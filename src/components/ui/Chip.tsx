import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

// Figma Components → Chip (DESIGN §8.7). Kayıt türü ve durum etiketi.
// Figma varyant adları → kod: Görev=task, Ödeme=payment, Genel=neutral, Yeşil=success, Turuncu=warning.
// Ölçü: 24 px, dikey 4 / yatay 8, iç boşluk 4, tam yuvarlak, label-sm.
// Metin renkleri AA kontrast için koyulaştırılmış tonlar (DESIGN §9.2.1).

export type ChipVariant = "task" | "payment" | "neutral" | "success" | "warning";

const variantClass: Record<ChipVariant, string> = {
  task: "bg-category-blue text-text-on-task",
  payment: "bg-category-pink text-text-on-payment",
  neutral: "bg-category-slate text-text-on-neutral",
  success: "bg-status-success-subtle text-text-success",
  warning: "bg-status-warning-subtle text-text-on-warning",
};

type ChipProps = {
  variant?: ChipVariant;
  /** Figma "Dot" property: metnin solunda küçük renkli nokta. */
  dot?: boolean;
  children: ReactNode;
  className?: string;
};

export function Chip({ variant = "neutral", dot, children, className }: ChipProps) {
  return (
    <span className={cn("inline-flex h-24 items-center gap-4 rounded-full px-8 text-label-sm whitespace-nowrap", variantClass[variant], className)}>
      {/* [Varsayım] Nokta çapı Figma'da ölçülmedi; 6 px. */}
      {dot && <span aria-hidden className="size-6 rounded-full bg-current" />}
      {children}
    </span>
  );
}
