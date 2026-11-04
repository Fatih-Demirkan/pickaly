import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "./Icon";

// Figma Components → Chip-Kategori (DESIGN §8.7). Seçilebilir filtre / kategori seçeneği.
// Yükseklik 32 px [Karar Ç-9]; on: brand-primary + check ikonu, off: surface-card + border-default.

type ChipSelectProps = Omit<ComponentProps<"button">, "children"> & {
  selected: boolean;
  children: ReactNode;
};

export function chipSelectClasses(selected: boolean) {
  return cn(
    "touch-target inline-flex h-32 shrink-0 items-center gap-4 rounded-full border px-12 text-label-sm whitespace-nowrap transition-colors",
    selected
      ? "border-brand-primary bg-brand-primary text-text-inverse"
      : "border-border-default bg-surface-card text-text-secondary hover:border-border-strong",
    "disabled:cursor-not-allowed disabled:border-border-subtle disabled:bg-surface-muted disabled:text-text-tertiary",
  );
}

export function ChipSelect({ selected, children, className, type = "button", ...rest }: ChipSelectProps) {
  return (
    <button type={type} aria-pressed={selected} className={cn(chipSelectClasses(selected), className)} {...rest}>
      {selected && <Icon icon="confirm" size="sm" />}
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
      {selected && <Icon icon="confirm" size="sm" />}
      {children}
    </Link>
  );
}
