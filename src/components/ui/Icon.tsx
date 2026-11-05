import type { LucideIcon } from "lucide-react";
import { appIcons, type AppIconName } from "@/config/icons";

// Boyutlar tokens/dimension.json → icon-size ile aynıdır (DESIGN_SYSTEM.md §A4: 16 / 20 / 24). xs eski addır (= sm).
const iconSizePx = { xs: 16, sm: 16, md: 20, lg: 24 } as const;
export type IconSize = keyof typeof iconSizePx;

type IconProps = {
  /** Kavram adı (src/config/icons.ts) ya da doğrudan bir Lucide bileşeni (ör. kategori ikonları). */
  icon: AppIconName | LucideIcon;
  /** Varsayılan: md (20 px). */
  size?: IconSize;
  /** Verilirse ikon ekran okuyucuya bu adla okunur; verilmezse dekoratif sayılır (aria-hidden). */
  label?: string;
  className?: string;
};

/**
 * Tek ikon bileşeni. Rengi bulunduğu metnin rengini alır (currentColor).
 * Stroke, Lucide'ın 24 px grid'deki 2 px değerinin orantılı ölçeğidir: 20 px'de ≈1,67 (absoluteStrokeWidth kapalı).
 */
export function Icon({ icon, size = "md", label, className }: IconProps) {
  const Component = typeof icon === "string" ? appIcons[icon] : icon;
  const px = iconSizePx[size];

  return (
    <Component
      width={px}
      height={px}
      strokeWidth={2}
      className={className}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? "img" : undefined}
      focusable="false"
    />
  );
}
