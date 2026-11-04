import type { MonthKey } from "@/lib/dates";

// Rapor adresleri (TECH_STACK §2: raporlar/[donem]): /raporlar/2026-05 · /raporlar → içinde bulunulan ay ·
//   /raporlar/2026-05/paylas (Paylaşılabilir Rapor).

export function reportHref(month: MonthKey) {
  return `/raporlar/${month}`;
}

export function shareReportHref(month: MonthKey) {
  return `/raporlar/${month}/paylas`;
}
