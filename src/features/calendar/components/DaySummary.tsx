import { getTranslations } from "next-intl/server";
import { Chip } from "@/components/ui/Chip";
import { Icon } from "@/components/ui/Icon";
import type { Locale } from "@/i18n/config";
import { formatDayMonth, formatWeekday, type DateKey } from "@/lib/dates";
import { countByKind, type AgendaEntry } from "./entries";
import { AGENDA_KINDS, kindChip } from "./kindStyle";

// Takvim seçili gün özeti: "16 Mayıs Perşembe" title-sm + 44 px kutu (beyaz, radius-md, elev-1, padding 4, aralık 8):
// canvas kutuda calendar-check, "Bugün:" caption + Görev / Randevu / Ödeme çipleri (DESIGN_SYSTEM_PICKALY §5.10).
// [Varsayım] Seçili gün bugün değilse "Gün:"; sıfır olan türün çipi gösterilmez.

const countKey = { task: "tasks", payment: "payments" } as const;

export async function DaySummary({ day, today, entries, locale }: { day: DateKey; today: DateKey; entries: AgendaEntry[]; locale: Locale }) {
  const t = await getTranslations("calendar.summary");
  const counts = countByKind(entries);

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-title-sm text-text-primary">
        {formatDayMonth(day, locale)} {formatWeekday(day, locale)}
      </h2>
      <div className="flex min-h-44 items-stretch gap-8 rounded-md bg-surface-card p-4 shadow-elev-1">
        <span aria-hidden className="inline-flex w-30 shrink-0 items-center justify-center rounded-sm bg-surface-page text-text-primary">
          <Icon icon="today" size="sm" />
        </span>
        <p className="flex flex-wrap items-center gap-4 py-4 text-caption text-text-primary">
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
