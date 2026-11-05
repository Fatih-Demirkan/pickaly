import { intlLocale, type Locale } from "@/i18n/config";

// Para birimi yardımcıları. Tutarlar her yerde kuruş cinsinden bigint tutulur; ondalıklı sayıyla
// hesap yapılmaz (TECH_STACK §5.1 amount_minor, PRD BR-MON-001). V1'de tek para birimi TRY.

const MINOR_PER_MAJOR = BigInt(100);
/** Tek işlemde girilebilecek en yüksek tutar: 999.999.999,99 ₺ [Varsayım — PRD'de üst sınır yok]. */
export const MAX_AMOUNT_MINOR = BigInt("99999999999");

type SignMode = "auto" | "always" | "never";

function toDecimalString(minor: bigint): string {
  const negative = minor < BigInt(0);
  const abs = negative ? -minor : minor;
  const whole = abs / MINOR_PER_MAJOR;
  const fraction = (abs % MINOR_PER_MAJOR).toString().padStart(2, "0");
  return `${negative ? "-" : ""}${whole}.${fraction}`;
}

/**
 * Tutarı ekranda gösterilecek biçime çevirir.
 * TR: "-1.280,00 ₺" (Pages'taki biçim, sembol sonda) · EN: "-₺1,280.00".
 * sign "always": sıfırdan farklı tutarlarda + / - gösterilir (liste ve özet satırları).
 */
export function formatMoney(minor: bigint, locale: Locale, sign: SignMode = "auto"): string {
  const signDisplay = sign === "always" ? "exceptZero" : sign === "never" ? "never" : "auto";
  const value = toDecimalString(minor) as `${number}`;

  if (locale === "tr") {
    const number = new Intl.NumberFormat(intlLocale.tr, { minimumFractionDigits: 2, maximumFractionDigits: 2, signDisplay }).format(value);
    return `${number} ₺`;
  }
  return new Intl.NumberFormat(intlLocale[locale], { style: "currency", currency: "TRY", currencyDisplay: "narrowSymbol", signDisplay }).format(value);
}

/**
 * Biçimlenmiş tutarı tam kısım ve ondalık kısım olarak ikiye böler (DESIGN_SYSTEM.md §A1: büyük bakiyede ondalık soluk).
 * TR "57.806,62 ₺" → ["57.806", ",62 ₺"] · EN "₺57,806.62" → ["₺57,806", ".62"].
 */
export function splitMoneyDecimals(formatted: string, locale: Locale): [whole: string, fraction: string] {
  const index = formatted.lastIndexOf(locale === "tr" ? "," : ".");
  return index < 0 ? [formatted, ""] : [formatted.slice(0, index), formatted.slice(index)];
}

/** Hızlı tutar çipleri gibi kuruşsuz kısa gösterim: TR "1.000 ₺", EN "₺1,000". */
export function formatMoneyShort(minor: bigint, locale: Locale): string {
  const major = (minor / MINOR_PER_MAJOR).toString() as `${number}`;
  if (locale === "tr") return `${new Intl.NumberFormat(intlLocale.tr).format(major)} ₺`;
  return new Intl.NumberFormat(intlLocale[locale], { style: "currency", currency: "TRY", currencyDisplay: "narrowSymbol", maximumFractionDigits: 0 }).format(major);
}

const separators: Record<Locale, { group: string; decimal: string }> = {
  tr: { group: ".", decimal: "," },
  en: { group: ",", decimal: "." },
};

/** Tam sayı kısmını binlik ayırıcıyla gruplar: "1234567" → "1.234.567". */
function groupDigits(digits: string, group: string): string {
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, group);
}

/**
 * Form alanının değeri. Kuruş sıfırsa gösterilmez (ürün sahibi isteği 2026-11-05): TR "120.000" · EN "120,000".
 * Kuruş varsa iki hane: TR "1.280,50" · EN "1,280.50". Kullanıcı kuruşu yine yazabilir.
 */
