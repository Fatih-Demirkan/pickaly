import "server-only";
import type { Frequency, ReminderOffset } from "@/lib/recurrence";
import { db, fromBigInt, toBigInt, toBigIntOrNull, unwrap } from "@/lib/supabase/data";
import type { SavingsAccount, SavingsContribution, SavingsMovement } from "../domain/types";
import type { SavingsRepository } from "./repository";

// Birikim hesapları ve hareketleri — Supabase (tablolar: savings_accounts, savings_movements).

type ContributionJson = {
  amount: string;
  frequency: Frequency;
  startDate: string;
  time: string;
  reminder: ReminderOffset;
  sourceAccountId: string;
  generatedThrough: string | null;
};

type AccountRow = {
  id: string;
  name: string;
  kind: SavingsAccount["kind"];
  unit: SavingsAccount["unit"];
  institution: string | null;
  target: number | null;
  opened_at: string;
  note: string | null;
  contribution: ContributionJson | null;
  icon: SavingsAccount["icon"];
  color: SavingsAccount["color"];
};

const ACCOUNT_COLUMNS = "id, name, kind, unit, institution, target, opened_at, note, contribution, icon, color";

function toContribution(json: ContributionJson | null): SavingsContribution | null {
  return json ? { ...json, amount: toBigInt(json.amount) } : null;
}

function fromContribution(contribution: SavingsContribution | null): ContributionJson | null {
  return contribution ? { ...contribution, amount: fromBigInt(contribution.amount) } : null;
}

function toAccount(row: AccountRow): SavingsAccount {
  return {
    id: row.id,
    name: row.name,
    kind: row.kind,
    unit: row.unit,
    institution: row.institution,
    target: toBigIntOrNull(row.target),
    openedAt: row.opened_at,
    note: row.note,
    contribution: toContribution(row.contribution),
    icon: row.icon,
    color: row.color,
  };
}

function accountPatch(patch: Partial<Omit<SavingsAccount, "id">>) {
  const row: Record<string, unknown> = {};
  if (patch.name !== undefined) row.name = patch.name;
  if (patch.kind !== undefined) row.kind = patch.kind;
  if (patch.unit !== undefined) row.unit = patch.unit;
  if (patch.institution !== undefined) row.institution = patch.institution;
  if (patch.target !== undefined) row.target = fromBigInt(patch.target);
  if (patch.openedAt !== undefined) row.opened_at = patch.openedAt;
  if (patch.note !== undefined) row.note = patch.note;
  if (patch.contribution !== undefined) row.contribution = fromContribution(patch.contribution);
  if (patch.icon !== undefined) row.icon = patch.icon;
  if (patch.color !== undefined) row.color = patch.color;
  return row;
}

type MovementRow = {
  id: string;
  account_id: string;
  direction: SavingsMovement["direction"];
  amount: number;
  transfer_minor: number | null;
  bank_account_id: string | null;
  occurred_at: string;
  source: SavingsMovement["source"];
};

const MOVEMENT_COLUMNS = "id, account_id, direction, amount, transfer_minor, bank_account_id, occurred_at, source";

function toMovement(row: MovementRow): SavingsMovement {
  return {
    id: row.id,
    accountId: row.account_id,
    direction: row.direction,
    amount: toBigInt(row.amount),
    transferMinor: toBigIntOrNull(row.transfer_minor),
    bankAccountId: row.bank_account_id,
    occurredAt: new Date(row.occurred_at).toISOString(),
    source: row.source,
  };
}

export const supabaseSavingsRepository: SavingsRepository = {
  async listAccounts() {
    const rows = unwrap(await (await db()).from("savings_accounts").select(ACCOUNT_COLUMNS).order("created_at"));
    return (rows as AccountRow[]).map(toAccount);
  },
  async getAccount(id) {
    const row = unwrap(await (await db()).from("savings_accounts").select(ACCOUNT_COLUMNS).eq("id", id).maybeSingle());
    return row ? toAccount(row as AccountRow) : null;
  },
  async createAccount(account) {
    const row = unwrap(await (await db()).from("savings_accounts").insert(accountPatch(account)).select(ACCOUNT_COLUMNS).single());
    return toAccount(row as AccountRow);
  },
  async updateAccount(id, patch) {
    const row = unwrap(await (await db()).from("savings_accounts").update(accountPatch(patch)).eq("id", id).select(ACCOUNT_COLUMNS).maybeSingle());
    return row ? toAccount(row as AccountRow) : null;
  },
  async removeAccount(id) {
    unwrap(await (await db()).from("savings_accounts").delete().eq("id", id));
  },
  async listMovements(accountId) {
    let query = (await db()).from("savings_movements").select(MOVEMENT_COLUMNS);
    if (accountId) query = query.eq("account_id", accountId);
    const rows = unwrap(await query);
    return (rows as MovementRow[]).map(toMovement);
  },
  async createMovement(movement) {
    const row = unwrap(
      await (await db())
        .from("savings_movements")
        .insert({
          account_id: movement.accountId,
          direction: movement.direction,
          amount: fromBigInt(movement.amount),
          transfer_minor: fromBigInt(movement.transferMinor),
          bank_account_id: movement.bankAccountId,
          occurred_at: movement.occurredAt,
          source: movement.source,
        })
        .select(MOVEMENT_COLUMNS)
        .single(),
    );
    return toMovement(row as MovementRow);
  },
};
