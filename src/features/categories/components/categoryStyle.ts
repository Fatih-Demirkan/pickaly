import type { CategoryColor } from "../domain/types";

// Kategori rengi → token sınıfları. Zeminler Figma Category/* renkleridir.
// İkon renkleri Pages'taki ikon tonlarıdır (ör. Market #D97706 = text-warning).
// Çip metinleri AA kontrast için koyulaştırılmış "on-*" tonlarıdır (DESIGN §9.2.1); Figma'daki açık tonlar
// (#D97706, #6366F1) Category zemini üstünde 4,5:1'i sağlamaz.
// [Varsayım] Teal / Violet / Amber / Red için Pages → Kategori Yönetimi çip metin tonları: Gelir-Tamamlandı (teal),
// Chart/Balance (violet), Semantic/Yaklaşan (amber), Gider-Hata (red); kontrast için en yakın semantik metin tonları.

type CategoryStyle = { surface: string; icon: string; chipText: string };

const styles: Record<CategoryColor, CategoryStyle> = {
  teal: { surface: "bg-category-teal", icon: "text-text-brand", chipText: "text-text-brand" },
  orange: { surface: "bg-category-orange", icon: "text-text-warning", chipText: "text-text-on-warning" },
  amber: { surface: "bg-category-amber", icon: "text-text-warning", chipText: "text-text-on-warning" },
  green: { surface: "bg-category-green", icon: "text-status-success", chipText: "text-text-success" },
  // Pages'taki ikon tonu #6366F1 (indigo-500) için semantik token yok; en yakın semantik ton on-task (indigo-700).
  blue: { surface: "bg-category-blue", icon: "text-text-on-task", chipText: "text-text-on-task" },
  violet: { surface: "bg-category-violet", icon: "text-text-on-task", chipText: "text-text-on-task" },
  pink: { surface: "bg-category-pink", icon: "text-text-on-payment", chipText: "text-text-on-payment" },
  red: { surface: "bg-category-red", icon: "text-status-danger", chipText: "text-text-danger" },
  slate: { surface: "bg-category-slate", icon: "text-text-secondary", chipText: "text-text-on-neutral" },
};

export function categorySurfaceClass(color: CategoryColor) {
  return styles[color].surface;
}

export function categoryIconClass(color: CategoryColor) {
  return styles[color].icon;
}

/** Liste satırı ve detaydaki kategori çipi (Figma "Chip": 24 px, kategori zemini). */
export function categoryChipClass(color: CategoryColor) {
  return `${styles[color].surface} ${styles[color].chipText}`;
}
