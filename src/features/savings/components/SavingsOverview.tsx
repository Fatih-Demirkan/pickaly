import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { ButtonLink } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { EmptyState } from "@/components/ui/EmptyState";
import { getAccountMap } from "@/features/accounts/server";
import { isLocale } from "@/i18n/config";
import { toDateKey } from "@/lib/dates";
import { formatMoney, splitMoneyDecimals } from "@/lib/money";
import { progressPercent } from "../domain/types";
import { formatPercent, formatSavingsAmount, formatSavingsShort } from "../format";
import { savingsHref } from "../routes";
import { getSavingsOverview } from "../server";
import { kindChip, ProgressBar, SavingsIcon } from "./savingsStyle";

// Pages → Birikimler - Ana Sayfa (129:5453) ve - Boş (136:8952), PRD FR-SAV-002/003/004, RESPONSIVE §3.4.1–3.4.2.
//   Görünüm DESIGN_SYSTEM_PICKALY §5.2: özet standart beyaz kart; caption "Toplam Birikim Varlığı", title-lg tutar
//     (ondalık text-tertiary), "+n ₺ bu ay eklendi (%n artış)" success çipi · "Aylık Rapor" (Primary) + "Yeni birikim
//     hesabı ekle" (Tertiary) LG tam genişlik
//   "Kayıtlı Birikimler" title-sm + "n Aktif Hedef" · kart: beyaz, radius-lg, padding 12, elev-1; 36 px ikon karosu + ad
//     body-strong + kurum caption, sağda tür çipi; ayraç; tutar title-sm + "Hedef: … (%n)" body; ilerleme çubuğu
//   Tablet: butonlar üst bara (Aylık Rapor Secondary, Yeni Primary), kartlar 2 sütun · laptop+: 3 sütun.
//   Boş durum: ortak EmptyState (DESIGN_SYSTEM_PICKALY §5.9) + "Birikim hesabı ekle" Primary LG; üst bardaki "Yeni"
//     butonu gizlenir. Pages'taki teal illüstrasyon yeni paletle uyumsuz olduğu için ikon karosuyla değiştirildi.
// [Varsayım] Pages'ta tutarın üstündeki "Dönem Net Değişimi" etiketi İşlemler kartından kalmış görünüyor; gösterilmez.
// "Aylık Rapor" → içinde bulunulan ayın Aylık Finans Raporu (RESPONSIVE §3.5.1).

export async function SavingsOverview() {
  const today = toDateKey(new Date());
  const [t, tPage, rawLocale, { accounts, summary }, bankAccounts] = await Promise.all([
    getTranslations("savings"),
    getTranslations("pages.savings"),
    getLocale(),
    getSavingsOverview(today),
    getAccountMap(),
  ]);
  const locale = isLocale(rawLocale) ? rawLocale : "tr";
  const empty = accounts.length === 0;
  const [totalWhole, totalFraction] = splitMoneyDecimals(formatMoney(summary.totalMinor, locale), locale);

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
        <EmptyState
          icon="savings"
          title={t("empty.title")}
          description={t("empty.body")}
          action={
            <ButtonLink href="/birikimler/yeni" scroll={false} leadingIcon="add">
              {t("empty.action")}
            </ButtonLink>
          }
        />
      ) : (
        <>
          <section aria-labelledby="savings-total-label" className="flex flex-col items-start gap-4 rounded-lg bg-surface-card p-16 shadow-elev-1">
            <p id="savings-total-label" className="text-caption text-text-secondary">
              {t("summary.chip")}
            </p>
            <div className="flex flex-col items-start gap-8">
              <p className="text-title-lg text-text-primary">
                {totalWhole}
                <span className="text-text-tertiary">{totalFraction}</span>
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
              <h2 id="savings-list" className="text-title-sm text-text-primary">
                {t("list.title")}
              </h2>
              <p className="text-caption-strong text-text-secondary">{t("list.active", { count: accounts.length })}</p>
            </div>
            <ul className="grid grid-cols-1 gap-8 tablet:grid-cols-2 laptop:grid-cols-3">
              {accounts.map((account) => {
                const percent = progressPercent(account);
                return (
                  <li key={account.id} className="relative flex flex-col gap-12 rounded-lg bg-surface-card p-12 shadow-elev-1 transition-colors hover:bg-action-tertiary-hover">
                    <div className="flex items-center justify-between gap-12">
                      <div className="flex min-w-0 items-center gap-12">
                        <SavingsIcon account={account} />
                        <div className="flex min-w-0 flex-col gap-2">
                          <Link href={savingsHref(account.id)} className="truncate text-body-strong text-text-primary after:absolute after:inset-0 after:rounded-lg">
                            {account.name}
                          </Link>
                          {/* Alt satır: bağlı hesap ("Saklama Kurumu" yerine, 2026-11-05). */}
                          {account.accountId && bankAccounts.get(account.accountId) && (
                            <span className="truncate text-caption text-text-secondary">{bankAccounts.get(account.accountId)?.name}</span>
                          )}
                        </div>
                      </div>
                      {percent !== null && percent >= 100 ? <Chip variant="success">{t("list.completed")}</Chip> : <Chip variant={kindChip[account.kind]}>{t(`kindShort.${account.kind}`)}</Chip>}
                    </div>
                    <hr className="border-border-subtle" />
                    <div className="flex flex-col gap-8">
                      <p className="flex flex-wrap items-baseline justify-between gap-x-12 gap-y-2">
                        <span className="text-title-sm text-text-primary">{formatSavingsAmount(account.balance, account.unit, locale)}</span>
                        <span className="text-body text-text-secondary">
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
