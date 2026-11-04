"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavItem } from "@/config/navigation";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";

// Figma Components → Nav Bar Buttons (DESIGN §8.4).
// "stacked": ikon üstte, etiket altta (mobil alt nav ve tablet rail) — 52 px, tam yuvarlak, label-xs.
// "inline":  ikon solda, etiket sağda (laptop+ sidebar) — 40 px, radius-md [RESPONSIVE §2.3].
//            [Varsayım] Metin stili (label-md) ve ikon–metin aralığı (12) dokümanda yok; TD-11 tasarımı bekliyor.
// Aktif: surface-nav-active zemin + brand-primary ikon/metin; pasif: text-secondary [Karar Ç-3].

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

type NavLinkProps = {
  item: NavItem;
  label: string;
  layout: "stacked" | "inline";
  className?: string;
};

export function NavLink({ item, label, layout, className }: NavLinkProps) {
  const pathname = usePathname();
  const active = isActive(pathname, item.href);

  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "touch-target flex items-center transition-colors",
        layout === "stacked"
          ? "h-52 min-w-0 flex-col justify-center gap-2 rounded-full px-4 text-label-xs"
          : "h-40 gap-12 rounded-md px-12 text-label-md",
        active ? "bg-surface-nav-active text-text-brand" : "text-text-secondary hover:text-text-primary",
        className,
      )}
    >
      <Icon icon={item.icon} />
      <span className="max-w-full truncate">{label}</span>
    </Link>
  );
}
