import type { Category } from "@/features/categories";
import type { Locale } from "@/i18n/config";
import type { DateKey } from "@/lib/dates";
import { itemHref, type CalendarQuery } from "../routes";
import { AgendaItemCard, AgendaPaymentCard } from "./AgendaCards";
import type { AgendaEntry } from "./entries";

type EntryCardProps = { entry: AgendaEntry; categories: Map<string, Category>; locale: Locale; today: DateKey; query: CalendarQuery };

export function EntryCard({ entry, categories, locale, today, query }: EntryCardProps) {
  if (entry.type === "payment") return <AgendaPaymentCard payment={entry.payment} series={entry.series} locale={locale} today={today} />;
  const category = entry.item.categoryId ? categories.get(entry.item.categoryId) : undefined;
  return <AgendaItemCard item={entry.item} category={category} href={itemHref(entry.item.id, query)} />;
}
