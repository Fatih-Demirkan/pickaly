import { getTranslations } from "next-intl/server";
import { ButtonLink } from "@/components/ui/Button";
import type { Category } from "@/features/categories";
import type { Locale } from "@/i18n/config";
import type { DateKey } from "@/lib/dates";
import { newItemHref, type CalendarQuery } from "../routes";
import { EntryCard } from "./EntryCard";
import type { AgendaEntry } from "./entries";

// Pages → Takvim ajandası: "Yapılacaklar" ve "Tamamlandı" başlıkları Label/Default text-secondary, kartlar arası 8,
// bölümler arası 16 + ayırıcı çizgi (PRD FR-CAL-004). Tablet: iki sütun [4/8 | 4/8] (RESPONSIVE §3.2.1).
// Boş gün: kısa mesaj + "Görev ekle" (PRD §5.4, RESPONSIVE §8.2.6).

type DayAgendaProps = {
  day: DateKey;
  today: DateKey;
  entries: AgendaEntry[];
  categories: Map<string, Category>;
  locale: Locale;
  query: CalendarQuery;
};

export async function DayAgenda({ day, today, entries, categories, locale, query }: DayAgendaProps) {
  const t = await getTranslations("calendar.agenda");
  const todo = entries.filter((entry) => !entry.done);
  const done = entries.filter((entry) => entry.done);

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-start gap-12 rounded-lg bg-surface-card p-16 shadow-elev-1">
        <p className="text-body text-text-secondary">{t("empty")}</p>
        <ButtonLink href={newItemHref({ date: day })} scroll={false} variant="secondary" size="sm" leadingIcon="add">
          {t("addTask")}
        </ButtonLink>
      </div>
    );
  }

  const section = (title: string, list: AgendaEntry[], id: string) =>
    list.length > 0 && (
      <section aria-labelledby={id} className="flex min-w-0 flex-col gap-8">
        <h3 id={id} className="text-caption-strong text-text-secondary">
          {title}
        </h3>
        <ul className="flex flex-col gap-8">
          {list.map((entry) => (
            <EntryCard key={entry.key} entry={entry} categories={categories} locale={locale} today={today} query={query} />
          ))}
        </ul>
      </section>
    );

  return (
    // Tablet iki sütun; laptop+ ajanda yan panelde olduğu için yine tek sütun.
    <div className="flex flex-col gap-16 tablet:grid tablet:grid-cols-2 tablet:items-start laptop:flex">
      {section(t("todo"), todo, `agenda-todo-${day}`)}
      {todo.length > 0 && done.length > 0 && <hr className="border-border-subtle tablet:hidden laptop:block" />}
      {section(t("done"), done, `agenda-done-${day}`)}
    </div>
  );
}
