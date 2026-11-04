import "server-only";
import { localDateTimeToIso, shiftMonth, type MonthKey } from "@/lib/dates";
import type { Frequency, ReminderOffset } from "@/lib/recurrence";
import { db, fromBigInt, toBigInt, unwrap } from "@/lib/supabase/data";
import type { RecurringRule, Transaction, TransactionInput, TransactionOrigin } from "../domain/types";
import type { RecurringRuleRepository, TransactionRepository } from "./repository";

// İşlem ve Tekrar Eden İşlem kuralı verisi — Supabase (tablolar: transactions, recurring_rules; RLS: kendi satırları).

type TransactionRow = {
  id: string;
  type: Transaction["type"];
  title: string;
  amount_minor: number;
  category_id: string;
  account_id: string;
  occurred_at: string;
  note: string | null;
  merchant_name: string | null;
  merchant_location: string | null;
  source: Transaction["source"];
  recurring_rule_id: string | null;
  payment_id: string | null;
};

const TRANSACTION_COLUMNS =
  "id, type, title, amount_minor, category_id, account_id, occurred_at, note, merchant_name, merchant_location, source, recurring_rule_id, payment_id";

function toTransaction(row: TransactionRow): Transaction {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    amountMinor: toBigInt(row.amount_minor),
    categoryId: row.category_id,
    accountId: row.account_id,
    occurredAt: new Date(row.occurred_at).toISOString(),
    note: row.note,
    merchantName: row.merchant_name,
    merchantLocation: row.merchant_location,
    source: row.source,
    recurringRuleId: row.recurring_rule_id,
    paymentId: row.payment_id,
  };
}

function inputRow(input: TransactionInput) {
  return {
    type: input.type,
    title: input.title,
    amount_minor: fromBigInt(input.amountMinor),
    category_id: input.categoryId,
    account_id: input.accountId,
    occurred_at: input.occurredAt,
    note: input.note,
  };
}

export const supabaseTransactionRepository: TransactionRepository = {
  async listByMonth(month: MonthKey) {
    // Ay sınırları uygulamanın saat dilimine göre (BR-REP-001).
    const from = localDateTimeToIso(`${month}-01`, "00:00");
    const to = localDateTimeToIso(`${shiftMonth(month, 1)}-01`, "00:00");
    const rows = unwrap(await (await db()).from("transactions").select(TRANSACTION_COLUMNS).gte("occurred_at", from).lt("occurred_at", to));
    return (rows as TransactionRow[]).map(toTransaction);
  },
  async listAll() {
    const rows = unwrap(await (await db()).from("transactions").select(TRANSACTION_COLUMNS));
    return (rows as TransactionRow[]).map(toTransaction);
  },
  async get(id) {
    const row = unwrap(await (await db()).from("transactions").select(TRANSACTION_COLUMNS).eq("id", id).maybeSingle());
    return row ? toTransaction(row as TransactionRow) : null;
  },
  async create(input, origin?: Partial<TransactionOrigin>) {
    const row = unwrap(
      await (await db())
        .from("transactions")
        .insert({
          ...inputRow(input),
          source: origin?.source ?? "manual",
          recurring_rule_id: origin?.recurringRuleId ?? null,
          payment_id: origin?.paymentId ?? null,
        })
        .select(TRANSACTION_COLUMNS)
        .single(),
    );
    return toTransaction(row as TransactionRow);
  },
  async update(id, input) {
    const row = unwrap(await (await db()).from("transactions").update(inputRow(input)).eq("id", id).select(TRANSACTION_COLUMNS).maybeSingle());
    return row ? toTransaction(row as TransactionRow) : null;
  },
  async remove(id) {
    const rows = unwrap(await (await db()).from("transactions").delete().eq("id", id).select("id"));
    return (rows as unknown[]).length > 0;
  },
};

type RuleRow = {
  id: string;
  template: { type: Transaction["type"]; title: string; amountMinor: string; categoryId: string; accountId: string; note: string | null };
  frequency: Frequency;
  start_date: string;
  time: string;
  reminder: ReminderOffset;
  active: boolean;
  generated_through: string;
};

const RULE_COLUMNS = "id, template, frequency, start_date, time, reminder, active, generated_through";

function toRule(row: RuleRow): RecurringRule {
  return {
    id: row.id,
    template: { ...row.template, amountMinor: toBigInt(row.template.amountMinor) },
    frequency: row.frequency,
    startDate: row.start_date,
    time: row.time,
    reminder: row.reminder,
    active: row.active,
    generatedThrough: row.generated_through,
  };
}

export const supabaseRecurringRuleRepository: RecurringRuleRepository = {
  async listActive() {
    const rows = unwrap(await (await db()).from("recurring_rules").select(RULE_COLUMNS).eq("active", true));
    return (rows as RuleRow[]).map(toRule);
  },
  async get(id) {
    const row = unwrap(await (await db()).from("recurring_rules").select(RULE_COLUMNS).eq("id", id).maybeSingle());
    return row ? toRule(row as RuleRow) : null;
  },
  async create(rule) {
    const { template } = rule;
    const row = unwrap(
      await (await db())
        .from("recurring_rules")
        .insert({
          template: { type: template.type, title: template.title, amountMinor: fromBigInt(template.amountMinor), categoryId: template.categoryId, accountId: template.accountId, note: template.note },
          frequency: rule.frequency,
          start_date: rule.startDate,
          time: rule.time,
          reminder: rule.reminder,
          active: rule.active,
          generated_through: rule.generatedThrough,
        })
        .select(RULE_COLUMNS)
        .single(),
    );
    return toRule(row as RuleRow);
  },
  async markGenerated(id, through) {
    unwrap(await (await db()).from("recurring_rules").update({ generated_through: through }).eq("id", id));
  },
};
