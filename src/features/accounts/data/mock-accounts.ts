import "server-only";
import { isDemoDataEnabled } from "@/lib/env";
import { majorToMinor } from "@/lib/money";
import type { Account } from "../domain/types";

// GEÇİCİ YEREL VERİ — gerçek kullanıcı verisi değildir; Supabase bağlanınca kaldırılır.
// Yeni hesapta yalnızca "Ana Hesap" (0 ₺) bulunur (PRD FR-AUTH-005, D-29: kayıt sonrası otomatik oluşturulur).
// Örnek içerikte (PICKALY_DEMO_DATA=true) Pages'taki işlem satırlarındaki iki hesap ("Ana Hesap", "Kredi Kartı") kullanılır.

export const mockAccounts: Account[] = isDemoDataEnabled()
  ? [
      { id: "acc-main", name: "Ana Hesap", detail: "Banka Kartı (••4821)", openingBalanceMinor: majorToMinor(12000) },
      { id: "acc-card", name: "Kredi Kartı", detail: null, openingBalanceMinor: majorToMinor(0) },
    ]
  : [{ id: "acc-main", name: "Ana Hesap", detail: null, openingBalanceMinor: majorToMinor(0) }];
