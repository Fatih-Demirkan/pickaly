import { Chip } from "@/components/ui/Chip";
import { Icon } from "@/components/ui/Icon";
import { CategoryIcon } from "@/features/categories/components/CategoryIcon";
import type { Category } from "@/features/categories/domain/types";
import { formatPercent } from "@/features/savings/format";
import type { Locale } from "@/i18n/config";
import { cn } from "@/lib/cn";
import { formatMoney } from "@/lib/money";
import type { MonthlyReport } from "../domain/report";

// Pages → Paylaşılabilir Rapor Görünümü "THE SHAREABLE CARD" (136:8592, PRD FR-REP-007, D-11).
//   Kart: beyaz, radius-lg, padding 16, aralık 12, shadow-overlay; üstte 4 px Teal 700 → 500 → 600 vurgu çizgisi
//   Başlık: 24 px Brand kare (radius 6) + uygulama adı Bold 18 (-0.45) · "Mayıs 2026 Finansal Özeti" Label/Small
//   Net kutusu (Ay Raporu özet kartıyla aynı gradyan): "Net Bakiye Değişimi" · tutar Data/Large Brand · "Tasarruf Oranı"
//     Yeşil çip (noktalı) · ayırıcı · Toplam Gelir / Toplam Gider mini kartları (30 px ikon kutusu)
//   "Gelir Dağılımı Dengesi" 10 px iki parçalı çubuk (Harcanan Kırmızı | Birikime Kalan Brand) + açıklama
//   "En Yüksek Harcamalar" / "İlk 3 kalem" · 32 px kategori kutusu, ad Body/Default, tutar Label/Default
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
    { key: "income", label: labels.income, amount: report.incomeMinor, icon: "income", tone: "bg-category-green text-status-success" },
    { key: "expense", label: labels.expense, amount: report.expenseMinor, icon: "expense", tone: "bg-category-red text-status-danger" },
  ] as const;

  return (
    <article
      id={SHARE_CARD_ID}
      aria-label={labels.subtitle}
      className="relative flex w-[358px] max-w-full flex-col gap-12 overflow-hidden rounded-lg border border-border-default bg-surface-card p-16 shadow-overlay"
    >
      <div aria-hidden className="absolute inset-x-0 top-0 h-4 bg-linear-to-r from-(--pk-teal-700) via-(--pk-teal-500) to-(--pk-teal-600)" />

      <header className="flex flex-col gap-4">
        <p className="flex items-center gap-8">
          <span aria-hidden className="size-24 rounded-[6px] bg-text-brand" />
          <span className="text-[18px] leading-[26px] font-bold tracking-[-0.45px] text-text-primary">Pickaly</span>
        </p>
        <p className="text-label-sm text-text-secondary">{labels.subtitle}</p>
      </header>
      <div aria-hidden className="border-t border-border-default" />

      <div className="flex flex-col items-center gap-12 rounded-2xl border border-border-default bg-linear-to-b from-surface-card to-surface-muted p-16 shadow-floating">
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-label-sm text-text-secondary">{labels.net}</p>
          <p className="text-data-lg text-text-brand">{formatMoney(report.netMinor, locale, "always")}</p>
          <Chip variant="success" dot>
            {labels.savingsRate}
          </Chip>
        </div>
        <div aria-hidden className="w-full border-t border-border-default" />
        <div className="flex w-full gap-8">
          {tiles.map((tile) => (
            <div key={tile.key} className="flex min-w-0 flex-1 items-stretch gap-8 rounded-md border border-border-default bg-surface-card p-4">
              <span aria-hidden className={cn("flex w-30 shrink-0 items-center justify-center rounded-sm", tile.tone)}>
                <Icon icon={tile.icon} size="sm" />
              </span>
              <span className="flex min-w-0 flex-col">
                <span className="truncate text-body-sm text-text-secondary">{tile.label}</span>
                <span className="truncate text-button text-text-primary">{formatMoney(tile.amount, locale)}</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <p className="flex items-center justify-between gap-8 text-label-sm">
          <span className="min-w-0 truncate text-text-secondary">{labels.balance}</span>
          <span className="shrink-0 whitespace-nowrap text-text-primary">{labels.balanceValue}</span>
        </p>
        <div aria-hidden className="flex h-10 overflow-hidden rounded-full border border-border-default bg-surface-muted">
          <div className="h-full bg-status-danger" style={{ width: `${spentWidth}%` }} />
          <div className="h-full bg-text-brand" style={{ width: `${keptWidth}%` }} />
        </div>
        <p className="flex items-center justify-between gap-8 text-body-sm text-text-secondary">
          <span className="flex items-center gap-4">
            <span aria-hidden className="size-8 rounded-full bg-status-danger" />
            {labels.spent}
          </span>
          <span className="flex items-center gap-4">
            <span aria-hidden className="size-8 rounded-full bg-text-brand" />
            {labels.kept}
          </span>
        </p>
      </div>
      <div aria-hidden className="border-t border-border-default" />

      <section className="flex flex-col gap-12">
        <p className="flex items-center justify-between gap-8">
          <span className="text-label-md text-text-primary">{labels.top}</span>
          <span className="text-label-sm text-text-secondary">{labels.topHint}</span>
        </p>
        {top.length === 0 ? (
          <p className="rounded-lg border border-border-default p-12 text-body-md text-text-secondary">{labels.empty}</p>
        ) : (
          <ul className="divide-y divide-border-default overflow-hidden rounded-lg border border-border-default bg-surface-card">
            {top.map((item) => {
              const category = categories.get(item.categoryId);
              if (!category) return null;
              return (
                <li key={item.categoryId} className="flex items-center justify-between gap-8 p-12">
                  <span className="flex min-w-0 items-center gap-8">
                    <CategoryIcon category={category} size="sm" className="rounded-md" />
                    <span className="truncate text-body-md text-text-primary">{category.name}</span>
                  </span>
                  <span className="shrink-0 text-label-md text-text-primary">{formatMoney(item.amountMinor, locale)}</span>
                </li>
              );
            })}
          </ul>
        )}
      </section>
      <div aria-hidden className="border-t border-border-default" />
      <p className="text-center text-label-sm text-text-secondary">{labels.footer}</p>
    </article>
  );
}

export function shareRateText(rate: number | null, locale: Locale) {
  return rate === null ? "–" : formatPercent(rate, locale);
}
