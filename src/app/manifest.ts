import type { MetadataRoute } from "next";
import { semanticColors } from "@/styles/tokens";
import trMessages from "@/locales/tr.json";

// PWA manifest (TECH_STACK §8.5, RESPONSIVE §5.3). Renkler token'lardan gelir: #0F766E / #F8FAFC.
// [Eksik] Uygulama ikonu / logo varlığı Figma Pages/Components'ta yok. 192, 512 ve maskable ikonlar
// tasarım ekibinden gelince "icons" alanına eklenecek; o zamana kadar uygulama ana ekrana kurulamaz.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: trMessages.app.name,
    short_name: trMessages.app.name,
    description: trMessages.app.description,
    lang: "tr",
    start_url: "/",
    display: "standalone",
    theme_color: semanticColors["brand-primary"],
    background_color: semanticColors["surface-page"],
    icons: [],
  };
}
