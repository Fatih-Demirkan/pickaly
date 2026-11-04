import type { CategoryType } from "./domain/types";

// Kategori Yönetimi adresleri (TECH_STACK §2: profil/kategoriler):
//   /profil/kategoriler?sekme=takvim · /profil/kategoriler/yeni?tur=gider|gelir|abonelik|takvim ·
//   /profil/kategoriler/[id]/duzenle

export type CategoryTab = "finance" | "calendar";

export function parseTabParam(value: unknown): CategoryTab {
  return value === "takvim" ? "calendar" : "finance";
}

export function categoriesHref(tab: CategoryTab = "finance") {
  return `/profil/kategoriler${tab === "calendar" ? "?sekme=takvim" : ""}`;
}

const typeParam: Record<CategoryType, string> = { income: "gelir", expense: "gider", subscription: "abonelik", calendar: "takvim" };

export function parseCategoryTypeParam(value: unknown): CategoryType {
  const entry = Object.entries(typeParam).find(([, param]) => param === value);
  return (entry?.[0] as CategoryType | undefined) ?? "expense";
}

export function newCategoryHref(type: CategoryType) {
  return `/profil/kategoriler/yeni?tur=${typeParam[type]}`;
}

export function editCategoryHref(id: string) {
  return `/profil/kategoriler/${encodeURIComponent(id)}/duzenle`;
}

export function tabOfType(type: CategoryType): CategoryTab {
  return type === "calendar" ? "calendar" : "finance";
}
