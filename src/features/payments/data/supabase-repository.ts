import "server-only";
import type { Frequency, ReminderOffset } from "@/lib/recurrence";
import { db, fromBigInt, toBigInt, toBigIntOrNull, unwrap } from "@/lib/supabase/data";
import type { Payment, RecurringPayment } from "../domain/types";
import type { PaymentRepository } from "./repository";

// Tekrarlayan ödeme ("Abonelik") ve ödeme örnekleri — Supabase (tablolar: recurring_payments, payments).

type SeriesRow = {
  id: string;
  title: string;
  amount_minor: number;
  category_id: string;
  account_id: string;
  frequency: Frequency | null;
  start_date: string;
  due_time: string;
  reminder: ReminderOffset;
  note: string | null;
  contract_number: string | null;
  deleted_at: string | null;
  generated_through: string | null;
};

const SERIES_COLUMNS = "id, title, amount_minor, category_id, account_id, frequency, start_date, due_time, reminder, note, contract_number, deleted_at, generated_through";

function toSeries(row: SeriesRow): RecurringPayment {
  return {
    id: row.id,
    title: row.title,
    amountMinor: toBigInt(row.amount_minor),
    categoryId: row.category_id,
    accountId: row.account_id,
    frequency: row.frequency,
    startDate: row.start_date,
    dueTime: row.due_time,
    reminder: row.reminder,
    note: row.note,
    contractNumber: row.contract_number,
    deletedAt: row.deleted_at,
    generatedThrough: row.generated_through,
  };
}

function seriesPatch(patch: Partial<Omit<RecurringPayment, "id">>) {
  const row: Record<string, unknown> = {};
  if (patch.title !== undefined) row.title = patch.title;
  if (patch.amountMinor !== undefined) row.amount_minor = fromBigInt(patch.amountMinor);
  if (patch.categoryId !== undefined) row.category_id = patch.categoryId;
  if (patch.accountId !== undefined) row.account_id = patch.accountId;
  if (patch.frequency !== undefined) row.frequency = patch.frequency;
  if (patch.startDate !== undefined) row.start_date = patch.startDate;
  if (patch.dueTime !== undefined) row.due_time = patch.dueTime;
  if (patch.reminder !== undefined) row.reminder = patch.reminder;
  if (patch.note !== undefined) row.note = patch.note;
  if (patch.contractNumber !== undefined) row.contract_number = patch.contractNumber;
  if (patch.deletedAt !== undefined) row.deleted_at = patch.deletedAt;
  if (patch.generatedThrough !== undefined) row.generated_through = patch.generatedThrough;
  return row;
}

type PaymentRow = {
  id: string;
  recurring_payment_id: string;
  due_date: string;
  amount_minor: number;
  status: Payment["status"];
  paid_at: string | null;
  paid_amount_minor: number | null;
  paid_account_id: string | null;
  transaction_id: string | null;
};

const PAYMENT_COLUMNS = "id, recurring_payment_id, due_date, amount_minor, status, paid_at, paid_amount_minor, paid_account_id, transaction_id";

function toPayment(row: PaymentRow): Payment {
  return {
    id: row.id,
    recurringPaymentId: row.recurring_payment_id,
    dueDate: row.due_date,
    amountMinor: toBigInt(row.amount_minor),
    status: row.status,
    paidAt: row.paid_at ? new Date(row.paid_at).toISOString() : null,
    paidAmountMinor: toBigIntOrNull(row.paid_amount_minor),
    paidAccountId: row.paid_account_id,
    transactionId: row.transaction_id,
  };
}

function paymentPatch(patch: Partial<Omit<Payment, "id">>) {
  const row: Record<string, unknown> = {};
  if (patch.recurringPaymentId !== undefined) row.recurring_payment_id = patch.recurringPaymentId;
  if (patch.dueDate !== undefined) row.due_date = patch.dueDate;
  if (patch.amountMinor !== undefined) row.amount_minor = fromBigInt(patch.amountMinor);
  if (patch.status !== undefined) row.status = patch.status;
  if (patch.paidAt !== undefined) row.paid_at = patch.paidAt;
  if (patch.paidAmountMinor !== undefined) row.paid_amount_minor = fromBigInt(patch.paidAmountMinor);
  if (patch.paidAccountId !== undefined) row.paid_account_id = patch.paidAccountId;
  if (patch.transactionId !== undefined) row.transaction_id = patch.transactionId;
  return row;
}

export const supabasePaymentRepository: PaymentRepository = {
  async listSeries() {
    const rows = unwrap(await (await db()).from("recurring_payments").select(SERIES_COLUMNS).is("deleted_at", null));
    return (rows as SeriesRow[]).map(toSeries);
  },
  async getSeries(id) {
    const row = unwrap(await (await db()).from("recurring_payments").select(SERIES_COLUMNS).eq("id", id).maybeSingle());
    return row ? toSeries(row as SeriesRow) : null;
  },
  async createSeries(series) {
    const row = unwrap(await (await db()).from("recurring_payments").insert(seriesPatch(series)).select(SERIES_COLUMNS).single());
    return toSeries(row as SeriesRow);
  },
  async updateSeries(id, patch) {
    unwrap(await (await db()).from("recurring_payments").update(seriesPatch(patch)).eq("id", id));
  },
  async listPayments(filter) {
    let query = (await db()).from("payments").select(PAYMENT_COLUMNS);
    if (filter?.recurringPaymentId) query = query.eq("recurring_payment_id", filter.recurringPaymentId);
    if (filter?.status) query = query.eq("status", filter.status);
    const rows = unwrap(await query);
    return (rows as PaymentRow[]).map(toPayment);
  },
  async getPayment(id) {
    const row = unwrap(await (await db()).from("payments").select(PAYMENT_COLUMNS).eq("id", id).maybeSingle());
    return row ? toPayment(row as PaymentRow) : null;
  },
  async createPayment(payment) {
    const row = unwrap(await (await db()).from("payments").insert(paymentPatch(payment)).select(PAYMENT_COLUMNS).single());
    return toPayment(row as PaymentRow);
  },
  async updatePayment(id, patch) {
    const row = unwrap(await (await db()).from("payments").update(paymentPatch(patch)).eq("id", id).select(PAYMENT_COLUMNS).maybeSingle());
    return row ? toPayment(row as PaymentRow) : null;
  },
  async removePayments(ids) {
    if (ids.length === 0) return;
    unwrap(await (await db()).from("payments").delete().in("id", [...ids]));
  },
};
