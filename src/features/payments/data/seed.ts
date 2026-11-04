import type { Transaction } from "@/features/transactions";
import { addDays, localDateTimeToIso, type DateKey } from "@/lib/dates";
import { majorToMinor } from "@/lib/money";
import { nthOccurrence } from "@/lib/recurrence";
import type { Payment, RecurringPayment } from "../domain/types";

// GEÇİCİ YEREL ÖRNEK VERİ — gerçek kullanıcı verisi değildir; Supabase bağlanınca kaldırılır.
// Başlık, tutar, sözleşme no ve geçmiş ödemeler Pages → Ödeme Detayı ve Ana Sayfa "Yaklaşan Ödemeler"
// örneklerinden alınmıştır; vadeler ekranın boş görünmemesi için bugüne göre üretilir.
// Ödenmiş geçmiş vadelerin gider işlemleri de buradan üretilir; işlem deposu bunları kendi örnek verisine ekler,
// böylece hangi ekran önce açılırsa açılsın iki depo tutarlıdır. Bekleyen ödemeler tekrar kuralından üretilir (server.ts).

type SeriesSeed = Omit<RecurringPayment, "id" | "deletedAt" | "generatedThrough" | "startDate" | "amountMinor"> & {
  id: string;
  amount: number;
  /** İlk bekleyen vadenin bugünden uzaklığı (gün). */
  nextDueInDays: number;
  /** Ödenmiş geçmiş vadeler, eskiden yeniye: [tutar, hesap]. */
  history?: [amount: number, accountId: string][];
};

const seeds: SeriesSeed[] = [
  {
    id: "rp-electricity",
    title: "Elektrik Faturası - CK Boğaziçi",
    amount: 1180,
    categoryId: "cat-sub-bills",
    accountId: "acc-main",
    frequency: "monthly",
    dueTime: "14:00",
    reminder: "1d",
    note: null,
    contractNumber: "TR-94820194",
    // Pages → Ana Sayfa "Bugünün Akışı": vadesi bugün 14:00, Bekliyor.
    nextDueInDays: 0,
    // Pages → Geçmiş Ödemeler: 1.054 (Ana Hesap) · 1.180 (Kredi Kartı) · 1.180 (Ana Hesap) · 1.180 (Ana Hesap)
    history: [
      [1054, "acc-main"],
      [1180, "acc-card"],
      [1180, "acc-main"],
      [1180, "acc-main"],
    ],
  },
  { id: "rp-rent", title: "Ev Kirası", amount: 12500, categoryId: "cat-sub-home", accountId: "acc-main", frequency: "monthly", dueTime: "09:00", reminder: "1d", note: null, contractNumber: null, nextDueInDays: 3 },
  { id: "rp-internet", title: "İnternet Faturası", amount: 682, categoryId: "cat-sub-digital", accountId: "acc-main", frequency: "monthly", dueTime: "09:00", reminder: "1h", note: null, contractNumber: null, nextDueInDays: 6 },
  // Gecikmiş durumunu göstermek için (BR-PAY-005).
  { id: "rp-dues", title: "Site Aidatı", amount: 850, categoryId: "cat-sub-dues", accountId: "acc-main", frequency: "monthly", dueTime: "09:00", reminder: "1d", note: null, contractNumber: null, nextDueInDays: -2 },
];

export type PaymentSeed = { series: RecurringPayment[]; payments: Payment[]; transactions: Transaction[] };

export function buildPaymentSeed(today: DateKey): PaymentSeed {
  const series: RecurringPayment[] = [];
  const payments: Payment[] = [];
  const transactions: Transaction[] = [];

  for (const { id, amount, nextDueInDays, history = [], ...rest } of seeds) {
    const nextDue = addDays(today, nextDueInDays);
    const frequency = rest.frequency ?? "monthly";
    const startDate = nthOccurrence(nextDue, frequency, -history.length);
    const dates = history.map((_, index) => nthOccurrence(startDate, frequency, index));

    for (const [index, [paidAmount, accountId]] of history.entries()) {
      const dueDate = dates[index] ?? startDate;
      const paymentId = `pay-${id.slice(3)}-${index + 1}`;
      const paidAt = localDateTimeToIso(dueDate, "10:00");
      const transactionId = `txn-${paymentId}`;
      transactions.push({
        id: transactionId,
        type: "expense",
        title: rest.title,
        amountMinor: majorToMinor(paidAmount),
        categoryId: rest.categoryId,
        accountId,
        occurredAt: paidAt,
        note: null,
        merchantName: null,
        merchantLocation: null,
        source: "payment",
        recurringRuleId: null,
        paymentId,
      });
      payments.push({
        id: paymentId,
        recurringPaymentId: id,
        dueDate,
        amountMinor: majorToMinor(amount),
        status: "paid",
        paidAt,
        paidAmountMinor: majorToMinor(paidAmount),
        paidAccountId: accountId,
        transactionId,
      });
    }

    series.push({ ...rest, id, amountMinor: majorToMinor(amount), startDate, deletedAt: null, generatedThrough: dates.at(-1) ?? null });
  }
  return { series, payments, transactions };
}

