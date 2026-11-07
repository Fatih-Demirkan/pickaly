import "server-only";
import { addDays, toDateKey } from "@/lib/dates";
import { isDemoDataEnabled } from "@/lib/env";
import { majorToMinor } from "@/lib/money";
import type { Loan } from "../domain/types";

// GEÇİCİ YEREL VERİ — yalnızca Supabase tanımlı değilken (bilgisayarda next dev) kullanılır; gerçek kullanıcı verisi değildir.
// Varsayılan olarak boş başlar; örnek içerikte (PICKALY_DEMO_DATA=true) iki alacak bulunur.

type Store = { loans: Loan[] };

const globalStore = globalThis as typeof globalThis & { __pickalyLoans?: Store };

function seed(): Store {
  if (!isDemoDataEnabled()) return { loans: [] };
  const today = toDateKey(new Date());
  const day = (offset: number) => addDays(today, offset);
  return {
    loans: [
      { id: "loan-car", person: "Ahmet Kaya", purpose: "Araba tamiri", amountMinor: majorToMinor(3000), accountId: "acc-main", lentOn: day(-10), dueOn: day(4), note: null, repaidOn: null, repaidAccountId: null, items: [] },
      { id: "loan-rent", person: "Elif", purpose: "Kira desteği", amountMinor: majorToMinor(1500), accountId: "acc-main", lentOn: day(-30), dueOn: day(-2), note: null, repaidOn: null, repaidAccountId: null, items: [] },
      {
        id: "loan-bills",
        person: "Babam",
        purpose: "Faturalar",
        amountMinor: majorToMinor(1794),
        accountId: "acc-main",
        lentOn: day(-3),
        dueOn: day(2),
        note: null,
        repaidOn: null,
        repaidAccountId: null,
        items: [
          { id: "bill-gas", label: "Doğalgaz", amountMinor: majorToMinor(1200) },
          { id: "bill-power", label: "Elektrik", amountMinor: majorToMinor(594) },
        ],
      },
    ],
  };
}

export function mockLoanStore(): Store {
  globalStore.__pickalyLoans ??= seed();
  return globalStore.__pickalyLoans;
}
