import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { ActionFooter } from "@/components/layout/ActionFooter";
import { FocusHeader } from "@/components/layout/FocusHeader";
import { PageContainer } from "@/components/layout/PageContainer";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { isLocale } from "@/i18n/config";
import { daysBetween, formatDateLong, toDateKey, type DateKey } from "@/lib/dates";
import { formatMoney, splitMoneyDecimals } from "@/lib/money";
import { isOverdue, loanTitle, type Loan } from "../domain/types";
import { loanHref, newLoanHref } from "../routes";
import { listLoans } from "../server";
import { LoanStatusChip } from "./LoanStatus";

// Profil → Alacaklarım (ürün sahibi isteği 2026-11-07). Görünüm Hesaplarım ile aynı dil (DESIGN_SYSTEM_PICKALY §5.2–§5.3):
//   Odak başlığı "← Alacaklarım" · özet kartı: caption "Açık alacaklar" + title-lg toplam + caption sayı / gecikmiş
//   "Açık" listesi (liste grubu): 36 px teal ikon karosu + "Kişi · Ne için" body-strong + caption geri alınacak tarih
//     (gecikmişte "n gün gecikti") · sağda tutar body-strong + durum çipi. Satır Alacak Detayı'nı açar.
//   "Kapananlar": kapalı, genişletilebilir grup; geri alındığı tarih.
//   Aksiyon: "Borç ver" (Primary) — mobilde alt barda, tablet+ üst barda.

export async function LoanList() {
  const [t, rawLocale, loans] = await Promise.all([getTranslations("loans"), getLocale(), listLoans()]);
  const locale = isLocale(rawLocale) ? rawLocale : "tr";
  const today = toDateKey(new Date());
  const open = loans.filter((loan) => loan.repaidOn === null);
  const closed = loans.filter((loan) => loan.repaidOn !== null).sort((a, b) => (b.repaidOn ?? "").localeCompare(a.repaidOn ?? ""));
  const overdue = open.filter((loan) => isOverdue(loan, today)).length;
  const total = open.reduce((sum, loan) => sum + loan.amountMinor, BigInt(0));
  const [totalWhole, totalFraction] = splitMoneyDecimals(formatMoney(total, locale), locale);

  const addButton = (
    <ButtonLink href={newLoanHref()} scroll={false} leadingIcon="add">
      {t("add")}
    </ButtonLink>
  );

  return (
    <>
      <div className="tablet:hidden">
        <FocusHeader title={t("title")} titleId="loans-title" back={{ href: "/profil", label: t("back") }} />
      </div>
      <PageContainer className="flex flex-col gap-(--layout-section-gap)">
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
          {addButton}
        </div>

        <section aria-labelledby="loans-total-label" className="flex flex-col gap-4 rounded-lg bg-surface-card p-16 shadow-elev-1">
          <p id="loans-total-label" className="text-caption text-text-secondary">
            {t("total")}
          </p>
          <p className="text-title-lg text-text-primary">
            {totalWhole}
            <span className="text-text-tertiary">{totalFraction}</span>
          </p>
          <p className="text-caption text-text-secondary">
            {t("openCount", { count: open.length })}
            {overdue > 0 && <span className="text-text-danger"> · {t("overdueCount", { count: overdue })}</span>}
          </p>
        </section>

        <section aria-labelledby="loans-open" className="flex flex-col gap-8">
          <h2 id="loans-open" className="text-title-sm text-text-primary">
            {t("openTitle")}
          </h2>
          {open.length === 0 ? (
            <p className="rounded-md bg-surface-card p-16 text-body text-text-secondary shadow-elev-1">{t("empty")}</p>
          ) : (
            <ul className="divide-y divide-border-subtle overflow-hidden rounded-md bg-surface-card shadow-elev-1">
              {open.map((loan) => (
                <LoanRow
                  key={loan.id}
                  loan={loan}
                  today={today}
                  meta={[dueText(loan, today, locale, t), loan.items.length > 0 ? t("itemCount", { count: loan.items.length }) : null].filter(Boolean).join(" · ")}
                  amount={formatMoney(loan.amountMinor, locale)}
                />
              ))}
            </ul>
          )}
        </section>

        {closed.length > 0 && (
          <details className="group flex flex-col gap-8">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-12 rounded-md py-8 text-body-strong text-text-secondary [&::-webkit-details-marker]:hidden">
              {t("closedTitle", { count: closed.length })}
              <span aria-hidden className="transition-transform group-open:rotate-180">
                <Icon icon="dropdown" size="sm" />
              </span>
            </summary>
            <ul className="mt-8 divide-y divide-border-subtle overflow-hidden rounded-md bg-surface-card shadow-elev-1">
              {closed.map((loan) => (
                <LoanRow
                  key={loan.id}
                  loan={loan}
                  today={today}
                  meta={t("repaidOn", { date: formatDateLong(loan.repaidOn as DateKey, locale) })}
                  amount={formatMoney(loan.amountMinor, locale)}
                />
              ))}
            </ul>
          </details>
        )}

        <div className="tablet:hidden">
          <ActionFooter>{addButton}</ActionFooter>
        </div>
      </PageContainer>
    </>
  );
}

function dueText(loan: Loan, today: DateKey, locale: "tr" | "en", t: Awaited<ReturnType<typeof getTranslations<"loans">>>) {
  if (isOverdue(loan, today)) return t("overdueBy", { count: daysBetween(loan.dueOn, today) });
  return t("dueOn", { date: formatDateLong(loan.dueOn, locale) });
}

async function LoanRow({ loan, today, meta, amount }: { loan: Loan; today: DateKey; meta: string; amount: string }) {
  const done = loan.repaidOn !== null;
  return (
    <li>
      <Link href={loanHref(loan.id)} scroll={false} className="flex min-h-64 items-center gap-12 px-16 py-12 transition-colors hover:bg-surface-page">
        <span aria-hidden className="inline-flex size-36 shrink-0 items-center justify-center rounded-sm bg-category-teal text-category-fg-teal">
          <Icon icon="loan" />
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-2">
          <span className={done ? "truncate text-body-strong text-text-secondary" : "truncate text-body-strong text-text-primary"}>{loanTitle(loan)}</span>
          <span className={isOverdue(loan, today) ? "truncate text-caption text-text-danger" : "truncate text-caption text-text-secondary"}>{meta}</span>
        </span>
        <span className="flex shrink-0 flex-col items-end gap-4">
          <span className="text-body-strong text-text-primary">{amount}</span>
          <LoanStatusChip loan={loan} today={today} />
        </span>
      </Link>
    </li>
  );
}
