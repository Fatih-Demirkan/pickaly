import { getLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { DrawerBody } from "@/components/layout/DrawerBody";
import { FocusHeader } from "@/components/layout/FocusHeader";
import { Drawer } from "@/components/ui/Drawer";
import { getAccountMap } from "@/features/accounts/server";
import { getCategoryMap } from "@/features/categories/server";
import { isLocale } from "@/i18n/config";
import { toMonthKey } from "@/lib/dates";
import { listHref, type ListQuery } from "../routes";
import { recurringRuleRepository, transactionRepository } from "../server";
import { TransactionDetail } from "./TransactionDetail";

// İşlem Detayı sunumu (RESPONSIVE §3.3.2): mobil tam ekran · 768–1279 sağ drawer 480 px ·
// ≥1280 listenin sağında sabit panel (docked). Kapatınca gelinen ay ve filtrelerle listeye dönülür.

type TransactionDetailDrawerProps = {
  id: string;
  query: ListQuery;
};

export async function TransactionDetailDrawer({ id, query }: TransactionDetailDrawerProps) {
  const transaction = await transactionRepository.get(id);
  if (!transaction) notFound();

  const [t, rawLocale, categories, accounts, rule] = await Promise.all([
    getTranslations("transactions.detail"),
    getLocale(),
    getCategoryMap(),
    getAccountMap(),
    transaction.recurringRuleId ? recurringRuleRepository.get(transaction.recurringRuleId) : null,
  ]);
  const locale = isLocale(rawLocale) ? rawLocale : "tr";
  const closeHref = listHref({ ...query, month: query.month ?? toMonthKey(new Date(transaction.occurredAt)) });
  const titleId = `transaction-detail-${transaction.id}`;

  return (
    <Drawer closeHref={closeHref} closeLabel={t("close")} labelledBy={titleId} size="detail" docked>
      <FocusHeader title={t("title")} titleId={titleId} back={{ href: closeHref, label: t("back") }} />
      <DrawerBody>
        <TransactionDetail
          transaction={transaction}
          category={categories.get(transaction.categoryId)}
          account={accounts.get(transaction.accountId)}
          rule={rule}
          locale={locale}
        />
      </DrawerBody>
    </Drawer>
  );
}
