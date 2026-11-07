import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { Icon } from "@/components/ui/Icon";
import { dueMessage } from "@/features/payments/components/PaymentStatusChip";
import { dueState, isUrgent } from "@/features/payments/domain/schedule";
import { isLocale } from "@/i18n/config";
import { cn } from "@/lib/cn";
import { addDays, formatDayMonth, type DateKey } from "@/lib/dates";
import { formatMoney } from "@/lib/money";
import { loanTitle } from "../domain/types";
import { LOANS_PATH, loanHref } from "../routes";
import { listLoans } from "../server";
import { MarkRepaidButton } from "./RepaidButtons";

// Ana Sayfa "Yaklaşan Alacaklar" (ürün sahibi isteği 2026-11-07). Yaklaşan Ödemeler kartının dili (DESIGN_SYSTEM_PICKALY
// §5.3; PaymentCard "upcoming"):
//   Gecikmiş açık alacaklar başta, sonra önümüzdeki 7 gün; en fazla 3 kart. Açık alacak yoksa bölüm hiç gösterilmez.
//   Kart: 36 px teal ikon karosu + "Kişi · Ne için" body-strong; alt satır vade caption-strong • kalan süre caption
//   (≤ 3 gün / gecikmiş: text-danger) · sağda + tutar text-success (geri alınınca hesaba girer).
//   Vadesi yakın / gecikmiş alacakta "Geri alındı" Secondary SM: kart listesi ≥ 32rem ise sağda, dar ise altta tam genişlik.
// "Tümü (n)" Profil → Alacaklarım'a gider.

const WINDOW_DAYS = 7;
const VISIBLE_LIMIT = 3;

export async function UpcomingLoans({ today }: { today: DateKey }) {
  const [t, rawLocale, loans] = await Promise.all([getTranslations("loans"), getLocale(), listLoans()]);
  const locale = isLocale(rawLocale) ? rawLocale : "tr";
  const limit = addDays(today, WINDOW_DAYS);
  const upcoming = loans.filter((loan) => loan.repaidOn === null && loan.dueOn <= limit).sort((a, b) => a.dueOn.localeCompare(b.dueOn));
  if (upcoming.length === 0) return null;

  return (
    <section aria-labelledby="upcoming-loans-title" className="flex flex-col gap-12">
      <SectionHeader id="upcoming-loans-title" icon="loan" title={t("upcoming.title")} link={{ href: LOANS_PATH, label: t("upcoming.all", { count: upcoming.length }) }} />
      <ul className="@container flex flex-col gap-8">
        {upcoming.slice(0, VISIBLE_LIMIT).map((loan) => {
          const due = dueState(loan.dueOn, today);
          const message = dueMessage(due);
          const urgent = isUrgent(due);
          const action = (fullWidth?: boolean) => <MarkRepaidButton loanId={loan.id} variant="secondary" size="sm" fullWidth={fullWidth} className="relative" />;
          return (
            <li key={loan.id} className="relative flex flex-col gap-12 rounded-md bg-surface-card p-12 shadow-elev-1 transition-colors hover:bg-action-tertiary-hover">
              <div className="flex items-start gap-12">
                <span aria-hidden className="inline-flex size-36 shrink-0 items-center justify-center rounded-sm bg-category-teal text-category-fg-teal">
                  <Icon icon="loan" />
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <Link href={loanHref(loan.id)} className="truncate text-body-strong text-text-primary after:absolute after:inset-0 after:rounded-md">
                    {loanTitle(loan)}
                  </Link>
                  <p className="flex min-w-0 items-center gap-8 text-caption">
                    <span className="shrink-0 text-caption-strong text-text-primary">{formatDayMonth(loan.dueOn, locale)}</span>
                    <span aria-hidden className="text-text-secondary">
                      •
                    </span>
                    <span className={cn("truncate", urgent ? "text-text-danger" : "text-text-secondary")}>{t(`upcoming.due.${message.key}`, message.values)}</span>
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-8">
                  <p className="text-end text-body-strong text-text-success">{formatMoney(loan.amountMinor, locale, "always")}</p>
                  {urgent && <div className="hidden @[32rem]:block">{action()}</div>}
                </div>
              </div>
              {urgent && <div className="@[32rem]:hidden">{action(true)}</div>}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
