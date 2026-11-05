import type { Payment, RecurringPayment } from "@/features/payments";
import type { DateKey } from "@/lib/dates";
import type { CalendarItem } from "../domain/types";
import type { AgendaKind } from "./kindStyle";

// Ajanda girdisi: görev / randevu veya vadesi o gün olan ödeme (PRD FR-CAL-013). Takvim, ajanda ve çizelge
// aynı listeyi kullanır.

export type AgendaEntry =
  | { type: "item"; key: string; kind: AgendaKind; date: DateKey; time: string | null; done: boolean; title: string; item: CalendarItem }
  | { type: "payment"; key: string; kind: AgendaKind; date: DateKey; time: string; done: boolean; title: string; payment: Payment; series: RecurringPayment };

export function buildEntries(items: readonly CalendarItem[], payments: readonly { payment: Payment; series: RecurringPayment }[]): AgendaEntry[] {
  const entries: AgendaEntry[] = [
    ...items.map((item) => ({ type: "item" as const, key: item.id, kind: "task" as const, date: item.date, time: item.time, done: item.status === "done", title: item.title, item })),
    ...payments.map(({ payment, series }) => ({
      type: "payment" as const,
      key: payment.id,
      kind: "payment" as const,
      date: payment.dueDate,
      time: series.dueTime,
      done: payment.status === "paid",
      title: series.title,
      payment,
      series,
    })),
  ];
  // Tüm gün kayıtlar başta, sonra saat sırası.
  return entries.sort((a, b) => a.date.localeCompare(b.date) || (a.time ?? "").localeCompare(b.time ?? ""));
}

export function groupByDate(entries: readonly AgendaEntry[]): Map<DateKey, AgendaEntry[]> {
  const map = new Map<DateKey, AgendaEntry[]>();
  for (const entry of entries) map.set(entry.date, [...(map.get(entry.date) ?? []), entry]);
  return map;
}

export function countByKind(entries: readonly AgendaEntry[]): Record<AgendaKind, number> {
  const counts: Record<AgendaKind, number> = { task: 0, payment: 0 };
  for (const entry of entries) counts[entry.kind] += 1;
  return counts;
}
