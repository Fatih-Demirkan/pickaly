import type { ComponentProps } from "react";
import type { AppIconName } from "@/config/icons";
import { cn } from "@/lib/cn";
import { Icon } from "./Icon";

// DESIGN_SYSTEM_PICKALY.md §5.1 İkon butonları.
//   ghost   : 40 daire, zeminsiz, text-secondary (drawer kapat, satır içi aksiyonlar)
//   outline : 36 daire, beyaz zemin + 1 px border-subtle, text-primary (DS: header bildirim / arama / hesap)
// Tek başına ikon buton her zaman erişilebilir ad taşır. Dokunma alanı 44 px'e genişler.

export type IconButtonVariant = "ghost" | "outline";

type IconButtonProps = Omit<ComponentProps<"button">, "children" | "aria-label"> & {
  icon: AppIconName;
  /** Zorunlu: ekran okuyucu adı. */
  label: string;
  variant?: IconButtonVariant;
};

export function iconButtonClasses(variant: IconButtonVariant = "ghost") {
  return cn(
    "touch-target inline-flex shrink-0 items-center justify-center rounded-full transition-colors",
    variant === "outline"
      ? "size-36 border border-border-subtle bg-surface-card text-text-primary hover:border-border-strong hover:bg-action-tertiary-hover"
      : "size-40 text-text-secondary hover:bg-action-tertiary-hover hover:text-text-primary",
    "disabled:cursor-not-allowed disabled:text-text-disabled disabled:hover:bg-transparent",
  );
}

export function IconButton({ icon, label, variant = "ghost", className, type = "button", ...rest }: IconButtonProps) {
  return (
    <button type={type} aria-label={label} title={label} className={cn(iconButtonClasses(variant), className)} {...rest}>
      <Icon icon={icon} />
    </button>
  );
}
