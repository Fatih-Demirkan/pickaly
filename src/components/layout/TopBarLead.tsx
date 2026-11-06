"use client";

import { useEffect, useSyncExternalStore } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { LogoMark } from "@/components/ui/Logo";
import { cn } from "@/lib/cn";
import { useShellPathname } from "@/lib/sheetRoutes";

// Üst bar (DESIGN_SYSTEM_PICKALY §5.6, Karar K-6, K-19).
//   Ana Sayfa : zamana duyarlı karşılama alanı — ürün sahibinin Figma tasarımı (Fatih-Test 205:1668 "Günaydın",
//               205:1679 "İyi akşamlar", 205:1691 "İyi geceler"; 2026-11-06).
//               Kap: dikey geçiş (üst renk → %50'de ara renk → altta saydam, sayfaya karışır), padding 16 / 16 / 32,
//               öğeler dikey ortalı, iki uç arası boşluk. Solda: 12 px semibold BÜYÜK HARF selamlama (siyah %65: Figma'daki %50
//               AA'yı karşılamıyordu, ürün sahibi onayı 2026-11-06; tüm durumlarda ≥5,59:1) · 24 px bold ad · tarih rozeti (beyaz %40, padding 4/8, radius-sm, caption-strong).
//               Sağda 120×74 görsel: Figma katmanları (arka şekiller SVG · 3D görsel 72 px · öndeki süs).
//               Yazı tipi DS'deki Geist (Figma'daki Manrope yerine; DESIGN_SYSTEM.md §A3).
//   Diğer     : mobilde 32 px logo sembolü + "Pickaly" (title-md) + tagline (caption); tablet+ marka rail/sidebar'da.
// Gün dilimi cihazın yerel saatinden hesaplanır ve dakikada bir yenilenir. Sunucu kullanıcının saatini bilmediği için
// ilk HTML'de alan zemin renginde gelir; renk ve görsel istemcide yumuşakça belirir (yükseklik sabit, kayma olmaz).

type Daypart = "morning" | "day" | "evening" | "night";

/** 05–12 Günaydın · 12–17 İyi günler · 17–22 İyi akşamlar · 22–05 İyi geceler [Varsayım: saat aralıkları]. */
function daypartOf(hour: number): Daypart {
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "day";
  if (hour >= 17 && hour < 22) return "evening";
  return "night";
}

type Scene = "morning" | "evening" | "night";

