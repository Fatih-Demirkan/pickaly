import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { DrawerBody } from "@/components/layout/DrawerBody";
import { FocusHeader } from "@/components/layout/FocusHeader";
import { Drawer } from "@/components/ui/Drawer";
import { Icon } from "@/components/ui/Icon";
import { listAccounts } from "@/features/accounts/server";
import { getAccountBalances } from "@/features/transactions/server";
import { isLocale } from "@/i18n/config";
import { addDays, toDateKey } from "@/lib/dates";
import { formatMoney, formatMoneyInput } from "@/lib/money";
import { LOANS_PATH, loanHref } from "../routes";
import { getLoan } from "../server";
import { LoanForm, type LoanFormValues } from "./LoanForm";

// Borç Ver / Alacağı Düzenle sunumu: mobil tam sayfa · tablet+ sağ drawer 560 px. Header "× İptal" (Yeni İşlem ile aynı).

type LoanFormDrawerProps = { mode: "create" } | { mode: "edit"; id: string };

/** [Varsayım] Yeni alacakta geri alınacak tarih varsayılan olarak 30 gün sonrası. */
const DEFAULT_TERM_DAYS = 30;

export async function LoanFormDrawer(props: LoanFormDrawerProps) {
  const [t, rawLocale, accounts, balances] = await Promise.all([getTranslations("loans.form"), getLocale(), listAccounts(), getAccountBalances()]);
  const locale = isLocale(rawLocale) ? rawLocale : "tr";

  let initialValues: LoanFormValues;
  let cancelHref: string;
  if (props.mode === "edit") {
    const loan = await getLoan(props.id);
    if (!loan) notFound();
    cancelHref = loanHref(loan.id);
    initialValues = {
      person: loan.person,
      purpose: loan.purpose ?? "",
      amount: formatMoneyInput(loan.amountMinor, locale),
      fromAccount: loan.accountId !== null,
      accountId: loan.accountId ?? accounts[0]?.id ?? "",
      lentOn: loan.lentOn,
      dueOn: loan.dueOn,
      note: loan.note ?? "",
      multi: loan.items.length > 0,
      items: loan.items.map((item) => ({ id: item.id, label: item.label, amount: formatMoneyInput(item.amountMinor, locale) })),
    };
  } else {
    const today = toDateKey(new Date());
    cancelHref = LOANS_PATH;
    initialValues = { person: "", purpose: "", amount: "", fromAccount: true, accountId: accounts[0]?.id ?? "", lentOn: today, dueOn: addDays(today, DEFAULT_TERM_DAYS), note: "", multi: false, items: [] };
  }

  const title = props.mode === "create" ? t("newTitle") : t("editTitle");
  const titleId = "loan-form-title";
  return (
    <Drawer closeHref={cancelHref} closeLabel={t("cancel")} labelledBy={titleId} size="form">
      <FocusHeader
        title={title}
        titleId={titleId}
        trailing={
          <Link
            href={cancelHref}
            scroll={false}
            className="touch-target -me-8 inline-flex h-40 items-center gap-4 rounded-full px-8 text-body-strong text-text-secondary transition-colors hover:bg-action-tertiary-hover hover:text-text-primary"
          >
            <Icon icon="close" size="sm" />
            {t("cancel")}
          </Link>
        }
      />
      <DrawerBody>
        <LoanForm
          loanId={props.mode === "edit" ? props.id : undefined}
          initialValues={initialValues}
          accounts={accounts.map((account) => ({
            id: account.id,
            name: account.name,
            balance: formatMoney(balances.get(account.id) ?? account.openingBalanceMinor, locale),
          }))}
          cancelHref={cancelHref}
        />
      </DrawerBody>
    </Drawer>
  );
}
