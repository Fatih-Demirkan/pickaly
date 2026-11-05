import type { ChipVariant } from "@/components/ui/Chip";

// Pages → Takvim lejantı ve ajanda çipleri:
//   Görev: violet ön plan nokta + Görev çipi (violet) · Randevu: Brand/Primary nokta, Yeşil çip (Category/Green)
//   Ödeme: pink ön plan nokta + Ödeme çipi (pink). Renkler DESIGN_SYSTEM_PICKALY §5.10
// [Varsayım] Haftalık şeritte Pages farklı nokta renkleri de kullanıyor (yeşil, turuncu); lejanttaki üç renk esas alındı.

export type AgendaKind = "task" | "appointment" | "payment";

export const kindChip: Record<AgendaKind, ChipVariant> = { task: "task", appointment: "success", payment: "payment" };

export const kindDot: Record<AgendaKind, string> = {
  task: "bg-category-fg-violet",
  appointment: "bg-brand-primary",
  payment: "bg-category-fg-pink",
};

export const AGENDA_KINDS: readonly AgendaKind[] = ["task", "appointment", "payment"];
