"use client";

import { useEffect, useSyncExternalStore } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { LogoMark } from "@/components/ui/Logo";
import { cn } from "@/lib/cn";
import { useShellPathname } from "@/lib/sheetRoutes";

// Üst bar (DESIGN_SYSTEM_PICKALY §5.6, Karar K-6, K-19).
//   Ana Sayfa : zamana duyarlı karşılama alanı (ürün sahibi isteği 2026-11-06). 168 px yükseklik, sayfayla birlikte
//               kayar. Solda sahneye eşlik eden büyük tipografi: body-strong selamlama · title-lg ad (en fazla 2 satır) ·
//               caption bugünün tarihi. Sağda gün diliminin vektörel sahnesi (176 px, tablet+ 216 px). Zemin gün
//               diliminin pastel tonu; altta 120 px'lik yumuşak geçişle sayfaya karışır. Sayfa yukarı çekildiğinde
//               (iOS esneme) ve tarayıcı çubuğunda da aynı renk görünür.
//   Diğer     : mobilde 32 px logo sembolü + "Pickaly" (title-md) + tagline (caption); tablet+ marka rail/sidebar'da.
// Gün dilimi cihazın yerel saatinden hesaplanır ve dakikada bir yenilenir. Sunucu kullanıcının saatini bilmediği için
// ilk HTML'de alan zemin renginde gelir; renk ve sahne istemcide yumuşakça (700 ms) belirir (yükseklik sabit, kayma olmaz).

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

/** Karşılama alanının yüksekliği (px). Bakiye bloğu bunun altında başlar. */
const HERO = 168;

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

/**
 * Sayfa yukarı çekildiğinde (iOS esneme / Android aşırı kaydırma) görünen boşluk <html> zeminidir. Ana Sayfa'nın
 * üstündeyken bu zemin ve tarayıcı tema rengi gün diliminin tonuna çekilir; aşağı inildiğinde (alttaki esneme
 * canvas kalsın diye) ve sayfadan çıkınca eski hâline döner.
 */
function useOverscrollTint(daypart: Daypart | null) {
  useEffect(() => {
    if (!daypart) return;
    const root = document.documentElement;
    const tint = getComputedStyle(root).getPropertyValue(`--color-daypart-${daypart}`).trim();
    if (!tint) return;
    const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    const previousTheme = meta?.content;
    const apply = () => {
      const top = window.scrollY < HERO;
      root.style.backgroundColor = top ? tint : "";
      if (meta && previousTheme) meta.content = top ? tint : previousTheme;
    };
    apply();
    window.addEventListener("scroll", apply, { passive: true });
    return () => {
      window.removeEventListener("scroll", apply);
      root.style.backgroundColor = "";
      if (meta && previousTheme) meta.content = previousTheme;
    };
  }, [daypart]);
}

/** Üst barın tamamı (header). Ana Sayfa'da zamana duyarlı karşılama, diğer sekmelerde mobilde marka. */
export function TopBarLead({ name }: { name: string }) {
  const pathname = useShellPathname(); // Sheet açıkken arkadaki ekranın yolu
  const t = useTranslations("header");
  const locale = useLocale();
  const daypart = useDaypart();

  const home = pathname === "/";
  const part = home && daypart ? DAYPARTS[daypart] : null;
  useOverscrollTint(home ? daypart : null);
  // Tarih cihazın saatinden, gün dilimiyle birlikte istemcide hesaplanır; sunucuda boş (yükseklik sabit).
  const today = part ? new Intl.DateTimeFormat(locale, { weekday: "long", day: "numeric", month: "long" }).format(new Date()) : "";

  return (
    <>
      {home && (
        // Sayfanın üstündeki renk alanı: içeriğin ARKASINDA (AppShell isolate), sayfayla birlikte kayar. Karşılama alanı
        // boyunca düz renk, sonra önce hızlı sonra yavaş solarak 120 px'te sayfa zeminine karışır (kesin çizgi yok).
        // Hızlı ilk düşüş, alttaki ikincil metinlerin zemin kontrastını korur (DESIGN_SYSTEM_PICKALY §2.4).
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-x-0 top-0 -z-10 h-288 transition-opacity duration-700 max-tablet:group-data-[focus]/shell:hidden",
            part ? cn(part.tint, "opacity-100") : "opacity-0",
          )}
          style={{ backgroundImage: fadeGradient("var(--daypart-tint, transparent)") }}
        />
      )}
      <header
        className={cn(
          "flex items-center gap-12 px-16 max-tablet:group-data-[focus]/shell:hidden tablet:px-(--layout-page-padding-x)",
          // Ana Sayfa: yüksek karşılama alanı, sayfayla birlikte kayar (yapışık değil). Diğer sekmeler: 64 px yapışık bar.
          home ? "relative h-168 overflow-hidden" : "sticky top-0 z-(--z-sticky) h-(--layout-topbar-height) bg-surface-page tablet:hidden",
        )}
      >
        {home ? (
          <>
            <Greeting name={name} greeting={part ? t(`greeting.${part.greeting}`) : ""} date={today} />
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
                className="pointer-events-none absolute end-0 top-1/2 h-auto w-176 -translate-y-1/2 animate-fade-in tablet:end-(--layout-page-padding-x) tablet:w-216"
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

/** Karşılama alanı boyunca düz, sonra kolay-çıkış eğrisiyle 120 px'te solan dikey geçiş. */
function fadeGradient(color: string) {
  const alpha = (percent: number) => `color-mix(in srgb, ${color} ${percent}%, transparent)`;
  const at = (offset: number) => `${HERO + offset}px`;
  // Bakiye etiketi (≈ +40 px) bölgesinde ton %15'in altında: ikincil metin her gün diliminde ≥4,5:1 kalır.
  return `linear-gradient(to bottom, ${color} 0, ${color} ${at(0)}, ${alpha(40)} ${at(16)}, ${alpha(16)} ${at(32)}, ${alpha(7)} ${at(56)}, ${alpha(2)} ${at(88)}, transparent ${at(120)})`;
}

function Greeting({ name, greeting, date }: { name: string; greeting: string; date: string }) {
  // Sahneye eşlik eden büyük tipografi (DESIGN_SYSTEM_PICKALY §3.2 ölçeği): selamlama body-strong, ad title-lg,
  // tarih caption. Renkli zeminde tüm metin text.primary (§2.4). Sahneye taşmasın diye genişlik sınırlı; uzun ad 2 satır.
  return (
    <div className="relative z-1 flex min-w-0 max-w-[calc(100%-144px)] flex-col gap-4 tablet:max-w-[calc(100%-232px)]">
      <span className={cn("h-20 text-body-strong text-text-primary", !name && "sr-only")}>{greeting}</span>
      <span className="line-clamp-2 text-title-lg break-words text-text-primary">{name || greeting || " "}</span>
      <span className="h-16 text-caption text-text-primary first-letter:uppercase">{date}</span>
    </div>
  );
}
