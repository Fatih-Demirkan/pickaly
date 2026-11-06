import { LogoMark } from "@/components/ui/Logo";
import type { Category } from "@/features/categories/domain/types";
import { formatPercent } from "@/features/savings/format";
import type { Locale } from "@/i18n/config";
import type { MonthKey } from "@/lib/dates";
import type { MonthlyReport } from "../domain/report";
import { ReportComparison, ReportSummary, ReportTopSpending } from "./ReportSections";

// Paylaşılabilir Rapor kartı (PRD FR-REP-007, D-11). Aylık Rapor ekranıyla AYNI bölümleri aynı sırayla gösterir
// (ürün sahibi isteği 2026-11-05): Özet → Gelir & Gider Karşılaştırması → En Çok Harcama Yapılanlar (ReportSections,
// compact). Görünüm DESIGN_SYSTEM_PICKALY §5.2: beyaz, radius-xl, padding 24, aralık 16, elev-2.
//   Başlık: 28 px Pickaly logo sembolü (küçük boyut çizimi, logo kiti 2026-11-06) + "Pickaly" title-sm · "Mayıs 2026 Finansal Özeti" caption-strong
//   Alt satır "… ile oluşturuldu". Görselde yer sınırlı olduğu için harcama listesi ilk 3 kalemle sınırlı.
// Kart her cihazda sabit 358 px'tir; dışa aktarılan görsel cihaza göre değişmez (RESPONSIVE §3.5.2).
// [Varsayım] Alt satırdaki alan adı yazılmaz: alan adı henüz alınmadı (TECH_STACK K-8).

export const SHARE_CARD_ID = "share-report-card";

const TOP_LIMIT = 3;

type ShareCardProps = {
  report: MonthlyReport;
  categories: Map<string, Category>;
  locale: Locale;
  month: MonthKey;
  labels: { subtitle: string; footer: string };
};

export async function ShareCard({ report, categories, locale, month, labels }: ShareCardProps) {
  return (
    <article
      id={SHARE_CARD_ID}
      aria-label={labels.subtitle}
      className="relative flex w-[358px] max-w-full flex-col gap-16 overflow-hidden rounded-xl bg-surface-card p-24 shadow-elev-2"
    >
      <header className="flex flex-col gap-4">
        <p className="flex items-center gap-8">
          <LogoMark size={28} />
          <span className="text-title-sm text-text-primary">Pickaly</span>
        </p>
        <p className="text-caption-strong text-text-secondary">{labels.subtitle}</p>
      </header>

      <ReportSummary report={report} locale={locale} month={month} compact />
      <ReportComparison report={report} locale={locale} compact />
      <ReportTopSpending report={report} locale={locale} categories={categories} limit={TOP_LIMIT} compact />

      <div aria-hidden className="border-t border-border-subtle" />
      <p className="text-center text-caption-strong text-text-secondary">{labels.footer}</p>
    </article>
  );
}

export function shareRateText(rate: number | null, locale: Locale) {
  return rate === null ? "–" : formatPercent(rate, locale);
}
