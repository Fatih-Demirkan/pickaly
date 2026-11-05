import "server-only";
import { isSupabaseConfigured } from "@/lib/env";
import { db, fromBigInt, toBigInt, unwrap } from "@/lib/supabase/data";
import type { Account, AccountTransfer } from "./domain/types";
import { mockAccountStore } from "./data/mock-accounts";

// Hesap ve hesaplar arası aktarım verisine sunucu tarafı erişim. Supabase tanımlıysa veritabanı (kullanıcıya özel,
// RLS), değilse yerel depo. Kayıtta "Ana Hesap" veritabanı tetikleyicisiyle oluşturulur (FR-AUTH-005).

type AccountRow = { id: string; name: string; detail: string | null; opening_balance_minor: number; is_default: boolean; archived_at: string | null };
type TransferRow = { id: string; from_account_id: string; to_account_id: string; amount_minor: number; occurred_at: string; note: string | null };

const ACCOUNT_COLUMNS = "id, name, detail, opening_balance_minor, is_default, archived_at";
const TRANSFER_COLUMNS = "id, from_account_id, to_account_id, amount_minor, occurred_at, note";

function toAccount(row: AccountRow): Account {
  return {
    id: row.id,
    name: row.name,
    detail: row.detail,
    openingBalanceMinor: toBigInt(row.opening_balance_minor),
    isDefault: row.is_default,
    archived: row.archived_at !== null,
  };
}

function toTransfer(row: TransferRow): AccountTransfer {
  return {
    id: row.id,
    fromAccountId: row.from_account_id,
    toAccountId: row.to_account_id,
    amountMinor: toBigInt(row.amount_minor),
    occurredAt: new Date(row.occurred_at).toISOString(),
    note: row.note,
  };
}

/** Hesaplar: varsayılan hesap önce, sonra oluşturulma sırası. Seçiciler için arşivlenmişler varsayılan olarak hariç. */
export async function listAccounts({ includeArchived = false }: { includeArchived?: boolean } = {}): Promise<Account[]> {
  if (!isSupabaseConfigured()) {
    const { accounts } = mockAccountStore();
    return includeArchived ? [...accounts] : accounts.filter((account) => !account.archived);
  }
  let query = (await db()).from("accounts").select(ACCOUNT_COLUMNS).order("is_default", { ascending: false }).order("created_at");
  if (!includeArchived) query = query.is("archived_at", null);
  return (unwrap(await query) as AccountRow[]).map(toAccount);
}

/** Tüm hesaplar (arşivlenmiş dahil): geçmiş kayıtlarda hesap adı gösterimi ve bakiye hesabı için. */
export async function getAccountMap(): Promise<Map<string, Account>> {
  return new Map((await listAccounts({ includeArchived: true })).map((account) => [account.id, account]));
}

export async function getAccount(id: string): Promise<Account | null> {
  return (await getAccountMap()).get(id) ?? null;
}

type AccountInput = { name: string; detail: string | null; openingBalanceMinor: bigint };

export async function createAccount(input: AccountInput): Promise<Account> {
  if (!isSupabaseConfigured()) {
    const account: Account = { id: `acc-${crypto.randomUUID()}`, ...input, isDefault: false, archived: false };
    mockAccountStore().accounts.push(account);
    return account;
  }
  const row = unwrap(
    await (await db())
      .from("accounts")
      .insert({ name: input.name, detail: input.detail, opening_balance_minor: fromBigInt(input.openingBalanceMinor) })
      .select(ACCOUNT_COLUMNS)
      .single(),
  );
  return toAccount(row as AccountRow);
}

export async function updateAccount(id: string, input: AccountInput): Promise<Account | null> {
  if (!isSupabaseConfigured()) {
    const account = mockAccountStore().accounts.find((item) => item.id === id);
    if (!account) return null;
    Object.assign(account, input);
    return account;
  }
  const row = unwrap(
    await (await db())
      .from("accounts")
      .update({ name: input.name, detail: input.detail, opening_balance_minor: fromBigInt(input.openingBalanceMinor) })
      .eq("id", id)
      .select(ACCOUNT_COLUMNS)
      .maybeSingle(),
  );
  return row ? toAccount(row as AccountRow) : null;
}

export async function setAccountArchived(id: string, archived: boolean): Promise<void> {
  if (!isSupabaseConfigured()) {
    const account = mockAccountStore().accounts.find((item) => item.id === id);
    if (account) account.archived = archived;
    return;
  }
  unwrap(await (await db()).from("accounts").update({ archived_at: archived ? new Date().toISOString() : null }).eq("id", id));
}

export async function deleteAccount(id: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    const store = mockAccountStore();
    store.accounts = store.accounts.filter((account) => account.id !== id);
    return;
  }
  unwrap(await (await db()).from("accounts").delete().eq("id", id));
}

/**
 * Hesaba bağlı kayıt var mı? Varsa hesap silinmez, arşivlenir (geçmiş korunur).
 * İşlemler, tekrar kuralları, abonelikler, birikimler, birikim hareketleri ve hesaplar arası aktarımlar sayılır.
 */
export async function isAccountInUse(id: string, transactionAccountIds: ReadonlySet<string>): Promise<boolean> {
  if (transactionAccountIds.has(id)) return true;
  const transfers = await listTransfers();
  if (transfers.some((transfer) => transfer.fromAccountId === id || transfer.toAccountId === id)) return true;
  if (!isSupabaseConfigured()) return false;
  const client = await db();
  const checks = await Promise.all([
    client.from("recurring_rules").select("id", { count: "exact", head: true }).filter("template->>accountId", "eq", id),
    client.from("recurring_payments").select("id", { count: "exact", head: true }).eq("account_id", id),
    client.from("savings_accounts").select("id", { count: "exact", head: true }).eq("account_id", id),
    client.from("savings_movements").select("id", { count: "exact", head: true }).eq("bank_account_id", id),
  ]);
  return checks.some((result) => (result.count ?? 0) > 0);
}

export async function listTransfers(): Promise<AccountTransfer[]> {
  if (!isSupabaseConfigured()) return [...mockAccountStore().transfers];
  const rows = unwrap(await (await db()).from("account_transfers").select(TRANSFER_COLUMNS).order("occurred_at", { ascending: false }));
  return (rows as TransferRow[]).map(toTransfer);
}

export async function createTransfer(input: Omit<AccountTransfer, "id">): Promise<AccountTransfer> {
  if (!isSupabaseConfigured()) {
    const transfer: AccountTransfer = { id: `trf-${crypto.randomUUID()}`, ...input };
    mockAccountStore().transfers.unshift(transfer);
    return transfer;
  }
  const row = unwrap(
    await (await db())
      .from("account_transfers")
      .insert({
        from_account_id: input.fromAccountId,
        to_account_id: input.toAccountId,
        amount_minor: fromBigInt(input.amountMinor),
        occurred_at: input.occurredAt,
        note: input.note,
      })
      .select(TRANSFER_COLUMNS)
      .single(),
  );
  return toTransfer(row as TransferRow);
}
