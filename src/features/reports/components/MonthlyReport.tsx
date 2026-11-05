import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { ActionFooter } from "@/components/layout/ActionFooter";
import { FocusHeader } from "@/components/layout/FocusHeader";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { MonthSwitcher } from "@/components/ui/MonthSwitcher";
import { getCategoryMap } from "@/features/categories/server";
import { isLocale } from "@/i18n/config";
import { cn } from "@/lib/cn";
import type { MonthKey } from "@/lib/dates";
import { reportHref, shareReportHref } from "../routes";
import { getMonthlyReport } from "../server";
import { ReportComparison, ReportSummary, ReportTopSpending } from "./ReportSections";

// Pages → Aylık Finans Raporu (136:7534, PRD FR-REP-001…004), RESPONSIVE §3.5.1.
//   Bölümler ReportSections'ta; Paylaşılabilir Rapor kartı aynı bölümleri aynı sırayla gösterir (2026-11-05).
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

export async function MonthlyReport({ month }: { month: MonthKey }) {
  const [t, rawLocale, report, categories] = await Promise.all([
    getTranslations("reports"),
    getLocale(),
    getMonthlyReport(month),
    getCategoryMap(),
  ]);
  const locale = isLocale(rawLocale) ? rawLocale : "tr";
  const switcherLabels = { previous: t("previousMonth"), next: t("nextMonth"), period: t("period") };


  const empty = report.incomeMinor === BigInt(0) && report.expenseMinor === BigInt(0);
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

        <ReportSummary report={report} locale={locale} month={month} />

        <div className="grid grid-cols-1 gap-(--layout-section-gap) tablet:grid-cols-2 tablet:items-start">
          <ReportComparison report={report} locale={locale} />
          <ReportTopSpending report={report} locale={locale} categories={categories} />
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
