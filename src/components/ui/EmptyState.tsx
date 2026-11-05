import type { ReactNode } from "react";
import type { AppIconName } from "@/config/icons";
import { cn } from "@/lib/cn";
import { Icon } from "./Icon";

// Boş durum (DESIGN_SYSTEM_PICKALY §5.9, RESPONSIVE §8.2.6): 48 px ikon karosu (blue.100 zemin, blue.600 ikon, radius-lg)
// → title-sm başlık → body text-secondary açıklama → isteğe bağlı aksiyon (Primary LG). Ortalı, en fazla 320 px.
// Sayfa içinde beyaz kart (radius-lg, elev-1) olarak durur; card={false} ile kartsız kullanılır.

type EmptyStateProps = {
  icon: AppIconName;
  title: string;
  description?: string;
  action?: ReactNode;
  card?: boolean;
  className?: string;
};

export function EmptyState({ icon, title, description, action, card = true, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center px-16 py-32 text-center", card && "rounded-lg bg-surface-card shadow-elev-1", className)}>
      <div className="flex max-w-[320px] flex-col items-center gap-8">
        <span aria-hidden className="mb-8 inline-flex size-48 items-center justify-center rounded-lg bg-brand-primary-subtle text-text-brand">
          <Icon icon={icon} size="lg" />
        </span>
        <p className="text-title-sm text-text-primary">{title}</p>
        {description && <p className="text-body text-text-secondary">{description}</p>}
        {action && <div className="mt-8">{action}</div>}
      </div>
    </div>
  );
}
