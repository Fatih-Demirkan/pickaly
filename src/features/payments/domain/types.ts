import type { DateKey } from "@/lib/dates";
import type { Frequency, ReminderOffset } from "@/lib/recurrence";

// Tekrarlayan ödeme ("Abonelik" sekmesi) ve ödeme örnekleri (TECH_STACK §5.1–5.2 recurring_payments,
// payment_occurrences; PRD §6, BR-PAY, BR-REC). "Abonelik" uygulamanın ücretli üyeliği değildir.

export type RecurringPayment = {
  id: string;
  title: string;
  /** Beklenen tutar, kuruş. */
  amountMinor: bigint;
  categoryId: string;
  /** Ödemenin yapılacağı hesap. */
  accountId: string;
  /** null: tek seferlik ödeme (PRD Q-8). */
  frequency: Frequency | null;
  /** İlk vade günü. */
  startDate: DateKey;
  /** Vade saati "HH:mm" (Pages: "22 Temmuz 2026, Salı • 09:00"). */
  dueTime: string;
  reminder: ReminderOffset;
  note: string | null;
  /** Pages → Ödeme Detayı "Abone / Sözleşme No". [Eksik] Formda giriş alanı yok. */
  contractNumber: string | null;
  /** Silinen tekrarlayan ödeme: gelecekteki bekleyenler silinir, geçmiş ödemeler korunur (PRD §6.4). */
  deletedAt: string | null;
  /** Bu güne kadarki ödeme örnekleri üretildi; null: henüz hiç üretilmedi. */
  generatedThrough: DateKey | null;
};

export type PaymentStatus = "pending" | "paid";

/** Tekrarlayan ödemenin vadesi gelen tekil kaydı: Bekliyor veya Ödendi. */
export type Payment = {
  id: string;
  recurringPaymentId: string;
  dueDate: DateKey;
  amountMinor: bigint;
  status: PaymentStatus;
  /** ISO anlık zaman. */
  paidAt: string | null;
  /** Ödenen tutar; beklenenden farklı olabilir (PRD Q-16). */
  paidAmountMinor: bigint | null;
  paidAccountId: string | null;
  /** "Ödendi olarak işaretle" ile oluşan gider işlemi (BR-PAY-002). */
  transactionId: string | null;
};

export type RecurringPaymentInput = Pick<RecurringPayment, "title" | "amountMinor" | "categoryId" | "accountId" | "frequency" | "startDate" | "dueTime" | "reminder" | "note">;
