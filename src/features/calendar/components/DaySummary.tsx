import { getTranslations } from "next-intl/server";
import { Chip } from "@/components/ui/Chip";
import { Icon } from "@/components/ui/Icon";
import type { Locale } from "@/i18n/config";
import { formatDayMonth, formatWeekday, type DateKey } from "@/lib/dates";
import { countByKind, type AgendaEntry } from "./entries";
import { AGENDA_KINDS, kindChip } from "./kindStyle";

// Pages → Takvim seçili gün özeti: "16 Mayıs Perşembe" Heading/H4 + 44 px kutu (surface-card, border-default,
// radius-md, padding 4, aralık 8): Neutral/200 kutuda calendar-check, "Bugün:" Body/Small + Görev / Randevu / Ödeme çipleri.
// [Varsayım] Seçili gün bugün değilse "Gün:"; sıfır olan türün çipi gösterilmez.

const countKey = { task: "tasks", appointment: "appointments", payment: "payments" } as const;

export async function DaySummary({ day, today, entries, locale }: { day: DateKey; today: DateKey; entries: AgendaEntry[]; locale: Locale }) {
  const t = await getTranslations("calendar.summary");
  const counts = countByKind(entries);

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-heading-h4 text-text-primary">
        {formatDayMonth(day, locale)} {formatWeekday(day, locale)}
      </h2>
      <div className="flex min-h-44 items-stretch gap-8 rounded-md border border-border-default bg-surface-card p-4">
        <span aria-hidden className="inline-flex w-30 shrink-0 items-center justify-center rounded-sm bg-surface-nav-active text-text-primary">
          <Icon icon="today" size="sm" />
        </span>
        <p className="flex flex-wrap items-center gap-4 py-4 text-body-sm text-text-primary">
          {entries.length === 0 ? (
            t("none")
          ) : (
            <>
              {day === today ? t("today") : t("day")}
              {AGENDA_KINDS.filter((kind) => counts[kind] > 0).map((kind) => (
                <Chip key={kind} variant={kindChip[kind]}>
                  {t(countKey[kind], { count: counts[kind] })}
                </Chip>
              ))}
            </>
          )}
        </p>
      </div>
    </div>
  );
}
