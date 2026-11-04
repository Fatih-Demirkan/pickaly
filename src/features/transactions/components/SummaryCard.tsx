import { getTranslations } from "next-intl/server";
import { Chip } from "@/components/ui/Chip";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { formatMoney, splitMoneyDecimals } from "@/lib/money";
import type { Locale } from "@/i18n/config";
import type { PeriodSummary } from "../domain/summary";

// İşlemler dönem özeti (DESIGN_SYSTEM_PICKALY §5.2, DS Spending chart card başlık düzeni). Gradyanlı kart kaldırıldı.
//   Standart beyaz kart (radius-lg, padding 16, elev-1).
//   Üst: caption "Dönem Net Değişimi" + sağda durum çipi (Pozitif: success · Negatif: warning) →
//        title-lg net tutar (ondalık text-tertiary yalnızca büyük metinde, 28 px).
//   Alt: Toplam Gelir / Toplam Gider blokları (canvas zemin, radius-md, padding 12): üstte 28 px renkli ikon karosu +
//        caption etiket; altında tam genişlik body-strong tutar (gelir success / gider danger, PRD UX-014) ve caption adet.
//        Dikey düzen: TR tutarları mobilde ikonun yanına sığmaz.
//        Renkli tutar AA için beyaz/canvas zeminde durur; tint zeminde kullanılmaz.
// Tablet+: tek satır — Net [4/8] | Gelir [2/8] | Gider [2/8] (RESPONSIVE §3.3.1).

type SummaryCardProps = {
  summary: PeriodSummary;
  locale: Locale;
};

export async function SummaryCard({ summary, locale }: SummaryCardProps) {
  const t = await getTranslations("transactions.summary");
  const positive = summary.netMinor >= BigInt(0);
  const [whole, fraction] = splitMoneyDecimals(formatMoney(summary.netMinor, locale, "always"), locale);

  const totals = [
    { key: "income", label: t("income"), amount: summary.incomeMinor, count: summary.incomeCount, icon: "trendUp", tone: "bg-category-green text-category-fg-green", amountClass: "text-text-success", sign: BigInt(1) },
    { key: "expense", label: t("expense"), amount: summary.expenseMinor, count: summary.expenseCount, icon: "trendDown", tone: "bg-category-red text-category-fg-red", amountClass: "text-text-danger", sign: BigInt(-1) },
  ] as const;

  return (
    <section aria-label={t("label")} className="grid grid-cols-2 gap-12 rounded-lg bg-surface-card p-16 shadow-elev-1 tablet:grid-cols-8 tablet:items-center">
      <div className="col-span-2 flex flex-col gap-4 tablet:col-span-4">
        <div className="flex items-center justify-between gap-8">
          <p className="text-caption text-text-secondary">{t("net")}</p>
          <Chip variant={positive ? "success" : "warning"}>{positive ? t("positive") : t("negative")}</Chip>
        </div>
        <p className="text-title-lg text-text-primary">
          {whole}
          <span className="text-text-tertiary">{fraction}</span>
        </p>
      </div>

      {totals.map((item) => (
        <div key={item.key} className="flex min-w-0 flex-col gap-4 rounded-md bg-surface-page p-12 tablet:col-span-2">
          <span className="flex min-w-0 items-center gap-8">
            <span aria-hidden className={cn("inline-flex size-28 shrink-0 items-center justify-center rounded-sm", item.tone)}>
              <Icon icon={item.icon} size="sm" />
            </span>
            <span className="truncate text-caption text-text-secondary">{item.label}</span>
          </span>
          <span className={cn("truncate text-body-strong", item.amountClass)}>{formatMoney(item.amount * item.sign, locale, "always")}</span>
          <span className="text-caption text-text-secondary">{t("count", { count: item.count })}</span>
        </div>
      ))}
    </section>
  );
}
