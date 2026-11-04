import { categoryIcons } from "@/config/icons";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import type { Category } from "../domain/types";
import { categoryIconClass, categorySurfaceClass } from "./categoryStyle";

// Liste satırı ikon karosu (DESIGN_SYSTEM.md §A8 Transaction list row): 36×36, radius-sm, kategori zemini, ikon 20.
// Küçük sürüm: 32×32, radius-sm, ikon 16.

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
        size === "md" ? "size-36 rounded-sm" : "size-32 rounded-sm",
        categorySurfaceClass(category.color),
        categoryIconClass(category.color),
        className,
      )}
    >
      <Icon icon={icon} size={size === "md" ? "md" : "sm"} />
    </span>
  );
}
