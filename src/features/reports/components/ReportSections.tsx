import { getTranslations } from "next-intl/server";
import { Chip } from "@/components/ui/Chip";
import { CategoryIcon } from "@/features/categories/components/CategoryIcon";
import type { Category } from "@/features/categories/domain/types";
import { formatPercent } from "@/features/savings/format";
import { intlLocale, type Locale } from "@/i18n/config";
import { cn } from "@/lib/cn";
import type { MonthKey } from "@/lib/dates";
import { formatMoney, formatMoneyShort, splitMoneyDecimals } from "@/lib/money";
import type { MonthlyReport } from "../domain/report";

// Aylık Rapor bölümleri — Aylık Rapor ekranı ve Paylaşılabilir Rapor kartı AYNI bölümleri aynı sırayla kullanır
// (ürün sahibi isteği 2026-11-05: "rapor ve paylaşım kartı aynı olsun"). Görünüm DESIGN_SYSTEM_PICKALY §5.2, §5.11:
//   1) Özet: ay çipi · "Net Nakit Akışı / Birikim" caption · display-balance tutar (ondalık text-tertiary) · ayraç ·
//      Gelir / Gider / Tasarruf (8 px nokta + caption, tutar body-strong, ipucu caption)
//   2) Gelir & Gider Karşılaştırması: nokta matrisli çubuklar (gelir %100, gider ve birikime aktarılan gelire oranla)
//      · ayraç · "Tasarruf Kapasitesi" | "Net Bakiye". Oran her zaman metin olarak da yazılır.
//   3) En Çok Harcama Yapılanlar: liste grubu; 36 px kategori karosu, ad body-strong, açıklama caption, tutar body-strong.
// compact: paylaşım kartı (358 px sabit) içinde; kart gölgeleri yerine canvas zemin, yerleşim tek sütun.
// [Varsayım] "n Temel Gider" ayın gider yapılan kategori sayısıdır; Tasarruf ipucu "Gelire oranla".

const DOT_COLUMNS = 30;

type Common = { report: MonthlyReport; locale: Locale; compact?: boolean };

function signedShort(minor: bigint, locale: Locale) {
  return minor > BigInt(0) ? `+${formatMoneyShort(minor, locale)}` : formatMoneyShort(minor, locale);
}

const rateText = (value: number | null, locale: Locale) => (value === null ? "–" : formatPercent(value, locale));

/** Bölüm kabı: ekranda beyaz kart + gölge, paylaşım kartında canvas zemin. */
function panelClass(compact?: boolean) {
  return compact ? "rounded-md bg-surface-page" : "rounded-lg bg-surface-card shadow-elev-1";
}

function SectionTitle({ id, title, hint }: { id: string; title: string; hint: string }) {
  return (
    <div className="flex items-center justify-between gap-12">
      <h2 id={id} className="text-title-sm text-text-primary">
        {title}
      </h2>
      <p className="shrink-0 text-caption-strong text-text-secondary">{hint}</p>
    </div>
  );
}

