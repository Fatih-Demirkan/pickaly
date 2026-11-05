import type { ChipVariant } from "@/components/ui/Chip";
import { Icon } from "@/components/ui/Icon";
import type { AppIconName } from "@/config/icons";
import { cn } from "@/lib/cn";
import type { SavingsAccount, SavingsIconName, SavingsKind } from "../domain/types";

// Pages → Birikimler kart görselleri:
//   ikon karosu 36 px, radius-sm (Acil Durum Fonu: Category/Red + octagon-alert · Ev Peşinatı: Category/Green + birdhouse)
//   tür çipi: "Vadeli" Görev (Category/Blue) · "Altın" Turuncu (Category/Orange)
//   ilerleme: noktalı Progress meter (src/components/ui/ProgressMeter.tsx; ürün sahibi kararı 2026-11-05)
// [Varsayım] Yatırım Fonu / Döviz / Nakit türlerinin çipi çizilmedi: Genel. Yeni hesabın ikonu Birikimler nav ikonu.

const iconOf: Record<SavingsIconName, AppIconName> = { emergency: "emergency", home: "savingsHome", savings: "savings" };

const toneOf: Record<SavingsAccount["color"], string> = {
  red: "bg-category-red text-category-fg-red",
  green: "bg-category-green text-category-fg-green",
  blue: "bg-category-blue text-category-fg-blue",
  orange: "bg-category-orange text-category-fg-orange",
  slate: "bg-category-slate text-category-fg-slate",
};

export const kindChip: Record<SavingsKind, ChipVariant> = { deposit: "task", gold: "warning", fund: "neutral", currency: "neutral", cash: "neutral" };

export function SavingsIcon({ account }: { account: Pick<SavingsAccount, "icon" | "color"> }) {
  return (
    <span aria-hidden className={cn("inline-flex size-36 shrink-0 items-center justify-center rounded-sm", toneOf[account.color])}>
      <Icon icon={iconOf[account.icon]} />
    </span>
  );
}
