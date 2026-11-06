"use client";

import { useSyncExternalStore } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { LogoMark } from "@/components/ui/Logo";
import { cn } from "@/lib/cn";
import { useShellPathname } from "@/lib/sheetRoutes";

// Üst bar (DESIGN_SYSTEM_PICKALY §5.6, Karar K-6, K-19).
//   Ana Sayfa : zamana duyarlı karşılama alanı (ürün sahibi isteği 2026-11-06). 136 px yükseklik, sayfayla birlikte
//               kayar. Solda 40 px avatar + caption selamlama + title-md ad; sağda gün diliminin vektörel sahnesi
//               (176 px, tablet+ 200 px). Zemin gün diliminin pastel tonu; altta 120 px'lik yumuşak geçişle sayfaya karışır.
//   Diğer     : mobilde 32 px logo sembolü + "Pickaly" (title-md) + tagline (caption); tablet+ marka rail/sidebar'da.
// Gün dilimi cihazın yerel saatinden hesaplanır ve dakikada bir yenilenir. Sunucu kullanıcının saatini bilmediği için
// ilk HTML'de bar zemin renginde gelir; renk istemcide yumuşakça (700 ms) belirir (yükseklik sabit, kayma olmaz).

type Daypart = "morning" | "day" | "sunset" | "evening" | "night";

/** 05–11 sabah · 11–17 gündüz · 17–20 akşamüstü · 20–23 akşam · 23–05 gece [Varsayım: saat aralıkları]. */
function daypartOf(hour: number): Daypart {
  if (hour >= 5 && hour < 11) return "morning";
  if (hour >= 11 && hour < 17) return "day";
  if (hour >= 17 && hour < 20) return "sunset";
  if (hour >= 20 && hour < 23) return "evening";
  return "night";
}

// tint: zemin rengini --daypart-tint değişkenine taşır. Sınıf tam yazılır; Tailwind yalnızca kaynakta geçen tema
// değişkenlerini CSS'e ekler (tokens/color.semantic.light.json "daypart").
const DAYPARTS: Record<Daypart, { greeting: "morning" | "afternoon" | "evening" | "night"; tint: string }> = {
  morning: { greeting: "morning", tint: "[--daypart-tint:var(--color-daypart-morning)]" },
  day: { greeting: "afternoon", tint: "[--daypart-tint:var(--color-daypart-day)]" },
  sunset: { greeting: "evening", tint: "[--daypart-tint:var(--color-daypart-sunset)]" },
  evening: { greeting: "evening", tint: "[--daypart-tint:var(--color-daypart-evening)]" },
  night: { greeting: "night", tint: "[--daypart-tint:var(--color-daypart-night)]" },
};

function subscribeMinute(callback: () => void) {
  const id = window.setInterval(callback, 60_000);
  return () => window.clearInterval(id);
}

function useDaypart(): Daypart | null {
  return useSyncExternalStore(
    subscribeMinute,
    () => daypartOf(new Date().getHours()),
    () => null,
  );
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("");
}

