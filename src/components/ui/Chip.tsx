import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

// DESIGN_SYSTEM_PICKALY.md §5.4 Durum chip'i (salt okunur). Kayıt türü ve durum etiketi.
// Zemin/metin çiftleri kategori tonlarından; hepsi ≥4,5:1. Ölçü: 24 px, yatay 8, iç boşluk 4, tam yuvarlak, caption-strong.

export type ChipVariant = "task" | "payment" | "neutral" | "success" | "warning" | "danger";

const variantClass: Record<ChipVariant, string> = {
  task: "bg-category-violet text-category-fg-violet",
  payment: "bg-category-pink text-category-fg-pink",
  neutral: "bg-category-slate text-category-fg-slate",
  success: "bg-status-success-subtle text-text-on-success",
  warning: "bg-status-warning-subtle text-text-on-warning",
  danger: "bg-status-danger-subtle text-text-on-danger",
};

type ChipProps = {
  variant?: ChipVariant;
  /** Metnin solunda 6 px renkli nokta (metin rengiyle). */
  dot?: boolean;
  children: ReactNode;
  className?: string;
};

export function Chip({ variant = "neutral", dot, children, className }: ChipProps) {
  return (
    <span className={cn("inline-flex h-24 items-center gap-4 rounded-full px-8 text-caption-strong whitespace-nowrap", variantClass[variant], className)}>
      {dot && <span aria-hidden className="size-6 rounded-full bg-current" />}
      {children}
    </span>
  );
}
