// Oturum adresleri (TECH_STACK §2: (auth)/ giris · kayit · dogrulama · sifremi-unuttum).
// Oturumsuz erişilebilen yollar proxy'de bu listeden okunur.

export const SIGN_IN_PATH = "/giris";
export const SIGN_UP_PATH = "/kayit";
export const VERIFY_PATH = "/dogrulama";
export const RESET_PATH = "/sifremi-unuttum";
export const AUTH_CALLBACK_PATH = "/auth/callback";

export const PUBLIC_PATHS = [SIGN_IN_PATH, SIGN_UP_PATH, VERIFY_PATH, RESET_PATH, AUTH_CALLBACK_PATH] as const;

/** Oturum açmadan erişilebilen yol mu? Şifre sıfırlamanın son adımı (yeni şifre) oturumla çalışır ama burada da açıktır. */
export function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

/** Girişten sonra dönülecek adres: yalnızca uygulama içi göreli yollar kabul edilir (açık yönlendirme engeli). */
export function safeNextPath(value: unknown): string {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return "/";
  return isPublicPath(value.split("?")[0] ?? value) ? "/" : value;
}

export function verifyHref(email: string, next?: string) {
  const params = new URLSearchParams({ e: email });
  if (next && next !== "/") params.set("sonra", next);
  return `${VERIFY_PATH}?${params.toString()}`;
}
