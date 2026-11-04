// payments modülünün (Abonelik / tekrarlayan ödemeler) istemci tarafında da kullanılabilen genel arayüzü.
// Veri erişimi (sunucu) için "@/features/payments/server" kullanılır.

export type { Payment, PaymentStatus, RecurringPayment } from "./domain/types";
export { paymentHref, type PaymentOrigin } from "./routes";