/** Üst barın tamamı (header). Ana Sayfa'da zamana duyarlı selamlama, diğer sekmelerde mobilde marka. */
export function TopBarLead({ name }: { name: string }) {
  const pathname = useShellPathname(); // Sheet açıkken arkadaki ekranın yolu
  const t = useTranslations("header");
  const daypart = useDaypart();

  const home = pathname === "/";
  const part = home && daypart ? DAYPARTS[daypart] : null;

  return (
    <>
      {home && (
        // Sayfanın üstündeki renk alanı: içeriğin ARKASINDA (AppShell isolate), sayfayla birlikte kayar. Karşılama alanı
        // (136 px) boyunca düz renk, sonra önce hızlı sonra yavaş solarak 120 px'te sayfa zeminine karışır (kesin çizgi
        // yok). Hızlı ilk düşüş, alttaki ikincil metinlerin zemin kontrastını korur (DESIGN_SYSTEM_PICKALY §2.4).
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-x-0 top-0 -z-10 h-256 transition-opacity duration-700 max-tablet:group-data-[focus]/shell:hidden",
            part ? cn(part.tint, "opacity-100") : "opacity-0",
          )}
          style={{ backgroundImage: fadeGradient("var(--daypart-tint, transparent)") }}
        />
      )}
      <header
        className={cn(
          "flex items-center gap-12 px-16 max-tablet:group-data-[focus]/shell:hidden tablet:px-(--layout-page-padding-x)",
          // Ana Sayfa: yüksek karşılama alanı, sayfayla birlikte kayar (yapışık değil). Diğer sekmeler: 64 px yapışık bar.
          home ? "relative h-136 overflow-hidden" : "sticky top-0 z-(--z-sticky) h-(--layout-topbar-height) bg-surface-page tablet:hidden",
        )}
      >
        {home ? (
          <>
            <Greeting name={name} greeting={part ? t(`greeting.${part.greeting}`) : ""} tinted={Boolean(part)} />
            {daypart && part && (
              // Gün dilimi sahnesi (public/illustrations/daypart): güneş, bulutlar, ay ve yıldızlar. Yavaş hareketler SVG'nin
              // içinde; "hareketi azalt" tercihinde durur. Ekran okuyucuya gün dilimi adı okunur.
              <Image
                key={daypart}
                src={`/illustrations/daypart/${daypart}.svg`}
                alt={t(`daypart.${daypart}`)}
                width={200}
                height={140}
                unoptimized
                priority
                className="pointer-events-none absolute end-0 top-1/2 h-auto w-176 -translate-y-1/2 animate-fade-in tablet:end-(--layout-page-padding-x) tablet:w-200"
              />
            )}
          </>
        ) : (
          <div className="flex items-center gap-12">
            <LogoMark size={32} />
            <div className="flex flex-col">
              <span className="text-title-md text-text-primary">{t("brand")}</span>
              <span className="text-caption text-text-secondary">{t("tagline")}</span>
            </div>
          </div>
        )}
      </header>
    </>
  );
}

/** Karşılama alanı (136 px) boyunca düz, sonra kolay-çıkış eğrisiyle solan dikey geçiş. */
function fadeGradient(color: string) {
  const alpha = (percent: number) => `color-mix(in srgb, ${color} ${percent}%, transparent)`;
  return `linear-gradient(to bottom, ${color} 0, ${color} 136px, ${alpha(55)} 152px, ${alpha(28)} 168px, ${alpha(12)} 200px, ${alpha(4)} 232px, transparent 256px)`;
}

function Greeting({ name, greeting, tinted }: { name: string; greeting: string; tinted: boolean }) {
  return (
    // Sağdaki sahneye taşmasın diye en fazla genişlik sınırlı; uzun ad kısaltılır.
    <div className="relative z-1 flex min-w-0 max-w-[calc(100%-136px)] items-center gap-12 tablet:max-w-[calc(100%-200px)]">
      {name && (
        <span
          aria-hidden
          className={cn(
            "inline-flex size-40 shrink-0 items-center justify-center rounded-full text-title-sm text-text-brand transition-colors duration-700",
            // Renkli barda avatar beyaz zeminde (gündüz tonu blue.100 ile aynı olduğu için kaybolmasın) [Uyarlama].
            tinted ? "bg-surface-card" : "bg-brand-primary-subtle",
          )}
        >
          {initials(name)}
        </span>
      )}
      <div className="relative z-1 flex min-w-0 flex-col">
        {/* Renkli zeminde ikincil gri metin kontrastı tutmaz: selamlama siyah (DESIGN_SYSTEM_PICKALY §2.4). */}
        <span className={cn("h-16 text-caption", tinted ? "text-text-primary" : "text-text-secondary", !name && "sr-only")}>{greeting}</span>
        <span className="truncate text-title-md text-text-primary">{name || greeting || " "}</span>
      </div>
    </div>
  );
}
