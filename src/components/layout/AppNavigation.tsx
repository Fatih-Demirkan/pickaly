import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { primaryNavigation } from "@/config/navigation";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { NavLink } from "./NavLink";

// Ana navigasyonun üç görünümü tek yapılandırmadan üretilir (RESPONSIVE §2, TECH_STACK §8.4).
// Görünürlük yalnızca CSS ile değişir (sunucuda breakpoint tahmini yapılmaz).
//   < 768  : BottomNav   — Figma Nav Bar: dış 16/16/24/16, beyaz pill, border-default, shadow-floating, iç 4
//   768+   : NavRail     — 80 px dikey; aynı Nav Bar Buttons dikey dizilir [Karar #10]
//   1024+  : Sidebar     — 240 / 264 px; marka bloğu + yatay öğeler, Profil altta ayrı [RESPONSIVE §2.3]
// [Eksik] Rail/sidebar Figma'da tasarlanmadı (PRD TD-11); geçici olarak RESPONSIVE kurallarıyla kuruldu.
// Odak ekranlarında mobil FAB ve alt nav gizlenir (ShellFrame data-focus).
// "Yeni işlem": mobil FAB · tablet rail içi 56 px buton · laptop+ sidebar Primary buton (RESPONSIVE §4.6).
// Varsayılan sekme Gelir'dir (RESPONSIVE §3.3.3).

const NEW_TRANSACTION_HREF = "/islemler/yeni";

export async function AppNavigation() {
  const t = await getTranslations();
  const mainItems = primaryNavigation.filter((item) => item.key !== "profile");
  const profileItem = primaryNavigation.find((item) => item.key === "profile");
  const label = (key: (typeof primaryNavigation)[number]["key"]) => t(`nav.${key}`);

  return (
    <>
      {/* Mobil: Floating-Button (DESIGN §8.1) — 48 px, padding 16, tam yuvarlak, brand-primary, shadow-floating.
          [Varsayım] Konum Pages'ta ölçülmedi: alt nav'ın 16 px üstünde, sağda. */}
      <ButtonLink
        href={NEW_TRANSACTION_HREF}
        scroll={false}
        shape="pill"
        leadingIcon="add"
        className="fixed end-16 bottom-[calc(var(--layout-bottom-nav-offset)+16px+env(safe-area-inset-bottom))] z-(--z-fab) shadow-floating group-data-[focus]/shell:hidden tablet:hidden"
      >
        {t("nav.newTransaction")}
      </ButtonLink>

      {/* Mobil: alt pill nav */}
      <nav
        aria-label={t("nav.label")}
        className="fixed inset-x-0 bottom-0 z-(--z-nav) px-16 pt-16 pb-[calc(24px+env(safe-area-inset-bottom))] group-data-[focus]/shell:hidden tablet:hidden"
      >
        <ul className="flex items-center rounded-full border border-border-default bg-surface-card p-4 shadow-floating">
          {primaryNavigation.map((item) => (
            <li key={item.key} className="min-w-0 flex-1">
              <NavLink item={item} label={label(item.key)} layout="stacked" />
            </li>
          ))}
        </ul>
      </nav>

      {/* Tablet: dikey rail */}
      <nav
        aria-label={t("nav.label")}
        className="fixed inset-y-0 start-0 z-(--z-nav) hidden w-(--layout-nav-width) flex-col items-center gap-8 border-e border-border-default bg-surface-card px-4 pt-16 pb-16 tablet:flex laptop:hidden"
      >
        {/* [Eksik] Rail'in en üstündeki logo işareti: logo dosyası yok (PRD TD-14). */}
        <Link
          href={NEW_TRANSACTION_HREF}
          scroll={false}
          aria-label={t("nav.newTransaction")}
          className="touch-target mb-8 flex size-56 flex-col items-center justify-center gap-2 rounded-md bg-brand-primary text-label-xs text-text-inverse transition-colors hover:bg-brand-primary-hover"
        >
          <Icon icon="add" />
          <span aria-hidden>{t("nav.newShort")}</span>
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
        className="fixed inset-y-0 start-0 z-(--z-nav) hidden w-(--layout-nav-width) flex-col border-e border-border-default bg-surface-card px-16 pt-24 pb-24 laptop:flex"
      >
        <div className="flex flex-col px-12 pb-24">
          {/* Figma Header'daki marka bloğu (H1 + Body/Small) sidebar'a taşınır (RESPONSIVE §2.3). */}
          <span className="text-heading-h1 text-text-primary">{t("app.name")}</span>
          <span className="text-body-sm text-text-secondary">{t("app.tagline")}</span>
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
          <div className="border-t border-border-default pt-16">
            <NavLink item={profileItem} label={label(profileItem.key)} layout="inline" />
          </div>
        )}
      </nav>
    </>
  );
}
