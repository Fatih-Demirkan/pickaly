import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { formatSavingsAmount, progressPercent, savingsHref, type SavingsAccountView } from "@/features/savings";
import type { Locale } from "@/i18n/config";
import { cn } from "@/lib/cn";

// Ana Sayfa Birikim Hedefi (PRD FR-DSH-008). DESIGN_SYSTEM.md §A8 Progress meter + DESIGN_SYSTEM_PICKALY.md §5.2.
// Teal gradyanlı kart kaldırıldı; standart beyaz kart (radius-lg, padding 16, elev-1).
//   Üst satır: caption "Birikim Hedefi" + title-sm hedef adı · sağda caption-strong "%75 tamamlandı"
//   Noktalı iz: dolu noktalar blue.500 (brand-accent), boş noktalar blue.300 %40; ilerleme ucunda knob (blue.500 + blue.200 hale)
//   Alt satır: "mevcut / hedef" | "%n". Yüzde her zaman metin olarak da yazılır (renk tek başına anlam taşımaz).
// Kart, hedefin Birikim Hesabı Detayı'nı açar. Mobilde en altta, laptop+ bakiye bloğunun yanında (RESPONSIVE §5.1).

const DOTS = 28;

export async function SavingsGoalCard({ goal, locale }: { goal: SavingsAccountView; locale: Locale }) {
  const t = await getTranslations("dashboard.savings");
  const percent = Math.min(progressPercent(goal) ?? 0, 100);
  const filled = Math.round((percent / 100) * DOTS);
  const amount = formatSavingsAmount(goal.balance, goal.unit, locale);
  const target = goal.target !== null ? formatSavingsAmount(goal.target, goal.unit, locale) : null;

  return (
    <Link
      href={savingsHref(goal.id)}
      aria-labelledby="savings-goal-label savings-goal-title"
      className="flex h-full flex-col justify-between gap-16 rounded-lg bg-surface-card p-16 text-text-primary shadow-elev-1 transition-colors hover:bg-action-tertiary-hover"
    >
      <span className="flex items-start justify-between gap-12">
        <span className="flex min-w-0 flex-col">
          <span id="savings-goal-label" className="text-caption text-text-secondary">
            {t("label")}
          </span>
          <span id="savings-goal-title" className="truncate text-title-sm">
            {goal.name}
          </span>
        </span>
        <span className="shrink-0 text-caption-strong text-text-secondary">{t("completed", { percent })}</span>
      </span>

      <span
        role="progressbar"
        aria-label={t("progress")}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        className="flex h-16 items-center justify-between"
      >
        {Array.from({ length: DOTS }, (_, index) => {
          const knob = filled > 0 && index === filled - 1;
          return (
            <span
              key={index}
              aria-hidden
              className={cn(
                "shrink-0 rounded-full",
                knob ? "size-12 bg-progress-fill shadow-[0_0_0_4px_var(--color-progress-halo)]" : "size-6",
                !knob && (index < filled ? "bg-progress-fill" : "bg-progress-track/40"),
              )}
            />
          );
        })}
      </span>

      <span className="flex items-baseline justify-between gap-12 text-caption text-text-secondary">
        <span className="min-w-0 truncate">
          <span className="text-body-strong text-text-primary">{amount}</span>
          {target && <> / {target}</>}
        </span>
        <span className="shrink-0">{t("percent", { percent })}</span>
      </span>
    </Link>
  );
}
