"use client";

import { useState } from "react";
import { Icon } from "./Icon";

// Pages → İşlem Detayı "İşlem Kodu" satırındaki kod pill'i + copy ikonu.
// Pill: 32 px, padding 8, aralık 4, tam yuvarlak, surface-card + border-default, Label/Small.

type CopyButtonProps = {
  value: string;
  label: string;
  copiedLabel: string;
};

export function CopyButton({ value, label, copiedLabel }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Pano izni yoksa sessizce geçilir; değer ekranda okunabilir durumda.
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={`${label}: ${value}`}
      className="touch-target inline-flex h-32 shrink-0 items-center gap-4 rounded-full border border-border-default bg-surface-card px-8 text-label-sm text-text-primary transition-colors hover:border-border-strong"
    >
      {value}
      <span className="text-text-secondary">
        <Icon icon={copied ? "confirm" : "copy"} size="xs" />
      </span>
      <span role="status" className="sr-only">
        {copied ? copiedLabel : ""}
      </span>
    </button>
  );
}
