import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { intlLocale, type Locale } from "@/i18n/config";
import { cn } from "@/lib/cn";
import { formatDateLong, formatWeekday, type DateKey, type WeekStart } from "@/lib/dates";
import { weekDays } from "../domain/agenda";
import { calendarHref } from "../routes";
import type { AgendaEntry } from "./entries";
import { AGENDA_KINDS, kindDot } from "./kindStyle";

// Takvim haftalık şerit (Pages 6:9992 yapısı) — görünüm DESIGN_SYSTEM_PICKALY §5.10: 7 eşit pill hücre, aralık 6;
//   hücre beyaz + elev-1, tam yuvarlak, dikey padding 8; gün adı caption text-secondary, gün button text-primary,
//   altında 6 px tür noktaları (aralık 2) · seçili: siyah zemin, gün adı beyaz %70, gün beyaz
//   bugün (seçili değilken): blue.100 zemin + blue.600 metin.

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
                  "flex flex-col items-center rounded-full py-8 transition-colors",
                  selected
                    ? "bg-surface-selected-strong"
                    : date === today
                      ? "bg-brand-primary-subtle hover:bg-action-secondary-hover"
                      : "bg-surface-card shadow-elev-1 hover:bg-action-tertiary-hover",
                )}
              >
                <span className={cn("text-caption", selected ? "text-text-inverse-secondary" : date === today ? "text-text-brand" : "text-text-secondary")}>
                  {new Intl.DateTimeFormat(intlLocale[locale], { weekday: "short", timeZone: "UTC" }).format(new Date(`${date}T00:00:00Z`))}
                </span>
                <span className={cn("pt-2 text-button", selected ? "text-text-inverse" : date === today ? "text-text-brand" : "text-text-primary")}>{Number(date.slice(8))}</span>
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
