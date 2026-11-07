import "server-only";
import { cache } from "react";
import { transferEffect } from "@/features/accounts/domain/types";
import { listAccounts, listTransfers } from "@/features/accounts/server";
import { loanEffect } from "@/features/loans/domain/types";
import { listLoans } from "@/features/loans/server";
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
 * Yalnızca gerçekleşmiş hareketler sayılır (BR-BAL-002, ürün sahibi onayı 2026-11-07): tarihi bugün veya geçmiş olan
 * işlem, aktarım, birikim hareketi ve alacak bakiyeyi etkiler; gelecek tarihliler tarihi gelene kadar etkilemez.
 * Sınır yerel gündür, saat değil: bugünkü 18:00 kaydı sabah da bakiyede görünür.
 */
export async function getAccountBalances(now: Date = new Date()): Promise<Map<string, bigint>> {
  const today = toDateKey(now);
  const realized = (occurredAt: string) => toDateKey(new Date(occurredAt)) <= today;
  const [accounts, allTransactions, savingsTransfers, allAccountTransfers, allLoans] = await Promise.all([
    listAccounts({ includeArchived: true }),
    transactionRepository.listAll(),
    getSavingsTransfersByAccount(now),
    listTransfers(),
    listLoans(),
  ]);
  const transactions = allTransactions.filter((transaction) => realized(transaction.occurredAt));
  const accountTransfers = allAccountTransfers.filter((transfer) => realized(transfer.occurredAt));
  // Alacak: verildiği gün hesaptan düşer, geri alındığı gün hesaba girer (tarihler yerel gün).
  const loans = allLoans.map((loan) => ({
    ...loan,
    accountId: loan.lentOn <= today ? loan.accountId : null,
    repaidOn: loan.repaidOn !== null && loan.repaidOn <= today ? loan.repaidOn : null,
  }));
  return new Map(
    accounts.map((account) => [
      account.id,
      accountBalance(account.openingBalanceMinor, account.id, transactions) + (savingsTransfers.get(account.id) ?? BigInt(0)) + transferEffect(account.id, accountTransfers) +
        // Alacaklar: borç verilen tutar düşer, geri alınan tutar eklenir (gelir / gider sayılmaz).
        loanEffect(account.id, loans),
    ]),
  );
}
