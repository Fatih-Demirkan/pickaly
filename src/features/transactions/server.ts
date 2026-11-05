import "server-only";
import { cache } from "react";
import { transferEffect } from "@/features/accounts/domain/types";
import { listAccounts, listTransfers } from "@/features/accounts/server";
import { getSavingsTransfersByAccount } from "@/features/savings/server";
import { localDateTimeToIso, toDateKey } from "@/lib/dates";
import { isSupabaseConfigured } from "@/lib/env";
import { occurrencesBetween } from "@/lib/recurrence";
import { DuplicateRecordError } from "@/lib/supabase/data";
import type { RecurringRuleRepository, TransactionRepository } from "./data/repository";
import { mockRecurringRuleRepository, mockTransactionRepository } from "./data/mock-repository";
import { supabaseRecurringRuleRepository, supabaseTransactionRepository } from "./data/supabase-repository";
import { accountBalance } from "./domain/summary";

// İşlem verisine sunucu tarafı erişim. Supabase tanımlıysa veritabanı (kullanıcıya özel, RLS), değilse yerel depo.

const baseTransactionRepository: TransactionRepository = isSupabaseConfigured() ? supabaseTransactionRepository : mockTransactionRepository;
export const recurringRuleRepository: RecurringRuleRepository = isSupabaseConfigured() ? supabaseRecurringRuleRepository : mockRecurringRuleRepository;

/**
 * Tarihi gelen Tekrar Eden İşlem örneklerini gerçekleşmiş işlem olarak oluşturur (BR-REC-003, onay istenmez).
 * [Supabase aşaması] Bu üretim zamanlanmış bir veritabanı işine (pg_cron) taşınır; okuma sırasında yapılmaz.
 */
async function generateDueTransactions(now: Date) {
  const today = toDateKey(now);
  for (const rule of await recurringRuleRepository.listActive()) {
    let through = rule.generatedThrough;
    for (const date of occurrencesBetween(rule.startDate, rule.frequency, rule.generatedThrough, today)) {
      const occurredAt = localDateTimeToIso(date, rule.time);
      if (new Date(occurredAt) > now) break; // Bugünkü örnek saati gelince oluşur.
      try {
        await baseTransactionRepository.create({ ...rule.template, occurredAt }, { source: "recurring", recurringRuleId: rule.id });
      } catch (error) {
        // Aynı örnek eşzamanlı bir istekte zaten oluşturuldu (BR-DUP-004).
        if (!(error instanceof DuplicateRecordError)) throw error;
      }
      through = date;
    }
    if (through !== rule.generatedThrough) await recurringRuleRepository.markGenerated(rule.id, through);
  }
}

// Aynı istekteki paralel okumalar (ör. liste + bakiye) üretimi bir kez çalıştırır. İstek başınadır: kullanıcılar
// birbirinin üretimini beklemez. Eşzamanlı isteklerde mükerrer kaydı veritabanı kuralı engeller.
const ensureGenerated = cache(() => generateDueTransactions(new Date()));

function withGeneratedOccurrences<T extends unknown[], R>(read: (...args: T) => Promise<R>) {
  return async (...args: T) => {
    await ensureGenerated();
    return read(...args);
  };
}

export const transactionRepository: TransactionRepository = {
  ...baseTransactionRepository,
  listByMonth: withGeneratedOccurrences(baseTransactionRepository.listByMonth),
  listAll: withGeneratedOccurrences(baseTransactionRepository.listAll),
  get: withGeneratedOccurrences(baseTransactionRepository.get),
};

/**
 * Hesap kimliği → güncel bakiye (açılış + gerçekleşmiş işlemler + hesaplar arası aktarımlar + birikim aktarımları).
 * Arşivlenmiş hesaplar da dahildir (toplam bakiye arşivlemeyle değişmez). Bekleyen ödemeler etkilemez
 * (BR-PAY-001); birikime aktarım hesabı azaltır, çekme artırır (BR-SAV-001/002).
 */
export async function getAccountBalances(): Promise<Map<string, bigint>> {
  const [accounts, transactions, savingsTransfers, accountTransfers] = await Promise.all([
    listAccounts({ includeArchived: true }),
    transactionRepository.listAll(),
    getSavingsTransfersByAccount(),
    listTransfers(),
  ]);
  return new Map(
    accounts.map((account) => [
      account.id,
      accountBalance(account.openingBalanceMinor, account.id, transactions) + (savingsTransfers.get(account.id) ?? BigInt(0)) + transferEffect(account.id, accountTransfers),
    ]),
  );
}
