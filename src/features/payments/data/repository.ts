import type { Payment, PaymentStatus, RecurringPayment } from "../domain/types";

/** Tekrarlayan ödeme ve ödeme örneği veri erişimi sözleşmesi (TECH_STACK §2). */
export interface PaymentRepository {
  /** Silinmemiş tekrarlayan ödemeler. */
  listSeries(): Promise<RecurringPayment[]>;
  getSeries(id: string): Promise<RecurringPayment | null>;
  createSeries(series: Omit<RecurringPayment, "id">): Promise<RecurringPayment>;
  updateSeries(id: string, patch: Partial<Omit<RecurringPayment, "id">>): Promise<void>;
  listPayments(filter?: { recurringPaymentId?: string; status?: PaymentStatus }): Promise<Payment[]>;
  getPayment(id: string): Promise<Payment | null>;
  createPayment(payment: Omit<Payment, "id">): Promise<Payment>;
  updatePayment(id: string, patch: Partial<Omit<Payment, "id">>): Promise<Payment | null>;
  removePayments(ids: readonly string[]): Promise<void>;
}
