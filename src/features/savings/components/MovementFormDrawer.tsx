import { getLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { DrawerBody } from "@/components/layout/DrawerBody";
import { FocusHeader } from "@/components/layout/FocusHeader";
import { Drawer } from "@/components/ui/Drawer";
import { getAccountMap } from "@/features/accounts/server";
import { getAccountBalances } from "@/features/transactions/server";
import { isLocale } from "@/i18n/config";
import { toDateKey } from "@/lib/dates";
import { formatMoney } from "@/lib/money";
import { formatSavingsAmount } from "../format";
import { savingsHref, type MovementDirection } from "../routes";
import { getSavingsDetail } from "../server";
import { MovementForm } from "./MovementForm";

// Para ekle / Çek sunumu (RESPONSIVE §8.2.11): tablet+ sağ drawer 480 px; mobilde tam ekran [Varsayım].
// Aktarım birikimin bağlı hesabıyla yapılır; form o hesabın adını ve bakiyesini gösterir.

export async function MovementFormDrawer({ id, direction }: { id: string; direction: MovementDirection }) {
  const detail = await getSavingsDetail(id);
  if (!detail) notFound();
  const [t, rawLocale, accounts, balances] = await Promise.all([getTranslations("savings.move"), getLocale(), getAccountMap(), getAccountBalances()]);
  const locale = isLocale(rawLocale) ? rawLocale : "tr";
  const { account } = detail;
  const closeHref = savingsHref(account.id);
  const titleId = "savings-move-title";
  const bank = account.accountId ? accounts.get(account.accountId) : undefined;
  const bankBalance = bank ? (balances.get(bank.id) ?? bank.openingBalanceMinor) : null;

  return (
    <Drawer closeHref={closeHref} closeLabel={t("cancel")} labelledBy={titleId} size="detail">
      <FocusHeader title={t("title")} titleId={titleId} back={{ href: closeHref, label: t("cancel") }} />
      <DrawerBody>
        <MovementForm
          accountId={account.id}
          unit={account.unit}
          balanceLabel={formatSavingsAmount(account.balance, account.unit, locale)}
          initialDirection={direction}
          linkedAccount={bank && bankBalance !== null ? { name: bank.name, balance: formatMoney(bankBalance, locale), balanceMinor: bankBalance.toString() } : null}
          today={toDateKey(new Date())}
          cancelHref={closeHref}
        />
      </DrawerBody>
    </Drawer>
  );
}
