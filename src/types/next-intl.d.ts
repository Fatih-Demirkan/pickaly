import type messages from "@/locales/tr.json";
import type { Locale } from "@/i18n/config";

// Çeviri anahtarları Türkçe kaynak dosyadan tiplenir: yanlış anahtar derleme hatası verir.
declare module "next-intl" {
  interface AppConfig {
    Locale: Locale;
    Messages: typeof messages;
  }
}
