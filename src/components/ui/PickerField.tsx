"use client";

import type { ComponentProps } from "react";
import type { AppIconName } from "@/config/icons";
import { cn } from "@/lib/cn";
import { Icon } from "./Icon";

// Select tetikleyici (Tarih, Saat): input ile aynı kutu (DESIGN_SYSTEM_PICKALY §5.7, 48 px, border-control);
// sol ikon + değer (body) + sağda chevron-down. Seçiciyi açan buton olarak çalışır.
// Tekrarlama Sıklığı ve Hatırlatma Bildirimi alanlarında Pages ikon göstermez (icon verilmez).

type PickerFieldProps = Omit<ComponentProps<"button">, "children"> & {
  icon?: AppIconName;
  value: string;
  open: boolean;
  invalid?: boolean;
};

export function PickerField({ icon, value, open, invalid, className, type = "button", ...rest }: PickerFieldProps) {
  return (
    <button
      type={type}
      aria-expanded={open}
      data-invalid={invalid || undefined}
      className={cn(
        "flex h-48 w-full items-center gap-8 rounded-md border border-border-control bg-surface-card px-16 text-start text-body text-text-primary transition-colors hover:border-border-control-hover",
        open && "border-border-focus",
        // Hata metni aria-describedby ile okunur; aria-invalid buton rolünde geçerli değildir.
        "data-invalid:border-border-error",
        className,
      )}
      {...rest}
    >
      {icon && (
        <span aria-hidden className="shrink-0 text-text-secondary">
          <Icon icon={icon} size="sm" />
        </span>
      )}
      <span className="min-w-0 flex-1 truncate">{value}</span>
      <span aria-hidden className={cn("shrink-0 text-text-secondary transition-transform", open && "rotate-180")}>
        <Icon icon="dropdown" size="sm" />
      </span>
    </button>
  );
}
