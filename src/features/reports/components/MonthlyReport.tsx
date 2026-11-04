import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { ActionFooter } from "@/components/layout/ActionFooter";
import { FocusHeader } from "@/components/layout/FocusHeader";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Icon } from "@/components/ui/Icon";
import { MonthSwitcher } from "@/components/ui/MonthSwitcher";
import { CategoryIcon } from "@/features/categories/components/CategoryIcon";
import { getCategoryMap } from "@/features/categories/server";
import { formatPercent } from "@/features/savings/format";
import { intlLocale, isLocale, type Locale } from "@/i18n/config";
import { cn } from "@/lib/cn";
import type { MonthKey } from "@/lib/dates";
import { formatMoney, formatMoneyShort, splitMoneyDecimals } from "@/lib/money";
import { reportHref, shareReportHref } from "../routes";
import { getMonthlyReport } from "../server";

// Pages → Aylık Finans Raporu (136:7534, PRD FR-REP-001…004), RESPONSIVE §3.5.1.
//   Görünüm DESIGN_SYSTEM_PICKALY §5.2, §5.11. Odak başlığı "← Aylık Rapor" + paylaş (36 px outline daire) · ay seçici
//     (İşlemler ile aynı) · özet: standart beyaz kart; "Mayıs Ayı" çipi, "Net Nakit Akışı / Birikim" caption, tutar
//     display-balance (ondalık text-tertiary); ayraç; Gelir / Gider / Tasarruf (8 px nokta + caption, tutar body-strong)
//   "Gelir & Gider Karşılaştırması" title-sm + "Gelir Oranı" · kart: DS imza öğesi nokta matrisli çubuklar
//     (chart.grid boş nokta; gelir chart.income %100, gider chart.expense ve birikime aktarılan chart.savings gelire oranla),
//     ayraç, "Tasarruf Kapasitesi" | "Net Bakiye". Oran her zaman metin olarak da yazılır.
//   "En Çok Harcama Yapılanlar" + "Gider Dağılımı" · liste grubu (radius-md): 36 px kategori karosu, ad body-strong,
//     açıklama caption, tutar body-strong · alt bar "Paylaşılabilir Raporu Görüntüle" (Primary).
// Tablet: özet kartı tam genişlik, altında Karşılaştırma | En Çok Harcama · laptop+: ay seçici ve "Paylaş" üst barda,
//   özet kartı 4 metrik tek satır (RESPONSIVE §3.5.1).
// [Varsayım] "4 Temel Gider" ayın gider yapılan kategori sayısıdır.
// [Varsayım] Tasarruf altındaki "Hedef Üstü" için tanımlı bir tasarruf hedefi yok (PRD); "Gelire oranla" gösterilir.
// [Varsayım] Harcama satırındaki açıklama kategorinin notu ("Elektrik, Su, İnternet"); not yoksa işlem sayısı.
// [Varsayım] Geri ok Ana Sayfa'ya döner (rapora Ana Sayfa ve Birikimler'den gelinir).
// Paylaş butonları Paylaşılabilir Rapor'u açar (mobil tam sayfa, tablet+ modal). Seçili ayda işlem yoksa devre dışı (PRD §8).
// [Eksik] Bütçe limiti uyarısı (D-16) ve önceki aya göre değişim (FR-REP-006) tasarlanmadı.

const DOT_COLUMNS = 30;

function signedShort(minor: bigint, locale: Locale) {
  return minor > BigInt(0) ? `+${formatMoneyShort(minor, locale)}` : formatMoneyShort(minor, locale);
}

function Bar({ label, amount, amountClass, rate, fillClass, locale }: { label: string; amount: string; amountClass: string; rate: number | null; fillClass: string; locale: Locale }) {
  const width = rate === null ? 0 : Math.min(100, Math.max(0, rate));
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-8 text-caption">
        <span className="text-text-secondary">{label}</span>
        <span className="whitespace-nowrap">
          <span className={cn("text-caption-strong", amountClass)}>{amount}</span>{" "}
          <span className="text-text-secondary">({rate === null ? "–" : formatPercent(rate, locale)})</span>
        </span>
      </div>
      {/* Nokta matrisli çubuk (DS Spending chart): 2 satır × 30 nokta; dolu nokta sayısı orana göre. */}
      <div aria-hidden className="grid grid-flow-col grid-rows-2 justify-between gap-y-3">
        {Array.from({ length: DOT_COLUMNS * 2 }, (_, index) => (
          <span key={index} className={cn("size-6 rounded-full", Math.floor(index / 2) < Math.round((width / 100) * DOT_COLUMNS) ? fillClass : "bg-chart-grid")} />
        ))}
      </div>
    </div>
  );
}

