import "server-only";
import { cache } from "react";
import { transactionRepository } from "@/features/transactions/server";
import { addDays, localDateTimeToIso, toDateKey, toTimeValue, type DateKey } from "@/lib/dates";
import { isSupabaseConfigured } from "@/lib/env";
import { nthOccurrence, occurrencesBetween } from "@/lib/recurrence";
import { DuplicateRecordError } from "@/lib/supabase/data";
import type { PaymentRepository } from "./data/repository";
import { mockPaymentRepository } from "./data/mock-repository";
import { supabasePaymentRepository } from "./data/supabase-repository";
import { compareByDue, GENERATION_HORIZON_MONTHS, UPCOMING_WINDOW_DAYS } from "./domain/schedule";
import type { Payment, RecurringPayment, RecurringPaymentInput } from "./domain/types";

// Ödeme verisine sunucu tarafı erişim ve ödeme kuralları (PRD BR-PAY, BR-REC).
// [Supabase aşaması] Örnek üretimi zamanlanmış işe, işaretleme ve geri alma RPC'lere taşınır
// (TECH_STACK §5.3 mark_payment_paid / undo_mark_payment_paid); imzalar korunur.

const repository: PaymentRepository = isSupabaseConfigured() ? supabasePaymentRepository : mockPaymentRepository;

/** Vadesi 3 ay içinde olan ödeme örneklerini üretir; süre ilerledikçe yenilenir (BR-REC-001). */
async function generatePayments(today: DateKey) {
  const horizon = nthOccurrence(today, "monthly", GENERATION_HORIZON_MONTHS);
  for (const series of await repository.listSeries()) {
    const dates =
      series.frequency === null
        ? series.generatedThrough === null
          ? [series.startDate]
          : []
        : occurrencesBetween(series.startDate, series.frequency, series.generatedThrough, horizon);
    if (dates.length === 0) continue;
    const existing = new Set((await repository.listPayments({ recurringPaymentId: series.id })).map((payment) => payment.dueDate));
    for (const dueDate of dates) {
      // Aynı vade için tek ödeme (BR-DUP-002).
      if (existing.has(dueDate)) continue;
      try {
        await repository.createPayment({
          recurringPaymentId: series.id,
          dueDate,
          amountMinor: series.amountMinor,
          status: "pending",
          paidAt: null,
          paidAmountMinor: null,
          paidAccountId: null,
          transactionId: null,
        });
      } catch (error) {
        // Eşzamanlı bir istek aynı vadeyi oluşturdu (BR-DUP-002).
        if (!(error instanceof DuplicateRecordError)) throw error;
      }
    }
    await repository.updateSeries(series.id, { generatedThrough: dates.at(-1) ?? series.generatedThrough });
  }
}

// İstek başına tek üretim; kullanıcılar birbirinin üretimini beklemez. Mükerrer vadeyi veritabanı kuralı engeller.
const ensureGenerated = cache(() => generatePayments(toDateKey(new Date())));

export type PaymentWithSeries = { payment: Payment; series: RecurringPayment };

/** Silinmemiş tekrarlayan ödemeler (Kategori Yönetimi kullanım sayıları, BR-CAT-007). */
export async function listRecurringPayments(): Promise<RecurringPayment[]> {
  return repository.listSeries();
}

/** Ana Sayfa "Yaklaşan Ödemeler": bekleyenler, gecikmişler başta (BR-PAY-005). */
export async function listUpcomingPayments(today: DateKey): Promise<PaymentWithSeries[]> {
  await ensureGenerated();
  const [series, pending] = await Promise.all([repository.listSeries(), repository.listPayments({ status: "pending" })]);
  const byId = new Map(series.map((item) => [item.id, item]));
  const until = addDays(today, UPCOMING_WINDOW_DAYS);
  return pending
    // Bugünkü vadeler Bugünün Akışı'nda gösterilir (Pages → Ana Sayfa).
    .filter((payment) => payment.dueDate !== today && payment.dueDate <= until)
    .sort(compareByDue)
    .flatMap((payment) => {
      const item = byId.get(payment.recurringPaymentId);
      return item ? [{ payment, series: item }] : [];
    });
}

/** Ana Sayfa "Bugünün Akışı": vadesi bugün olan ödemeler; ödenenler soluk görünümle kalır (PRD Q-20). */
export async function listPaymentsDueOn(date: DateKey): Promise<PaymentWithSeries[]> {
  return listPaymentsBetween(date, date);
}

