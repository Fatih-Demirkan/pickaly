import { intlLocale, type Locale } from "@/i18n/config";

// Tarih yardımcıları. Gün ve ay sınırları kullanıcının saat diliminde hesaplanır; V1'de bu
// Europe/Istanbul'dur (PRD BR-TIME-001, TECH_STACK D-18). Veride anlık zaman ISO-8601 (UTC) saklanır.

export const APP_TIME_ZONE = "Europe/Istanbul";
/** Türkiye 2016'dan beri yaz saati uygulamadan sürekli UTC+3'tedir; yerel tarih+saat → ISO için kullanılır. */
const APP_UTC_OFFSET = "+03:00";

/** "YYYY-MM-DD" (yerel gün). */
export type DateKey = string;
/** "YYYY-MM" (yerel ay). */
export type MonthKey = string;

const partsFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: APP_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

function localParts(date: Date) {
  const parts = Object.fromEntries(partsFormatter.formatToParts(date).map((part) => [part.type, part.value]));
  return { year: parts.year ?? "", month: parts.month ?? "", day: parts.day ?? "", hour: parts.hour ?? "", minute: parts.minute ?? "" };
}

export function toDateKey(date: Date): DateKey {
  const { year, month, day } = localParts(date);
  return `${year}-${month}-${day}`;
}

export function toMonthKey(date: Date): MonthKey {
  return toDateKey(date).slice(0, 7);
}

/** Yeni kayıt formlarının varsayılan saati (ürün sahibi kararı 2026-11-05): tarih bugün, saat 09:00. */
export const DEFAULT_TIME = "09:00";

/** Yerel saat "HH:mm". */
export function toTimeValue(date: Date): string {
  const { hour, minute } = localParts(date);
  return `${hour}:${minute}`;
}

export function isMonthKey(value: unknown): value is MonthKey {
  return typeof value === "string" && /^\d{4}-(0[1-9]|1[0-2])$/.test(value);
}

export function isDateKey(value: unknown): value is DateKey {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
}

export function isTimeValue(value: unknown): value is string {
  return typeof value === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

export function shiftMonth(month: MonthKey, delta: number): MonthKey {
  const [year = 0, monthIndex = 1] = month.split("-").map(Number);
  const date = new Date(Date.UTC(year, monthIndex - 1 + delta, 1));
  return date.toISOString().slice(0, 7);
}

/** Yerel tarih + saat → ISO anlık zaman. */
export function localDateTimeToIso(date: DateKey, time: string): string {
  return new Date(`${date}T${time}:00${APP_UTC_OFFSET}`).toISOString();
}

// Takvim günü / ayı biçimlendirilirken saat dilimi kayması olmasın diye UTC gece yarısı kullanılır.
function calendarDate(key: string): Date {
  return new Date(`${key.length === 7 ? `${key}-01` : key}T00:00:00Z`);
}

/** "Mayıs 2026" / "May 2026". */
export function formatMonthLabel(month: MonthKey, locale: Locale): string {
  return new Intl.DateTimeFormat(intlLocale[locale], { month: "long", year: "numeric", timeZone: "UTC" }).format(calendarDate(month));
}

/** "14 Mayıs" / "May 14". */
export function formatDayMonth(date: DateKey, locale: Locale): string {
  return new Intl.DateTimeFormat(intlLocale[locale], { day: "numeric", month: "long", timeZone: "UTC" }).format(calendarDate(date));
}

/** "14 Mayıs 2026" / "May 14, 2026". */
export function formatDateLong(date: DateKey, locale: Locale): string {
  return new Intl.DateTimeFormat(intlLocale[locale], { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(calendarDate(date));
}

/** "15:42". */
export function formatTime(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(intlLocale[locale], { hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: APP_TIME_ZONE }).format(new Date(iso));
}

/** "14 Mayıs 2026, Perşembe" (İşlem Detayı tarih çipi; saat ayrıca eklenir). */
export function formatDateWithWeekday(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(intlLocale[locale], { day: "numeric", month: "long", year: "numeric", weekday: "long", timeZone: APP_TIME_ZONE }).format(new Date(iso));
}

/** Takvim gününe gün ekler (saat diliminden bağımsız). */
export function addDays(date: DateKey, days: number): DateKey {
  const next = calendarDate(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next.toISOString().slice(0, 10);
}

/** İki takvim günü arasındaki gün farkı (to − from). */
export function daysBetween(from: DateKey, to: DateKey): number {
  return Math.round((calendarDate(to).getTime() - calendarDate(from).getTime()) / 86_400_000);
}

/** "Salı" / "Tuesday" (takvim günü). */
export function formatWeekday(date: DateKey, locale: Locale): string {
  return new Intl.DateTimeFormat(intlLocale[locale], { weekday: "long", timeZone: "UTC" }).format(calendarDate(date));
}

/** Haftanın ilk günü: 1 = Pazartesi (varsayılan, BR-TIME-003), 0 = Pazar. */
export type WeekStart = 0 | 1;

export function isWeekStart(value: unknown): value is WeekStart {
  return value === 0 || value === 1;
}

/** Haftanın günü dizini, seçili başlangıç gününe göre: 0 = haftanın ilk günü … 6 = son günü. */
export function weekdayIndex(date: DateKey, weekStart: WeekStart): number {
  return (new Date(`${date}T00:00:00Z`).getUTCDay() - weekStart + 7) % 7;
}
