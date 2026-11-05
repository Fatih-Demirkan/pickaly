import Link from "next/link";
import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import { Chip } from "@/components/ui/Chip";
import { Icon } from "@/components/ui/Icon";
import type { AppIconName } from "@/config/icons";
import { resolveCategoryIcon, type Category } from "@/features/categories";
import { paymentHref, type Payment, type RecurringPayment } from "@/features/payments";
import { MarkPaidButton } from "@/features/payments/components/MarkPaidButton";
import type { Locale } from "@/i18n/config";
import { cn } from "@/lib/cn";
import { formatMoney } from "@/lib/money";
import type { CalendarItem } from "../domain/types";
import { CompleteToggle } from "./CompleteToggle";
import { subtaskProgress } from "../domain/types";
import { SubtaskProgress } from "./SubtaskProgress";
import { kindChip } from "./kindStyle";

// Takvim ajanda kartı (Pages "Article" yapısı) — görünüm DESIGN_SYSTEM_PICKALY §5.2: beyaz, radius-md, padding 12,
//   aralık 12, elev-1. Solda 62 px saat kutusu (canvas zemin, radius-sm): saat body-strong + alt satır caption-strong
//     ("45 dk" text-secondary · "Son Gün" Semantic/Gider - Hata · "Bitti" Semantic/Gelir - Tamamlandı)
//   Dikey ayırıcı · içerik: tür çipi + sağda ✓ (Button-test 32 px) / "Öncelikli" Label/Small Semantic/Gider - Hata /
//     ödeme tutarı; başlık Label/Default; alt satır 16 px ikon + Body/Small text-secondary
//   Tamamlandı: zemin beyaz kalır (muted zeminde ikincil gri AA'yı karşılamaz); saat ve başlık text-secondary,
//   başlık üstü çizili (PRD Q-19).
//   Ödeme kartı: "Ödendi olarak işaretle" sağa hizalı, Secondary SM (RESPONSIVE §4.6, "Hemen öde" kaldırıldı).
// [Varsayım] Yüksek öncelikli görevde Pages ✓ yerine "Öncelikli" gösteriyor; ikisi birlikte gösterilir ki görev
//   listeden de tamamlanabilsin (PRD FR-CAL-015). Alt satır: konum varsa konum, yoksa açıklama; ikon konum /
//   kategori ikonu / dosya.
// Kartın tamamı detayı açar; buton bağlantının üstünde kalır.

type Shell = { done: boolean; time: string; sub: string; subTone: string; children: ReactNode };

function CardShell({ done, time, sub, subTone, children }: Shell) {
  return (
    <li className="relative flex gap-12 rounded-md bg-surface-card p-12 shadow-elev-1 transition-colors hover:bg-action-tertiary-hover">
      <span className="flex w-62 shrink-0 flex-col items-center justify-center rounded-sm bg-surface-page px-4 text-center">
        <span className={cn("text-body-strong", done ? "text-text-secondary" : "text-text-primary")}>{time}</span>
        <span className={cn("text-caption-strong", subTone)}>{sub}</span>
      </span>
      <span aria-hidden className="w-px shrink-0 self-stretch bg-border-subtle" />
      <div className="flex min-w-0 flex-1 flex-col gap-4">{children}</div>
    </li>
  );
}

function titleLinkClass(done: boolean) {
  return cn("text-body-strong after:absolute after:inset-0 after:rounded-md", done ? "text-text-secondary line-through" : "text-text-primary");
}

type ItemCardProps = { item: CalendarItem; category: Category | undefined; href: string };

export async function AgendaItemCard({ item, category, href }: ItemCardProps) {
  const t = await getTranslations("calendar");
  const done = item.status === "done";
  const progress = subtaskProgress(item.subtasks);
  const sub = done ? t("card.finished") : item.durationMinutes ? t("card.minutes", { count: item.durationMinutes }) : item.time ? "" : t("card.allDay");
  // Açıklama ve öncelik arayüzde yok (ürün sahibi kararı 2026-11-05). Alt satır: konum; konum yoksa kategori adı
  // (eskiden açıklamanın gösterildiği yer, kategori ikonuyla) [Varsayım].
  const metaText = item.locationName ?? category?.name;
  const metaIcon: AppIconName | ReturnType<typeof resolveCategoryIcon> = item.locationName ? "location" : category?.icon ? resolveCategoryIcon(category) : "categories";

  return (
    <CardShell done={done} time={item.time ?? t("card.allDay")} sub={item.time ? sub : ""} subTone={done ? "text-text-success" : "text-text-secondary"}>
      <span className="flex items-center justify-between gap-8">
        <Chip variant={kindChip.task}>{t("kind.task")}</Chip>
        {/* Kartı kaplayan başlık bağlantısı DOM'da sonra geldiği için buton z-1 ile üstte tutulur. */}
        <span className="relative z-1 flex items-center gap-8">
          <CompleteToggle id={item.id} title={item.title} done={done} />
        </span>
      </span>
      <Link href={href} scroll={false} className={titleLinkClass(done)}>
        {item.title}
      </Link>
      {metaText && (
        <span className="flex min-w-0 items-start gap-4 text-caption text-text-secondary">
          <span aria-hidden className="shrink-0">
            <Icon icon={metaIcon} size="sm" />
          </span>
          <span className="min-w-0">{metaText}</span>
        </span>
      )}
      {progress && <SubtaskProgress done={progress.done} total={progress.total} label={t("subtasks.progress")} size="sm" className="pt-4" />}
    </CardShell>
  );
}

type PaymentCardProps = { payment: Payment; series: RecurringPayment; locale: Locale; today: string };

export async function AgendaPaymentCard({ payment, series, locale, today }: PaymentCardProps) {
  const [t, tPayments] = await Promise.all([getTranslations("calendar"), getTranslations("payments")]);
  const paid = payment.status === "paid";
  const overdue = !paid && payment.dueDate < today;
  const sub = paid ? tPayments("status.paid") : overdue ? tPayments("status.overdue") : t("card.lastDay");

  return (
    <CardShell done={paid} time={series.dueTime} sub={sub} subTone={paid ? "text-text-success" : "text-text-danger"}>
      <span className="flex items-center justify-between gap-8">
        <Chip variant={kindChip.payment}>{t("kind.payment")}</Chip>
        <span className="text-body-strong text-text-danger">{formatMoney(-(payment.paidAmountMinor ?? payment.amountMinor), locale, "always")}</span>
      </span>
      <Link href={paymentHref(payment.id, "calendar")} scroll={false} className={titleLinkClass(paid)}>
        {series.title}
      </Link>
      {!paid && (
        <span className="relative z-1 mt-8 flex justify-end">
          <MarkPaidButton paymentId={payment.id} variant="secondary" size="sm" />
        </span>
      )}
    </CardShell>
  );
}
