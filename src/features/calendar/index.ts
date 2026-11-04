// calendar modülünün (Takvim: görev ve randevular) istemci tarafında da kullanılabilen genel arayüzü.
// Veri erişimi (sunucu) için "@/features/calendar/server" kullanılır.

export type { CalendarItem, CalendarItemKind, Priority } from "./domain/types";
export { calendarHref, itemHref, newItemHref, type CalendarQuery } from "./routes";
