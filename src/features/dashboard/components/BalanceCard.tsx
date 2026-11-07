import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Chip } from "@/components/ui/Chip";
import { Icon } from "@/components/ui/Icon";
import type { AppIconName } from "@/config/icons";
import { reportHref } from "@/features/reports/routes";
import { listHref } from "@/features/transactions/routes";
import type { Locale } from "@/i18n/config";
import { cn } from "@/lib/cn";
import type { MonthKey } from "@/lib/dates";
import { formatMoney, splitMoneyDecimals } from "@/lib/money";

// Ana Sayfa toplam bakiye (PRD FR-DSH-001/002). DESIGN_SYSTEM.md §A8 Balance header + Stat card,
// DESIGN_SYSTEM_PICKALY.md §5.2. Gradyanlı koyu kart kaldırıldı (Part A'da gradyan yok).
//   Canvas üzerinde ortalı: caption "Toplam bakiye" → display-balance tutar (ondalık text-tertiary) → caption "n hesapta".
//   Stat ızgarası (aralık 8): Bu ay gelir (income tint) · Bu ay gider (expense tint) · Geçen aya göre (compare tint).
//     [Uyarlama] DS 3'lü; TR tutarları 390 px'te 3 sütuna sığmadığı için mobilde 2 + 1 (karşılaştırma tam genişlik).
//     Kart: radius-md, padding 12, gölgesiz; etiket caption, değer title-sm (işaretli); tüm metin text-primary
//     (renkli zeminde ikincil gri AA'yı karşılamaz). Köşede 28 px beyaz ok butonu → ilgili liste / rapor.
//   Alt satır: "Bugün: n Görev, n Ödeme bekleniyor." + "Aylık Rapor ›" metin butonu.
// Toplam Bakiye: tüm hesapların bakiyesi, birikimler hariç (BR-BAL-003). Gelir/gider: bu ayın gerçekleşmiş işlemleri.
// "Toplam bakiyeye dahil et" kapalı hesaplar (ürün sahibi isteği 2026-11-07) toplama girmez; "n hesapta" satırının altında
//   ayrı bakiye olarak ortalı salt okunur pill'lerde gösterilir: ad caption text-secondary + tutar caption-strong.
//   [Türetme: DS filtre chip'i "seçili değil" görünümü — beyaz, border-subtle, radius-full, yükseklik 32, yatay 12, aralık 8]
//   Liste "Toplama dahil olmayan hesaplar" adıyla okunur.
// "Geçen aya göre": bu ayki giderin geçen ayın toplam giderine göre yüzde değişimi; geçen ay gider yoksa "—".
// Sayılar yalnızca bugün tarihli, tamamlanmamış görev/randevu ve bekleyen ödemelerdir (FR-DSH-001, BR-TSK-002).

type BalanceCardProps = {
  totalMinor: bigint;
  accountCount: number;
  /** Toplama dahil olmayan aktif hesaplar. */
  separate: { id: string; name: string; balanceMinor: bigint }[];
  incomeMinor: bigint;
  expenseMinor: bigint;
  previousExpenseMinor: bigint;
  month: MonthKey;
  pendingTasks: number;
  pendingPayments: number;
  locale: Locale;
};

type StatTone = "income" | "expense" | "compare";

const toneClass: Record<StatTone, string> = {
  income: "bg-surface-income",
  expense: "bg-surface-expense",
  compare: "bg-surface-compare",
};

function StatCard({
  tone,
  label,
  value,
  href,
  linkLabel,
  icon,
  className,
}: {
  tone: StatTone;
  label: string;
  value: string;
  href: string;
  linkLabel: string;
  icon: AppIconName;
  className?: string;
}) {
  return (
    <div className={cn("relative flex min-w-0 flex-col gap-4 rounded-md p-12 text-text-primary", toneClass[tone], className)}>
      <span className="flex items-start justify-between gap-8">
        <span className="min-w-0 truncate pt-4 text-caption">{label}</span>
        {/* Kartın tamamı tıklanır (after:inset-0); görünür hedef 28 px beyaz ok butonu. */}
        <Link
          href={href}
          aria-label={linkLabel}
          title={linkLabel}
          className="inline-flex size-28 shrink-0 items-center justify-center rounded-sm bg-surface-card text-text-primary transition-colors after:absolute after:inset-0 after:rounded-md hover:bg-action-tertiary-hover"
        >
          <Icon icon={icon} size="sm" />
        </Link>
      </span>
      <span className="truncate text-title-sm">{value}</span>
    </div>
  );
}

