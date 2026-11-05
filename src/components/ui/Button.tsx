import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import type { AppIconName } from "@/config/icons";
import { cn } from "@/lib/cn";
import { Icon } from "./Icon";
import { Spinner } from "./Spinner";

// DESIGN_SYSTEM.md §A8 Buttons + DESIGN_SYSTEM_PICKALY.md §5.1.
// Boyut: LG 44 (yatay 20, ikon 20, aralık 8) · SM 32 (yatay 14, ikon 16, aralık 6). Tüm butonlar pill (radius-full).
// Varyantlar: Primary (blue.600) · Secondary (blue.100 + mavi metin) · Contrast (siyah) · Tertiary (beyaz + ince çerçeve)
//             · Text (zeminsiz, mavi metin) · Destructive (red.600).
// SM'nin dokunma alanı touch-target ile 44 px'e genişler.

export type ButtonVariant = "primary" | "secondary" | "contrast" | "tertiary" | "text" | "destructive";
export type ButtonSize = "lg" | "sm";
/** @deprecated Part A'da tüm butonlar pill; değer görünümü etkilemez. Component geçişi bitince kaldırılacak. */
export type ButtonShape = "rounded" | "pill";

type ButtonStyleOptions = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** @deprecated Bkz. ButtonShape. */
  shape?: ButtonShape;
  fullWidth?: boolean;
};

const variantClass: Record<ButtonVariant, string> = {
  primary: "bg-brand-primary text-text-inverse hover:bg-brand-primary-hover active:bg-action-primary-pressed",
  secondary:
    "bg-brand-primary-subtle text-text-brand hover:bg-action-secondary-hover hover:text-brand-primary-hover active:bg-action-secondary-pressed active:text-action-primary-pressed",
  contrast: "bg-surface-inverse text-text-inverse hover:bg-action-contrast-hover active:bg-surface-inverse-control",
  tertiary: "border border-border-subtle bg-surface-card text-text-primary hover:bg-action-tertiary-hover active:bg-surface-muted",
  text: "bg-transparent text-text-brand hover:underline active:text-action-primary-pressed",
  destructive: "bg-status-danger text-text-inverse hover:bg-action-danger-hover active:bg-action-danger-hover",
};

const sizeClass: Record<ButtonSize, string> = {
  lg: "h-44 gap-8 px-20",
  sm: "h-32 gap-6 px-14",
};

export function buttonClasses({ variant = "primary", size = "lg", fullWidth }: ButtonStyleOptions = {}) {
  return cn(
    "touch-target inline-flex shrink-0 items-center justify-center rounded-full text-button whitespace-nowrap transition-colors",
    sizeClass[size],
    // Metin butonu satır içinde durur: yatay boşluk verilmez.
    variant === "text" && "px-0",
    variantClass[variant],
    // Disabled: soluklaştırma yerine sabit renkler (DESIGN_SYSTEM_PICKALY §5.1).
    variant === "text"
      ? "disabled:cursor-not-allowed disabled:text-text-disabled disabled:no-underline aria-disabled:cursor-not-allowed aria-disabled:text-text-disabled aria-disabled:no-underline"
      : cn(
          "disabled:cursor-not-allowed disabled:border-transparent disabled:bg-surface-disabled disabled:text-text-disabled",
          "aria-disabled:cursor-not-allowed aria-disabled:border-transparent aria-disabled:bg-surface-disabled aria-disabled:text-text-disabled",
        ),
    fullWidth && "w-full",
  );
}

type ContentProps = {
  leadingIcon?: AppIconName;
  trailingIcon?: AppIconName;
  loading?: boolean;
  children: ReactNode;
};

function ButtonContent({ leadingIcon, trailingIcon, loading, size = "lg", children }: ContentProps & { size?: ButtonSize }) {
  const iconSize = size === "sm" ? "sm" : "md";
  return (
    <>
      {loading ? <Spinner className={size === "sm" ? "size-16" : undefined} /> : leadingIcon && <Icon icon={leadingIcon} size={iconSize} />}
      <span>{children}</span>
      {trailingIcon && !loading && <Icon icon={trailingIcon} size={iconSize} />}
    </>
  );
}

type ButtonProps = ButtonStyleOptions & ContentProps & Omit<ComponentProps<"button">, "children">;

export function Button({ variant, size, shape, fullWidth, leadingIcon, trailingIcon, loading, children, className, disabled, type = "button", ...rest }: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(buttonClasses({ variant, size, shape, fullWidth }), className)}
      {...rest}
    >
      <ButtonContent leadingIcon={leadingIcon} trailingIcon={trailingIcon} loading={loading} size={size}>
        {children}
      </ButtonContent>
    </button>
  );
}

type ButtonLinkProps = ButtonStyleOptions & Omit<ContentProps, "loading"> & Omit<ComponentProps<typeof Link>, "children">;

/** Buton görünümlü bağlantı (sayfa değiştiren aksiyonlar için). */
export function ButtonLink({ variant, size, shape, fullWidth, leadingIcon, trailingIcon, children, className, ...rest }: ButtonLinkProps) {
  return (
    <Link className={cn(buttonClasses({ variant, size, shape, fullWidth }), className)} {...rest}>
      <ButtonContent leadingIcon={leadingIcon} trailingIcon={trailingIcon} size={size}>
        {children}
      </ButtonContent>
    </Link>
  );
}
