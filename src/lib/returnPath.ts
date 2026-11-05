import { isSheetRoute } from "@/config/navigation";

/**
 * Yeni İşlem sheet'i bir ekranın üstünde açıldıysa kayıttan sonra o ekrana dönülür (form "returnTo" alanı).
 * Yalnızca uygulama içi yol kabul edilir; geçersizse veya sheet adresiyse Ana Sayfa.
 */
export function returnPath(formData: FormData): string {
  const value = formData.get("returnTo");
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return "/";
  const pathname = value.split(/[?#]/)[0] ?? "/";
  return isSheetRoute(pathname) ? "/" : value;
}
