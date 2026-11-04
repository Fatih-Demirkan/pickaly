import { toMonthKey, type MonthKey } from "@/lib/dates";
import type { SavingsMovement } from "@/features/savings/domain/types";
import type { Transaction } from "@/features/transactions/domain/types";

// Aylık Finans Raporu hesapları (PRD FR-REP-001…004, BR-REP-001…005, TECH_STACK §5.5 monthly_report).
// Saf hesaplar: React, Next veya veri katmanı import etmez. [Supabase aşaması] Aynı hesap monthly_report(month) RPC'sine taşınır.

const ZERO = BigInt(0);

export type CategorySpending = { categoryId: string; amountMinor: bigint; count: number };

export type MonthlyReport = {
  month: MonthKey;
  incomeMinor: bigint;
  expenseMinor: bigint;
  /** Net nakit akışı = gelir − gider (Figma: 42.000 − 17.150 = 24.850). */
  netMinor: bigint;
  incomeCount: number;
  /** Dönemde birikim hesaplarına aktarılan net TL tutarı (ekleme − çekme). Gelir/gider sayılmaz (BR-REP-002). */
  savingsTransferMinor: bigint;
  /** Yüzde, bir ondalık; gelir 0 ise null (BR-REP-003/004). */
  savingsRate: number | null;
  expenseRate: number | null;
  savingsTransferRate: number | null;
  /** Gider kategorileri, tutara göre azalan (BR-REP-005). */
  topSpending: CategorySpending[];
};

/** part / whole yüzdesi, bir ondalığa yuvarlanmış (Figma: 24.850 / 42.000 → %59,2). */
export function percentOf(part: bigint, whole: bigint): number | null {
  if (whole <= ZERO) return null;
  const negative = part < ZERO;
  const abs = negative ? -part : part;
  const tenths = Number((abs * BigInt(2000) / whole + BigInt(1)) / BigInt(2)) / 10;
  return negative ? -tenths : tenths;
}

/**
 * Seçili ayın gerçekleşmiş gelir/gider işlemlerinden rapor (BR-REP-001). Bekleyen ödemeler işlem olmadığı için zaten
 * dahil değildir. Birikim aktarımları ayrı satırdır (BR-REP-002).
 * [Varsayım] "Birikim Hesabına Aktarılan" ayın net aktarımıdır (ekleme − çekme); banka hesabına dokunmayan hareketler
 * (açılış bakiyesi, adet/gram) dahil edilmez.
 */
export function buildMonthlyReport(month: MonthKey, transactions: readonly Transaction[], movements: readonly SavingsMovement[]): MonthlyReport {
  let incomeMinor = ZERO;
  let expenseMinor = ZERO;
  let incomeCount = 0;
  const byCategory = new Map<string, CategorySpending>();

  for (const transaction of transactions) {
    if (toMonthKey(new Date(transaction.occurredAt)) !== month) continue;
    if (transaction.type === "income") {
      incomeMinor += transaction.amountMinor;
      incomeCount += 1;
      continue;
    }
    expenseMinor += transaction.amountMinor;
    const entry = byCategory.get(transaction.categoryId) ?? { categoryId: transaction.categoryId, amountMinor: ZERO, count: 0 };
    entry.amountMinor += transaction.amountMinor;
    entry.count += 1;
    byCategory.set(transaction.categoryId, entry);
  }

  let savingsTransferMinor = ZERO;
  for (const movement of movements) {
    if (movement.transferMinor === null || !movement.bankAccountId) continue;
    if (toMonthKey(new Date(movement.occurredAt)) !== month) continue;
    savingsTransferMinor += movement.direction === "in" ? movement.transferMinor : -movement.transferMinor;
  }

  const netMinor = incomeMinor - expenseMinor;
  const topSpending = [...byCategory.values()].sort((a, b) => (a.amountMinor === b.amountMinor ? 0 : a.amountMinor > b.amountMinor ? -1 : 1));

  return {
    month,
    incomeMinor,
    expenseMinor,
    netMinor,
    incomeCount,
    savingsTransferMinor,
    savingsRate: percentOf(netMinor, incomeMinor),
    expenseRate: percentOf(expenseMinor, incomeMinor),
    savingsTransferRate: percentOf(savingsTransferMinor, incomeMinor),
    topSpending,
  };
}
