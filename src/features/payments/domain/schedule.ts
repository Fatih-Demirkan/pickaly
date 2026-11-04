import { daysBetween, type DateKey } from "@/lib/dates";
import type { Payment } from "./types";

// Saf ödeme takvimi hesapları: React, Next veya veri katmanı import etmez.

/** Ödeme örnekleri vadeden bu kadar ileriye kadar üretilir (BR-REC-001: 3 ay). */
export const GENERATION_HORIZON_MONTHS = 3;

/** Ana Sayfa "Yaklaşan Ödemeler": gecikmişler + önümüzdeki 7 gün (PRD FR-DSH-007, Q-1). Bugünkü vadeler Bugünün Akışı'ndadır. */
export const UPCOMING_WINDOW_DAYS = 7;

/** [Varsayım] Bu kadar gün veya daha az kaldıysa kalan süre Semantic/Gider - Hata rengiyle gösterilir (Pages: "3 gün kaldı"). */
export const URGENT_DAYS = 3;

export type DueState = { kind: "overdue"; days: number } | { kind: "today" } | { kind: "upcoming"; days: number };

/** Vadeye kalan süre. Vadesi geçmiş ve ödenmemiş ödeme "Gecikmiş" sayılır (BR-PAY-005). */
export function dueState(dueDate: DateKey, today: DateKey): DueState {
  const days = daysBetween(today, dueDate);
  if (days < 0) return { kind: "overdue", days: -days };
  if (days === 0) return { kind: "today" };
  return { kind: "upcoming", days };
}

export function isUrgent(state: DueState): boolean {
  return state.kind !== "upcoming" || state.days <= URGENT_DAYS;
}

/** Gecikmişler başta, sonra vadesi en yakın olan (BR-PAY-005). */
export function compareByDue(a: Pick<Payment, "dueDate">, b: Pick<Payment, "dueDate">): number {
  return a.dueDate.localeCompare(b.dueDate);
}
