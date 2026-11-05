import "server-only";
import { isDemoDataEnabled } from "@/lib/env";
import { majorToMinor } from "@/lib/money";
import type { Account, AccountTransfer } from "../domain/types";

// GEÇİCİ YEREL VERİ — yalnızca Supabase tanımlı değilken (bilgisayarda next dev) kullanılır; gerçek kullanıcı verisi değildir.
// Yeni hesapta yalnızca "Ana Hesap" (0 ₺) bulunur (PRD FR-AUTH-005).
// Örnek içerikte (PICKALY_DEMO_DATA=true) Pages'taki işlem satırlarındaki iki hesap ("Ana Hesap", "Kredi Kartı") kullanılır.
// Değişiklikler sunucu süreci boyunca bellekte tutulur (globalThis: dev yeniden derlemede kaybolmasın).

type Store = { accounts: Account[]; transfers: AccountTransfer[] };

const globalStore = globalThis as typeof globalThis & { __pickalyAccounts?: Store };

function seed(): Store {
  const accounts: Account[] = isDemoDataEnabled()
    ? [
        { id: "acc-main", name: "Ana Hesap", detail: "Banka Kartı (••4821)", openingBalanceMinor: majorToMinor(12000), isDefault: true, archived: false },
        { id: "acc-card", name: "Kredi Kartı", detail: null, openingBalanceMinor: majorToMinor(0), isDefault: false, archived: false },
      ]
    : [{ id: "acc-main", name: "Ana Hesap", detail: null, openingBalanceMinor: majorToMinor(0), isDefault: true, archived: false }];
  return { accounts, transfers: [] };
}

export function mockAccountStore(): Store {
  globalStore.__pickalyAccounts ??= seed();
  return globalStore.__pickalyAccounts;
}
