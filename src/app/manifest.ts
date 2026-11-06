import type { MetadataRoute } from "next";
import { semanticColors } from "@/styles/tokens";
import trMessages from "@/locales/tr.json";

// PWA manifest (TECH_STACK §8.5, RESPONSIVE §5.3). Renkler token'lardan gelir: tema ve zemin canvas #F5F6F7
// (DESIGN_SYSTEM_PICKALY §7). Kurulum tarayıcının kendi akışıyla (menü → "Uygulamayı yükle" / "Ana Ekrana Ekle").
// İkonlar ürün sahibinin logo kitinden (pickaly-logo/web: kırmızı zeminde beyaz kiraz) scripts/build-app-icons.mjs
// ile kopyalanır (2026-11-06). Tema ve açılış zemini DESIGN_SYSTEM_PICKALY §7'deki canvas rengidir; kitin önerdiği
// kırmızı tema rengi (#E23A4E) kullanılmaz.
// [Ertelendi] Service worker (Serwist, yalnızca uygulama kabuğu ve statik varlık önbelleği) ve çevrimdışı bandı.
//   Chrome menüden kurulum için service worker istemiyor (Chrome 108+ mobil); iOS da istemiyor.
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: trMessages.app.name,
    short_name: trMessages.app.name,
    description: trMessages.app.description,
    lang: "tr",
    start_url: "/",
    scope: "/",
    display: "standalone",
    theme_color: semanticColors["surface-page"],
    background_color: semanticColors["surface-page"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
