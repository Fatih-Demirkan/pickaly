import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

// Pages kalıbı → liste kartı (DESIGN §8.3): surface-card, border-default, radius-lg (16) [Karar Ç-1].
// Gölge yok; yüzey ayrımı çerçeveyle yapılır (DESIGN §6.1). İç boşluk breakpoint'e göre 16 / 20 / 24.
// Hero kartlar (Toplam Bakiye, Birikim Hedefi) ilgili modülde ayrıca uygulanacak (radius-2xl).

type CardProps = ComponentProps<"div"> & {
  /** none: liste satırları kenardan kenara ise iç boşluk verilmez. */
  padding?: "default" | "none";
};

export function Card({ padding = "default", className, ...rest }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border-default bg-surface-card",
        padding === "default" && "p-(--layout-card-padding)",
        className,
      )}
      {...rest}
    />
  );
}