export function formatMoneyInput(minor: bigint, locale: Locale): string {
  const [whole = "0", fraction = "00"] = toDecimalString(minor < BigInt(0) ? -minor : minor).split(".");
  const { group, decimal } = separators[locale];
  return fraction === "00" ? groupDigits(whole, group) : `${groupDigits(whole, group)}${decimal}${fraction}`;
}

/** Tutar alanının tam sayı kısmında en fazla hane (MAX_AMOUNT_MINOR = 999.999.999,99). */
const MAX_WHOLE_DIGITS = 9;

/**
 * Yazılırken tutar alanını biçimler: binlik ayırıcı eklenir, ondalık ayırıcı korunur, kuruş en fazla iki hane.
 * TR'de "." binlik olduğu için yazılan nokta yok sayılır; ondalık için "," kullanılır (EN'de tersi).
 * Örn. TR: "1234567,8" → "1.234.567,8" · "" → "".
 */
export function formatMoneyTyping(raw: string, locale: Locale): string {
  const { group, decimal } = separators[locale];
  const cleaned = raw.split(group).join("").replace(new RegExp(`[^\\d${decimal === "." ? "\\." : decimal}]`, "g"), "");
  const separatorIndex = cleaned.indexOf(decimal);
  const wholeRaw = separatorIndex === -1 ? cleaned : cleaned.slice(0, separatorIndex);
  const fractionRaw = separatorIndex === -1 ? null : cleaned.slice(separatorIndex + 1).split(decimal).join("").slice(0, 2);

  const whole = wholeRaw.replace(/^0+(?=\d)/, "").slice(0, MAX_WHOLE_DIGITS);
  if (!whole && fractionRaw === null) return "";
  const groupedWhole = groupDigits(whole || "0", group);
  return fractionRaw === null ? groupedWhole : `${groupedWhole}${decimal}${fractionRaw}`;
}

/** Biçimlenmiş metinde, imlecin solundaki "anlamlı" karakter sayısı (rakam ve ondalık ayırıcı). */
export function countAmountCharacters(text: string, locale: Locale): number {
  const { decimal } = separators[locale];
  let count = 0;
  for (const char of text) if (/\d/.test(char) || char === decimal) count += 1;
  return count;
}

/** countAmountCharacters'ın tersi: aynı sayıda anlamlı karakterden sonraki imleç konumu. */
export function caretAfterAmountCharacters(text: string, count: number, locale: Locale): number {
  const { decimal } = separators[locale];
  if (count === 0) return 0;
  let seen = 0;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index] ?? "";
    if (/\d/.test(char) || char === decimal) seen += 1;
    if (seen === count) return index + 1;
  }
  return text.length;
}

/**
 * Kullanıcının yazdığı tutarı kuruşa çevirir; geçersizse null.
 * TR'de nokta binlik, virgül ondalık ayırıcıdır; EN'de tersi. Sembol ve boşluklar yok sayılır.
 * Yalnızca pozitif tutar kabul edilir; yönü işlem türü belirler (gelir/gider).
 */
export function parseMoneyInput(input: string, locale: Locale): bigint | null {
  const compact = input.replace(/[\s₺]/g, "");
  const normalized = locale === "tr" ? compact.replace(/\./g, "").replace(",", ".") : compact.replace(/,/g, "");
  const match = /^(\d{1,12})(?:\.(\d{1,2}))?$/.exec(normalized);
  if (!match) return null;

  const whole = BigInt(match[1] ?? "0");
  const fraction = BigInt((match[2] ?? "").padEnd(2, "0") || "0");
  const minor = whole * MINOR_PER_MAJOR + fraction;
  if (minor <= BigInt(0) || minor > MAX_AMOUNT_MINOR) return null;
  return minor;
}

export function majorToMinor(major: number): bigint {
  return BigInt(Math.round(major * 100));
}
