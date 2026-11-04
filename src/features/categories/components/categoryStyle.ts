import type { CategoryColor } from "../domain/types";

// Kategori rengi → token sınıfları (DESIGN_SYSTEM_PICKALY.md §2.2). Renk anahtarları veritabanındaki adlardır, değişmez.
// Zemin: category.* (FinPilot veri tonu kalıbı) · ikon ve çip metni: category-fg.* (zeminde ve beyazda ≥4,5:1).

const surface: Record<CategoryColor, string> = {
  teal: "bg-category-teal",
  orange: "bg-category-orange",
  amber: "bg-category-amber",
  green: "bg-category-green",
  blue: "bg-category-blue",
  violet: "bg-category-violet",
  pink: "bg-category-pink",
  red: "bg-category-red",
  slate: "bg-category-slate",
};

const foreground: Record<CategoryColor, string> = {
  teal: "text-category-fg-teal",
  orange: "text-category-fg-orange",
  amber: "text-category-fg-amber",
  green: "text-category-fg-green",
  blue: "text-category-fg-blue",
  violet: "text-category-fg-violet",
  pink: "text-category-fg-pink",
  red: "text-category-fg-red",
  slate: "text-category-fg-slate",
};

export function categorySurfaceClass(color: CategoryColor) {
  return surface[color];
}

export function categoryIconClass(color: CategoryColor) {
  return foreground[color];
}

/** Liste satırı ve detaydaki kategori çipi (24 px, kategori zemini + ön plan metni). */
export function categoryChipClass(color: CategoryColor) {
  return `${surface[color]} ${foreground[color]}`;
}
