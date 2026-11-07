import type { DateKey } from "@/lib/dates";

// Alacak: borç verilen para (ürün sahibi isteği 2026-11-07). "X kişisine Y için Z tutarı verdim, A tarihinde geri alacağım."
// Gelir / gider sayılmaz; hesaplar arası aktarım gibi yalnızca hesap bakiyesini değiştirir:
//   accountId doluysa verildiği gün o hesaptan düşer (null: hesaptan para çıkmadı, yalnızca alacak kaydı);
//   repaidOn doluysa (geri alındı / kapatıldı) tutar repaidAccountId hesabına eklenir. Erken geri alınabilir.

/** Alacak kalemi: üst başlık altındaki tek alacak (örn. "Doğalgaz", 1.200 ₺). */
export type LoanItem = { id: string; label: string; amountMinor: bigint };

export type Loan = {
  id: string;
  /** Borç verilen kişi. */
  person: string;
  /** Ne için (isteğe bağlı). */
  purpose: string | null;
  amountMinor: bigint;
  /** Paranın çıktığı hesap; null ise bakiye etkilenmez (yalnızca alacak). */
  accountId: string | null;
  lentOn: DateKey;
  /** Geri alınacak tarih (takvimde bu gün görünür). */
  dueOn: DateKey;
  note: string | null;
  /** Geri alındığı gün; null ise açık. */
  repaidOn: DateKey | null;
  /** Geri alınan paranın girdiği hesap. */
  repaidAccountId: string | null;
  /** Kalemler (ürün sahibi isteği 2026-11-07). Boşsa tek tutarlı alacak; doluysa amountMinor kalemlerin toplamıdır. */
  items: LoanItem[];
};

export const LOAN_PERSON_MAX_LENGTH = 80;
export const LOAN_PURPOSE_MAX_LENGTH = 80;
export const LOAN_NOTE_MAX_LENGTH = 200;
export const LOAN_ITEMS_MAX = 20;
export const LOAN_ITEM_LABEL_MAX_LENGTH = 60;

export function isOpen(loan: Pick<Loan, "repaidOn">): boolean {
  return loan.repaidOn === null;
}

/** Vadesi geçmiş açık alacak. */
export function isOverdue(loan: Pick<Loan, "repaidOn" | "dueOn">, today: DateKey): boolean {
  return loan.repaidOn === null && loan.dueOn < today;
}

/** Alacakların bir hesabın bakiyesine net etkisi: verilen tutar düşer, geri alınan tutar eklenir. */
export function loanEffect(accountId: string, loans: readonly Loan[]): bigint {
  return loans.reduce((total, loan) => {
    let next = total;
    if (loan.accountId === accountId) next -= loan.amountMinor;
    if (loan.repaidOn !== null && loan.repaidAccountId === accountId) next += loan.amountMinor;
    return next;
  }, BigInt(0));
}

/** Liste başlığı: "Ahmet · Araba tamiri" ya da yalnızca kişi. */
export function loanTitle(loan: Pick<Loan, "person" | "purpose">): string {
  return loan.purpose ? `${loan.person} · ${loan.purpose}` : loan.person;
}
