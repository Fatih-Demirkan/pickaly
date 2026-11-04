import { isDateKey, type DateKey } from "@/lib/dates";
import type { CalendarItemKind } from "./domain/types";

// Takvim ekranının URL durumu (TECH_STACK §4): görünüm ve seçili gün adreste tutulur.
//   /takvim?gorunum=aylik|haftalik&gun=2026-05-16
// Kayıt detayı /takvim/[id], form /takvim/yeni?tur=gorev|randevu&tarih=… ve /takvim/[id]/duzenle.

export type CalendarView = "month" | "week";
export type CalendarQuery = { view?: CalendarView; day?: DateKey };

type SearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function parseCalendarQuery(params: SearchParams): CalendarQuery {
  const view = first(params.gorunum);
  const day = first(params.gun);
  return { view: view === "haftalik" ? "week" : view === "aylik" ? "month" : undefined, day: isDateKey(day) ? day : undefined };
}

function queryString(query: CalendarQuery) {
  const params = new URLSearchParams();
  if (query.view === "week") params.set("gorunum", "haftalik");
  if (query.day) params.set("gun", query.day);
  const value = params.toString();
  return value ? `?${value}` : "";
}

export function calendarHref(query: CalendarQuery) {
  return `/takvim${queryString(query)}`;
}

/** Detay bağlantısı takvim durumunu taşır: kapatınca aynı görünüm ve güne dönülür. */
export function itemHref(id: string, query: CalendarQuery) {
  return `/takvim/${encodeURIComponent(id)}${queryString(query)}`;
}

const kindParam: Record<CalendarItemKind, string> = { task: "gorev", appointment: "randevu" };

export function parseKindParam(value: unknown): CalendarItemKind | undefined {
  return value === kindParam.appointment ? "appointment" : value === kindParam.task ? "task" : undefined;
}

export function newItemHref(options: { kind?: CalendarItemKind; date?: DateKey } = {}) {
  const params = new URLSearchParams();
  if (options.kind) params.set("tur", kindParam[options.kind]);
  if (options.date) params.set("tarih", options.date);
  const value = params.toString();
  return `/takvim/yeni${value ? `?${value}` : ""}`;
}
