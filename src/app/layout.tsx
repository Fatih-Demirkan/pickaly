import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Suspense } from "react";
import { Manrope } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getTranslations } from "next-intl/server";
import { defaultLocale, LOCALE_COOKIE, locales } from "@/i18n/config";
import { EnvironmentBadge } from "@/components/layout/EnvironmentBadge";
import { semanticColors } from "@/styles/tokens";
import trMessages from "@/locales/tr.json";
import "@/styles/globals.css";

// Manrope: Regular 400, SemiBold 600, Bold 700 (DESIGN §3.1). latin-ext: ğ, ş, ı, İ.
const manrope = Manrope({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "600", "700"],
  display: "swap",
  variable: "--font-manrope",
});

// Varsayılan dil Türkçe olduğu için statik metadata Türkçe kaynak dosyadan gelir.
export const metadata: Metadata = {
  applicationName: trMessages.app.name,
  title: { default: trMessages.app.name, template: `%s · ${trMessages.app.name}` },
  description: trMessages.app.description,
  // Gerçek kullanıcıya açılana kadar arama motorlarına kapalı (PRD §1.8 yayın engelleri).
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: semanticColors["brand-primary"],
};

// <html lang> cookie'deki dil tercihine göre BOYAMADAN ÖNCE ayarlanır. Sunucuda cookie okumak
// tüm kabuğu isteğe bağlı yapacağından (cacheComponents) Next.js'in önerdiği satır içi script kullanılır.
const setLangScript = `(function(){try{var m=document.cookie.match(/(?:^|; )${LOCALE_COOKIE}=([^;]+)/);var l=m&&m[1];if(${JSON.stringify(
  locales,
)}.indexOf(l)>-1){document.documentElement.lang=l;}}catch(e){}})();`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang={defaultLocale} className={manrope.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: setLangScript }} />
      </head>
      <body>
        {/* Dil cookie'den okunduğu için çeviri kullanan her şey bu sınırın içinde akışla gelir. */}
        <Suspense fallback={<div aria-busy="true" className="min-h-dvh bg-surface-page" />}>
          <LocalizedRoot>{children}</LocalizedRoot>
        </Suspense>
      </body>
    </html>
  );
}

async function LocalizedRoot({ children }: { children: ReactNode }) {
  const t = await getTranslations("common");

  return (
    <NextIntlClientProvider>
      <a href="#main-content" className="skip-link text-label-md text-text-brand">
        {t("skipToContent")}
      </a>
      <EnvironmentBadge />
      {children}
    </NextIntlClientProvider>
  );
}
