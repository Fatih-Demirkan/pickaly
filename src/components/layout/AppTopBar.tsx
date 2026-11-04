import { getTranslations } from "next-intl/server";
import { IconButton } from "@/components/ui/IconButton";

// Üst bar (RESPONSIVE §2.2–§2.3, §4.9).
//   Mobil      : Figma Header — 64 px, surface-card, alt çizgi, padding 8/16; solda "Pickaly" (H1) + tagline,
//                sağda arama / bildirim / hesap ikon butonları (40×40, aralık 4).
//   Tablet+    : Marka rail/sidebar'a taşındığı için yalnızca sağdaki aksiyonlar kalır. Sayfa başlığı
//                içerikteki PageHeader'dadır.
//   Odak ekranı: mobilde gizlenir (ShellFrame data-focus); ekran kendi FocusHeader'ını kullanır.
// [Ertelendi] Arama (PRD Q-9), Bildirimler paneli (D-24) ve hesap menüsü (Karar #5) henüz yok;
// butonlar devre dışı ve bunu ekran okuyucuya da söyler.

export async function AppTopBar() {
  const t = await getTranslations("header");

  const actions = (
    <div className="flex items-center gap-4">
      <IconButton icon="search" label={t("search")} disabled aria-describedby="topbar-unavailable" />
      <IconButton icon="notifications" label={t("notifications")} disabled aria-describedby="topbar-unavailable" />
      <IconButton icon="account" label={t("account")} disabled aria-describedby="topbar-unavailable" />
      <span id="topbar-unavailable" className="sr-only">
        {t("unavailable")}
      </span>
    </div>
  );

  return (
    <header className="sticky top-0 flex max-tablet:group-data-[focus]/shell:hidden z-(--z-sticky) h-(--layout-topbar-height) items-center justify-between border-b border-border-default bg-surface-card px-16 tablet:justify-end tablet:border-b-0 tablet:bg-surface-page tablet:px-(--layout-page-padding-x)">
      <div className="flex flex-col tablet:hidden">
        <span className="text-heading-h1 text-text-primary">{t("brand")}</span>
        <span className="text-body-sm text-text-secondary">{t("tagline")}</span>
      </div>
      {actions}
    </header>
  );
}
