import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { defaultLocale, isLocale, LOCALE_COOKIE } from "./config";

// next-intl istek yapılandırması (dil öneksiz kullanım).
// Cookie okumak isteğe bağlı bir işlemdir; bu yüzden çeviri kullanan içerik
// kök layout'taki <Suspense> sınırının içinde render edilir (cacheComponents).
export default getRequestConfig(async () => {
  const stored = (await cookies()).get(LOCALE_COOKIE)?.value;
  const locale = isLocale(stored) ? stored : defaultLocale;

  return {
    locale,
    messages: (await import(`../locales/${locale}.json`)).default,
  };
});
