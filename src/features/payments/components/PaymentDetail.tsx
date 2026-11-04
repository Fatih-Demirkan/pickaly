import { getTranslations } from "next-intl/server";
import { ActionFooter } from "@/components/layout/ActionFooter";
import { Chip } from "@/components/ui/Chip";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { CopyButton } from "@/components/ui/CopyButton";
import { DetailRow } from "@/components/ui/DetailRow";
import { Icon } from "@/components/ui/Icon";
import type { Account } from "@/features/accounts";
import { categoryChipClass, resolveCategoryIcon, type Category } from "@/features/categories";
import type { Locale } from "@/i18n/config";
import { cn } from "@/lib/cn";
import { formatDateLong, formatDateWithWeekday, formatTime, localDateTimeToIso, toDateKey, type DateKey } from "@/lib/dates";
import { formatMoney } from "@/lib/money";
import { recurrenceRuleMessage } from "@/lib/recurrenceText";
import { deleteRecurringPaymentAction } from "../actions";
import { dueState } from "../domain/schedule";
import type { PaymentOrigin } from "../routes";
import type { PaymentDetailData } from "../server";
import { MarkPaidButton } from "./MarkPaidButton";
import { dueMessage, PaymentStatusChip } from "./PaymentStatusChip";

// Pages → Ödeme Detayı ve Durum Yönetimi (115:2171, PRD FR-FIN-015/016).
//   Durum kartı: İşlem Detayı ile aynı kart; kategori çipi • durum çipi, başlık Label/Small, tutar Data/Large
//                (Semantic/Gider - Hata), vade tarihi + saat çipi (Category/Slate)
//   Ödeme Ayrıntıları: Vade ("n gün kaldı") · Tekrarlama Sıklığı ("Her ayın 22'sinde") · Kaynak Hesap ·
//                Hatırlatıcı · Abone / Sözleşme No (kopyalanabilir pill)
//   Geçmiş Ödemeler: liste kartı; satırda 32 px Category/Green kutuda badge-check, tarih + hesap, sağda tutar
//   Alt bar: "İşlemi sil" + "Ödendi olarak işaretle"
// [Varsayım] Satır ikonları Pages'ta yer tutucu (credit-card, store); kavram ikonları kullanıldı (calendar, repeat,
//   paymentMethod, notifications, code).
// [Eksik] "Geçmiş Ödemeler → Tümü" ekranı tasarlanmadı; bağlantı gösterilmez, son 4 ödeme listelenir.
// [Eksik] "Hemen öde" kaldırıldı: uygulama ödeme yapmaz (PRD FR-FIN-017, D-5).
// [Eksik] Duraklatma / sonlandırma (FR-FIN-019) ve tekrarlayan ödemeyi düzenleme tasarlanmadı.
// [Varsayım] Hatırlatma kanalı v1'de uygulama içi bildirimdir (TECH_STACK §5.2 reminders.channel); Pages'taki
//   "Push Bildirim" v1.1'de gelir.

const HISTORY_LIMIT = 4;

type PaymentDetailProps = {
  data: PaymentDetailData;
  category: Category | undefined;
  accounts: Map<string, Account>;
  locale: Locale;
  today: DateKey;
  origin: PaymentOrigin;
};