/** Takvim: vadesi `from`–`to` (dahil) arasındaki ödemeler, vade saatine göre (PRD FR-CAL-013). */
export async function listPaymentsBetween(from: DateKey, to: DateKey): Promise<PaymentWithSeries[]> {
  await ensureGenerated();
  const [series, payments] = await Promise.all([repository.listSeries(), repository.listPayments()]);
  const byId = new Map(series.map((item) => [item.id, item]));
  return payments
    .filter((payment) => payment.dueDate >= from && payment.dueDate <= to)
    .flatMap((payment) => {
      const item = byId.get(payment.recurringPaymentId);
      return item ? [{ payment, series: item }] : [];
    })
    .sort((a, b) => a.payment.dueDate.localeCompare(b.payment.dueDate) || a.series.dueTime.localeCompare(b.series.dueTime));
}

export type PaymentDetailData = PaymentWithSeries & {
  /** Aynı tekrarlayan ödemenin ödenmiş vadeleri, yeniden eskiye. */
  history: Payment[];
};

export async function getPaymentDetail(id: string): Promise<PaymentDetailData | null> {
  await ensureGenerated();
  const payment = await repository.getPayment(id);
  const series = payment ? await repository.getSeries(payment.recurringPaymentId) : null;
  if (!payment || !series) return null;
  const history = (await repository.listPayments({ recurringPaymentId: series.id, status: "paid" }))
    .filter((item) => item.id !== payment.id)
    .sort((a, b) => b.dueDate.localeCompare(a.dueDate));
  return { payment, series, history };
}

/** Yeni İşlem → Abonelik. Kaydı ve ilk vadeleri oluşturur; ilk vadenin ödemesini döndürür. */
export async function createRecurringPayment(input: RecurringPaymentInput): Promise<Payment> {
  const series = await repository.createSeries({ ...input, contractNumber: null, deletedAt: null, generatedThrough: null });
  await ensureGenerated();
  const first = (await repository.listPayments({ recurringPaymentId: series.id })).find((payment) => payment.dueDate === series.startDate);
  if (!first) throw new Error("İlk vade üretilemedi.");
  return first;
}

/**
 * "Ödendi olarak işaretle": ödeme Ödendi olur, ödemenin hesabından ödeme tutarında gider işlemi oluşur (BR-PAY-002).
 * [Varsayım] Tek dokunuşta tutar beklenen tutar, tarih şu andır (BR-PAY-003); "Tutarı düzenle" [Eksik].
 */
export async function markPaymentPaid(id: string, now: Date): Promise<Payment | null> {
  const payment = await repository.getPayment(id);
  const series = payment ? await repository.getSeries(payment.recurringPaymentId) : null;
  if (!payment || !series || payment.status !== "pending") return null;
  const occurredAt = localDateTimeToIso(toDateKey(now), toTimeValue(now));
  const transaction = await transactionRepository.create(
    { type: "expense", title: series.title, amountMinor: payment.amountMinor, categoryId: series.categoryId, accountId: series.accountId, occurredAt, note: null },
    { source: "payment", paymentId: payment.id },
  );
  return repository.updatePayment(id, {
    status: "paid",
    paidAt: transaction.occurredAt,
    paidAmountMinor: payment.amountMinor,
    paidAccountId: series.accountId,
    transactionId: transaction.id,
  });
}

const pendingPatch = { status: "pending", paidAt: null, paidAmountMinor: null, paidAccountId: null, transactionId: null } as const;

/** "Geri al" (5 sn): oluşan gider işlemi silinir, ödeme Bekliyor'a döner (BR-PAY-004, D-18). */
export async function undoPaymentPaid(id: string): Promise<boolean> {
  const payment = await repository.getPayment(id);
  if (!payment || payment.status !== "paid") return false;
  if (payment.transactionId) await transactionRepository.remove(payment.transactionId);
  await repository.updatePayment(id, pendingPatch);
  return true;
}

/** Ödemeden oluşan gider işlemi silinince ödeme Bekliyor'a döner (PRD Q-13). */
export async function revertPaymentForDeletedTransaction(paymentId: string): Promise<void> {
  await repository.updatePayment(paymentId, pendingPatch);
}

/**
 * Tekrarlayan ödemeyi siler: gelecekteki bekleyen ödemeler silinir; geçmiş "Ödendi" kayıtları ve oluşan
 * işlemler korunur (PRD §6.4).
 */
export async function deleteRecurringPayment(seriesId: string): Promise<boolean> {
  const series = await repository.getSeries(seriesId);
  if (!series || series.deletedAt) return false;
  const pending = await repository.listPayments({ recurringPaymentId: seriesId, status: "pending" });
  await repository.removePayments(pending.map((payment) => payment.id));
  await repository.updateSeries(seriesId, { deletedAt: new Date().toISOString() });
  return true;
}
