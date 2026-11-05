"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavItem } from "@/config/navigation";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";

// DESIGN_SYSTEM.md §A8 Floating tab bar + DESIGN_SYSTEM_PICKALY.md §5.6.
// "tab"     : mobil siyah tab bar — yalnızca 24 px ikon, görünür etiket yok (Karar K-5; ad aria-label ile).
//             Aktif 40 px beyaz daire + siyah ikon, pasif beyaz %70.
// "stacked" : tablet rail — ikon üstte, nav etiketi (10 px) altta; 64×56 pill.
// "inline"  : laptop+ sidebar — ikon solda, body-strong etiket; 44 px pill.
// Rail ve sidebar'da aktif: siyah zemin + beyaz ikon/metin; pasif: text-secondary, hover canvas zemin.

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

type NavLinkProps = {
  item: NavItem;
  label: string;
  layout: "tab" | "stacked" | "inline";
  className?: string;
};

export function NavLink({ item, label, layout, className }: NavLinkProps) {
  const pathname = usePathname();
  const active = isActive(pathname, item.href);

  if (layout === "tab") {
    return (
      <Link
        href={item.href}
        aria-current={active ? "page" : undefined}
        aria-label={label}
        title={label}
        className={cn("touch-target flex h-48 items-center justify-center", className)}
      >
        <span
          className={cn(
            "inline-flex size-40 items-center justify-center rounded-full transition-colors",
            active ? "bg-surface-tabbar-active text-text-primary" : "text-text-inverse-secondary hover:text-text-inverse",
          )}
        >
          <Icon icon={item.icon} size="lg" />
        </span>
      </Link>
    );
  }

  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "touch-target flex items-center rounded-full transition-colors",
        layout === "stacked" ? "mx-auto h-56 w-64 flex-col justify-center gap-2 px-4 text-nav" : "h-44 gap-12 px-16 text-body-strong",
        active ? "bg-surface-nav-active text-text-inverse" : "text-text-secondary hover:bg-surface-page hover:text-text-primary",
        className,
      )}
    >
      <Icon icon={item.icon} size="lg" />
      <span className="max-w-full truncate">{label}</span>
    </Link>
  );
}
