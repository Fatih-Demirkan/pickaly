import { getLocale, getTranslations } from "next-intl/server";
import { DrawerBody } from "@/components/layout/DrawerBody";
import { FocusHeader } from "@/components/layout/FocusHeader";
import { Drawer } from "@/components/ui/Drawer";
import { getAccountBalances } from "@/features/transactions/server";
import { isLocale } from "@/i18n/config";
import { DEFAULT_TIME, toDateKey } from "@/lib/dates";
import { formatMoney } from "@/lib/money";
import { ACCOUNTS_PATH } from "../routes";
import { listAccounts } from "../server";
import { TransferForm } from "./TransferForm";

// Para Aktar sunumu: mobil tam sayfa · tablet+ sağ drawer 560 px. Yalnızca aktif hesaplar seçilebilir.

export async function TransferFormDrawer() {
  const [t, rawLocale, accounts, balances] = await Promise.all([getTranslations("accounts.transfer"), getLocale(), listAccounts(), getAccountBalances()]);
  const locale = isLocale(rawLocale) ? rawLocale : "tr";
  const titleId = "transfer-form-title";

  return (
    <Drawer closeHref={ACCOUNTS_PATH} closeLabel={t("cancel")} labelledBy={titleId} size="form">
      <FocusHeader title={t("title")} titleId={titleId} back={{ href: ACCOUNTS_PATH, label: t("cancel") }} />
      <DrawerBody>
        <TransferForm
          accounts={accounts.map((account) => {
            const balance = balances.get(account.id) ?? account.openingBalanceMinor;
            return { id: account.id, name: account.name, balance: formatMoney(balance, locale), balanceMinor: balance.toString() };
          })}
          today={toDateKey(new Date())}
          defaultTime={DEFAULT_TIME}
          cancelHref={ACCOUNTS_PATH}
        />
      </DrawerBody>
    </Drawer>
  );
}
