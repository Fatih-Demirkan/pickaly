"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";

// Pages kalıbı → Segmented Control (DESIGN §8.8): kap 42 px, surface-muted + border-default, radius-md,
// iç boşluk ve aralık 4; seçenek 32 px, radius-sm, seçili surface-card + shadow-sm, metin button.
// Görünüm Figma ölçüsündedir; dokunma alanı touch-target ile 44 px'e genişler.

export type SegmentedOption<T extends string> = {
  value: T;
  label: string;
  lang?: string;
  /** Seçilemeyen seçenek (ör. henüz geliştirilmemiş sekme). */
  disabled?: boolean;
};

function groupClasses(fullWidth?: boolean, className?: string) {
  return cn("inline-flex gap-4 rounded-md border border-border-default bg-surface-muted p-4", fullWidth && "flex w-full", className);
}

function optionClasses(selected: boolean, fullWidth?: boolean) {
  return cn(
    "touch-target inline-flex h-32 items-center justify-center rounded-sm px-12 text-button whitespace-nowrap transition-colors",
    fullWidth && "flex-1",
    selected ? "bg-surface-card text-text-primary shadow-sm" : "text-text-secondary hover:text-text-primary",
    "disabled:cursor-not-allowed disabled:text-text-tertiary disabled:hover:text-text-tertiary",
    "aria-disabled:cursor-not-allowed aria-disabled:text-text-tertiary aria-disabled:hover:text-text-tertiary",
  );
}

type SegmentedControlProps<T extends string> = {
  options: readonly SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Grubun ekran okuyucu adı. */
  label: string;
  disabled?: boolean;
  /** Mobilde tam genişlik (RESPONSIVE §4.8). */
  fullWidth?: boolean;
  className?: string;
};

export function SegmentedControl<T extends string>({ options, value, onChange, label, disabled, fullWidth, className }: SegmentedControlProps<T>) {
  return (
    <div role="group" aria-label={label} aria-busy={disabled || undefined} className={groupClasses(fullWidth, className)}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            lang={option.lang}
            aria-pressed={selected}
            disabled={disabled || option.disabled}
            onClick={() => !selected && onChange(option.value)}
            className={optionClasses(selected, fullWidth)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

type SegmentedLinksProps<T extends string> = {
  options: readonly (SegmentedOption<T> & { href: string })[];
  value: T;
  label: string;
  fullWidth?: boolean;
  className?: string;
};

/** Seçimin URL'de tutulduğu hâl (ör. İşlemler → Tümü / Gelir / Gider, ?tur=). */
export function SegmentedLinks<T extends string>({ options, value, label, fullWidth, className }: SegmentedLinksProps<T>) {
  return (
    <nav aria-label={label} className={groupClasses(fullWidth, className)}>
      {options.map((option) => {
        const selected = option.value === value;
        // Hazır olmayan seçenek (ör. Takvim → Günlük [Eksik]) bağlantı değil, devre dışı metin olarak görünür.
        if (option.disabled) {
          return (
            <span key={option.value} aria-disabled="true" className={optionClasses(false, fullWidth)}>
              {option.label}
            </span>
          );
        }
        return (
          <Link
            key={option.value}
            href={option.href}
            scroll={false}
            aria-current={selected ? "true" : undefined}
            className={optionClasses(selected, fullWidth)}
          >
            {option.label}
          </Link>
        );
      })}
    </nav>
  );
}
