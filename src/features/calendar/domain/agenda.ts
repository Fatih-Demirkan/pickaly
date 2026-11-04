import { addDays, weekdayIndex, type DateKey, type WeekStart } from "@/lib/dates";
import type { CalendarItem } from "./types";

// Saf ajanda hesapları: React, Next veya veri katmanı import etmez.

/** "09:30" + 60 dk → "10:30". Gün sonunu aşarsa 23:59'da durur. */
export function endTime(time: string, durationMinutes: number): string {
  const [hour = 0, minute = 0] = time.split(":").map(Number);
  const total = Math.min(hour * 60 + minute + durationMinutes, 23 * 60 + 59);
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

/** Tüm gün kayıtlar başta, sonra saat sırası. */
export function compareByTime(a: Pick<CalendarItem, "time">, b: Pick<CalendarItem, "time">): number {
  return (a.time ?? "").localeCompare(b.time ?? "");
}

/** Haftanın 7 günü; ilk gün ayardan gelir, varsayılan Pazartesi (BR-TIME-003, TECH_STACK §5.2 user_settings.week_start). */
export function weekDays(day: DateKey, weekStart: WeekStart = 1): DateKey[] {
  const start = addDays(day, -weekdayIndex(day, weekStart));
  return Array.from({ length: 7 }, (_, index) => addDays(start, index));
}

/** Ay matrisinin günleri (haftanın ilk gününden başlayan, önceki/sonraki ayın günleriyle tamamlanmış haftalar). */
export function monthMatrix(month: string, weekStart: WeekStart = 1): DateKey[] {
  const first = `${month}-01`;
  const days: DateKey[] = [];
  let day = weekDays(first, weekStart)[0] ?? first;
  // Ayın son gününü içeren haftanın sonuna kadar.
  const nextMonthFirst = new Date(`${first}T00:00:00Z`);
  nextMonthFirst.setUTCMonth(nextMonthFirst.getUTCMonth() + 1);
  const last = addDays(nextMonthFirst.toISOString().slice(0, 10), -1);
  const end = weekDays(last, weekStart)[6] ?? last;
  while (day <= end) {
    days.push(day);
    day = addDays(day, 1);
  }
  return days;
}
