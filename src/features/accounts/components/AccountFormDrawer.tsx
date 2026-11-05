import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { DrawerBody } from "@/components/layout/DrawerBody";
import { FocusHeader } from "@/components/layout/FocusHeader";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Drawer } from "@/components/ui/Drawer";
import { Icon } from "@/components/ui/Icon";
import { transactionRepository } from "@/features/transactions/server";
import { isLocale } from "@/i18n/config";
import { formatMoneyInput } from "@/lib/money";
import { removeAccountAction } from "../actions";
import { ACCOUNTS_PATH } from "../routes";
import { getAccount, isAccountInUse } from "../server";
import { AccountForm, type AccountFormValues } from "./AccountForm";

// Hesap Ekle / Düzenle sunumu: mobil tam sayfa · tablet+ sağ drawer 560 px (kategori formuyla aynı).
// Düzenlemede altta "Hesabı sil": kaydı olan hesap arşivlenir, olmayan kalıcı silinir (onay diyaloğu metni buna göre).
// Varsayılan hesap ("Ana Hesap") silinemez; yerine bilgi notu gösterilir.

type AccountFormDrawerProps = { mode: "create" } | { mode: "edit"; id: string };

export async function AccountFormDrawer(props: AccountFormDrawerProps) {
  const [t, rawLocale] = await Promise.all([getTranslations("accounts"), getLocale()]);
  const locale = isLocale(rawLocale) ? rawLocale : "tr";

  let initialValues: AccountFormValues = { name: "", detail: "", openingBalance: "" };
  let removal: { inUse: boolean; name: string } | null = null;
  let isDefault = false;
  if (props.mode === "edit") {
    const account = await getAccount(props.id);
    if (!account || account.archived) notFound();
    initialValues = {
      name: account.name,
      detail: account.detail ?? "",
      openingBalance: account.openingBalanceMinor > BigInt(0) ? formatMoneyInput(account.openingBalanceMinor, locale) : "",
    };
    isDefault = account.isDefault;
    if (!account.isDefault) {
      const transactions = await transactionRepository.listAll();
      removal = { inUse: await isAccountInUse(account.id, new Set(transactions.map((transaction) => transaction.accountId))), name: account.name };
    }
  }

  const titleId = "account-form-title";

  return (
    <Drawer closeHref={ACCOUNTS_PATH} closeLabel={t("form.cancel")} labelledBy={titleId} size="form">
      <FocusHeader
        title={props.mode === "create" ? t("form.newTitle") : t("form.editTitle")}
        titleId={titleId}
        trailing={
          <Link
            href={ACCOUNTS_PATH}
            scroll={false}
            className="touch-target -me-8 inline-flex h-40 items-center gap-4 rounded-full px-8 text-body-strong text-text-secondary transition-colors hover:bg-action-tertiary-hover hover:text-text-primary"
          >
            <Icon icon="close" size="sm" />
            {t("form.cancel")}
          </Link>
        }
      />
      <DrawerBody>
        <AccountForm accountId={props.mode === "edit" ? props.id : undefined} initialValues={initialValues} cancelHref={ACCOUNTS_PATH} />
        {props.mode === "edit" &&
          (isDefault ? (
            <p className="rounded-lg bg-status-info-subtle p-16 text-body text-text-primary">{t("form.defaultNote")}</p>
          ) : (
            removal && (
              <ConfirmDialog
                trigger={{ label: t("form.remove"), icon: "delete", variant: "destructive", className: "w-full" }}
                title={removal.inUse ? t("removeDialog.archiveTitle") : t("removeDialog.deleteTitle")}
                body={removal.inUse ? t("removeDialog.archiveBody", { name: removal.name }) : t("removeDialog.deleteBody", { name: removal.name })}
                cancelLabel={t("removeDialog.cancel")}
                confirmLabel={removal.inUse ? t("removeDialog.archiveConfirm") : t("removeDialog.deleteConfirm")}
                action={removeAccountAction.bind(null, props.id)}
              />
            )
          ))}
        {/* Silme diyaloğu kendi <form>'unu taşıdığı için hesap formunun dışında; mobilde sabit alt barın arkasında
            kalmasın diye altında bar yüksekliği kadar boşluk bırakılır. */}
        {props.mode === "edit" && <div aria-hidden className="h-[calc(72px+env(safe-area-inset-bottom))] tablet:hidden" />}
      </DrawerBody>
    </Drawer>
  );
}
