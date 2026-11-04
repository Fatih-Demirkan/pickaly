import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { formatMonthLabel, shiftMonth, type MonthKey } from "@/lib/dates";
import type { Locale } from "@/i18n/config";

// Ay seçici (İşlemler, Aylık Finans Raporu). DESIGN_SYSTEM_PICKALY §5.2 kart dili:
// 44 px beyaz pill, elev-1, yatay 6; iki yanda 32 px yuvarlak ok butonu; ortada calendar 16 + ay adı (body-strong).
// Adresleri çağıran üretir.

type MonthSwitcherProps = {
  month: MonthKey;
  hrefFor: (month: MonthKey) => string;
  locale: Locale;
  labels: { previous: string; next: string; period: string };
};

const arrowClass =
  "touch-target inline-flex size-32 items-center justify-center rounded-full text-text-primary transition-colors hover:bg-action-tertiary-hover";

export function MonthSwitcher({ month, hrefFor, locale, labels }: MonthSwitcherProps) {
  return (
    <div className="flex h-44 items-center justify-between gap-8 rounded-full bg-surface-card px-6 shadow-elev-1">
      <Link href={hrefFor(shiftMonth(month, -1))} scroll={false} aria-label={labels.previous} className={arrowClass}>
        <Icon icon="previous" size="sm" />
      </Link>
      <p className="flex items-center gap-8 text-body-strong text-text-primary" aria-live="polite">
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
