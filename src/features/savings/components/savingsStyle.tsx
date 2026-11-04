import type { ChipVariant } from "@/components/ui/Chip";
import { Icon } from "@/components/ui/Icon";
import type { AppIconName } from "@/config/icons";
import { cn } from "@/lib/cn";
import type { SavingsAccount, SavingsIconName, SavingsKind } from "../domain/types";

// Pages → Birikimler kart görselleri:
//   ikon kutusu 40 px, radius-md (Acil Durum Fonu: Category/Red + octagon-alert · Ev Peşinatı: Category/Green + birdhouse)
//   tür çipi: "Vadeli" Görev (Category/Blue) · "Altın" Turuncu (Category/Orange)
//   ilerleme çubuğu: 8 px, tam yuvarlak, Neutral/50 zemin + Border/Default çerçeve, Brand/Primary dolgu
// [Varsayım] Yatırım Fonu / Döviz / Nakit türlerinin çipi çizilmedi: Genel. Yeni hesabın ikonu Birikimler nav ikonu.

const iconOf: Record<SavingsIconName, AppIconName> = { emergency: "emergency", home: "savingsHome", savings: "savings" };

const toneOf: Record<SavingsAccount["color"], string> = {
  red: "bg-category-red text-status-danger",
  green: "bg-category-green text-status-success",
  blue: "bg-category-blue text-text-on-task",
  orange: "bg-category-orange text-text-warning",
  slate: "bg-category-slate text-text-secondary",
};

export const kindChip: Record<SavingsKind, ChipVariant> = { deposit: "task", gold: "warning", fund: "neutral", currency: "neutral", cash: "neutral" };

export function SavingsIcon({ account }: { account: Pick<SavingsAccount, "icon" | "color"> }) {
  return (
    <span aria-hidden className={cn("inline-flex size-40 shrink-0 items-center justify-center rounded-md", toneOf[account.color])}>
      <Icon icon={iconOf[account.icon]} />
    </span>
  );
}

export function ProgressBar({ percent, label }: { percent: number; label: string }) {
  const value = Math.max(0, Math.min(100, percent));
  return (
    <span
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}
      className="block h-8 w-full overflow-hidden rounded-full border border-border-default bg-surface-page"
    >
      <span className="block h-full rounded-full bg-brand-primary" style={{ width: `${value}%` }} />
    </span>
  );
}
