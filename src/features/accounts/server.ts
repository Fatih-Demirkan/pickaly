import "server-only";
import { isSupabaseConfigured } from "@/lib/env";
import { db, toBigInt, unwrap } from "@/lib/supabase/data";
import type { Account } from "./domain/types";
import { mockAccounts } from "./data/mock-accounts";

// Hesap verisine sunucu tarafı erişim. Supabase tanımlıysa veritabanı (kullanıcıya özel, RLS), değilse yerel depo.
// Kayıtta "Ana Hesap" veritabanı tetikleyicisiyle oluşturulur (FR-AUTH-005). [Eksik] Profil → Hesaplarım ekranı yok.

type AccountRow = { id: string; name: string; detail: string | null; opening_balance_minor: number };

export async function listAccounts(): Promise<Account[]> {
  if (!isSupabaseConfigured()) return mockAccounts;
  const rows = unwrap(
    await (await db()).from("accounts").select("id, name, detail, opening_balance_minor").order("is_default", { ascending: false }).order("created_at"),
  ) as AccountRow[];
  return rows.map((row) => ({ id: row.id, name: row.name, detail: row.detail, openingBalanceMinor: toBigInt(row.opening_balance_minor) }));
}

export async function getAccountMap(): Promise<Map<string, Account>> {
  return new Map((await listAccounts()).map((account) => [account.id, account]));
}
