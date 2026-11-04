import { categoryIcons } from "@/config/icons";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import type { Category } from "../domain/types";
import { categoryIconClass, categorySurfaceClass } from "./categoryStyle";

// Pages → işlem satırı "Background" kutusu: 40×40, radius 12 (md), kategori zemini, ikon 20.
// Detaydaki küçük sürüm: 32×32, radius 8 (sm).

type CategoryIconProps = {
  category: Pick<Category, "icon" | "color" | "type">;
  size?: "md" | "sm";
  className?: string;
};

const typeIcons = { income: "income", expense: "expense", subscription: "receipt", calendar: "task" } as const; // Abonelik: Pages kategori çipleri receipt-text

/** Kategorinin ikonu; ikonsuz kategoride türün varsayılan ikonu. */
export function resolveCategoryIcon(category: Pick<Category, "icon" | "type">) {
  return category.icon ? categoryIcons[category.icon] : typeIcons[category.type];
}

export function CategoryIcon({ category, size = "md", className }: CategoryIconProps) {
  const icon = resolveCategoryIcon(category);

  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex shrink-0 items-center justify-center",
        size === "md" ? "size-40 rounded-md" : "size-32 rounded-sm",
        categorySurfaceClass(category.color),
        categoryIconClass(category.color),
        className,
      )}
    >
      <Icon icon={icon} size={size === "md" ? "md" : "sm"} />
    </span>
  );
}
