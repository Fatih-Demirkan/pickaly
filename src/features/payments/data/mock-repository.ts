import "server-only";
import { toDateKey } from "@/lib/dates";
import type { Payment, RecurringPayment } from "../domain/types";
import type { PaymentRepository } from "./repository";
import { buildPaymentSeed } from "./seed";

// GEÇİCİ YEREL ÖRNEK VERİ DEPOSU — gerçek kullanıcı verisi değildir.
// Veriler sunucu belleğinde tutulur: sunucu yeniden başlayınca örnek verilere döner.
// Örnek veriler: ./seed.ts.

type Store = { series: RecurringPayment[]; payments: Payment[] };

const store = globalThis as typeof globalThis & { __pickalyMockPayments?: Store };

async function data(): Promise<Store> {
  store.__pickalyMockPayments ??= buildPaymentSeed(toDateKey(new Date()));
  return store.__pickalyMockPayments;
}

export const mockPaymentRepository: PaymentRepository = {
  async listSeries() {
    return (await data()).series.filter((series) => !series.deletedAt);
  },
  async getSeries(id) {
    return (await data()).series.find((series) => series.id === id) ?? null;
  },
  async createSeries(input) {
    const series: RecurringPayment = { ...input, id: crypto.randomUUID() };
    (await data()).series.push(series);
    return series;
  },
  async updateSeries(id, patch) {
    const series = (await data()).series.find((item) => item.id === id);
    if (series) Object.assign(series, patch);
  },
  async listPayments(filter = {}) {
    return (await data()).payments.filter(
      (payment) => (!filter.recurringPaymentId || payment.recurringPaymentId === filter.recurringPaymentId) && (!filter.status || payment.status === filter.status),
    );
  },
  async getPayment(id) {
    return (await data()).payments.find((payment) => payment.id === id) ?? null;
  },
  async createPayment(input) {
    const payment: Payment = { ...input, id: crypto.randomUUID() };
    (await data()).payments.push(payment);
    return payment;
  },
  async updatePayment(id, patch) {
    const payment = (await data()).payments.find((item) => item.id === id);
    if (!payment) return null;
    Object.assign(payment, patch);
    return payment;
  },
  async removePayments(ids) {
    const store = await data();
    store.payments = store.payments.filter((payment) => !ids.includes(payment.id));
  },
};
