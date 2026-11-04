import { getLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { DrawerBody } from "@/components/layout/DrawerBody";
import { FocusHeader } from "@/components/layout/FocusHeader";
import { Drawer } from "@/components/ui/Drawer";
import { listAccounts } from "@/features/accounts/server";
import { getAccountBalances } from "@/features/transactions/server";
import { isLocale } from "@/i18n/config";
import { toDateKey } from "@/lib/dates";
import { formatMoney } from "@/lib/money";
import { formatSavingsAmount } from "../format";
import { savingsHref, type MovementDirection } from "../routes";
import { getSavingsDetail } from "../server";
import { MovementForm } from "./MovementForm";

// Para ekle / Çek sunumu (RESPONSIVE §8.2.11): tablet+ sağ drawer 480 px; mobilde tam ekran [Varsayım].

export async function MovementFormDrawer({ id, direction }: { id: string; direction: MovementDirection }) {
  const detail = await getSavingsDetail(id);
  if (!detail) notFound();
  const [t, rawLocale, accounts, balances] = await Promise.all([getTranslations("savings.move"), getLocale(), listAccounts(), getAccountBalances()]);
  const locale = isLocale(rawLocale) ? rawLocale : "tr";
  const { account } = detail;
  const closeHref = savingsHref(account.id);
  const titleId = "savings-move-title";

  return (
    <Drawer closeHref={closeHref} closeLabel={t("cancel")} labelledBy={titleId} size="detail">
      <FocusHeader title={t("title")} titleId={titleId} back={{ href: closeHref, label: t("cancel") }} />
      <DrawerBody>
        <MovementForm
          accountId={account.id}
          unit={account.unit}
          balanceLabel={formatSavingsAmount(account.balance, account.unit, locale)}
          initialDirection={direction}
          accounts={accounts.map((bank) => {
            const balance = balances.get(bank.id) ?? bank.openingBalanceMinor;
            return { id: bank.id, name: bank.name, balance: formatMoney(balance, locale), balanceMinor: balance.toString() };
          })}
          today={toDateKey(new Date())}
          cancelHref={closeHref}
        />
      </DrawerBody>
    </Drawer>
  );
}
