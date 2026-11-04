import "server-only";
import { listAccounts } from "@/features/accounts/server";
import { getSavingsTransfersByAccount } from "@/features/savings/server";
import { localDateTimeToIso, toDateKey } from "@/lib/dates";
import { occurrencesBetween } from "@/lib/recurrence";
import type { RecurringRuleRepository, TransactionRepository } from "./data/repository";
import { mockRecurringRuleRepository, mockTransactionRepository } from "./data/mock-repository";
import { accountBalance } from "./domain/summary";

// İşlem verisine sunucu tarafı erişim. Supabase repository'si geldiğinde yalnızca burada değiştirilir.

export const recurringRuleRepository: RecurringRuleRepository = mockRecurringRuleRepository;

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
      await mockTransactionRepository.create({ ...rule.template, occurredAt }, { source: "recurring", recurringRuleId: rule.id });
      through = date;
    }
    if (through !== rule.generatedThrough) await recurringRuleRepository.markGenerated(rule.id, through);
  }
}

// Aynı istekte paralel okumalar (ör. liste + bakiye) aynı örneği iki kez üretmesin diye tek çalıştırma paylaşılır.
let generating: Promise<void> | null = null;

function withGeneratedOccurrences<T extends unknown[], R>(read: (...args: T) => Promise<R>) {
  return async (...args: T) => {
    generating ??= generateDueTransactions(new Date()).finally(() => {
      generating = null;
    });
    await generating;
    return read(...args);
  };
}

export const transactionRepository: TransactionRepository = {
  ...mockTransactionRepository,
  listByMonth: withGeneratedOccurrences(mockTransactionRepository.listByMonth),
  listAll: withGeneratedOccurrences(mockTransactionRepository.listAll),
  get: withGeneratedOccurrences(mockTransactionRepository.get),
};

/**
 * Hesap kimliği → güncel bakiye (açılış + gerçekleşmiş işlemler + birikim aktarımları). Bekleyen ödemeler etkilemez
 * (BR-PAY-001); birikime aktarım hesabı azaltır, çekme artırır (BR-SAV-001/002).
 */
export async function getAccountBalances(): Promise<Map<string, bigint>> {
  const [accounts, transactions, transfers] = await Promise.all([listAccounts(), transactionRepository.listAll(), getSavingsTransfersByAccount()]);
  return new Map(
    accounts.map((account) => [account.id, accountBalance(account.openingBalanceMinor, account.id, transactions) + (transfers.get(account.id) ?? BigInt(0))]),
  );
}
