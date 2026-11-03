// Dil yapılandırması. PRD UX-007/UX-008, TECH_STACK D-31.
// URL'de dil öneki kullanılmaz (adresler TECH_STACK §2'deki gibi öneksiz). Dil kullanıcı tercihinden
// (cookie) okunur; ileride Profil → Uygulama Dili ayarı ve user_settings.language ile eşitlenecek.

export const locales = ["tr", "en"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "tr";

/** Dil tercihinin saklandığı cookie. HttpOnly değildir: <html lang> boyamadan önce istemcide okunur. */
export const LOCALE_COOKIE = "pickaly_locale";

/** Biçimlendirme (Intl) için yerel ayar karşılıkları. PRD Q-22. */
export const intlLocale: Record<Locale, string> = {
  tr: "tr-TR",
  en: "en",
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (locales as readonly string[]).includes(value);
}
