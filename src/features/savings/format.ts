import { intlLocale, type Locale } from "@/i18n/config";
import { formatMoney } from "@/lib/money";
import type { SavingsUnit } from "./domain/types";

// Birim cinsinden miktar biçimi: TRY → "45.000,00 ₺" · adet → "25 Adet" · gram → "12,5 gr".
// Miktarlar yüzde birlik tam sayı olarak tutulur (TRY'de kuruş).

const unitLabel: Record<Exclude<SavingsUnit, "TRY">, Record<Locale, string>> = {
  piece: { tr: "Adet", en: "pcs" },
  gram: { tr: "gr", en: "g" },
};

export function formatSavingsAmount(amount: bigint, unit: SavingsUnit, locale: Locale, sign?: "always"): string {
  if (unit === "TRY") return formatMoney(amount, locale, sign);
  const value = new Intl.NumberFormat(intlLocale[locale], { maximumFractionDigits: 2, signDisplay: sign === "always" ? "exceptZero" : "auto" }).format(Number(amount) / 100);
  return `${value} ${unitLabel[unit][locale]}`;
}

/** Hedef satırı için kısa biçim: "60.000 ₺" / "100 Adet". */
export function formatSavingsShort(amount: bigint, unit: SavingsUnit, locale: Locale): string {
  if (unit !== "TRY") return formatSavingsAmount(amount, unit, locale);
  return `${new Intl.NumberFormat(intlLocale[locale], { maximumFractionDigits: 0 }).format(Number(amount) / 100)} ₺`;
}

/** "%75" (TR) / "75%" (EN). */
export function formatPercent(value: number, locale: Locale): string {
  return new Intl.NumberFormat(intlLocale[locale], { style: "percent", maximumFractionDigits: 1 }).format(value / 100);
}
