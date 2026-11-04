import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { formatMonthLabel, shiftMonth, type MonthKey } from "@/lib/dates";
import type { Locale } from "@/i18n/config";

// Pages → İşlemler ay seçici: 40 px, padding 8/16, radius-md, surface-card, border-default;
// chevron-left / chevron-right 16 px text-secondary, ortada calendar 16 + ay adı (Body/Large).
// İşlemler ve Aylık Finans Raporu (136:7660) aynı seçiciyi kullanır; adresleri çağıran üretir.

type MonthSwitcherProps = {
  month: MonthKey;
  hrefFor: (month: MonthKey) => string;
  locale: Locale;
  labels: { previous: string; next: string; period: string };
};

const arrowClass =
  "touch-target inline-flex size-24 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-action-tertiary-hover hover:text-text-primary";

export function MonthSwitcher({ month, hrefFor, locale, labels }: MonthSwitcherProps) {
  return (
    <div className="flex h-40 items-center justify-between gap-8 rounded-md border border-border-default bg-surface-card px-16 py-8">
      <Link href={hrefFor(shiftMonth(month, -1))} scroll={false} aria-label={labels.previous} className={arrowClass}>
        <Icon icon="previous" size="sm" />
      </Link>
      <p className="flex items-center gap-8 text-body-lg text-text-primary" aria-live="polite">
        <span className="text-text-secondary">
          <Icon icon="calendar" size="sm" />
        </span>
        <span className="sr-only">{labels.period}: </span>
        {formatMonthLabel(month, locale)}
      </p>
      <Link href={hrefFor(shiftMonth(month, 1))} scroll={false} aria-label={labels.next} className={arrowClass}>
        <Icon icon="next" size="sm" />
      </Link>
    </div>
  );
}
