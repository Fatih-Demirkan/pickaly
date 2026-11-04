"use client";

import { useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/cn";

// Üst barın sol bloğu (DESIGN_SYSTEM_PICKALY §5.6, Karar K-6).
//   Ana Sayfa : 40 px avatar + caption selamlama (saate göre) + title-md kullanıcı adı. Ad yoksa yalnızca selamlama.
//   Diğer     : mobilde "Pickaly" (title-md) + tagline (caption); tablet+ marka rail/sidebar'da olduğu için boş.
// Selamlama cihazın yerel saatinden hesaplanır. Sunucu kullanıcının saatini bilmediği için ilk HTML'de selamlama
// satırı boş gelir ve istemcide dolar (yükseklik sabit, kayma olmaz).

type GreetingKey = "morning" | "afternoon" | "evening";

function greetingKey(hour: number): GreetingKey {
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 18) return "afternoon";
  return "evening";
}

const noop = () => () => {};

function useGreetingKey(): GreetingKey | null {
  return useSyncExternalStore(
    noop,
    () => greetingKey(new Date().getHours()),
    () => null,
  );
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toLocaleUpperCase())
    .join("");
}

export function TopBarLead({ name }: { name: string }) {
  const pathname = usePathname();
  const t = useTranslations("header");
  const key = useGreetingKey();

  if (pathname !== "/") {
    return (
      <div className="flex flex-col tablet:hidden">
        <span className="text-title-md text-text-primary">{t("brand")}</span>
        <span className="text-caption text-text-secondary">{t("tagline")}</span>
      </div>
    );
  }

  return (
    <div className="flex min-w-0 items-center gap-12">
      {name && (
        <span
          aria-hidden
          className="inline-flex size-40 shrink-0 items-center justify-center rounded-full bg-brand-primary-subtle text-title-sm text-text-brand"
        >
          {initials(name)}
        </span>
      )}
      <div className="flex min-w-0 flex-col">
        <span className={cn("h-16 text-caption text-text-secondary", !name && "sr-only")}>{key ? t(`greeting.${key}`) : ""}</span>
        <span className="truncate text-title-md text-text-primary">{name || (key ? t(`greeting.${key}`) : " ")}</span>
      </div>
    </div>
  );
}
