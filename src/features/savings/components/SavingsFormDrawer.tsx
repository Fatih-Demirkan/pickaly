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
import { DEFAULT_TIME, toDateKey, toTimeValue } from "@/lib/dates";
import { formatMoney, formatMoneyInput } from "@/lib/money";
import { DEFAULT_REMINDER } from "@/lib/recurrence";
import { savingsHref } from "../routes";
import { savingsRepository } from "../server";
import { SavingsForm, type SavingsFormValues } from "./SavingsForm";

// Yeni Birikim Hesabı / Hesabı Düzenle sunumu (RESPONSIVE §3.4.4): mobil tam sayfa · tablet+ sağ drawer 560 px.
// Header "Yeni Birikim Hesabı" + "× İptal" (Pages).

type SavingsFormDrawerProps = { mode: "create" } | { mode: "edit"; id: string };

export async function SavingsFormDrawer(props: SavingsFormDrawerProps) {
  const [t, rawLocale, accounts, balances] = await Promise.all([getTranslations("savings.form"), getLocale(), listAccounts(), getAccountBalances()]);
  const locale = isLocale(rawLocale) ? rawLocale : "tr";
  const now = new Date();

  let initialValues: SavingsFormValues;
  let cancelHref: string;
  if (props.mode === "edit") {
    const account = await savingsRepository.getAccount(props.id);
    if (!account) notFound();
    cancelHref = savingsHref(account.id);
    const rule = account.contribution;
    initialValues = {
      name: account.name,
      kind: account.kind,
      unit: account.unit,
      amount: rule ? formatMoneyInput(rule.amount, locale) : "",
      target: account.target !== null ? formatMoneyInput(account.target, locale) : "",
      sourceAccountId: account.accountId ?? rule?.sourceAccountId ?? accounts[0]?.id ?? "",
      date: toDateKey(now),
      time: rule?.time ?? toTimeValue(now),
      repeat: rule !== null,
      frequency: rule?.frequency ?? "monthly",
      reminder: rule?.reminder ?? DEFAULT_REMINDER,
      note: account.note ?? "",
    };
  } else {
    cancelHref = "/birikimler";
    initialValues = {
      name: "",
      kind: "deposit",
      unit: "TRY",
      amount: "",
      target: "",
      // [Varsayım] Varsayılan kaynak hesap listedeki ilk hesap (Pages: "Ana Hesap").
      sourceAccountId: accounts[0]?.id ?? "",
      date: toDateKey(now),
      time: DEFAULT_TIME, // Yeni kayıt: bugün 09:00 (ürün sahibi kararı 2026-11-05)
      // Pages: Yeni Birikim formunda Tekrar Eden İşlem açık, sıklık Aylık.
      repeat: true,
      frequency: "monthly",
      reminder: DEFAULT_REMINDER,
      note: "",
    };
  }

  const accountOptions = accounts.map((account) => ({
    id: account.id,
    name: account.name,
    balance: formatMoney(balances.get(account.id) ?? account.openingBalanceMinor, locale),
  }));
  const titleId = "savings-form-title";

  return (
    <Drawer closeHref={cancelHref} closeLabel={t("cancel")} labelledBy={titleId} size="form">
      <FocusHeader
        title={props.mode === "create" ? t("newTitle") : t("editTitle")}
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
        <SavingsForm mode={props.mode} accountId={props.mode === "edit" ? props.id : undefined} initialValues={initialValues} accounts={accountOptions} cancelHref={cancelHref} />
      </DrawerBody>
    </Drawer>
  );
}