export async function PaymentDetail({ data, category, accounts, locale, today, origin }: PaymentDetailProps) {
  const [t, tRecurrence] = await Promise.all([getTranslations("payments"), getTranslations("recurrence")]);
  const { payment, series, history } = data;
  const paid = payment.status === "paid";
  const due = dueState(payment.dueDate, today);
  const dueAt = localDateTimeToIso(payment.dueDate, series.dueTime);
  const account = accounts.get(series.accountId);
  const rule = recurrenceRuleMessage(series.frequency, series.startDate, locale);
  const statusLabels = { pending: t("status.pending"), paid: t("status.paid"), overdue: t("status.overdue") };
  const dueText = dueMessage(due);

  return (
    <article className="flex flex-1 flex-col gap-(--layout-section-gap)">
      <section className="flex flex-col items-start gap-12 rounded-2xl border border-border-default bg-linear-to-b from-surface-card to-surface-muted p-16 shadow-floating">
        <div className="flex flex-wrap items-center gap-4">
          {category && (
            <span className={cn("inline-flex h-24 items-center gap-4 rounded-full px-8 text-label-sm", categoryChipClass(category.color))}>
              <Icon icon={resolveCategoryIcon(category)} size="xs" />
              {category.name}
            </span>
          )}
          <span aria-hidden className="w-8 text-center text-body-sm text-text-secondary">
            •
          </span>
          <PaymentStatusChip status={payment.status} due={due} labels={statusLabels} />
        </div>
        <div className="flex min-w-0 flex-col">
          <h2 className="text-label-sm text-text-secondary">{series.title}</h2>
          <p className="text-data-lg text-text-danger">{formatMoney(-(payment.paidAmountMinor ?? payment.amountMinor), locale, "always")}</p>
        </div>
        <Chip variant="neutral">
          {formatDateWithWeekday(dueAt, locale)} • {formatTime(dueAt, locale)}
        </Chip>
      </section>

      <section aria-labelledby={`payment-details-${payment.id}`} className="flex flex-col gap-12">
        <h3 id={`payment-details-${payment.id}`} className="text-heading-h4 text-text-primary">
          {t("detail.details")}
        </h3>
        <dl className="overflow-hidden rounded-lg border border-border-default bg-surface-card">
          <DetailRow icon="calendar" label={t("detail.due")}>
            <p className="text-label-md text-text-primary">{formatDateLong(payment.dueDate, locale)}</p>
            <p className={cn("text-body-sm", !paid && due.kind === "overdue" ? "text-text-danger" : "text-text-secondary")}>
              {paid && payment.paidAt
                ? t("detail.paidOn", { date: formatDateLong(toDateKey(new Date(payment.paidAt)), locale) })
                : t(`due.${dueText.key}`, dueText.values)}
            </p>
          </DetailRow>
          <DetailRow icon="repeat" label={t("detail.frequency")}>
            <p className="text-label-md text-text-primary">{tRecurrence(`frequency.${series.frequency ?? "once"}`)}</p>
            <p className="text-body-sm text-text-secondary">{tRecurrence(`rule.${rule.key}`, rule.values)}</p>
          </DetailRow>
          <DetailRow icon="paymentMethod" label={t("detail.account")}>
            <p className="text-label-md text-text-primary">{account?.name ?? "—"}</p>
            {account?.detail && <p className="text-body-sm text-text-secondary">{account.detail}</p>}
          </DetailRow>
          <DetailRow icon="notifications" label={t("detail.reminder")}>
            {series.reminder === "none" ? (
              <p className="text-label-md text-text-primary">{t("detail.reminderOff")}</p>
            ) : (
              <>
                <p className="text-label-md text-text-primary">{t("detail.reminderChannel")}</p>
                <p className="text-body-sm text-text-secondary">{t("detail.reminderOffset", { offset: tRecurrence(`reminder.${series.reminder}`) })}</p>
              </>
            )}
          </DetailRow>
          {series.contractNumber && (
            <DetailRow icon="code" label={t("detail.contract")}>
              <CopyButton value={series.contractNumber} label={t("detail.copyContract")} copiedLabel={t("detail.copied")} />
            </DetailRow>
          )}
        </dl>
      </section>

      <section aria-labelledby={`payment-history-${payment.id}`} className="flex flex-col gap-12">
        <h3 id={`payment-history-${payment.id}`} className="text-heading-h4 text-text-primary">
          {t("detail.history")}
        </h3>
        {history.length === 0 ? (
          <p className="text-body-md text-text-secondary">{t("detail.historyEmpty")}</p>
        ) : (
          <ul className="overflow-hidden rounded-lg border border-border-default bg-surface-card">
            {history.slice(0, HISTORY_LIMIT).map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-12 p-16">
                <span className="flex min-w-0 items-center gap-8">
                  <span aria-hidden className="inline-flex size-32 shrink-0 items-center justify-center rounded-sm bg-category-green text-status-success">
                    <Icon icon="paid" size="sm" />
                  </span>
                  <span className="flex min-w-0 flex-col gap-2">
                    <span className="truncate text-label-md text-text-primary">{formatDateLong(item.dueDate, locale)}</span>
                    <span className="truncate text-body-sm text-text-secondary">{accounts.get(item.paidAccountId ?? series.accountId)?.name}</span>
                  </span>
                </span>
                <span className="shrink-0 text-label-md text-text-primary">{formatMoney(item.paidAmountMinor ?? item.amountMinor, locale)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <ActionFooter>
        <ConfirmDialog
          trigger={{ label: t("detail.delete"), icon: "delete" }}
          title={t("deleteDialog.title")}
          body={t("deleteDialog.body", { title: series.title })}
          cancelLabel={t("deleteDialog.cancel")}
          confirmLabel={t("deleteDialog.confirm")}
          action={deleteRecurringPaymentAction.bind(null, series.id, origin)}
        />
        {!paid && <MarkPaidButton paymentId={payment.id} />}
      </ActionFooter>
    </article>
  );
}
