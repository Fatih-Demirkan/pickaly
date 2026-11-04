import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Chip } from "@/components/ui/Chip";
import { Icon } from "@/components/ui/Icon";
import type { AppIconName } from "@/config/icons";
import type { Locale } from "@/i18n/config";
import { formatMoney } from "@/lib/money";

// Pages → Ana Sayfa "Section - 1. Ana Finansal Odak" (6:1862, PRD FR-DSH-001/002).
//   Kart: radius-2xl, padding 16, aralık 12, gradyan Neutral/700 → Neutral/900 (yukarıdan aşağı), shadow-floating
//   "TOPLAM BAKİYE" Label/Small Neutral/300 · tutar Data/Large beyaz · sağda "Aylık Rapor ›" Button/Default Neutral/300
//   Bu Ay Gelir / Gider kutuları: Neutral/700, radius-md, padding 4, aralık 8; 30 px Neutral/600 ok kutusu (radius-sm),
//     etiket Body/Small Neutral/300, tutar Button/Default beyaz
//   Bugün satırı: 44 px kutu, calendar-check, "Bugün:" + "n Görev" (Görev çipi) + "n Ödeme" (Ödeme çipi) + "bekleniyor."
// Toplam Bakiye: tüm hesapların bakiyesi, birikimler hariç (BR-BAL-003). Gelir/gider: bu ayın gerçekleşmiş işlemleri.
// "Aylık Rapor" → içinde bulunulan ayın Aylık Finans Raporu (RESPONSIVE Karar #9).
// Sayılar yalnızca bugün tarihli, tamamlanmamış görev/randevu ve bekleyen ödemelerdir (PRD FR-DSH-001, BR-TSK-002);
// sıfır olan türün çipi gösterilmez.

type BalanceCardProps = {
  totalMinor: bigint;
  incomeMinor: bigint;
  expenseMinor: bigint;
  pendingTasks: number;
  pendingPayments: number;
  locale: Locale;
};

function MonthTile({ icon, label, value }: { icon: AppIconName; label: string; value: string }) {
  return (
    <div className="flex min-w-0 flex-1 items-stretch gap-8 rounded-md bg-surface-inverse-raised p-4">
      <span aria-hidden className="inline-flex w-30 shrink-0 items-center justify-center rounded-sm bg-surface-inverse-control text-text-inverse">
        <Icon icon={icon} size="sm" />
      </span>
      <span className="flex min-w-0 flex-col py-2">
        <span className="truncate text-body-sm text-text-inverse-secondary">{label}</span>
        <span className="truncate text-button text-text-inverse">{value}</span>
      </span>
    </div>
  );
}

export async function BalanceCard({ totalMinor, incomeMinor, expenseMinor, pendingTasks, pendingPayments, locale }: BalanceCardProps) {
  const t = await getTranslations("dashboard.balance");

  return (
    <section
      aria-labelledby="balance-title"
      className="flex h-full flex-col gap-12 rounded-2xl bg-linear-to-b from-surface-inverse-raised to-surface-inverse p-16 text-text-inverse shadow-floating"
    >
      <div className="flex items-start justify-between gap-12">
        <div className="flex min-w-0 flex-col">
          <h2 id="balance-title" className="text-label-sm text-text-inverse-secondary uppercase">
            {t("label")}
          </h2>
          <p className="truncate text-data-lg">{formatMoney(totalMinor, locale)}</p>
        </div>
        <Link
          href="/raporlar"
          className="touch-target inline-flex shrink-0 items-center gap-4 rounded-sm text-button text-text-inverse-secondary transition-colors hover:text-text-inverse"
        >
          {t("monthlyReport")}
          <Icon icon="next" />
        </Link>
      </div>
      <div className="mt-auto flex flex-col gap-8">
        <div className="flex gap-8">
          <MonthTile icon="trendUp" label={t("monthIncome")} value={formatMoney(incomeMinor, locale, "always")} />
          <MonthTile icon="trendDown" label={t("monthExpense")} value={formatMoney(-expenseMinor, locale, "always")} />
        </div>
        <div className="flex h-44 items-stretch gap-8 rounded-md bg-surface-inverse-raised p-4">
          <span aria-hidden className="inline-flex w-30 shrink-0 items-center justify-center rounded-sm bg-surface-inverse-control text-text-inverse">
            <Icon icon="today" size="sm" />
          </span>
          <p className="flex min-w-0 items-center gap-4 text-body-sm text-text-inverse-secondary">
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
        </div>
      </div>
    </section>
  );
}
