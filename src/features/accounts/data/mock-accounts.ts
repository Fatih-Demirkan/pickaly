import "server-only";
import { majorToMinor } from "@/lib/money";
import type { Account } from "../domain/types";

// GEÇİCİ YEREL ÖRNEK VERİ — gerçek kullanıcı verisi değildir; Supabase bağlanınca kaldırılır.
// Hesap adları Pages'taki işlem satırlarından ("Ana Hesap", "Kredi Kartı") alınmıştır.

export const mockAccounts: Account[] = [
  { id: "acc-main", name: "Ana Hesap", detail: "Banka Kartı (••4821)", openingBalanceMinor: majorToMinor(12000) },
  { id: "acc-card", name: "Kredi Kartı", detail: null, openingBalanceMinor: majorToMinor(0) },
];
