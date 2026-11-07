import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { intlLocale, type Locale } from "@/i18n/config";
import { cn } from "@/lib/cn";
import { formatDateLong, formatWeekday, type DateKey, type WeekStart } from "@/lib/dates";
import { monthMatrix } from "../domain/agenda";
import { calendarHref, type CalendarQuery } from "../routes";
import type { AgendaEntry } from "./entries";
import { AGENDA_KINDS, kindDot, type AgendaKind } from "./kindStyle";

// Takvim aylık matris (Pages 6:6470 yapısı) — görünüm DESIGN_SYSTEM_PICKALY §5.10:
//   kart beyaz, radius-lg, padding 8, elev-1 · gün başlıkları caption-strong text-secondary
//   hücre 44 px, mobil/tablet tam yuvarlak (laptop+ içerikli hücre radius-md), aralık 4 · gün body text-primary
//   hafta sonu ve ay dışı günler text-secondary · bugün: blue.100 zemin + blue.600 body-strong
//   seçili: siyah zemin + beyaz body-strong (seçim = siyah) · altında 6 px tür noktaları · lejant: Görev · Ödeme
// Responsive (RESPONSIVE §3.2.1):
//   mobil: noktalar · tablet: tür başına adet rozeti (nokta + sayı) · laptop+: ilk 2 kaydın başlığı küçük çip, fazlası "+n"
// [Varsayım] Adet rozeti ve hücre çipi görünümü çizilmedi; lejant renkleri ve Chip-Kategori'nin küçük hali kullanıldı.

const cellChip: Record<AgendaKind, string> = {
  task: "bg-category-violet text-category-fg-violet",
  payment: "bg-category-pink text-category-fg-pink",
  loan: "bg-category-teal text-category-fg-teal",
};

type MonthMatrixProps = {
  month: string;
  day: DateKey;
  today: DateKey;
  byDate: Map<DateKey, AgendaEntry[]>;
  locale: Locale;
  query: CalendarQuery;
  weekStart: WeekStart;
};

/** Cumartesi ve Pazar, haftanın ilk gününden bağımsız olarak hafta sonudur. */
function isWeekend(date: DateKey) {
  const day = new Date(`${date}T00:00:00Z`).getUTCDay();
  return day === 0 || day === 6;
}

export async function MonthMatrix({ month, day, today, byDate, locale, query, weekStart }: MonthMatrixProps) {
  const t = await getTranslations("calendar");
  const days = monthMatrix(month, weekStart);
  const weeks = Array.from({ length: days.length / 7 }, (_, index) => days.slice(index * 7, index * 7 + 7));
  const weekdays = Array.from({ length: 7 }, (_, index) =>
    new Intl.DateTimeFormat(intlLocale[locale], { weekday: "short", timeZone: "UTC" }).format(new Date(Date.UTC(2024, 0, weekStart + index))), // 1 Ocak 2024 Pazartesi
  );

  return (
    <div className="flex flex-col gap-8 rounded-lg bg-surface-card p-8 shadow-elev-1">
      <table className="w-full table-fixed border-separate border-spacing-4">
        <caption className="sr-only">{t("views.month")}</caption>
        <thead>
          <tr>
            {weekdays.map((weekday) => (
              <th key={weekday} scope="col" className="pb-4 text-caption-strong text-text-secondary">
                {weekday}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week) => (
            <tr key={week[0]}>
              {week.map((date) => {
                const entries = byDate.get(date) ?? [];
                const inMonth = date.startsWith(month);
                const selected = date === day;
                const isToday = date === today;
                const weekend = isWeekend(date);
                const kinds = AGENDA_KINDS.filter((kind) => entries.some((entry) => entry.kind === kind));
                return (
                  <td key={date} className="p-0 align-top">
                    <Link
                      href={calendarHref({ view: query.view, day: date })}
                      scroll={false}
                      aria-current={selected ? "date" : undefined}
                      aria-label={`${formatDateLong(date, locale)} ${formatWeekday(date, locale)}${entries.length ? `, ${t("matrix.dayItems", { count: entries.length })}` : ""}`}
                      className={cn(
                        "flex h-44 flex-col items-center justify-center gap-4 rounded-full transition-colors tablet:h-56 tablet:rounded-lg laptop:h-88 laptop:items-stretch laptop:justify-start laptop:rounded-md laptop:p-4",
                        selected
                          ? "bg-surface-selected-strong text-text-inverse"
                          : isToday
                            ? "bg-brand-primary-subtle text-text-brand"
                            : "hover:bg-surface-page",
                      )}
                    >
                      <span
                        className={cn(
                          "laptop:px-4",
                          !selected && !isToday && (inMonth ? cn("text-body", weekend ? "text-text-secondary" : "text-text-primary") : "text-caption text-text-secondary"),
                          (selected || isToday) && "text-body-strong",
                        )}
                      >
                        {Number(date.slice(8))}
                      </span>
                      {/* Mobil: tür noktaları */}
                      {kinds.length > 0 && (
                        <span aria-hidden className="flex gap-2 tablet:hidden">
                          {kinds.map((kind) => (
                            <span key={kind} className={cn("size-6 rounded-full", selected ? "bg-text-inverse" : kindDot[kind])} />
                          ))}
                        </span>
                      )}
                      {/* Tablet: tür başına adet rozeti */}
                      {kinds.length > 0 && (
                        <span aria-hidden className="hidden gap-4 tablet:flex laptop:hidden">
                          {kinds.map((kind) => (
                            <span key={kind} className="inline-flex items-center gap-2 text-nav">
                              <span className={cn("size-6 rounded-full", selected ? "bg-text-inverse" : kindDot[kind])} />
                              {entries.filter((entry) => entry.kind === kind).length}
                            </span>
                          ))}
                        </span>
                      )}
                      {/* Laptop+: ilk 2 kaydın başlığı, fazlası "+n" */}
                      {entries.length > 0 && (
                        <span aria-hidden className="hidden min-w-0 flex-col gap-2 laptop:flex">
                          {entries.slice(0, 2).map((entry) => (
                            <span key={entry.key} className={cn("truncate rounded-sm px-4 text-nav", cellChip[entry.kind], entry.done && "line-through opacity-70")}>
                              {entry.title}
                            </span>
                          ))}
                          {entries.length > 2 && <span className="px-4 text-nav">{t("matrix.more", { count: entries.length - 2 })}</span>}
                        </span>
                      )}
                    </Link>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <ul aria-label={t("legend")} className="flex items-center justify-center gap-16 border-t border-border-subtle pt-8 pb-4">
        {AGENDA_KINDS.map((kind) => (
          <li key={kind} className="flex items-center gap-4 text-caption text-text-secondary">
            <span aria-hidden className={cn("size-6 rounded-full", kindDot[kind])} />
            {t(`kind.${kind}`)}
          </li>
        ))}
      </ul>
    </div>
  );
}
