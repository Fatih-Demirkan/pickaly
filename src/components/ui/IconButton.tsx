import type { ComponentProps } from "react";
import type { AppIconName } from "@/config/icons";
import { cn } from "@/lib/cn";
import { Icon } from "./Icon";

// Figma: Header → "Button - Arama / Bildirimler" (40×40, tam yuvarlak, ikon 20, text-secondary).
// Tek başına ikon buton her zaman erişilebilir ad taşır (DESIGN §7.3). Dokunma alanı 44 px'e genişler.

type IconButtonProps = Omit<ComponentProps<"button">, "children" | "aria-label"> & {
  icon: AppIconName;
  /** Zorunlu: ekran okuyucu adı. */
  label: string;
};

export function IconButton({ icon, label, className, type = "button", ...rest }: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        "touch-target inline-flex size-40 shrink-0 items-center justify-center rounded-full text-text-secondary transition-colors",
        "hover:bg-action-tertiary-hover hover:text-text-primary",
        "disabled:cursor-not-allowed disabled:text-text-tertiary disabled:hover:bg-transparent",
        className,
      )}
      {...rest}
    >
      <Icon icon={icon} />
    </button>
  );
}
