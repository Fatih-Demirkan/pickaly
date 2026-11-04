import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { SegmentedLinks } from "@/components/ui/SegmentedControl";
import { getCategoryMap } from "@/features/categories/server";
import { listPaymentsBetween } from "@/features/payments/server";
import { getSettings } from "@/features/settings/server";
import { isLocale } from "@/i18n/config";
import { addDays, formatMonthLabel, shiftMonth, toDateKey, type DateKey } from "@/lib/dates";
import { monthMatrix, weekDays } from "../domain/agenda";
import { calendarHref, type CalendarQuery, type CalendarView } from "../routes";
import { calendarRepository } from "../server";
import { DayAgenda } from "./DayAgenda";
import { DaySummary } from "./DaySummary";
import { DayTimeline } from "./DayTimeline";
import { buildEntries, groupByDate } from "./entries";
import { MonthMatrix } from "./MonthMatrix";
import { WeekStrip } from "./WeekStrip";

// Pages → Takvim - Aylık Görünüm ve Ajanda (6:5987) · Takvim - Haftalık Çizelge Görünümü (6:9589), PRD §5, RESPONSIVE §3.2.
//   Başlık "Takvim" + alt başlık, sağda "Bugün" (Tertiary SM, calendar ikonu) · Aylık / Haftalık / Günlük segmented
//   ay seçici (İşlemler ile aynı kalıp) · aylık: ay matrisi + seçili gün özeti + ajanda · haftalık: 7 günlük şerit +
//   seçili gün özeti + saat çizelgesi.
// Laptop+ (aylık): matris [8/12] | seçili gün ajandası [4/12], sticky (RESPONSIVE §3.2.1).
// [Eksik] "Günlük" görünüm tasarlanmadı (RESPONSIVE #4): seçenek görünür ama devre dışı.
// Haftalık görünümde ileri/geri bir hafta kaydırır; başlıkta seçili günün ayı yazar (Pages: "Mayıs 2026").

const arrowClass =
  "touch-target inline-flex size-24 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-action-tertiary-hover hover:text-text-primary";

export async function CalendarScreen({ query }: { query: CalendarQuery }) {
  const today = toDateKey(new Date());
  const view: CalendarView = query.view ?? "month";
  const day = query.day ?? today;
  const month = day.slice(0, 7);
  const { weekStart } = await getSettings();
  const range = view === "month" ? monthMatrix(month, weekStart) : weekDays(day, weekStart);
  const from = range[0] ?? day;
  const to = range.at(-1) ?? day;

  const [t, tPage, rawLocale, items, payments, categories] = await Promise.all([
    getTranslations("calendar"),
    getTranslations("pages.calendar"),
    getLocale(),
    calendarRepository.listBetween(from, to),
    listPaymentsBetween(from, to),
    getCategoryMap(),
  ]);
  const locale = isLocale(rawLocale) ? rawLocale : "tr";
  const byDate = groupByDate(buildEntries(items, payments));
  const dayEntries = byDate.get(day) ?? [];
  const current: CalendarQuery = { view: query.view, day };

  const shift = (direction: 1 | -1): DateKey => (view === "month" ? `${shiftMonth(month, direction)}-01` : addDays(day, direction * 7));

  const controls = (
    <div className="flex flex-col gap-8">
      <SegmentedLinks
        label={t("views.label")}
        fullWidth
        value={view}
        options={[
          { value: "month", label: t("views.month"), href: calendarHref({ day }) },
          { value: "week", label: t("views.week"), href: calendarHref({ view: "week", day }) },
          { value: "day" as CalendarView, label: t("views.day"), href: "", disabled: true },
        ]}
      />
      <div className="flex h-40 items-center justify-between gap-8 rounded-md border border-border-default bg-surface-card px-16 py-8">
        <Link href={calendarHref({ view: query.view, day: shift(-1) })} scroll={false} aria-label={view === "month" ? t("previousMonth") : t("previousWeek")} className={arrowClass}>
          <Icon icon="previous" size="sm" />
        </Link>
        <p className="flex items-center gap-8 text-body-lg text-text-primary" aria-live="polite">
          <span className="text-text-secondary">
            <Icon icon="calendar" size="sm" />
          </span>
          <span className="sr-only">{t("period")}: </span>
          {formatMonthLabel(month, locale)}
        </p>
        <Link href={calendarHref({ view: query.view, day: shift(1) })} scroll={false} aria-label={view === "month" ? t("nextMonth") : t("nextWeek")} className={arrowClass}>
          <Icon icon="next" size="sm" />
        </Link>
      </div>
    </div>
  );

  const summary = <DaySummary day={day} today={today} entries={dayEntries} locale={locale} />;

  return (
    <PageContainer className="flex flex-col gap-(--layout-section-gap)">
      <PageHeader
        title={tPage("title")}
        subtitle={tPage("subtitle")}
        actions={
          <ButtonLink href={calendarHref({ view: query.view })} scroll={false} variant="tertiary" size="sm" leadingIcon="calendar">
            {t("today")}
          </ButtonLink>
        }
      />

      {view === "month" ? (
        <div className="flex flex-col gap-(--layout-section-gap) laptop:grid laptop:grid-cols-12 laptop:items-start laptop:gap-24">
          <div className="flex min-w-0 flex-col gap-8 laptop:col-span-8">
            {controls}
            <MonthMatrix month={month} day={day} today={today} byDate={byDate} locale={locale} query={current} weekStart={weekStart} />
          </div>
          <div className="flex min-w-0 flex-col gap-12 laptop:sticky laptop:top-(--layout-topbar-height) laptop:col-span-4">
            {summary}
            <DayAgenda day={day} today={today} entries={dayEntries} categories={categories} locale={locale} query={current} />
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-(--layout-section-gap) laptop:mx-auto laptop:w-full laptop:max-w-[720px]">
          <div className="flex flex-col gap-8">
            {controls}
            <WeekStrip day={day} today={today} byDate={byDate} locale={locale} weekStart={weekStart} />
          </div>
          <div className="flex flex-col gap-12">
            {summary}
            <DayTimeline entries={dayEntries} categories={categories} locale={locale} today={today} query={current} />
          </div>
        </div>
      )}
    </PageContainer>
  );
}
