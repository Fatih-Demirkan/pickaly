import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { primaryNavigation } from "@/config/navigation";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { NavLink } from "./NavLink";

// Ana navigasyonun üç görünümü tek yapılandırmadan üretilir (RESPONSIVE §2, TECH_STACK §8.4).
// Görünürlük yalnızca CSS ile değişir (sunucuda breakpoint tahmini yapılmaz).
//   < 768  : Tab bar — DESIGN_SYSTEM.md §A8: siyah pill, 56 px, elev-2, güvenli alanın 16 px üstünde, kenarlardan 16
//   768+   : Rail    — 80 px, beyaz, sağda border-subtle (DESIGN_SYSTEM_PICKALY §5.6)
//   1024+  : Sidebar — 240 / 264 px; marka bloğu + Primary "Yeni işlem" + öğeler, Profil altta ayrı
// Odak ekranlarında mobil FAB ve tab bar gizlenir (ShellFrame data-focus).
// "Yeni işlem": mobil FAB (Primary LG + elev-2, tab bar'ın 16 px üstü) · tablet rail 48 px Primary daire ·
// laptop+ sidebar Primary LG tam genişlik. Varsayılan sekme Gelir'dir (RESPONSIVE §3.3.3).

const NEW_TRANSACTION_HREF = "/islemler/yeni";

export async function AppNavigation() {
  const t = await getTranslations();
  const mainItems = primaryNavigation.filter((item) => item.key !== "profile");
  const profileItem = primaryNavigation.find((item) => item.key === "profile");
  const label = (key: (typeof primaryNavigation)[number]["key"]) => t(`nav.${key}`);

  return (
    <>
      {/* Mobil FAB: tab bar'ın (bottom-nav-offset) 16 px üstünde, sağda. */}
      <ButtonLink
        href={NEW_TRANSACTION_HREF}
        scroll={false}
        leadingIcon="add"
        className="fixed end-16 bottom-[calc(var(--layout-bottom-nav-offset)+env(safe-area-inset-bottom))] z-(--z-fab) shadow-elev-2 group-data-[focus]/shell:hidden tablet:hidden"
      >
        {t("nav.newTransaction")}
      </ButtonLink>

      {/* Mobil: siyah yüzen tab bar */}
      <nav
        aria-label={t("nav.label")}
        className="fixed inset-x-16 bottom-[calc(16px+env(safe-area-inset-bottom))] z-(--z-nav) group-data-[focus]/shell:hidden tablet:hidden"
      >
        <ul className="flex h-56 items-center rounded-full bg-surface-tabbar px-8 shadow-elev-2">
          {primaryNavigation.map((item) => (
            <li key={item.key} className="min-w-0 flex-1">
              <NavLink item={item} label={label(item.key)} layout="tab" />
            </li>
          ))}
        </ul>
      </nav>

      {/* Tablet: dikey rail */}
      <nav
        aria-label={t("nav.label")}
        className="fixed inset-y-0 start-0 z-(--z-nav) hidden w-(--layout-nav-width) flex-col items-center gap-16 border-e border-border-subtle bg-surface-card pt-16 pb-16 tablet:flex laptop:hidden"
      >
        {/* [Eksik] Rail'in en üstündeki logo işareti: logo dosyası yok (PRD TD-14). */}
        <Link
          href={NEW_TRANSACTION_HREF}
          scroll={false}
          aria-label={t("nav.newTransaction")}
          title={t("nav.newTransaction")}
          className="touch-target flex size-48 items-center justify-center rounded-full bg-brand-primary text-text-inverse shadow-elev-2 transition-colors hover:bg-brand-primary-hover active:bg-action-primary-pressed"
        >
          <Icon icon="add" size="lg" />
        </Link>
        <ul className="flex w-full flex-col gap-8">
          {primaryNavigation.map((item) => (
            <li key={item.key}>
              <NavLink item={item} label={label(item.key)} layout="stacked" />
            </li>
          ))}
        </ul>
      </nav>

      {/* Laptop+: sidebar */}
      <nav
        aria-label={t("nav.label")}
        className="fixed inset-y-0 start-0 z-(--z-nav) hidden w-(--layout-nav-width) flex-col border-e border-border-subtle bg-surface-card px-16 pt-24 pb-24 laptop:flex"
      >
        <div className="flex flex-col px-16 pb-24">
          <span className="text-title-md text-text-primary">{t("app.name")}</span>
          <span className="text-caption text-text-secondary">{t("app.tagline")}</span>
        </div>
        <ButtonLink href={NEW_TRANSACTION_HREF} scroll={false} leadingIcon="add" fullWidth className="mb-24">
          {t("nav.newTransaction")}
        </ButtonLink>
        <ul className="flex flex-1 flex-col gap-4">
          {mainItems.map((item) => (
            <li key={item.key}>
              <NavLink item={item} label={label(item.key)} layout="inline" />
            </li>
          ))}
        </ul>
        {profileItem && (
          <div className="border-t border-border-subtle pt-16">
            <NavLink item={profileItem} label={label(profileItem.key)} layout="inline" />
          </div>
        )}
      </nav>
    </>
  );
}
