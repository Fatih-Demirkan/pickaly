// transactions modülünün istemci tarafında da kullanılabilen genel arayüzü.
// Veri erişimi (sunucu) için "@/features/transactions/server" kullanılır.

export type { RecurringRule, Transaction, TransactionOrigin, TransactionSource, TransactionType } from "./domain/types";
export { summarize, type PeriodSummary } from "./domain/summary";
