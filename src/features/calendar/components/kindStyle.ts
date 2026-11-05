import type { ChipVariant } from "@/components/ui/Chip";

// Pages → Takvim lejantı ve ajanda çipleri:
//   Görev: violet ön plan nokta + Görev çipi (violet) · Ödeme: pink ön plan nokta + Ödeme çipi (pink). Renkler DESIGN_SYSTEM_PICKALY §5.10
// [Karar ürün sahibi 2026-11-05] Görev / Randevu ayrımı arayüzden kaldırıldı: eski randevu kayıtları da Görev olarak gösterilir.

export type AgendaKind = "task" | "payment";

export const kindChip: Record<AgendaKind, ChipVariant> = { task: "task", payment: "payment" };

export const kindDot: Record<AgendaKind, string> = {
  task: "bg-category-fg-violet",
  payment: "bg-category-fg-pink",
};

export const AGENDA_KINDS: readonly AgendaKind[] = ["task", "payment"];
