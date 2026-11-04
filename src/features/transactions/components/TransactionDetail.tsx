import { getTranslations } from "next-intl/server";
import { ActionFooter } from "@/components/layout/ActionFooter";
import { ButtonLink } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { CopyButton } from "@/components/ui/CopyButton";
import { DetailRow } from "@/components/ui/DetailRow";
import { Icon } from "@/components/ui/Icon";
import type { Account } from "@/features/accounts";
import { categoryChipClass, resolveCategoryIcon, type Category } from "@/features/categories";
import type { Locale } from "@/i18n/config";
import { cn } from "@/lib/cn";
import { formatDateWithWeekday, formatTime } from "@/lib/dates";
import { formatMoney } from "@/lib/money";
import { recurrenceRuleMessage } from "@/lib/recurrenceText";
import { deleteTransaction } from "../actions";
import { signedAmount, transactionCode } from "../domain/summary";
import type { RecurringRule, Transaction } from "../domain/types";

// Pages → İşlem Detayı (115:2029, PRD FR-FIN-012).
//   Durum kartı: radius-2xl, padding 16, aralık 12, gradyan beyaz → Neutral/100, border, shadow-floating;
//                kategori + tür çipleri, başlık Label/Small text-secondary, tutar Data/Large, tarih çipi Category/Slate
//   Kayıt Parametreleri: liste kartı (radius-lg); satır padding 16, aralık 16, alt çizgi;
//                solda 32 px ikon kutusu (Category/Slate, radius-sm) + Body/Default text-secondary,
//                sağda Label/Default + Body/Small
//   Bilgi notu: Category/Orange zemin, radius-md, padding 12, aralık 8, info ikonu
// [Eksik] Pages'taki ikinci kategori çipi ("Mutfak") alt kategori gösteriyor; veri modelinde alt kategori yok.
// [Ertelendi] "Fiş / Belge" satırı: ek dosya yükleme sonraki dilimde (PRD FR-FIN-013); kayıt yoksa satır gösterilmez.
// [Varsayım] "Tekrar" satırı: Tekrar Eden İşlem kuralından gelen kayıtta sıklık gösterilir; Pages İşlem Detayı'nda yok.
// Bilgi notu metni AA kontrast için text-on-warning (Pages'taki #D97706 Category/Orange üstünde 4,5:1'i sağlamaz).

type TransactionDetailProps = {
  transaction: Transaction;
  category: Category | undefined;
  account: Account | undefined;
  rule: RecurringRule | null;
  locale: Locale;
};

export async function TransactionDetail({ transaction, category, account, rule, locale }: TransactionDetailProps) {
  const [t, tRecurrence] = await Promise.all([getTranslations("transactions"), getTranslations("recurrence")]);
  const ruleText = rule && recurrenceRuleMessage(rule.frequency, rule.startDate, locale);
  const income = transaction.type === "income";
  const amount = formatMoney(transaction.amountMinor, locale);
  const accountName = account?.name ?? "—";

  return (
    <article className="flex flex-1 flex-col gap-(--layout-section-gap)">
      <section className="flex flex-col items-start gap-12 rounded-2xl border border-border-default bg-linear-to-r from-surface-card to-surface-muted p-16 shadow-floating">
        <div className="flex flex-wrap items-center gap-8">
          {category && (
            <span className={cn("inline-flex h-24 items-center gap-4 rounded-full px-8 text-label-sm", categoryChipClass(category.color))}>
              <Icon icon={resolveCategoryIcon(category)} size="xs" />
              {category.name}
            </span>
          )}
          {/* [Varsayım] Tür çipinin rengi ölçülmedi: Gelir Yeşil, Gider Genel (noktalı). */}
          <Chip variant={income ? "success" : "neutral"} dot>
            {t(`type.${transaction.type}`)}
          </Chip>
        </div>
        <div className="flex min-w-0 flex-col">
          <h2 className="text-label-sm text-text-secondary">{transaction.title}</h2>
          <p className={cn("text-data-lg", income ? "text-text-success" : "text-text-danger")}>{formatMoney(signedAmount(transaction), locale, "always")}</p>
        </div>
        <Chip variant="neutral">
          {formatDateWithWeekday(transaction.occurredAt, locale)} • {formatTime(transaction.occurredAt, locale)}
        </Chip>
      </section>

      <section aria-labelledby={`parameters-${transaction.id}`} className="flex flex-col gap-12">
        <h3 id={`parameters-${transaction.id}`} className="text-heading-h4 text-text-primary">
          {t("detail.parameters")}
        </h3>
        <dl className="overflow-hidden rounded-lg border border-border-default bg-surface-card">
          <DetailRow icon="paymentMethod" label={t("detail.account")}>
            <p className="text-label-md text-text-primary">{accountName}</p>
            {account?.detail && <p className="text-body-sm text-text-secondary">{account.detail}</p>}
          </DetailRow>
          {rule && ruleText && (
            <DetailRow icon="repeat" label={t("detail.repeat")}>
              <p className="text-label-md text-text-primary">{tRecurrence(`frequency.${rule.frequency}`)}</p>
              <p className="text-body-sm text-text-secondary">{tRecurrence(`rule.${ruleText.key}`, ruleText.values)}</p>
            </DetailRow>
          )}
          {transaction.merchantName && (
            <DetailRow icon="store" label={t("detail.merchant")}>
              <p className="text-label-md text-text-primary">{transaction.merchantName}</p>
              {transaction.merchantLocation && <p className="text-body-sm text-text-secondary">{transaction.merchantLocation}</p>}
            </DetailRow>
          )}
          {transaction.note && (
            <DetailRow icon="note" label={t("detail.note")} stacked>
              <p className="rounded-sm border border-border-subtle bg-surface-page p-8 text-body-md text-text-primary">{transaction.note}</p>
            </DetailRow>
          )}
          <DetailRow icon="code" label={t("detail.code")}>
            <CopyButton value={transactionCode(transaction.id)} label={t("detail.copyCode")} copiedLabel={t("detail.copied")} />
          </DetailRow>
        </dl>
      </section>

      <p className="flex gap-8 rounded-md bg-category-orange p-12 text-body-md text-text-on-warning">
        <span className="mt-2 shrink-0 text-text-warning">
          <Icon icon="info" size="sm" />
        </span>
        {t(income ? "detail.deleteInfoIncome" : "detail.deleteInfoExpense", { amount, account: accountName })}
      </p>

      <ActionFooter>
        <ConfirmDialog
          trigger={{ label: t("detail.delete"), icon: "delete" }}
          title={t("deleteDialog.title")}
          body={t(transaction.paymentId ? "deleteDialog.bodyPayment" : "deleteDialog.body", { title: transaction.title })}
          cancelLabel={t("deleteDialog.cancel")}
          confirmLabel={t("deleteDialog.confirm")}
          action={deleteTransaction.bind(null, transaction.id)}
        />
        <ButtonLink href={`/islemler/${encodeURIComponent(transaction.id)}/duzenle`} scroll={false} leadingIcon="edit">
          {t("detail.edit")}
        </ButtonLink>
      </ActionFooter>
    </article>
  );
}
