import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Chip } from "@/components/ui/Chip";
import { CategoryIcon, type Category } from "@/features/categories";
import type { Locale } from "@/i18n/config";
import { cn } from "@/lib/cn";
import { formatDayMonth, localDateTimeToIso, formatTime, type DateKey } from "@/lib/dates";
import { formatMoney } from "@/lib/money";
import { dueState, isUrgent } from "../domain/schedule";
import type { Payment, RecurringPayment } from "../domain/types";
import { paymentHref } from "../routes";
import { MarkPaidButton } from "./MarkPaidButton";
import { dueMessage } from "./PaymentStatusChip";

// Pages → Ana Sayfa ödeme kartı ("Bugünün Akışı" ve "Yaklaşan Ödemeler"):
//   radius-lg, border-default, padding 12, aralık 12; kategori ikon kutusu 40 + başlık Label/Default,
//   alt satır Label/Small (saat / vade) • Body/Small (kategori / kalan süre); sağda tutar Label/Default Semantic/Gider - Hata.
//   Akış: başlığın yanında durum çipi ("Bekliyor" Turuncu).
// "Ödendi olarak işaretle" tek buton, Secondary [D-5, Ç-4]: kart dar iken altta tam genişlik, geniş iken (kart listesi
//   ≥ 32rem) sağda tutarın altında SM (RESPONSIVE §4.6). "Hemen öde" kaldırıldı (PRD FR-FIN-017).
// [Varsayım] Geniş/dar eşiği ekran yerine kart listesinin genişliğine göre (container query): laptop'ta dar sütunda
//   başlık sıkışmasın diye.
// Kart listesi (ul) `@container` olmalıdır.
// Kartın tamamı Ödeme Detayı'nı açar; buton bağlantının üstünde kalır.

type PaymentCardProps = {
  payment: Payment;
  series: RecurringPayment;
  category: Category | undefined;
  locale: Locale;
  today: DateKey;
  /** agenda: Bugünün Akışı (saat + kategori + durum çipi) · upcoming: Yaklaşan Ödemeler (vade + kalan süre). */
  variant: "agenda" | "upcoming";
};

export async function PaymentCard({ payment, series, category, locale, today, variant }: PaymentCardProps) {
  const t = await getTranslations("payments");
  const paid = payment.status === "paid";
  const due = dueState(payment.dueDate, today);
  const dueText = dueMessage(due);
  // Akışta bugünkü bekleyen her ödeme, yaklaşanlarda vadesi yakın (≤ 3 gün) veya gecikmiş olanlar işaretlenebilir.
  const actionable = !paid && (variant === "agenda" || isUrgent(due));
  const amount = formatMoney(-(payment.paidAmountMinor ?? payment.amountMinor), locale, "always");
  // Görünürlük sarmalayıcıda değişir: buton sınıfları birleştirilmediği için display çakışması olmaz.
  const action = (fullWidth?: boolean) => <MarkPaidButton paymentId={payment.id} variant="secondary" size="sm" fullWidth={fullWidth} className="relative" />;

  return (
    // Tamamlananlar listede soluk görünümle kalır (PRD Q-20).
    <li className={cn("relative flex flex-col gap-12 rounded-lg border border-border-default bg-surface-card p-12 transition-colors hover:border-border-strong", paid && "opacity-60")}>
      <div className="flex items-start gap-12">
        {category && <CategoryIcon category={category} />}
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <span className="flex min-w-0 items-center gap-8">
            <Link href={paymentHref(payment.id, "home")} className="truncate text-label-md text-text-primary after:absolute after:inset-0 after:rounded-lg">
              {series.title}
            </Link>
            {variant === "agenda" && <Chip variant={paid ? "success" : "warning"}>{paid ? t("status.paid") : t("status.pending")}</Chip>}
          </span>
          <p className="flex min-w-0 items-center gap-8 text-body-sm">
            <span className="shrink-0 text-label-sm text-text-primary">
              {variant === "agenda" ? formatTime(localDateTimeToIso(payment.dueDate, series.dueTime), locale) : formatDayMonth(payment.dueDate, locale)}
            </span>
            <span aria-hidden className="text-text-secondary">
              •
            </span>
            {variant === "agenda" ? (
              <span className="truncate text-text-secondary">{category?.name}</span>
            ) : (
              <span className={cn("truncate", isUrgent(due) ? "text-text-danger" : "text-text-secondary")}>{t(`due.${dueText.key}`, dueText.values)}</span>
            )}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-8">
          <p className="text-end text-label-md text-text-danger">{amount}</p>
          {actionable && <div className="hidden @[32rem]:block">{action()}</div>}
        </div>
      </div>
      {actionable && <div className="@[32rem]:hidden">{action(true)}</div>}
    </li>
  );
}
