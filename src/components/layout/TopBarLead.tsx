"use client";

import { useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import { Icon } from "@/components/ui/Icon";
import { LogoMark } from "@/components/ui/Logo";
import type { AppIconName } from "@/config/icons";
import { cn } from "@/lib/cn";
import { useShellPathname } from "@/lib/sheetRoutes";

// Üst bar (DESIGN_SYSTEM_PICKALY §5.6, Karar K-6, K-19).
//   Ana Sayfa : zamana duyarlı bar (ürün sahibi isteği 2026-11-06). Solda 40 px avatar + caption selamlama +
//               title-md kullanıcı adı; sağda gün dilimi belirteci (40 px daire, 20 px Lucide ikon). Bar gün diliminin
//               pastel tonunda; altında 120 px'lik yumuşak bir geçişle sayfa zeminine karışır (kesin çizgi yok).
//               Kaydırınca bar yapışık kalır, içerik geçişin altından solarak geçer.
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

// Tailwind sınıfları derleme anında bulunabilsin diye tam yazılır. Renkler tokens/color.semantic.light.json "daypart".
const DAYPARTS: Record<Daypart, { greeting: "morning" | "afternoon" | "evening" | "night"; icon: AppIconName; bar: string; fade: string; fg: string }> = {
  morning: { greeting: "morning", icon: "sunrise", bar: "bg-daypart-morning", fade: "from-daypart-morning via-daypart-morning/45 to-daypart-morning/0", fg: "text-daypart-morning-fg" },
  day: { greeting: "afternoon", icon: "sun", bar: "bg-daypart-day", fade: "from-daypart-day via-daypart-day/45 to-daypart-day/0", fg: "text-daypart-day-fg" },
  sunset: { greeting: "evening", icon: "sunset", bar: "bg-daypart-sunset", fade: "from-daypart-sunset via-daypart-sunset/45 to-daypart-sunset/0", fg: "text-daypart-sunset-fg" },
  evening: { greeting: "evening", icon: "moon", bar: "bg-daypart-evening", fade: "from-daypart-evening via-daypart-evening/45 to-daypart-evening/0", fg: "text-daypart-evening-fg" },
  night: { greeting: "night", icon: "moonStar", bar: "bg-daypart-night", fade: "from-daypart-night via-daypart-night/45 to-daypart-night/0", fg: "text-daypart-night-fg" },
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
        // Sayfanın üstündeki renk geçişi: içeriğin ARKASINDA (AppShell isolate), sayfayla birlikte kayar. Bar yüksekliği
        // boyunca düz renk, sonra önce hızlı sonra yavaş solarak 120 px'te sayfa zeminine karışır (kesin çizgi yok).
        // Hızlı ilk düşüş, "Toplam Bakiye" gibi ikincil metinlerin zemin kontrastını korur (DESIGN_SYSTEM_PICKALY §2.4).
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-x-0 top-0 -z-10 h-184 transition-opacity duration-700 max-tablet:group-data-[focus]/shell:hidden",
            part ? "opacity-100" : "opacity-0",
          )}
          style={daypart ? { backgroundImage: fadeGradient(`var(--color-daypart-${daypart})`) } : undefined}
        />
      )}
    <header
      className={cn(
        "sticky top-0 z-(--z-sticky) flex h-(--layout-topbar-height) items-center gap-12 px-16 transition-colors duration-700 max-tablet:group-data-[focus]/shell:hidden tablet:px-(--layout-page-padding-x)",
        part ? part.bar : "bg-surface-page",
        // Tablet+: marka rail / sidebar'da; bar yalnızca Ana Sayfa selamlaması için.
        !home && "tablet:hidden",
      )}
    >
      {home && (
        // Kaydırınca içerik barın altından geçer: barın alt kenarı 24 px'lik bir solmayla biter, sert çizgi oluşmaz.
        <span
          aria-hidden
          className={cn("pointer-events-none absolute inset-x-0 top-full h-24 bg-linear-to-b transition-opacity duration-700", part ? cn(part.fade, "opacity-100") : "opacity-0")}
        />
      )}
      {home ? (
        <>
          <Greeting name={name} greeting={part ? t(`greeting.${part.greeting}`) : ""} tinted={Boolean(part)} />
          {part && daypart && (
            <span
              role="img"
              aria-label={t(`daypart.${daypart}`)}
              className={cn("ms-auto inline-flex size-40 shrink-0 animate-fade-in items-center justify-center rounded-full bg-surface-card/60", part.fg)}
            >
              <Icon icon={part.icon} />
            </span>
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

/** Bar (64 px) boyunca düz, sonra kolay-çıkış eğrisiyle solan dikey geçiş. */
function fadeGradient(color: string) {
  const alpha = (percent: number) => `color-mix(in srgb, ${color} ${percent}%, transparent)`;
  return `linear-gradient(to bottom, ${color} 0, ${color} 64px, ${alpha(55)} 80px, ${alpha(28)} 96px, ${alpha(12)} 128px, ${alpha(4)} 160px, transparent 184px)`;
}

function Greeting({ name, greeting, tinted }: { name: string; greeting: string; tinted: boolean }) {
  return (
    <div className="flex min-w-0 items-center gap-12">
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
