import { Chip } from "@/components/ui/Chip";
import { Icon } from "@/components/ui/Icon";
import { CategoryIcon } from "@/features/categories/components/CategoryIcon";
import type { Category } from "@/features/categories/domain/types";
import { formatPercent } from "@/features/savings/format";
import type { Locale } from "@/i18n/config";
import { cn } from "@/lib/cn";
import { formatMoney, splitMoneyDecimals } from "@/lib/money";
import type { MonthlyReport } from "../domain/report";

// Paylaşılabilir Rapor kartı (Pages 136:8592 yapısı, PRD FR-REP-007, D-11) — görünüm DESIGN_SYSTEM_PICKALY §5.2:
//   Kart: beyaz, radius-xl, padding 24, aralık 16, elev-2. Teal vurgu çizgisi kaldırıldı.
//   Başlık: 28 px blue.500 logo karosu (radius-sm) + "Pickaly" title-sm · "Mayıs 2026 Finansal Özeti" caption-strong
//   Net bloğu (DS Balance header): "Net Bakiye Değişimi" caption · display-balance tutar (ondalık text-tertiary) ·
//     "Tasarruf Oranı" success çipi · Toplam Gelir / Toplam Gider stat kartları (income / expense tint, text-primary)
//   "Gelir Dağılımı Dengesi" 10 px iki parçalı çubuk (Harcanan chart.expense | Birikime Kalan chart.savings) + açıklama
//   "En Yüksek Harcamalar" / "İlk 3 kalem" · liste grubu (radius-md), 32 px kategori karosu, ad body, tutar body-strong
//   alt satır "… ile oluşturuldu".
// Kart her cihazda sabit 358 px'tir; dışa aktarılan görsel cihaza göre değişmez (RESPONSIVE §3.5.2).
// Pages'taki "Uygulama Adı" / "uygulama-adı" yer tutucuları "Pickaly" ile değiştirildi (RESPONSIVE §8.3 madde 9).
// [Ertelendi] Kullanıcı adı çipi ("Deniz Yılmaz") oturum / profil aşamasında eklenir; henüz kullanıcı verisi yok.
// [Varsayım] Alt satırdaki alan adı yazılmaz: alan adı henüz alınmadı (TECH_STACK K-8).
// [Varsayım] Gider gelirden büyükse çubuğun tamamı Harcanan; net negatifse Birikime Kalan parçası çizilmez.

export const SHARE_CARD_ID = "share-report-card";

type ShareCardProps = {
  report: MonthlyReport;
  categories: Map<string, Category>;
  locale: Locale;
  labels: {
    subtitle: string;
    net: string;
    savingsRate: string;
    income: string;
    expense: string;
    balance: string;
    balanceValue: string;
    spent: string;
    kept: string;
    top: string;
    topHint: string;
    empty: string;
    footer: string;
  };
};

function clamp(rate: number | null) {
  return rate === null ? 0 : Math.min(100, Math.max(0, rate));
}

export function ShareCard({ report, categories, locale, labels }: ShareCardProps) {
  const spentWidth = clamp(report.expenseRate);
  const keptWidth = Math.min(100 - spentWidth, clamp(report.savingsRate));
  const top = report.topSpending.slice(0, 3);
  const tiles = [
    { key: "income", label: labels.income, amount: report.incomeMinor, icon: "income", surface: "bg-surface-income" },
    { key: "expense", label: labels.expense, amount: report.expenseMinor, icon: "expense", surface: "bg-surface-expense" },
  ] as const;
  const [netWhole, netFraction] = splitMoneyDecimals(formatMoney(report.netMinor, locale, "always"), locale);

  return (
    <article
      id={SHARE_CARD_ID}
      aria-label={labels.subtitle}
      className="relative flex w-[358px] max-w-full flex-col gap-16 overflow-hidden rounded-xl bg-surface-card p-24 shadow-elev-2"
    >

      <header className="flex flex-col gap-4">
        <p className="flex items-center gap-8">
          <span aria-hidden className="size-28 rounded-sm bg-brand-accent" />
          <span className="text-title-sm text-text-primary">Pickaly</span>
        </p>
        <p className="text-caption-strong text-text-secondary">{labels.subtitle}</p>
      </header>
      <div aria-hidden className="border-t border-border-subtle" />

      <div className="flex flex-col items-center gap-12">
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-caption text-text-secondary">{labels.net}</p>
          <p className="text-display-balance text-text-primary">
            {netWhole}
            <span className="text-text-tertiary">{netFraction}</span>
          </p>
          <Chip variant="success" dot>
            {labels.savingsRate}
          </Chip>
        </div>
                <div className="flex w-full gap-8">
          {tiles.map((tile) => (
            <div key={tile.key} className={cn("flex min-w-0 flex-1 flex-col gap-4 rounded-md p-12 text-text-primary", tile.surface)}>
              <span className="flex min-w-0 items-center justify-between gap-8">
                <span className="truncate text-caption">{tile.label}</span>
                <span aria-hidden className="inline-flex size-24 shrink-0 items-center justify-center rounded-sm bg-surface-card">
                  <Icon icon={tile.icon} size="sm" />
                </span>
              </span>
              <span className="truncate text-body-strong">{formatMoney(tile.amount, locale)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <p className="flex items-center justify-between gap-8 text-caption-strong">
          <span className="min-w-0 truncate text-text-secondary">{labels.balance}</span>
          <span className="shrink-0 whitespace-nowrap text-text-primary">{labels.balanceValue}</span>
        </p>
        <div aria-hidden className="flex h-10 overflow-hidden rounded-full bg-chart-grid">
          <div className="h-full bg-chart-expense" style={{ width: `${spentWidth}%` }} />
          <div className="h-full bg-chart-savings" style={{ width: `${keptWidth}%` }} />
        </div>
        <p className="flex items-center justify-between gap-8 text-caption text-text-secondary">
          <span className="flex items-center gap-4">
            <span aria-hidden className="size-8 rounded-full bg-chart-expense" />
            {labels.spent}
          </span>
          <span className="flex items-center gap-4">
            <span aria-hidden className="size-8 rounded-full bg-chart-savings" />
            {labels.kept}
          </span>
        </p>
      </div>
      <div aria-hidden className="border-t border-border-subtle" />

      <section className="flex flex-col gap-12">
        <p className="flex items-center justify-between gap-8">
          <span className="text-body-strong text-text-primary">{labels.top}</span>
          <span className="text-caption-strong text-text-secondary">{labels.topHint}</span>
        </p>
        {top.length === 0 ? (
          <p className="rounded-md bg-surface-page p-12 text-body text-text-secondary">{labels.empty}</p>
        ) : (
          <ul className="divide-y divide-border-subtle overflow-hidden rounded-md bg-surface-page">
            {top.map((item) => {
              const category = categories.get(item.categoryId);
              if (!category) return null;
              return (
                <li key={item.categoryId} className="flex items-center justify-between gap-8 p-12">
                  <span className="flex min-w-0 items-center gap-8">
                    <CategoryIcon category={category} size="sm" />
                    <span className="truncate text-body text-text-primary">{category.name}</span>
                  </span>
                  <span className="shrink-0 text-body-strong text-text-primary">{formatMoney(item.amountMinor, locale)}</span>
                </li>
              );
            })}
          </ul>
        )}
      </section>
      <div aria-hidden className="border-t border-border-subtle" />
      <p className="text-center text-caption-strong text-text-secondary">{labels.footer}</p>
    </article>
  );
}

export function shareRateText(rate: number | null, locale: Locale) {
  return rate === null ? "–" : formatPercent(rate, locale);
}
