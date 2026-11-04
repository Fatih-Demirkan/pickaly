import type { DateKey } from "@/lib/dates";
import type { Frequency, ReminderOffset } from "@/lib/recurrence";

// İşlem modeli (TECH_STACK §5.2 transactions, PRD DM-004). Gerçekleşmiş gelir ve gider kayıtları;
// tekrar kuralından (Tekrar Eden İşlem) veya "Ödendi olarak işaretle"den de oluşabilir. Transfer sonraki dilimde.

export type TransactionType = "income" | "expense";

/** Kaydın kaynağı (TECH_STACK §5.2 transactions.source). */
export type TransactionSource = "manual" | "recurring" | "payment";

export type Transaction = {
  id: string;
  type: TransactionType;
  title: string;
  /** Her zaman pozitif, kuruş. Yön `type` ile belirlenir. */
  amountMinor: bigint;
  categoryId: string;
  accountId: string;
  /** ISO-8601 anlık zaman. */
  occurredAt: string;
  note: string | null;
  merchantName: string | null;
  merchantLocation: string | null;
  source: TransactionSource;
  /** Tekrar Eden İşlem kuralından üretildiyse kural kimliği. */
  recurringRuleId: string | null;
  /** "Ödendi olarak işaretle" ile oluştuysa ödeme (örnek) kimliği (BR-PAY-002). */
  paymentId: string | null;
};

export type TransactionOrigin = Pick<Transaction, "source" | "recurringRuleId" | "paymentId">;

/** Oluşturma ve düzenleme formunun doğrulanmış girdisi. */
export type TransactionInput = Omit<Transaction, "id" | "merchantName" | "merchantLocation" | keyof TransactionOrigin>;

export type TransactionFilter = {
  type?: TransactionType;
  categoryId?: string;
};

/**
 * Tekrar Eden İşlem kuralı (TECH_STACK §5.2 recurring_rules, PRD FR-FIN-005).
 * Tarihi gelen örnekler onay istenmeden gerçekleşmiş işlem olarak oluşur (BR-REC-003).
 */
export type RecurringRule = {
  id: string;
  template: Omit<TransactionInput, "occurredAt">;
  frequency: Frequency;
  /** İlk örneğin yerel günü; ilk örnek kuralla birlikte kaydedilen işlemin kendisidir. */
  startDate: DateKey;
  /** Örneklerin yerel saati "HH:mm". */
  time: string;
  reminder: ReminderOffset;
  active: boolean;
  /** Bu güne kadarki örnekler üretildi. */
  generatedThrough: DateKey;
};