function percentChange(current: bigint, previous: bigint): number | null {
  if (previous === BigInt(0)) return null;
  // Kuruş tam sayıdır; yüzde bir ondalık basamakla gösterilir.
  return Number(((current - previous) * BigInt(1000)) / previous) / 10;
}

export async function BalanceCard({
  totalMinor,
  accountCount,
  separate,
  incomeMinor,
  expenseMinor,
  previousExpenseMinor,
  month,
  pendingTasks,
  pendingPayments,
  locale,
}: BalanceCardProps) {
  const t = await getTranslations("dashboard.balance");
  const [whole, fraction] = splitMoneyDecimals(formatMoney(totalMinor, locale), locale);
  const change = percentChange(expenseMinor, previousExpenseMinor);
  const changeText =
    change === null
      ? "—"
      : new Intl.NumberFormat(locale === "tr" ? "tr-TR" : "en-US", { style: "percent", maximumFractionDigits: 1, signDisplay: "exceptZero" }).format(change / 100);

  return (
    <section aria-labelledby="balance-title" className="flex h-full flex-col gap-20">
      <div className="flex flex-col items-center gap-4 pt-8 text-center">
        <h2 id="balance-title" className="text-caption text-text-secondary">
          {t("label")}
        </h2>
        <p className="max-w-full text-display-balance break-words text-text-primary">
          {whole}
          <span className="text-text-tertiary">{fraction}</span>
        </p>
        <p className="text-caption text-text-secondary">{t("accounts", { count: accountCount })}</p>
        {separate.length > 0 && (
          <ul aria-label={t("separateLabel")} className="flex flex-wrap justify-center gap-8 pt-8">
            {separate.map((account) => (
              <li key={account.id} className="inline-flex h-32 max-w-full items-center gap-6 rounded-full border border-border-subtle bg-surface-card px-12 text-caption">
                <span className="min-w-0 truncate text-text-secondary">{account.name}</span>
                <span className="shrink-0 text-caption-strong text-text-primary">{formatMoney(account.balanceMinor, locale)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Mobilde TR tutarları 3 sütuna sığmaz: gelir/gider yan yana, karşılaştırma tam genişlik; tablet+ 3 sütun. */}
      <div className="grid grid-cols-2 gap-8 tablet:grid-cols-3">
        <StatCard
          tone="income"
          label={t("monthIncome")}
          value={formatMoney(incomeMinor, locale, "always")}
          href={listHref({ month, type: "income" })}
          linkLabel={t("openIncome")}
          icon="arrowUpRight"
        />
        <StatCard
          tone="expense"
          label={t("monthExpense")}
          value={formatMoney(-expenseMinor, locale, "always")}
          href={listHref({ month, type: "expense" })}
          linkLabel={t("openExpense")}
          icon="arrowDownLeft"
        />
        <StatCard
          tone="compare"
          label={t("vsLastMonth")}
          value={changeText}
          href={reportHref(month)}
          linkLabel={t("monthlyReport")}
          icon="arrowUpRight"
          className="col-span-2 tablet:col-span-1"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-x-12 gap-y-8">
        <p className="flex min-w-0 flex-wrap items-center gap-4 text-caption text-text-secondary">
          <Icon icon="today" size="sm" className="text-text-primary" />
          {pendingTasks + pendingPayments > 0 ? (
            <>
              {t("today")}
              {pendingTasks > 0 && <Chip variant="task">{t("todayTasks", { count: pendingTasks })}</Chip>}
              {pendingPayments > 0 && <Chip variant="payment">{t("todayPayments", { count: pendingPayments })}</Chip>}
              {t("waiting")}
            </>
          ) : (
            t("todayNone")
          )}
        </p>
        <Link href={reportHref(month)} className="touch-target inline-flex shrink-0 items-center gap-4 text-caption-strong text-text-brand hover:underline">
          {t("monthlyReport")}
          <Icon icon="next" size="sm" />
        </Link>
      </div>
    </section>
  );
}
