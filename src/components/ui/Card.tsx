import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

// DESIGN_SYSTEM_PICKALY.md §5.2 Standart kart: beyaz, radius-lg (16), elev-1, sert çerçeve yok (DS "almost no hard borders").
// İç boşluk breakpoint'e göre 16 / 20 / 24 (--layout-card-padding).
// Liste grubu: padding="none" + satırlar arası border-subtle ayraç; DS'ye göre radius-md (12) için tone="list".
// Renkli veri kartları (gelir / gider / karşılaştırma) gölgesiz tint yüzeydir: tone="income" | "expense" | "compare".

type CardTone = "default" | "list" | "income" | "expense" | "compare";

const toneClass: Record<CardTone, string> = {
  default: "rounded-lg bg-surface-card shadow-elev-1",
  list: "rounded-md bg-surface-card shadow-elev-1",
  income: "rounded-md bg-surface-income",
  expense: "rounded-md bg-surface-expense",
  compare: "rounded-md bg-surface-compare",
};

type CardProps = ComponentProps<"div"> & {
  /** none: liste satırları kenardan kenara ise iç boşluk verilmez. */
  padding?: "default" | "compact" | "none";
  tone?: CardTone;
};

export function Card({ padding = "default", tone = "default", className, ...rest }: CardProps) {
  return (
    <div
      className={cn(
        toneClass[tone],
        padding === "default" && "p-(--layout-card-padding)",
        padding === "compact" && "p-12",
        className,
      )}
      {...rest}
    />
  );
}
