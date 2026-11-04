import { getTranslations } from "next-intl/server";
import { Chip } from "@/components/ui/Chip";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { formatMoney } from "@/lib/money";
import type { Locale } from "@/i18n/config";
import type { PeriodSummary } from "../domain/summary";

// Pages → İşlemler "Durum & Başlık" özet kartı:
//   kart: radius-2xl (24), padding 16, aralık 12, LINEAR(-90°) beyaz → Neutral/100, border Neutral/200, shadow-floating
//   chip "Pozitif Bakiye" (Category/Green, Label/Small) · "Dönem Net Değişimi" Body/Small · tutar Heading/H2
//   mini kartlar: padding 4, aralık 8, radius-md, beyaz + border-default; ikon kutusu 30 px genişlik, radius-sm
// [Varsayım] Mini kart metin stilleri ölçülmedi: başlık Label/Small, tutar Label/Default, adet Body/Small.
// [Varsayım] Negatif dönem Pages'ta yok: "Negatif Bakiye" Turuncu chip ile gösterilir.
// [Varsayım] Gradyan yönü: beyaz başlangıçta (sol), ton sonda (sağ).
// Tablet+: tek satır — Net [4/8] | Gelir [2/8] | Gider [2/8] (RESPONSIVE §3.3.1).

type SummaryCardProps = {
  summary: PeriodSummary;
  locale: Locale;
};

export async function SummaryCard({ summary, locale }: SummaryCardProps) {
  const t = await getTranslations("transactions.summary");
  const positive = summary.netMinor >= BigInt(0);

  const totals = [
    { key: "income", label: t("income"), amount: summary.incomeMinor, count: summary.incomeCount, icon: "trendUp", tone: "bg-category-green text-status-success", amountClass: "text-text-success", sign: BigInt(1) },
    { key: "expense", label: t("expense"), amount: summary.expenseMinor, count: summary.expenseCount, icon: "trendDown", tone: "bg-category-red text-status-danger", amountClass: "text-text-danger", sign: BigInt(-1) },
  ] as const;

  return (
    <section
      aria-label={t("label")}
      className="grid grid-cols-2 gap-12 rounded-2xl border border-border-default bg-linear-to-r from-surface-card to-surface-muted p-16 shadow-floating tablet:grid-cols-8 tablet:items-center"
    >
      <div className="col-span-2 flex flex-col items-start gap-12 tablet:col-span-4">
        <Chip variant={positive ? "success" : "warning"}>{positive ? t("positive") : t("negative")}</Chip>
        <div className="flex flex-col">
          <p className="text-body-sm text-text-secondary">{t("net")}</p>
          <p className="text-heading-h2 text-text-primary">{formatMoney(summary.netMinor, locale, "always")}</p>
        </div>
      </div>

      {totals.map((item) => (
        <div key={item.key} className="flex min-w-0 gap-8 rounded-md border border-border-default bg-surface-card p-4 tablet:col-span-2">
          <span aria-hidden className={cn("flex w-30 shrink-0 items-center justify-center rounded-sm", item.tone)}>
            <Icon icon={item.icon} size="sm" />
          </span>
          <div className="flex min-w-0 flex-col py-2">
            <span className="truncate text-label-sm text-text-secondary">{item.label}</span>
            <span className={cn("truncate text-label-md", item.amountClass)}>{formatMoney(item.amount * item.sign, locale, "always")}</span>
            <span className="text-body-sm text-text-secondary">{t("count", { count: item.count })}</span>
          </div>
        </div>
      ))}
    </section>
  );
}
