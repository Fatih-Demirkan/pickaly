import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { intlLocale, type Locale } from "@/i18n/config";
import { cn } from "@/lib/cn";
import { formatDateLong, formatWeekday, type DateKey, type WeekStart } from "@/lib/dates";
import { weekDays } from "../domain/agenda";
import { calendarHref } from "../routes";
import type { AgendaEntry } from "./entries";
import { AGENDA_KINDS, kindDot } from "./kindStyle";

// Pages → Takvim Haftalık "7 Günlük Kompakt Şerit" (6:9992): 7 eşit buton, aralık 6;
//   buton surface-card, border-default, radius-md, dikey padding 8; gün adı Body/Small text-secondary,
//   gün Button/Default text-primary, altında 6 px tür noktaları (aralık 2)
//   seçili: Brand/Primary zemin, 2 px beyaz + 2 px Brand/Primary halka; gün adı Brand/Primary Subtle, gün beyaz kalın
// [Varsayım] Bugün (seçili değilken) aylık matristeki gibi Brand/Primary çerçeve ile işaretlenir; Pages'ta ayrı çizilmedi.

type WeekStripProps = { day: DateKey; today: DateKey; byDate: Map<DateKey, AgendaEntry[]>; locale: Locale; weekStart: WeekStart };

export async function WeekStrip({ day, today, byDate, locale, weekStart }: WeekStripProps) {
  const t = await getTranslations("calendar");

  return (
    <nav aria-label={t("matrix.week")}>
      <ul className="grid grid-cols-7 gap-6">
        {weekDays(day, weekStart).map((date) => {
          const entries = byDate.get(date) ?? [];
          const selected = date === day;
          const kinds = AGENDA_KINDS.filter((kind) => entries.some((entry) => entry.kind === kind));
          return (
            <li key={date}>
              <Link
                href={calendarHref({ view: "week", day: date })}
                scroll={false}
                aria-current={selected ? "date" : undefined}
                aria-label={`${formatDateLong(date, locale)} ${formatWeekday(date, locale)}${entries.length ? `, ${t("matrix.dayItems", { count: entries.length })}` : ""}`}
                className={cn(
                  "flex flex-col items-center rounded-md border py-8 transition-colors",
                  selected
                    ? "border-brand-primary bg-brand-primary shadow-[0_0_0_2px_var(--color-surface-card),0_0_0_4px_var(--color-brand-primary)]"
                    : date === today
                      ? "border-brand-primary bg-surface-card hover:bg-surface-page"
                      : "border-border-default bg-surface-card hover:border-border-strong",
                )}
              >
                <span className={cn("text-body-sm", selected ? "text-brand-primary-subtle" : "text-text-secondary")}>
                  {new Intl.DateTimeFormat(intlLocale[locale], { weekday: "short", timeZone: "UTC" }).format(new Date(`${date}T00:00:00Z`))}
                </span>
                <span className={cn("pt-2 text-button", selected ? "font-bold text-text-inverse" : "text-text-primary")}>{Number(date.slice(8))}</span>
                <span aria-hidden className="flex h-12 items-end gap-2">
                  {kinds.map((kind) => (
                    <span key={kind} className={cn("size-6 rounded-full", selected ? "bg-text-inverse" : kindDot[kind])} />
                  ))}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
