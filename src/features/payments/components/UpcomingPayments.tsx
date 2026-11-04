import { getLocale, getTranslations } from "next-intl/server";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { getCategoryMap } from "@/features/categories/server";
import { isLocale } from "@/i18n/config";
import type { DateKey } from "@/lib/dates";
import { listUpcomingPayments } from "../server";
import { PaymentCard } from "./PaymentCard";

// Pages → Ana Sayfa "Section - 5. Yaklaşan Ödemeler" (6:1147, PRD FR-DSH-006/007).
//   Gecikmişler başta (BR-PAY-005), sonra önümüzdeki 7 gün; bugünkü vadeler Bugünün Akışı'ndadır.
// "Tümü (n)" İşlemler listesine gider, filtre uygulanmaz (RESPONSIVE §3.3.1, Karar #9, D-26).
// [Varsayım] En fazla 3 kart. Boş durum aksiyonsuz kısa mesaj (RESPONSIVE §8.2.6).

const VISIBLE_LIMIT = 3;

export async function UpcomingPayments({ today }: { today: DateKey }) {
  const [t, rawLocale, upcoming, categories] = await Promise.all([getTranslations("payments"), getLocale(), listUpcomingPayments(today), getCategoryMap()]);
  const locale = isLocale(rawLocale) ? rawLocale : "tr";

  return (
    <section aria-labelledby="upcoming-payments-title" className="flex flex-col gap-12">
      <SectionHeader
        id="upcoming-payments-title"
        icon="payments"
        title={t("upcoming.title")}
        link={upcoming.length > 0 ? { href: "/islemler", label: t("upcoming.all", { count: upcoming.length }) } : undefined}
      />
      {upcoming.length === 0 ? (
        <p className="rounded-lg bg-surface-card shadow-elev-1 p-12 text-body text-text-secondary">{t("upcoming.empty")}</p>
      ) : (
        <ul className="@container flex flex-col gap-8">
          {upcoming.slice(0, VISIBLE_LIMIT).map(({ payment, series }) => (
            <PaymentCard key={payment.id} payment={payment} series={series} category={categories.get(series.categoryId)} locale={locale} today={today} variant="upcoming" />
          ))}
        </ul>
      )}
    </section>
  );
}
