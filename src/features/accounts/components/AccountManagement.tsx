import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { ActionFooter } from "@/components/layout/ActionFooter";
import { FocusHeader } from "@/components/layout/FocusHeader";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Icon } from "@/components/ui/Icon";
import { getAccountBalances } from "@/features/transactions/server";
import { isLocale } from "@/i18n/config";
import { formatDateLong, toDateKey } from "@/lib/dates";
import { formatMoney, splitMoneyDecimals } from "@/lib/money";
import { restoreAccountAction } from "../actions";
import { editAccountHref, newAccountHref, transferHref } from "../routes";
import { listAccounts, listTransfers } from "../server";

// Profil → Hesaplarım (ürün sahibi isteği 2026-11-05). Görünüm DESIGN_SYSTEM_PICKALY §5.2–§5.3:
//   Odak başlığı "← Hesaplarım" · özet kartı: caption "Toplam bakiye" + title-lg (aktif hesaplar, birikimler ve "Toplam dışı" hesaplar hariç)
//   Hesap listesi (liste grubu, radius-md): 36 px ikon karosu + ad body-strong + açıklama caption (varsayılan hesapta
//     "Varsayılan" çipi) · sağda bakiye body-strong + chevron. Satır Hesabı Düzenle'yi açar.
//   "Son Aktarımlar": son 5 hesaplar arası aktarım (kaynak → hedef, tarih, tutar).
//   Arşivlenmiş hesaplar: kapalı, genişletilebilir grup; satırda "Geri al".
//   Aksiyonlar: "Hesap ekle" (Primary) + "Para aktar" (Secondary; en az 2 aktif hesap gerekir). Mobilde alt barda,
//   tablet+ üst barda. Tablet+: liste ve aktarımlar 2 sütun.

const RECENT_TRANSFERS = 5;

