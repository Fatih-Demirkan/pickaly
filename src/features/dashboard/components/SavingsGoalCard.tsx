import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { formatSavingsAmount, formatSavingsShort, progressPercent, savingsHref, type SavingsAccountView } from "@/features/savings";
import type { Locale } from "@/i18n/config";

// Pages → Ana Sayfa "Birikim Hedefi" (6:2423, PRD FR-DSH-008).
//   Kart: radius-lg, padding 16, aralık 8, gradyan Brand/Accent → Brand/Primary Hover (yukarıdan aşağı)
//   "BİRİKİM HEDEFİ" Body/Small Brand/Primary Subtle · sağda "%75 Tamamlandı" Yeşil çip
//   hedef adı Heading/H4 beyaz + "Hedef: 60.000 ₺" Body/Small · sağda mevcut tutar Heading/H3 beyaz
//   ilerleme çubuğu 8 px, tam yuvarlak, koyu yarı saydam zemin + Brand/Accent dolgu
// Kart, hedefin Birikim Hesabı Detayı'nı açar. Mobilde en altta, laptop+ bakiye kartının yanında (RESPONSIVE §5.1).
// [Varsayım] Çubuk zemini Pages'ta rgba(0,0,0,.2); en yakın token Neutral/900 %20.

export async function SavingsGoalCard({ goal, locale }: { goal: SavingsAccountView; locale: Locale }) {
  const t = await getTranslations("dashboard.savings");
  const percent = Math.min(progressPercent(goal) ?? 0, 100);

  return (
    <Link
      href={savingsHref(goal.id)}
      aria-labelledby="savings-goal-label savings-goal-title"
      className="flex h-full flex-col justify-between gap-8 rounded-lg bg-linear-to-b from-brand-accent to-brand-primary-hover p-16 text-text-inverse transition-opacity hover:opacity-95"
    >
      <span className="flex items-center justify-between gap-8">
        <span id="savings-goal-label" className="text-body-sm text-brand-primary-subtle uppercase">
          {t("label")}
        </span>
        <span className="inline-flex h-24 items-center rounded-full bg-category-green px-8 text-label-sm text-text-success">{t("completed", { percent })}</span>
      </span>
      <span className="flex items-end justify-between gap-12">
        <span className="flex min-w-0 flex-col">
          <span id="savings-goal-title" className="truncate text-heading-h4">
            {goal.name}
          </span>
          <span className="text-body-sm text-brand-primary-subtle">{goal.target !== null && t("target", { amount: formatSavingsShort(goal.target, goal.unit, locale) })}</span>
        </span>
        <span className="shrink-0 text-end text-heading-h3">{formatSavingsAmount(goal.balance, goal.unit, locale)}</span>
      </span>
      <span
        role="progressbar"
        aria-label={t("progress")}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        className="block h-8 w-full overflow-hidden rounded-full bg-surface-inverse/20"
      >
        <span className="block h-full rounded-full bg-brand-accent" style={{ width: `${percent}%` }} />
      </span>
    </Link>
  );
}
