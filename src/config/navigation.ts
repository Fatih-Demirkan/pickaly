import type { AppIconName } from "./icons";

// Ana navigasyonun TEK kaynağı. Alt nav (mobil), rail (tablet) ve sidebar (laptop+) bu diziden üretilir
// (RESPONSIVE.md §2, TECH_STACK §3.2). Sıra ve ikonlar Pages'taki Nav Bar ile aynıdır.
// Not: Rotalar henüz oluşturulmadı; navigasyon bileşenleri sonraki aşamada eklenecek.

export type NavItem = {
  key: "home" | "calendar" | "transactions" | "savings" | "profile";
  href: string;
  icon: AppIconName;
};

export const primaryNavigation: readonly NavItem[] = [
  { key: "home", href: "/", icon: "home" },
  { key: "calendar", href: "/takvim", icon: "calendar" },
  { key: "transactions", href: "/islemler", icon: "transactions" },
  { key: "savings", href: "/birikimler", icon: "savings" },
  { key: "profile", href: "/profil", icon: "profile" },
];
