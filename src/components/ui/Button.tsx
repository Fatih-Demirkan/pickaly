import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import type { AppIconName } from "@/config/icons";
import { cn } from "@/lib/cn";
import { Icon } from "./Icon";
import { Spinner } from "./Spinner";

// Figma Components → Button (DESIGN §8.1).
// Size: LG 48 / SM 38 · Varyant (Figma'daki "State"): Primary / Secondary / Tertiary / Destructive
// Ölçüler: yatay 16, ikon–metin 8, radius-md, metin button (14/21 SemiBold), ikon 20.
// Etkileşim durumları Figma'da yok; DESIGN §9.3'teki hedef kurallar uygulanır.

export type ButtonVariant = "primary" | "secondary" | "tertiary" | "destructive";
export type ButtonSize = "lg" | "sm";
/** pill: yüzen alt aksiyon barı ve FAB için tam yuvarlak form (DESIGN §8.4, [Varsayım] Shape=Pill). */
export type ButtonShape = "rounded" | "pill";

type ButtonStyleOptions = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  shape?: ButtonShape;
  fullWidth?: boolean;
};

const variantClass: Record<ButtonVariant, string> = {
  primary: "bg-brand-primary text-text-inverse hover:bg-brand-primary-hover active:bg-action-primary-pressed",
  secondary: "bg-brand-primary-subtle text-text-brand hover:bg-action-secondary-hover",
  tertiary: "border border-border-default bg-surface-card text-text-primary hover:bg-action-tertiary-hover",
  destructive: "bg-status-danger text-text-inverse hover:bg-action-danger-hover",
};

const sizeClass: Record<ButtonSize, string> = {
  lg: "h-48",
  sm: "h-38",
};

export function buttonClasses({ variant = "primary", size = "lg", shape = "rounded", fullWidth }: ButtonStyleOptions = {}) {
  return cn(
    "touch-target inline-flex shrink-0 items-center justify-center gap-8 px-16 text-button whitespace-nowrap transition-colors",
    shape === "pill" ? "rounded-full" : "rounded-md",
    sizeClass[size],
    variantClass[variant],
    // Disabled: soluklaştırma yerine sabit renkler (DESIGN §9.3).
    "disabled:cursor-not-allowed disabled:border-border-subtle disabled:bg-surface-muted disabled:text-text-tertiary",
    "aria-disabled:cursor-not-allowed aria-disabled:border-border-subtle aria-disabled:bg-surface-muted aria-disabled:text-text-tertiary",
    fullWidth && "w-full",
  );
}

type ContentProps = {
  leadingIcon?: AppIconName;
  trailingIcon?: AppIconName;
  loading?: boolean;
  children: ReactNode;
};

function ButtonContent({ leadingIcon, trailingIcon, loading, children }: ContentProps) {
  return (
    <>
      {loading ? <Spinner /> : leadingIcon && <Icon icon={leadingIcon} />}
      <span>{children}</span>
      {trailingIcon && !loading && <Icon icon={trailingIcon} />}
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
      <ButtonContent leadingIcon={leadingIcon} trailingIcon={trailingIcon} loading={loading}>
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
      <ButtonContent leadingIcon={leadingIcon} trailingIcon={trailingIcon}>
        {children}
      </ButtonContent>
    </Link>
  );
}
