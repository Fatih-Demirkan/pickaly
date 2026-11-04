// categories modülünün istemci tarafında da kullanılabilen genel arayüzü.
// Veri erişimi (sunucu) için "@/features/categories/server" kullanılır.

export type { Category, CategoryColor, CategoryType } from "./domain/types";
export { CategoryIcon, resolveCategoryIcon } from "./components/CategoryIcon";
export { categoryChipClass } from "./components/categoryStyle";
