import { toDateKey, type DateKey } from "@/lib/dates";
import type { Transaction, TransactionFilter } from "./types";

// Saf hesaplar: React, Next veya veri katmanı import etmez.

const ZERO = BigInt(0);

/** Gelir +, gider − işaretli tutar. */
export function signedAmount(transaction: Pick<Transaction, "type" | "amountMinor">): bigint {
  return transaction.type === "income" ? transaction.amountMinor : -transaction.amountMinor;
}

export type PeriodSummary = {
  incomeMinor: bigint;
  expenseMinor: bigint;
  netMinor: bigint;
  incomeCount: number;
  expenseCount: number;
};

/** İşlemler özet kartı: dönem net değişimi, toplam gelir ve gider (PRD FR-FIN-010). */
export function summarize(transactions: readonly Transaction[]): PeriodSummary {
  let incomeMinor = ZERO;
  let expenseMinor = ZERO;
  let incomeCount = 0;
  let expenseCount = 0;
  for (const transaction of transactions) {
    if (transaction.type === "income") {
      incomeMinor += transaction.amountMinor;
      incomeCount += 1;
    } else {
      expenseMinor += transaction.amountMinor;
      expenseCount += 1;
    }
  }
  return { incomeMinor, expenseMinor, netMinor: incomeMinor - expenseMinor, incomeCount, expenseCount };
}

export function applyFilter(transactions: readonly Transaction[], filter: TransactionFilter): Transaction[] {
  return transactions.filter(
    (transaction) => (!filter.type || transaction.type === filter.type) && (!filter.categoryId || transaction.categoryId === filter.categoryId),
  );
}

export type DayGroup = {
  date: DateKey;
  netMinor: bigint;
  transactions: Transaction[];
};

/** Yerel güne göre gruplar; günler ve gün içindeki işlemler yeniden eskiye sıralanır. */
export function groupByDay(transactions: readonly Transaction[]): DayGroup[] {
  const sorted = [...transactions].sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
  const groups = new Map<DateKey, DayGroup>();
  for (const transaction of sorted) {
    const date = toDateKey(new Date(transaction.occurredAt));
    const group = groups.get(date) ?? { date, netMinor: ZERO, transactions: [] };
    group.netMinor += signedAmount(transaction);
    group.transactions.push(transaction);
    groups.set(date, group);
  }
  return [...groups.values()];
}

/** Hesap bakiyesi = açılış bakiyesi + gelirler − giderler (PRD BR-MON-002). */
export function accountBalance(openingBalanceMinor: bigint, accountId: string, transactions: readonly Transaction[]): bigint {
  return transactions.reduce((total, transaction) => (transaction.accountId === accountId ? total + signedAmount(transaction) : total), openingBalanceMinor);
}

/**
 * Ekranda gösterilen "İşlem Kodu" (Pages: "#TXN-902481").
 * [Varsayım] Veri modelinde ayrı bir kod alanı yok; kayıt kimliğinden türetilir.
 */
export function transactionCode(id: string): string {
  // Kısa kimlikler (örnek veri: "txn-902481") olduğu gibi; UUID'ler ilk 8 hanesiyle gösterilir.
  return `#${(id.length <= 12 ? id : id.replace(/-/g, "").slice(0, 8)).toUpperCase()}`;
}
