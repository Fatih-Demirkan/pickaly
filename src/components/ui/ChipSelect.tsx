import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

// DESIGN_SYSTEM.md §A8 Filter chips + DESIGN_SYSTEM_PICKALY.md §5.4. Seçilebilir filtre / kategori / hızlı tutar seçeneği.
// Seçili: siyah dolgu + beyaz metin (check ikonu yok) · Seçili değil: beyaz + 1 px border-subtle + siyah metin.
// Yükseklik 32 [Uyarlama: DS ≈28, Karar Ç-9], yatay 12, caption-strong, tam yuvarlak.

type ChipSelectProps = Omit<ComponentProps<"button">, "children"> & {
  selected: boolean;
  children: ReactNode;
};

export function chipSelectClasses(selected: boolean) {
  return cn(
    "touch-target inline-flex h-32 shrink-0 items-center gap-4 rounded-full border px-12 text-caption-strong whitespace-nowrap transition-colors",
    selected
      ? "border-surface-selected-strong bg-surface-selected-strong text-text-inverse"
      : "border-border-subtle bg-surface-card text-text-primary hover:border-border-strong hover:bg-action-tertiary-hover",
    "disabled:cursor-not-allowed disabled:border-transparent disabled:bg-surface-disabled disabled:text-text-disabled",
  );
}

export function ChipSelect({ selected, children, className, type = "button", ...rest }: ChipSelectProps) {
  return (
    <button type={type} aria-pressed={selected} className={cn(chipSelectClasses(selected), className)} {...rest}>
      {children}
    </button>
  );
}

type ChipLinkProps = Omit<ComponentProps<typeof Link>, "children"> & {
  selected: boolean;
  children: ReactNode;
};

/** Filtre çipinin bağlantı hâli: seçim URL'de tutulduğunda kullanılır (ör. ?kategori=). */
export function ChipLink({ selected, children, className, ...rest }: ChipLinkProps) {
  return (
    <Link aria-current={selected ? "true" : undefined} className={cn(chipSelectClasses(selected), className)} {...rest}>
      {children}
    </Link>
  );
}