// Figma'da üç tasarım var; "İyi günler" (12–17) Günaydın tasarımını kullanır [Varsayım]. Sınıflar tam yazılır:
// Tailwind yalnızca kaynakta geçen tema değişkenlerini CSS'e ekler (tokens "daypart").
const DAYPARTS: Record<Daypart, { greeting: "morning" | "afternoon" | "evening" | "night"; scene: Scene; tint: string; greetingTone: string; front: boolean }> = {
  morning: {
    greeting: "morning",
    scene: "morning",
    tint: "[--daypart-from:var(--color-daypart-morning)] [--daypart-via:var(--color-daypart-morning-via)]",
    greetingTone: "text-text-primary/65",
    front: true,
  },
  day: {
    greeting: "afternoon",
    scene: "morning",
    tint: "[--daypart-from:var(--color-daypart-morning)] [--daypart-via:var(--color-daypart-morning-via)]",
    greetingTone: "text-text-primary/65",
    front: true,
  },
  evening: {
    greeting: "evening",
    scene: "evening",
    tint: "[--daypart-from:var(--color-daypart-evening)] [--daypart-via:var(--color-daypart-evening-via)]",
    greetingTone: "text-text-primary/65",
    front: true,
  },
  night: {
    greeting: "night",
    scene: "night",
    tint: "[--daypart-from:var(--color-daypart-night)] [--daypart-via:var(--color-daypart-night-via)]",
    greetingTone: "text-text-primary/65",
    front: false,
  },
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

/** Karşılama alanının yüksekliği (px): Figma frame'i 122. Sayfa esnemesi bu yüksekliğin üstündeyken renklenir. */
const HERO = 122;

/**
 * Sayfa yukarı çekildiğinde (iOS esneme / Android aşırı kaydırma) görünen boşluk <html> zeminidir. Ana Sayfa'nın
 * üstündeyken bu zemin ve tarayıcı tema rengi karşılama alanının üst rengine çekilir; aşağı inildiğinde (alttaki
 * esneme canvas kalsın diye) ve sayfadan çıkınca eski hâline döner.
 */
function useOverscrollTint(scene: Scene | null) {
  useEffect(() => {
    if (!scene) return;
    const root = document.documentElement;
    const tint = getComputedStyle(root).getPropertyValue(`--color-daypart-${scene}`).trim();
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
  }, [scene]);
}

/** Üst barın tamamı (header). Ana Sayfa'da zamana duyarlı karşılama, diğer sekmelerde mobilde marka. */
export function TopBarLead({ name }: { name: string }) {
  const pathname = useShellPathname(); // Sheet açıkken arkadaki ekranın yolu
  const t = useTranslations("header");
  const locale = useLocale();
  const daypart = useDaypart();

  const home = pathname === "/";
  const part = home && daypart ? DAYPARTS[daypart] : null;
  useOverscrollTint(part ? part.scene : null);
  // Tarih cihazın saatinden, gün dilimiyle birlikte istemcide hesaplanır; sunucuda boş (yükseklik sabit).
  const today = part ? new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", weekday: "long" }).format(new Date()) : "";

  if (!home) {
    return (
      <header className="sticky top-0 z-(--z-sticky) flex h-(--layout-topbar-height) items-center gap-12 bg-surface-page px-16 max-tablet:group-data-[focus]/shell:hidden tablet:hidden">
        <div className="flex items-center gap-12">
          <LogoMark size={32} />
          <div className="flex flex-col">
            <span className="text-title-md text-text-primary">{t("brand")}</span>
            <span className="text-caption text-text-secondary">{t("tagline")}</span>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header
      // Figma: 122 px, padding 16 (üst) / 32 (alt) / 16 (yan), öğeler dikey ortalı, iki uç arası boşluk.
      className="relative flex h-122 items-center justify-between gap-12 px-16 pt-16 pb-32 max-tablet:group-data-[focus]/shell:hidden tablet:px-(--layout-page-padding-x)"
    >
      {/* Zemin geçişi: üst renk → %50'de ara renk → altta saydam (sayfaya kesin çizgisiz karışır). İçeriğin arkasında;
          renk istemcide belirince yumuşakça görünür, metin baştan görünür kalır. */}
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 -z-10 bg-linear-to-b from-(--daypart-from) from-0% via-(--daypart-via) via-50% to-(--daypart-via)/0 to-100% transition-opacity duration-700",
          part ? cn(part.tint, "opacity-100") : "opacity-0",
        )}
      />
      <div className="flex min-w-0 flex-1 flex-col items-start">
        {/* Selamlama: büyük harf, 12 px semibold (ürün sahibi). Büyük harf dönüşümü sayfa diliyle (tr: i → İ). */}
        <p className={cn("text-caption-strong uppercase", part?.greetingTone)}>{part ? t(`greeting.${part.greeting}`) : " "}</p>
        <p className="line-clamp-2 text-[24px] leading-[1.35] font-bold break-words text-text-primary">{name || " "}</p>
        {today && (
          // Tarih rozeti: beyaz %40, padding 4/8, radius-sm, caption-strong (Figma "badge").
          <p className="mt-0 rounded-sm bg-surface-card/40 px-8 py-4 text-caption-strong whitespace-nowrap text-text-primary first-letter:uppercase">{today}</p>
        )}
      </div>
      {part && daypart && (
        <span role="img" aria-label={t(`daypart.${daypart}`)} className="relative h-74 w-120 shrink-0 animate-fade-in">
          <Image src={`/illustrations/daypart/greeting-${part.scene}-back.svg`} alt="" width={120} height={74} unoptimized className="absolute inset-0" />
          <Image src={`/illustrations/daypart/greeting-${part.scene}.png`} alt="" width={72} height={72} unoptimized priority className="absolute top-1 left-24 size-72 object-cover" />
          {part.front && <Image src={`/illustrations/daypart/greeting-${part.scene}-front.svg`} alt="" width={120} height={74} unoptimized className="absolute inset-0" />}
        </span>
      )}
    </header>
  );
}