export async function AccountManagement() {
  const [t, rawLocale, accounts, balances, transfers] = await Promise.all([
    getTranslations("accounts"),
    getLocale(),
    listAccounts({ includeArchived: true }),
    getAccountBalances(),
    listTransfers(),
  ]);
  const locale = isLocale(rawLocale) ? rawLocale : "tr";
  const active = accounts.filter((account) => !account.archived);
  const archived = accounts.filter((account) => account.archived);
  const names = new Map(accounts.map((account) => [account.id, account.name]));
  const balanceOf = (id: string, opening: bigint) => balances.get(id) ?? opening;
  // "Toplam bakiyeye dahil et" kapalı hesaplar toplama girmez (2026-11-07); satırda "Toplam dışı" çipi taşır.
  const total = active.reduce((sum, account) => (account.includeInTotal ? sum + balanceOf(account.id, account.openingBalanceMinor) : sum), BigInt(0));
  const excludedCount = active.filter((account) => !account.includeInTotal).length;
  const [totalWhole, totalFraction] = splitMoneyDecimals(formatMoney(total, locale), locale);
  const canTransfer = active.length >= 2;

  const transferButton = (fullWidth?: boolean) =>
    canTransfer ? (
      <ButtonLink href={transferHref()} scroll={false} variant="secondary" leadingIcon="transfer" fullWidth={fullWidth}>
        {t("transferAction")}
      </ButtonLink>
    ) : (
      <Button variant="secondary" leadingIcon="transfer" disabled aria-describedby="transfer-unavailable" fullWidth={fullWidth}>
        {t("transferAction")}
      </Button>
    );

  return (
    <>
      <div className="tablet:hidden">
        <FocusHeader title={t("title")} titleId="accounts-title" back={{ href: "/profil", label: t("back") }} />
      </div>
      <PageContainer className="flex flex-col gap-(--layout-section-gap)">
        {!canTransfer && (
          <span id="transfer-unavailable" className="sr-only">
            {t("transferNeedsTwo")}
          </span>
        )}
        <div className="hidden items-center justify-between gap-12 tablet:flex">
          <div className="flex min-w-0 items-center gap-8">
            <Link
              href="/profil"
              aria-label={t("back")}
              className="touch-target inline-flex size-36 shrink-0 items-center justify-center rounded-full border border-border-subtle bg-surface-card text-text-primary transition-colors hover:border-border-strong hover:bg-action-tertiary-hover"
            >
              <Icon icon="back" />
            </Link>
            <h1 className="truncate text-title-md text-text-primary">{t("title")}</h1>
          </div>
          <div className="flex shrink-0 gap-8">
            {transferButton()}
            <ButtonLink href={newAccountHref()} scroll={false} leadingIcon="add">
              {t("add")}
            </ButtonLink>
          </div>
        </div>

        <section aria-labelledby="accounts-total-label" className="flex flex-col gap-4 rounded-lg bg-surface-card p-16 shadow-elev-1">
          <p id="accounts-total-label" className="text-caption text-text-secondary">
            {t("total")}
          </p>
          <p className="text-title-lg text-text-primary">
            {totalWhole}
            <span className="text-text-tertiary">{totalFraction}</span>
          </p>
          <p className="text-caption text-text-secondary">
            {t("count", { count: active.length })}
            {excludedCount > 0 && ` · ${t("countExcluded", { count: excludedCount })}`}
          </p>
        </section>

        <div className="grid grid-cols-1 gap-(--layout-section-gap) laptop:grid-cols-2 laptop:items-start">
          <section aria-labelledby="accounts-list" className="flex flex-col gap-8">
            <h2 id="accounts-list" className="text-title-sm text-text-primary">
              {t("listTitle")}
            </h2>
            <ul className="divide-y divide-border-subtle overflow-hidden rounded-md bg-surface-card shadow-elev-1">
              {active.map((account) => (
                <li key={account.id}>
                  <Link
                    href={editAccountHref(account.id)}
                    scroll={false}
                    aria-label={t("edit", { name: account.name })}
                    className="flex min-h-64 items-center gap-12 px-16 py-12 transition-colors hover:bg-surface-page"
                  >
                    <span aria-hidden className="inline-flex size-36 shrink-0 items-center justify-center rounded-sm bg-category-blue text-category-fg-blue">
                      <Icon icon="paymentMethod" />
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col gap-2">
                      <span className="flex min-w-0 items-center gap-8">
                        <span className="truncate text-body-strong text-text-primary">{account.name}</span>
                        {account.isDefault && <Chip>{t("default")}</Chip>}
                        {!account.includeInTotal && <Chip>{t("excluded")}</Chip>}
                      </span>
                      {account.detail && <span className="truncate text-caption text-text-secondary">{account.detail}</span>}
                    </span>
                    <span className="shrink-0 text-body-strong text-text-primary">{formatMoney(balanceOf(account.id, account.openingBalanceMinor), locale)}</span>
                    <span aria-hidden className="shrink-0 text-text-secondary">
                      <Icon icon="next" size="sm" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="accounts-transfers" className="flex flex-col gap-8">
            <h2 id="accounts-transfers" className="text-title-sm text-text-primary">
              {t("transfersTitle")}
            </h2>
            {transfers.length === 0 ? (
              <p className="rounded-md bg-surface-card p-16 text-body text-text-secondary shadow-elev-1">{t("transfersEmpty")}</p>
            ) : (
              <ul className="divide-y divide-border-subtle overflow-hidden rounded-md bg-surface-card shadow-elev-1">
                {transfers.slice(0, RECENT_TRANSFERS).map((transfer) => (
                  <li key={transfer.id} className="flex min-h-64 items-center gap-12 px-16 py-12">
                    <span aria-hidden className="inline-flex size-36 shrink-0 items-center justify-center rounded-sm bg-category-slate text-category-fg-slate">
                      <Icon icon="transfer" />
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col gap-2">
                      <span className="truncate text-body-strong text-text-primary">
                        {t("transferRoute", { from: names.get(transfer.fromAccountId) ?? "—", to: names.get(transfer.toAccountId) ?? "—" })}
                      </span>
                      <span className="truncate text-caption text-text-secondary">
                        {formatDateLong(toDateKey(new Date(transfer.occurredAt)), locale)}
                        {transfer.note ? ` · ${transfer.note}` : ""}
                      </span>
                    </span>
                    <span className="shrink-0 text-body-strong text-text-primary">{formatMoney(transfer.amountMinor, locale)}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {archived.length > 0 && (
          <details className="group flex flex-col gap-8">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-12 rounded-md py-8 text-body-strong text-text-secondary [&::-webkit-details-marker]:hidden">
              {t("archivedTitle", { count: archived.length })}
              <span aria-hidden className="transition-transform group-open:rotate-180">
                <Icon icon="dropdown" size="sm" />
              </span>
            </summary>
            <ul className="mt-8 grid grid-cols-1 gap-8 tablet:grid-cols-2">
              {archived.map((account) => (
                <li key={account.id} className="flex items-center justify-between gap-12 rounded-lg border border-border-subtle bg-surface-card p-12">
                  <span className="flex min-w-0 flex-col gap-2">
                    <span className="truncate text-body-strong text-text-secondary">{account.name}</span>
                    <span className="text-caption text-text-secondary">{formatMoney(balanceOf(account.id, account.openingBalanceMinor), locale)}</span>
                  </span>
                  <form action={restoreAccountAction.bind(null, account.id)}>
                    <Button type="submit" variant="text" size="sm" aria-label={t("restoreLabel", { name: account.name })}>
                      {t("restore")}
                    </Button>
                  </form>
                </li>
              ))}
            </ul>
          </details>
        )}

        <div className="tablet:hidden">
          <ActionFooter>
            {transferButton()}
            <ButtonLink href={newAccountHref()} scroll={false} leadingIcon="add">
              {t("add")}
            </ButtonLink>
          </ActionFooter>
        </div>
      </PageContainer>
    </>
  );
}
