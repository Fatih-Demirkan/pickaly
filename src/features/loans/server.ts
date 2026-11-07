import "server-only";
import { isSupabaseConfigured } from "@/lib/env";
import type { DateKey } from "@/lib/dates";
import { db, fromBigInt, toBigInt, unwrap } from "@/lib/supabase/data";
import { mockLoanStore } from "./data/mock-loans";
import type { Loan } from "./domain/types";

// Alacak verisine sunucu tarafı erişim. Supabase tanımlıysa veritabanı (tablo: loans, kullanıcıya özel, RLS),
// değilse yerel depo.

type LoanRow = {
  id: string;
  person: string;
  purpose: string | null;
  amount_minor: number | string;
  account_id: string | null;
  lent_on: string;
  due_on: string;
  note: string | null;
  repaid_on: string | null;
  repaid_account_id: string | null;
  items: { id: string; label: string; amountMinor: string }[] | null;
};

const COLUMNS = "id, person, purpose, amount_minor, account_id, lent_on, due_on, note, repaid_on, repaid_account_id, items";

function toLoan(row: LoanRow): Loan {
  return {
    id: row.id,
    person: row.person,
    purpose: row.purpose,
    amountMinor: toBigInt(row.amount_minor),
    accountId: row.account_id,
    lentOn: row.lent_on,
    dueOn: row.due_on,
    note: row.note,
    repaidOn: row.repaid_on,
    repaidAccountId: row.repaid_account_id,
    items: (row.items ?? []).map((item) => ({ id: item.id, label: item.label, amountMinor: toBigInt(item.amountMinor) })),
  };
}

export type LoanInput = Omit<Loan, "id" | "repaidOn" | "repaidAccountId">;

function toRow(input: LoanInput) {
  return {
    person: input.person,
    purpose: input.purpose,
    amount_minor: fromBigInt(input.amountMinor),
    account_id: input.accountId,
    lent_on: input.lentOn,
    due_on: input.dueOn,
    note: input.note,
    items: input.items.map((item) => ({ id: item.id, label: item.label, amountMinor: fromBigInt(item.amountMinor) })),
  };
}

/** Tüm alacaklar: geri alınacak tarihe göre. */
export async function listLoans(): Promise<Loan[]> {
  if (!isSupabaseConfigured()) return [...mockLoanStore().loans].sort((a, b) => a.dueOn.localeCompare(b.dueOn));
  const rows = unwrap(await (await db()).from("loans").select(COLUMNS).order("due_on"));
  return (rows as LoanRow[]).map(toLoan);
}

export async function getLoan(id: string): Promise<Loan | null> {
  if (!isSupabaseConfigured()) return mockLoanStore().loans.find((loan) => loan.id === id) ?? null;
  const row = unwrap(await (await db()).from("loans").select(COLUMNS).eq("id", id).maybeSingle());
  return row ? toLoan(row as LoanRow) : null;
}

export async function createLoan(input: LoanInput): Promise<Loan> {
  if (!isSupabaseConfigured()) {
    const loan: Loan = { id: `loan-${crypto.randomUUID()}`, ...input, repaidOn: null, repaidAccountId: null };
    mockLoanStore().loans.push(loan);
    return loan;
  }
  const row = unwrap(await (await db()).from("loans").insert(toRow(input)).select(COLUMNS).single());
  return toLoan(row as LoanRow);
}

export async function updateLoan(id: string, input: LoanInput): Promise<Loan | null> {
  if (!isSupabaseConfigured()) {
    const loan = mockLoanStore().loans.find((item) => item.id === id);
    if (!loan) return null;
    Object.assign(loan, input);
    return loan;
  }
  const row = unwrap(await (await db()).from("loans").update(toRow(input)).eq("id", id).select(COLUMNS).maybeSingle());
  return row ? toLoan(row as LoanRow) : null;
}

/** Alacağı kapatır (geri alındı) ya da yeniden açar (repaidOn = null). */
export async function setLoanRepaid(id: string, repaid: { on: DateKey; accountId: string } | null): Promise<Loan | null> {
  if (!isSupabaseConfigured()) {
    const loan = mockLoanStore().loans.find((item) => item.id === id);
    if (!loan) return null;
    loan.repaidOn = repaid?.on ?? null;
    loan.repaidAccountId = repaid?.accountId ?? null;
    return loan;
  }
  const row = unwrap(
    await (await db())
      .from("loans")
      .update({ repaid_on: repaid?.on ?? null, repaid_account_id: repaid?.accountId ?? null })
      .eq("id", id)
      .select(COLUMNS)
      .maybeSingle(),
  );
  return row ? toLoan(row as LoanRow) : null;
}

export async function deleteLoan(id: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    const store = mockLoanStore();
    store.loans = store.loans.filter((loan) => loan.id !== id);
    return;
  }
  unwrap(await (await db()).from("loans").delete().eq("id", id));
}
