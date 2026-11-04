import type { Category } from "@/features/categories";
import type { Locale } from "@/i18n/config";
import type { DateKey } from "@/lib/dates";
import type { CalendarQuery } from "../routes";
import { EntryCard } from "./EntryCard";
import type { AgendaEntry } from "./entries";

// Pages → Takvim Haftalık seçili günün saat çizelgesi (6:10106): her saat bir satır (Label/Small text-secondary
// + Border/Default çizgi); o saatteki kayıtlar satırın altında, saat sütunu kadar içeriden ajanda kartı olarak.
// Pages 08:00–23:00 aralığını gösteriyor; daha erken saatte kayıt varsa çizelge o saatten başlar.
// Tüm gün kayıtlar çizelgenin üstünde.
// [Ertelendi] Laptop+ 7 gün sütunlu haftalık zaman ızgarası (RESPONSIVE §3.2.2 [Varsayım]) tasarlanmadı.

const FIRST_HOUR = 8;
const LAST_HOUR = 23;

type DayTimelineProps = { entries: AgendaEntry[]; categories: Map<string, Category>; locale: Locale; today: DateKey; query: CalendarQuery };

export function DayTimeline({ entries, categories, locale, today, query }: DayTimelineProps) {
  const allDay = entries.filter((entry) => entry.time === null);
  const timed = entries.filter((entry) => entry.time !== null);
  const earliest = Math.min(FIRST_HOUR, ...timed.map((entry) => Number(entry.time?.slice(0, 2))));
  const hours = Array.from({ length: LAST_HOUR - earliest + 1 }, (_, index) => earliest + index);
  const card = (entry: AgendaEntry) => <EntryCard key={entry.key} entry={entry} categories={categories} locale={locale} today={today} query={query} />;

  return (
    <div className="flex flex-col gap-8">
      {allDay.length > 0 && <ul className="flex flex-col gap-8">{allDay.map(card)}</ul>}
      <ol className="flex flex-col">
        {hours.map((hour) => {
          const label = `${String(hour).padStart(2, "0")}:00`;
          const inHour = timed.filter((entry) => Number(entry.time?.slice(0, 2)) === hour);
          return (
            <li key={hour} className="flex flex-col gap-8 pb-8">
              <span className="flex items-center gap-12">
                <span className="w-40 shrink-0 text-caption-strong text-text-secondary">{label}</span>
                <span aria-hidden className="h-px flex-1 bg-border-subtle" />
              </span>
              {inHour.length > 0 && <ul className="flex flex-col gap-8 ps-48">{inHour.map(card)}</ul>}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
