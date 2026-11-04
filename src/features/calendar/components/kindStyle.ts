import type { ChipVariant } from "@/components/ui/Chip";

// Pages → Takvim lejantı ve ajanda çipleri:
//   Görev: Chart/Balance nokta, Görev çipi (Category/Blue) · Randevu: Brand/Primary nokta, Yeşil çip (Category/Green)
//   Ödeme: Semantic/Gider - Hata nokta, Ödeme çipi (Category/Pink)
// [Varsayım] Haftalık şeritte Pages farklı nokta renkleri de kullanıyor (yeşil, turuncu); lejanttaki üç renk esas alındı.

export type AgendaKind = "task" | "appointment" | "payment";

export const kindChip: Record<AgendaKind, ChipVariant> = { task: "task", appointment: "success", payment: "payment" };

export const kindDot: Record<AgendaKind, string> = {
  task: "bg-chart-balance",
  appointment: "bg-brand-primary",
  payment: "bg-status-danger",
};

export const AGENDA_KINDS: readonly AgendaKind[] = ["task", "appointment", "payment"];
