import { getLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { ActionFooter } from "@/components/layout/ActionFooter";
import { DrawerBody } from "@/components/layout/DrawerBody";
import { FocusHeader } from "@/components/layout/FocusHeader";
import { ButtonLink } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { DetailRow } from "@/components/ui/DetailRow";
import { Drawer } from "@/components/ui/Drawer";
import { getAccountMap } from "@/features/accounts/server";
import { isLocale } from "@/i18n/config";
import { cn } from "@/lib/cn";
import { formatDateLong, toDateKey } from "@/lib/dates";
import { formatMoney } from "@/lib/money";
import { deleteLoanAction } from "../actions";
import { isOverdue } from "../domain/types";
import { LOANS_PATH, editLoanHref } from "../routes";
import { getLoan } from "../server";
import { LoanStatusChip } from "./LoanStatus";
import { MarkRepaidButton, ReopenLoanButton } from "./RepaidButtons";

// Alacak Detayı (ürün sahibi isteği 2026-11-07): mobil tam sayfa · tablet+ sağ drawer 480 px (Kayıt Detayı kalıbı).
//   Durum ve başlık kartı: durum çipi · kişi title-md · ne için caption · tutar title-lg
//   Ayrıntılar (DetailRow): verildiği tarih · geri alınacak tarih · paranın çıktığı hesap · (kapalıysa) geri alındığı
//     tarih ve hesap · not
//   Alt bar: Düzenle (Tertiary) + Geri alındı (Primary) / Yeniden aç (Secondary). "Alacağı sil" onaylı.

export async function LoanDetailDrawer({ id, closeHref = LOANS_PATH }: { id: string; closeHref?: string }) {
  const loan = await getLoan(id);
  if (!loan) notFound();

  const [t, rawLocale, accounts] = await Promise.all([getTranslations("loans"), getLocale(), getAccountMap()]);
  const locale = isLocale(rawLocale) ? rawLocale : "tr";
  const today = toDateKey(new Date());
  const titleId = `loan-${loan.id}`;
  const accountName = (accountId: string | null) => (accountId ? (accounts.get(accountId)?.name ?? "—") : t("detail.noAccount"));

  return (
    <Drawer closeHref={closeHref} closeLabel={t("detail.close")} labelledBy={titleId} size="detail">
      <FocusHeader title={t("detail.title")} titleId={titleId} back={{ href: closeHref, label: t("detail.back") }} />
      <DrawerBody>
        <article className="flex flex-1 flex-col gap-(--layout-section-gap)">
          <section className="flex flex-col gap-12 rounded-lg bg-surface-card p-16 shadow-elev-1">
            <div className="flex flex-wrap items-center gap-4">
              <LoanStatusChip loan={loan} today={today} />
            </div>
            <div className="flex flex-col">
              <h2 className="text-title-md text-text-primary">{loan.person}</h2>
              {loan.purpose && <p className="text-caption text-text-secondary">{loan.purpose}</p>}
            </div>
            <p className="text-title-lg text-text-primary">{formatMoney(loan.amountMinor, locale)}</p>
          </section>

          <dl className="overflow-hidden rounded-lg bg-surface-card shadow-elev-1">
            <DetailRow icon="calendar" label={t("detail.lentOn")}>
              <span className="text-body-strong text-text-primary">{formatDateLong(loan.lentOn, locale)}</span>
            </DetailRow>
            <DetailRow icon="today" label={t("detail.dueOn")}>
              <span className={cn("text-body-strong", isOverdue(loan, today) ? "text-text-danger" : "text-text-primary")}>{formatDateLong(loan.dueOn, locale)}</span>
            </DetailRow>
            <DetailRow icon="paymentMethod" label={t("detail.account")}>
              <span className="text-body-strong text-text-primary">{accountName(loan.accountId)}</span>
            </DetailRow>
            {loan.repaidOn && (
              <>
                <DetailRow icon="paid" label={t("detail.repaidOn")}>
                  <span className="text-body-strong text-text-success">{formatDateLong(loan.repaidOn, locale)}</span>
                </DetailRow>
                <DetailRow icon="paymentMethod" label={t("detail.repaidAccount")}>
                  <span className="text-body-strong text-text-primary">{accountName(loan.repaidAccountId)}</span>
                </DetailRow>
              </>
            )}
            {loan.note && (
              <DetailRow icon="note" label={t("detail.note")} stacked>
                <span className="text-body text-text-primary">{loan.note}</span>
              </DetailRow>
            )}
          </dl>

          <p className="text-caption text-text-secondary">{loan.accountId ? t("detail.balanceHint") : t("detail.balanceHintNoAccount")}</p>

          <ConfirmDialog
            trigger={{ label: t("detail.delete"), icon: "delete", variant: "destructive", className: "w-full" }}
            title={t("deleteDialog.title")}
            body={t("deleteDialog.body", { person: loan.person })}
            cancelLabel={t("deleteDialog.cancel")}
            confirmLabel={t("deleteDialog.confirm")}
            action={deleteLoanAction.bind(null, loan.id)}
          />

          <ActionFooter>
            <ButtonLink href={editLoanHref(loan.id)} scroll={false} variant="tertiary" leadingIcon="edit">
              {t("detail.edit")}
            </ButtonLink>
            {loan.repaidOn ? <ReopenLoanButton loanId={loan.id} /> : <MarkRepaidButton loanId={loan.id} />}
          </ActionFooter>
        </article>
      </DrawerBody>
    </Drawer>
  );
}
