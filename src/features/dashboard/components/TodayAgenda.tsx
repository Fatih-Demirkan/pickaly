import type { ReactNode } from "react";
import { getLocale, getTranslations } from "next-intl/server";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { calendarHref, type CalendarItem } from "@/features/calendar";
import { getCategoryMap } from "@/features/categories/server";
import { PaymentCard } from "@/features/payments/components/PaymentCard";
import type { PaymentWithSeries } from "@/features/payments/server";
import { isLocale } from "@/i18n/config";
import type { DateKey } from "@/lib/dates";
import { AgendaTaskCard } from "./AgendaTaskCard";

// Pages → Ana Sayfa "Section - 4. Bugünün Akışı" (6:1075, PRD FR-DSH-004/005).
//   Bugünün görevleri, randevuları ve vadesi gelen ödemeleri saat sırasıyla; görevde ✓, ödemede "Ödendi olarak işaretle".
//   "Tümü (n)" Takvim'i bugün seçili açar [Karar #9].
//   En üstte "Gecikmiş" grubu: geçmiş tarihli, tamamlanmamış görev ve randevular (PRD BR-TSK-002, RESPONSIVE §8.2.11:
//   Semantic/Gider - Hata başlık). Gecikmiş ödemeler Yaklaşan Ödemeler'in başındadır (BR-PAY-005).
// Boş durum aksiyonsuz kısa mesaj (RESPONSIVE §8.2.6).

type Entry = { time: string | null; node: ReactNode };

type TodayAgendaProps = { today: DateKey; items: CalendarItem[]; overdue: CalendarItem[]; payments: PaymentWithSeries[] };

export async function TodayAgenda({ today, items, overdue, payments }: TodayAgendaProps) {
  const [t, rawLocale, categories] = await Promise.all([getTranslations("dashboard.agenda"), getLocale(), getCategoryMap()]);
  const locale = isLocale(rawLocale) ? rawLocale : "tr";
  const categoryOf = (item: CalendarItem) => (item.categoryId ? categories.get(item.categoryId) : undefined);

  const entries: Entry[] = [
    ...items.map((item) => ({ time: item.time, node: <AgendaTaskCard key={item.id} item={item} category={categoryOf(item)} /> })),
    ...payments.map(({ payment, series }) => ({
      time: series.dueTime,
      node: (
        <PaymentCard key={payment.id} payment={payment} series={series} category={categories.get(series.categoryId)} locale={locale} today={today} variant="agenda" />
      ),
    })),
  ].sort((a, b) => (a.time ?? "").localeCompare(b.time ?? ""));
  const total = entries.length + overdue.length;

  return (
    <section aria-labelledby="today-agenda-title" className="flex flex-col gap-12">
      <SectionHeader
        id="today-agenda-title"
        icon="agenda"
        title={t("title")}
        link={total > 0 ? { href: calendarHref({ day: today }), label: t("all", { count: total }) } : undefined}
      />
      {total === 0 ? (
        <p className="rounded-md bg-surface-card p-12 text-body text-text-secondary shadow-elev-1">{t("empty")}</p>
      ) : (
        <div className="flex flex-col gap-12">
          {overdue.length > 0 && (
            <section aria-labelledby="today-agenda-overdue" className="flex flex-col gap-8">
              <h3 id="today-agenda-overdue" className="text-body-strong text-text-danger">
                {t("overdue")}
              </h3>
              <ul className="flex flex-col gap-8">
                {overdue.map((item) => (
                  <AgendaTaskCard key={item.id} item={item} category={categoryOf(item)} />
                ))}
              </ul>
            </section>
          )}
          {entries.length > 0 && <ul className="@container flex flex-col gap-8">{entries.map((entry) => entry.node)}</ul>}
        </div>
      )}
    </section>
  );
}
