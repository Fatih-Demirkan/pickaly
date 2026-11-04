import Image from "next/image";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { ButtonLink } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { isLocale } from "@/i18n/config";
import { toDateKey } from "@/lib/dates";
import { formatMoney } from "@/lib/money";
import { progressPercent } from "../domain/types";
import { formatPercent, formatSavingsAmount, formatSavingsShort } from "../format";
import { savingsHref } from "../routes";
import { getSavingsOverview } from "../server";
import { kindChip, ProgressBar, SavingsIcon } from "./savingsStyle";

// Pages → Birikimler - Ana Sayfa (129:5453) ve - Boş (136:8952), PRD FR-SAV-002/003/004, RESPONSIVE §3.4.1–3.4.2.
//   Özet kartı: İşlem Detayı ile aynı kart; "Toplam Birikim Varlığı" çipi, tutar Heading/H2, "+n ₺ bu ay eklendi
//     (%n artış)" Yeşil çip · "Aylık Rapor" (Primary) + "Yeni birikim hesabı ekle" (Tertiary) LG tam genişlik
//   "Kayıtlı Birikimler" Heading/H4 + "n Aktif Hedef" · kart: radius-lg, padding 12, aralık 12; ikon kutusu + ad
//     Label/Default + kurum Body/Small, sağda tür çipi; ayırıcı; tutar Heading/H4 + "Hedef: … (%n)" Body/Default; çubuk
//   Tablet: butonlar üst bara (Aylık Rapor Secondary, Yeni Primary), kartlar 2 sütun · laptop+: 3 sütun.
//   Boş durum: 120 px görsel, Heading/H3 başlık, Body/Small açıklama, "Birikim hesabı ekle" Primary LG; büyük ekranda
//     ortalı, max 480 px; üst bardaki "Yeni" butonu gizlenir.
// [Varsayım] Pages'ta tutarın üstündeki "Dönem Net Değişimi" etiketi İşlemler kartından kalmış görünüyor; gösterilmez.
// "Aylık Rapor" → içinde bulunulan ayın Aylık Finans Raporu (RESPONSIVE §3.5.1).

export async function SavingsOverview() {
  const today = toDateKey(new Date());
  const [t, tPage, rawLocale, { accounts, summary }] = await Promise.all([
    getTranslations("savings"),
    getTranslations("pages.savings"),
    getLocale(),
    getSavingsOverview(today),
  ]);
  const locale = isLocale(rawLocale) ? rawLocale : "tr";
  const empty = accounts.length === 0;

  const reportButton = (variant: "primary" | "secondary", className?: string) => (
    <ButtonLink href="/raporlar" variant={variant} leadingIcon="report" className={className}>
      {t("actions.monthlyReport")}
    </ButtonLink>
  );

  return (
    <PageContainer className="flex flex-col gap-(--layout-section-gap)">
      <PageHeader
        title={tPage("title")}
        subtitle={tPage("subtitle")}
        actions={
          !empty && (
            <div className="hidden gap-8 tablet:flex">
              {reportButton("secondary")}
              <ButtonLink href="/birikimler/yeni" scroll={false} leadingIcon="add">
                {t("actions.add")}
              </ButtonLink>
            </div>
          )
        }
      />

      {empty ? (
        <section className="mx-auto flex w-full max-w-[480px] flex-col items-center gap-24 py-48 text-center">
          <Image src="/illustrations/empty-savings.png" alt="" width={120} height={120} className="size-120" priority />
          <div className="flex flex-col gap-8">
            <h2 className="text-heading-h3 text-text-primary">{t("empty.title")}</h2>
            <p className="text-body-sm text-text-secondary">{t("empty.body")}</p>
          </div>
          <ButtonLink href="/birikimler/yeni" scroll={false} leadingIcon="add" fullWidth>
            {t("empty.action")}
          </ButtonLink>
        </section>
      ) : (
        <>
          <section aria-labelledby="savings-total" className="flex flex-col items-start gap-12 rounded-2xl border border-border-default bg-linear-to-b from-surface-card to-surface-muted p-16 shadow-floating">
            <Chip variant="task">{t("summary.chip")}</Chip>
            <div className="flex flex-col items-start gap-4">
              <p id="savings-total" className="text-heading-h2 text-text-primary">
                {formatMoney(summary.totalMinor, locale)}
              </p>
              {summary.monthAddedMinor !== BigInt(0) && (
                <Chip variant="success" dot>
                  {summary.monthPercent !== null
                    ? t("summary.monthAddedPercent", { amount: formatMoney(summary.monthAddedMinor, locale, "always"), percent: summary.monthPercent.toLocaleString(locale) })
                    : t("summary.monthAdded", { amount: formatMoney(summary.monthAddedMinor, locale, "always") })}
                </Chip>
              )}
            </div>
          </section>

          <div className="flex flex-col gap-8 tablet:hidden">
            {reportButton("primary", "w-full")}
            <ButtonLink href="/birikimler/yeni" scroll={false} variant="tertiary" leadingIcon="add" fullWidth>
              {t("actions.add")}
            </ButtonLink>
          </div>

          <section aria-labelledby="savings-list" className="flex flex-col gap-8">
            <div className="flex items-center justify-between gap-12">
              <h2 id="savings-list" className="text-heading-h4 text-text-primary">
                {t("list.title")}
              </h2>
              <p className="text-label-sm text-text-secondary">{t("list.active", { count: accounts.length })}</p>
            </div>
            <ul className="grid grid-cols-1 gap-8 tablet:grid-cols-2 laptop:grid-cols-3">
              {accounts.map((account) => {
                const percent = progressPercent(account);
                return (
                  <li key={account.id} className="relative flex flex-col gap-12 rounded-lg border border-border-default bg-surface-card p-12 transition-colors hover:border-border-strong">
                    <div className="flex items-center justify-between gap-12">
                      <div className="flex min-w-0 items-center gap-12">
                        <SavingsIcon account={account} />
                        <div className="flex min-w-0 flex-col gap-2">
                          <Link href={savingsHref(account.id)} className="truncate text-label-md text-text-primary after:absolute after:inset-0 after:rounded-lg">
                            {account.name}
                          </Link>
                          {account.institution && <span className="truncate text-body-sm text-text-secondary">{account.institution}</span>}
                        </div>
                      </div>
                      {percent !== null && percent >= 100 ? <Chip variant="success">{t("list.completed")}</Chip> : <Chip variant={kindChip[account.kind]}>{t(`kindShort.${account.kind}`)}</Chip>}
                    </div>
                    <hr className="border-border-default" />
                    <div className="flex flex-col gap-8">
                      <p className="flex flex-wrap items-baseline justify-between gap-x-12 gap-y-2">
                        <span className="text-heading-h4 text-text-primary">{formatSavingsAmount(account.balance, account.unit, locale)}</span>
                        <span className="text-body-md text-text-secondary">
                          {account.target !== null ? (
                            <>
                              {t("list.target", { amount: formatSavingsShort(account.target, account.unit, locale) })} <span className="font-semibold">({formatPercent(percent ?? 0, locale)})</span>
                            </>
                          ) : (
                            t("list.noTarget")
                          )}
                        </span>
                      </p>
                      {percent !== null && <ProgressBar percent={percent} label={t("detail.progressLabel")} />}
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        </>
      )}
    </PageContainer>
  );
}