export async function MonthlyReport({ month }: { month: MonthKey }) {
  const [t, rawLocale, report, categories] = await Promise.all([
    getTranslations("reports"),
    getLocale(),
    getMonthlyReport(month),
    getCategoryMap(),
  ]);
  const locale = isLocale(rawLocale) ? rawLocale : "tr";
  const monthName = new Intl.DateTimeFormat(intlLocale[locale], { month: "long", timeZone: "UTC" }).format(new Date(`${month}-01T00:00:00Z`));
  const rate = (value: number | null) => (value === null ? "–" : formatPercent(value, locale));
  const switcherLabels = { previous: t("previousMonth"), next: t("nextMonth"), period: t("period") };

  const stats = [
    { key: "income", label: t("income"), value: signedShort(report.incomeMinor, locale), hint: t("incomeCount", { count: report.incomeCount }), dot: "bg-status-success", text: "text-text-success" },
    { key: "expense", label: t("expense"), value: signedShort(-report.expenseMinor, locale), hint: t("expenseCategories", { count: report.topSpending.length }), dot: "bg-status-danger", text: "text-text-danger" },
    { key: "savings", label: t("savings"), value: rate(report.savingsRate), hint: t("savingsHint"), dot: "bg-text-brand", text: "text-text-brand" },
  ];

  const empty = report.incomeMinor === BigInt(0) && report.expenseMinor === BigInt(0);
  const [netWhole, netFraction] = splitMoneyDecimals(formatMoney(report.netMinor, locale, "always"), locale);
  const shareHref = shareReportHref(month);
  const shareButton = (className?: string) =>
    empty ? (
      <Button variant="secondary" leadingIcon="share" disabled aria-describedby="report-share-empty" className={className}>
        {t("share")}
      </Button>
    ) : (
      <ButtonLink href={shareHref} scroll={false} variant="secondary" leadingIcon="share" className={className}>
        {t("share")}
      </ButtonLink>
    );
  const iconClass =
    "touch-target inline-flex size-36 items-center justify-center rounded-full border border-border-subtle bg-surface-card text-text-primary";

  return (
    <>
      {empty && (
        <span id="report-share-empty" className="sr-only">
          {t("shareView.emptyMonth")}
        </span>
      )}
      <div className="tablet:hidden">
        <FocusHeader
          title={t("title")}
          titleId="report-title"
          back={{ href: "/", label: t("back") }}
          trailing={
            empty ? (
              <button type="button" disabled aria-label={t("share")} aria-describedby="report-share-empty" className={cn(iconClass, "cursor-not-allowed text-text-disabled")}>
                <Icon icon="share" size="sm" />
              </button>
            ) : (
              <Link href={shareHref} scroll={false} aria-label={t("share")} className={cn(iconClass, "transition-colors hover:border-border-strong hover:bg-action-tertiary-hover")}>
                <Icon icon="share" size="sm" />
              </Link>
            )
          }
        />
      </div>
      <PageContainer className="flex flex-col gap-(--layout-section-gap)">
        <div className="hidden items-center justify-between gap-12 tablet:flex">
          <div className="flex min-w-0 items-center gap-8">
            <Link
              href="/"
              aria-label={t("back")}
              className="touch-target inline-flex size-36 shrink-0 items-center justify-center rounded-full border border-border-subtle bg-surface-card text-text-primary transition-colors hover:border-border-strong hover:bg-action-tertiary-hover"
            >
              <Icon icon="back" />
            </Link>
            <h1 className="truncate text-title-md text-text-primary">{t("title")}</h1>
          </div>
          <div className="flex shrink-0 items-center gap-12">
            <div className="hidden w-[320px] laptop:block">
              <MonthSwitcher month={month} hrefFor={reportHref} locale={locale} labels={switcherLabels} />
            </div>
            {shareButton()}
          </div>
        </div>

        <div className="laptop:hidden">
          <MonthSwitcher month={month} hrefFor={reportHref} locale={locale} labels={switcherLabels} />
        </div>

        <section
          aria-labelledby="report-net"
          className="flex flex-col gap-12 rounded-lg bg-surface-card p-16 shadow-elev-1 laptop:flex-row laptop:items-center laptop:gap-24"
        >
          <div className="flex flex-col items-start gap-12 laptop:flex-1">
            <Chip>{t("monthChip", { month: monthName })}</Chip>
            <div className="flex min-w-0 flex-col">
              <h2 id="report-net" className="text-caption text-text-secondary">
                {t("net")}
              </h2>
              <p className="text-display-balance break-words text-text-primary">
                {netWhole}
                <span className="text-text-tertiary">{netFraction}</span>
              </p>
            </div>
          </div>
          <div aria-hidden className="border-t border-border-subtle laptop:self-stretch laptop:border-t-0 laptop:border-l" />
          <dl className="flex gap-8 laptop:flex-[1.2]">
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

        <div className="grid grid-cols-1 gap-(--layout-section-gap) tablet:grid-cols-2 tablet:items-start">
          <section aria-labelledby="report-comparison" className="flex flex-col gap-8">
            <div className="flex items-center justify-between gap-12">
              <h2 id="report-comparison" className="text-title-sm text-text-primary">
                {t("comparison.title")}
              </h2>
              <p className="shrink-0 text-caption-strong text-text-secondary">{t("comparison.hint")}</p>
            </div>
            <div className="flex flex-col gap-16 rounded-lg bg-surface-card p-16 shadow-elev-1">
              <Bar
                label={t("comparison.income")}
                amount={formatMoney(report.incomeMinor, locale, "always")}
                amountClass="text-text-success"
                rate={report.incomeMinor > BigInt(0) ? 100 : null}
                fillClass="bg-chart-income"
                locale={locale}
              />
              <Bar
                label={t("comparison.expense")}
                amount={formatMoney(-report.expenseMinor, locale, "always")}
                amountClass="text-text-danger"
                rate={report.expenseRate}
                fillClass="bg-chart-expense"
                locale={locale}
              />
              <Bar
                label={t("comparison.transfer")}
                amount={formatMoney(report.savingsTransferMinor, locale)}
                amountClass="text-text-brand"
                rate={report.savingsTransferRate}
                fillClass="bg-chart-savings"
                locale={locale}
              />
              <div aria-hidden className="border-t border-border-subtle" />
              <div className="flex flex-wrap items-center justify-between gap-8 text-caption">
                <span className="text-text-secondary">{t("comparison.capacity", { amount: signedShort(report.netMinor, locale) })}</span>
                <span className="text-caption-strong text-text-primary">{t("comparison.netRate", { rate: rate(report.savingsRate) })}</span>
              </div>
            </div>
          </section>

          <section aria-labelledby="report-top" className="flex flex-col gap-8">
            <div className="flex items-center justify-between gap-12">
              <h2 id="report-top" className="text-title-sm text-text-primary">
                {t("top.title")}
              </h2>
              <p className="shrink-0 text-caption-strong text-text-secondary">{t("top.hint")}</p>
            </div>
            {report.topSpending.length === 0 ? (
              <p className="rounded-md bg-surface-card p-16 text-body text-text-secondary shadow-elev-1">{t("top.empty")}</p>
            ) : (
              <ul className="divide-y divide-border-subtle overflow-hidden rounded-md bg-surface-card shadow-elev-1">
                {report.topSpending.map((item) => {
                  const category = categories.get(item.categoryId);
                  if (!category) return null;
                  return (
                    <li key={item.categoryId} className="flex min-h-64 items-center justify-between gap-12 px-16 py-12">
                      <div className="flex min-w-0 items-center gap-12">
                        <CategoryIcon category={category} />
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
        </div>

        <div className="tablet:hidden">
          <ActionFooter>
            {empty ? (
              <Button disabled aria-describedby="report-share-empty">
                {t("shareOpen")}
              </Button>
            ) : (
              <ButtonLink href={shareHref} scroll={false}>
                {t("shareOpen")}
              </ButtonLink>
            )}
          </ActionFooter>
        </div>
      </PageContainer>
    </>
  );
}
