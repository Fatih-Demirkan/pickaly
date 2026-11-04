import type { Locale } from "@/i18n/config";
import { formatDayMonth, formatWeekday, type DateKey } from "./dates";
import { turkishLocativeSuffix, type Frequency } from "./recurrence";

/**
 * Tekrar kuralının okunur hali için çeviri anahtarı ve değerleri ("recurrence.rule.*"):
 * "Her ayın 22'sinde" (Pages → Ödeme Detayı), "Her Salı", "Her yıl 22 Temmuz", "Her gün".
 */
export type RecurrenceRuleMessage = { key: Frequency | "once"; values: Record<string, string | number> };

export function recurrenceRuleMessage(frequency: Frequency | null, start: DateKey, locale: Locale): RecurrenceRuleMessage {
  if (frequency === null) return { key: "once", values: {} };
  if (frequency === "weekly") return { key: "weekly", values: { weekday: formatWeekday(start, locale) } };
  if (frequency === "yearly") return { key: "yearly", values: { date: formatDayMonth(start, locale) } };
  if (frequency === "monthly") {
    const day = Number(start.slice(8));
    return { key: "monthly", values: { day, suffix: turkishLocativeSuffix(day) } };
  }
  return { key: "daily", values: {} };
}
