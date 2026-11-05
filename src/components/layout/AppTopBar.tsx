import { getSessionUser } from "@/features/auth/server";
import { getProfile } from "@/features/settings/server";
import { TopBarLead } from "./TopBarLead";

// Üst bar (DESIGN_SYSTEM_PICKALY §5.6, RESPONSIVE §2.2–§2.3, §4.9).
//   Zemin canvas (alt çizgi yok), 64 px, padding 8/16. İçerik TopBarLead: Ana Sayfa selamlaması veya marka.
//   Arama, bildirim ve hesap butonları kaldırıldı (ürün sahibi isteği 2026-11-05: işlevleri yok). İşlevleri gelince
//   geri eklenir (PRD Q-9, D-24, Karar #5).
//   Tablet+: marka rail/sidebar'da olduğu için bar yalnızca Ana Sayfa'da (selamlama) görünür.
//   Odak ekranı: mobilde gizlenir (ShellFrame data-focus); ekran kendi FocusHeader'ını kullanır.

export async function AppTopBar() {
  const sessionUser = await getSessionUser();
  const name = sessionUser?.name ?? (await getProfile()).name;
  return <TopBarLead name={name.trim()} />;
}