export async function ReportSummary({ report, locale, compact, month }: Common & { month: MonthKey }) {
  const t = await getTranslations("reports");
  const monthName = new Intl.DateTimeFormat(intlLocale[locale], { month: "long", timeZone: "UTC" }).format(new Date(`${month}-01T00:00:00Z`));
  const [netWhole, netFraction] = splitMoneyDecimals(formatMoney(report.netMinor, locale, "always"), locale);
  const stats = [
    { key: "income", label: t("income"), value: signedShort(report.incomeMinor, locale), hint: t("incomeCount", { count: report.incomeCount }), dot: "bg-status-success", text: "text-text-success" },
    { key: "expense", label: t("expense"), value: signedShort(-report.expenseMinor, locale), hint: t("expenseCategories", { count: report.topSpending.length }), dot: "bg-status-danger", text: "text-text-danger" },
    { key: "savings", label: t("savings"), value: rateText(report.savingsRate, locale), hint: t("savingsHint"), dot: "bg-text-brand", text: "text-text-brand" },
  ];
  const id = compact ? "share-report-net" : "report-net";

  return (
    <section aria-labelledby={id} className={cn("flex flex-col gap-12 p-16", panelClass(compact), !compact && "laptop:flex-row laptop:items-center laptop:gap-24")}>
      <div className={cn("flex flex-col items-start gap-12", !compact && "laptop:flex-1")}>
        <Chip>{t("monthChip", { month: monthName })}</Chip>
        <div className="flex min-w-0 flex-col">
          <h2 id={id} className="text-caption text-text-secondary">
            {t("net")}
          </h2>
          <p className={cn("break-words text-text-primary", compact ? "text-title-lg" : "text-display-balance")}>
            {netWhole}
            <span className="text-text-tertiary">{netFraction}</span>
          </p>
        </div>
      </div>
      <div aria-hidden className={cn("border-t border-border-subtle", !compact && "laptop:self-stretch laptop:border-t-0 laptop:border-l")} />
      <dl className={cn("flex gap-8", !compact && "laptop:flex-[1.2]")}>
        {stats.map((stat) => (
          <div key={stat.key} className="flex min-w-0 flex-1 flex-col gap-4">
            <dt className="flex items-center gap-4 text-caption text-text-secondary">
              <span aria-hidden className={cn("size-8 shrink-0 rounded-full", stat.dot)} />
              {stat.label}
            </dt>
            <dd className={cn("truncate text-body-strong", stat.text)}>{stat.value}</dd>
            <dd className="text-caption text-text-secondary">{stat.hint}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function Bar({ label, amount, amountClass, rate, fillClass, locale, columns }: { label: string; amount: string; amountClass: string; rate: number | null; fillClass: string; locale: Locale; columns: number }) {
  const width = rate === null ? 0 : Math.min(100, Math.max(0, rate));
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-8 text-caption">
        <span className="min-w-0 truncate text-text-secondary">{label}</span>
        <span className="whitespace-nowrap">
          <span className={cn("text-caption-strong", amountClass)}>{amount}</span> <span className="text-text-secondary">({rateText(rate, locale)})</span>
        </span>
      </div>
      {/* Nokta matrisli çubuk (DS Spending chart): 2 satır; dolu nokta sayısı orana göre. */}
      <div aria-hidden className="grid grid-flow-col grid-rows-2 justify-between gap-y-3">
        {Array.from({ length: columns * 2 }, (_, index) => (
          <span key={index} className={cn("size-6 rounded-full", Math.floor(index / 2) < Math.round((width / 100) * columns) ? fillClass : "bg-chart-grid")} />
        ))}
      </div>
    </div>
  );
}

export async function ReportComparison({ report, locale, compact }: Common) {
  const t = await getTranslations("reports");
  const columns = compact ? 24 : DOT_COLUMNS;
  const id = compact ? "share-report-comparison" : "report-comparison";
  return (
    <section aria-labelledby={id} className="flex flex-col gap-8">
      <SectionTitle id={id} title={t("comparison.title")} hint={t("comparison.hint")} />
      <div className={cn("flex flex-col gap-16 p-16", panelClass(compact))}>
        <Bar
          label={t("comparison.income")}
          amount={formatMoney(report.incomeMinor, locale, "always")}
          amountClass="text-text-success"
          rate={report.incomeMinor > BigInt(0) ? 100 : null}
          fillClass="bg-chart-income"
          locale={locale}
          columns={columns}
        />
        <Bar
          label={t("comparison.expense")}
          amount={formatMoney(-report.expenseMinor, locale, "always")}
          amountClass="text-text-danger"
          rate={report.expenseRate}
          fillClass="bg-chart-expense"
          locale={locale}
          columns={columns}
        />
        <Bar
          label={t("comparison.transfer")}
          amount={formatMoney(report.savingsTransferMinor, locale)}
          amountClass="text-text-brand"
          rate={report.savingsTransferRate}
          fillClass="bg-chart-savings"
          locale={locale}
          columns={columns}
        />
        <div aria-hidden className="border-t border-border-subtle" />
        <div className="flex flex-wrap items-center justify-between gap-8 text-caption">
          <span className="text-text-secondary">{t("comparison.capacity", { amount: signedShort(report.netMinor, locale) })}</span>
          <span className="text-caption-strong text-text-primary">{t("comparison.netRate", { rate: rateText(report.savingsRate, locale) })}</span>
        </div>
      </div>
    </section>
  );
}

export async function ReportTopSpending({ report, locale, compact, categories, limit }: Common & { categories: Map<string, Category>; limit?: number }) {
  const t = await getTranslations("reports");
  const items = limit ? report.topSpending.slice(0, limit) : report.topSpending;
  const id = compact ? "share-report-top" : "report-top";
  return (
    <section aria-labelledby={id} className="flex flex-col gap-8">
      <SectionTitle id={id} title={t("top.title")} hint={t("top.hint")} />
      {items.length === 0 ? (
        <p className={cn("p-16 text-body text-text-secondary", panelClass(compact))}>{t("top.empty")}</p>
      ) : (
        <ul className={cn("divide-y divide-border-subtle overflow-hidden", compact ? "rounded-md bg-surface-page" : "rounded-md bg-surface-card shadow-elev-1")}>
          {items.map((item) => {
            const category = categories.get(item.categoryId);
            if (!category) return null;
            return (
              <li key={item.categoryId} className={cn("flex items-center justify-between gap-12", compact ? "px-12 py-8" : "min-h-64 px-16 py-12")}>
                <div className="flex min-w-0 items-center gap-12">
                  <CategoryIcon category={category} size={compact ? "sm" : "md"} />
                  <div className="flex min-w-0 flex-col gap-2">
                    <span className="truncate text-body-strong text-text-primary">{category.name}</span>
                    <span className="truncate text-caption text-text-secondary">{category.note || t("top.count", { count: item.count })}</span>
                  </div>
                </div>
                <span className="shrink-0 text-body-strong text-text-primary">{formatMoney(item.amountMinor, locale)}</span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
