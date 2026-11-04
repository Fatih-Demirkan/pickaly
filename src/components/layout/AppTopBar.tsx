import { getTranslations } from "next-intl/server";
import { IconButton } from "@/components/ui/IconButton";
import { getSessionUser } from "@/features/auth/server";
import { getProfile } from "@/features/settings/server";
import { TopBarLead } from "./TopBarLead";

// Üst bar (DESIGN_SYSTEM_PICKALY §5.6, RESPONSIVE §2.2–§2.3, §4.9).
//   Zemin canvas (alt çizgi yok), 64 px, padding 8/16. Solda TopBarLead (Ana Sayfa selamlaması veya marka),
//   sağda 36 px outline ikon butonları (arama / bildirim / hesap), aralık 8.
//   Tablet+: marka rail/sidebar'da; Ana Sayfa dışında yalnızca sağdaki aksiyonlar kalır.
//   Odak ekranı: mobilde gizlenir (ShellFrame data-focus); ekran kendi FocusHeader'ını kullanır.
// [Ertelendi] Arama (PRD Q-9), Bildirimler paneli (D-24) ve hesap menüsü (Karar #5) henüz yok;
// butonlar devre dışı ve bunu ekran okuyucuya da söyler.

export async function AppTopBar() {
  const [t, sessionUser] = await Promise.all([getTranslations("header"), getSessionUser()]);
  const name = sessionUser?.name ?? (await getProfile()).name;

  return (
    <header className="sticky top-0 z-(--z-sticky) flex h-(--layout-topbar-height) items-center justify-between gap-12 bg-surface-page px-16 max-tablet:group-data-[focus]/shell:hidden tablet:px-(--layout-page-padding-x)">
      <TopBarLead name={name.trim()} />
      <div className="ms-auto flex shrink-0 items-center gap-8">
        <IconButton variant="outline" icon="search" label={t("search")} disabled aria-describedby="topbar-unavailable" />
        <IconButton variant="outline" icon="notifications" label={t("notifications")} disabled aria-describedby="topbar-unavailable" />
        <IconButton variant="outline" icon="account" label={t("account")} disabled aria-describedby="topbar-unavailable" />
        <span id="topbar-unavailable" className="sr-only">
          {t("unavailable")}
        </span>
      </div>
    </header>
  );
}
