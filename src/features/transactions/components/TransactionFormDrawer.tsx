import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { DrawerBody } from "@/components/layout/DrawerBody";
import { FocusHeader } from "@/components/layout/FocusHeader";
import { Drawer } from "@/components/ui/Drawer";
import { Icon } from "@/components/ui/Icon";
import { listAccounts } from "@/features/accounts/server";
import { listCategories } from "@/features/categories/server";
import { isLocale } from "@/i18n/config";
import { toDateKey, toTimeValue } from "@/lib/dates";
import { formatMoney, formatMoneyInput } from "@/lib/money";
import { DEFAULT_REMINDER } from "@/lib/recurrence";
import type { TransactionFormType } from "../schemas";
import { getAccountBalances, transactionRepository } from "../server";
import { TransactionForm, type TransactionFormValues } from "./TransactionForm";

// Yeni İşlem ve Düzenle sunumu (RESPONSIVE §3.3.3): mobil tam ekran form (Pages) · tablet+ sağ drawer 560 px.
// Hem doğrudan adresle açılan sayfa hem de listeden açılan (intercept edilen) drawer bu bileşeni kullanır.

type TransactionFormDrawerProps = { mode: "create"; type?: TransactionFormType } | { mode: "edit"; id: string };

export async function TransactionFormDrawer(props: TransactionFormDrawerProps) {
  const [t, rawLocale, categories, accounts, balances] = await Promise.all([
    getTranslations("transactions.form"),
    getLocale(),
    listCategories(),
    listAccounts(),
    getAccountBalances(),
  ]);
  const locale = isLocale(rawLocale) ? rawLocale : "tr";

  let initialValues: TransactionFormValues;
  let cancelHref: string;
  if (props.mode === "edit") {
    const transaction = await transactionRepository.get(props.id);
    if (!transaction) notFound();
    const occurredAt = new Date(transaction.occurredAt);
    cancelHref = `/islemler/${encodeURIComponent(transaction.id)}`;
    initialValues = {
      type: transaction.type,
      amount: formatMoneyInput(transaction.amountMinor, locale),
      title: transaction.title,
      categoryId: transaction.categoryId,
      accountId: transaction.accountId,
      date: toDateKey(occurredAt),
      time: toTimeValue(occurredAt),
      note: transaction.note ?? "",
      repeat: false,
      frequency: "monthly",
      reminder: DEFAULT_REMINDER,
    };
  } else {
    const now = new Date();
    cancelHref = "/islemler";
    const type = props.type ?? "income";
    initialValues = {
      type,
      amount: "",
      title: "",
      categoryId: "",
      // [Varsayım] Yeni kayıtta varsayılan hesap listedeki ilk hesaptır (Pages: "Ana Hesap").
      accountId: accounts[0]?.id ?? "",
      date: toDateKey(now),
      time: toTimeValue(now),
      note: "",
      // Pages: Abonelik'te Tekrar Eden İşlem açık gelir; Gelir/Gider'de kapalı.
      repeat: type === "subscription",
      frequency: "monthly",
      reminder: DEFAULT_REMINDER,
    };
  }

  // Arşivli kategoriler yeni seçimde çıkmaz; düzenlenen kaydın mevcut kategorisi korunur (BR-CAT-003).
  const selectable = categories.filter((category) => !category.archived || category.id === initialValues.categoryId);
  const accountOptions = accounts.map((account) => ({
    id: account.id,
    name: account.name,
    balance: formatMoney(balances.get(account.id) ?? account.openingBalanceMinor, locale),
  }));
  const title = props.mode === "create" ? t("newTitle") : t("editTitle");
  const titleId = "transaction-form-title";

  return (
    <Drawer closeHref={cancelHref} closeLabel={t("cancel")} labelledBy={titleId} size="form">
      <FocusHeader
        title={title}
        titleId={titleId}
        trailing={
          <Link
            href={cancelHref}
            scroll={false}
            className="touch-target -me-8 inline-flex h-40 items-center gap-4 rounded-full px-8 text-label-md text-text-secondary transition-colors hover:bg-action-tertiary-hover hover:text-text-primary"
          >
            <Icon icon="close" size="sm" />
            {t("cancel")}
          </Link>
        }
      />
      <DrawerBody>
        <TransactionForm
          mode={props.mode}
          transactionId={props.mode === "edit" ? props.id : undefined}
          initialValues={initialValues}
          categories={selectable}
          accounts={accountOptions}
          cancelHref={cancelHref}
        />
      </DrawerBody>
    </Drawer>
  );
}
