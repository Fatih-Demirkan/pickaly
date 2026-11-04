import { z } from "zod";
import { isCategoryIconName } from "@/config/icons";
import { CATEGORY_COLORS } from "./domain/types";

// Kategori Ekle / Düzenle doğrulama kuralları (PRD §9.1). Asıl doğrulama sunucudadır (TECH_STACK §6.3).

export const NAME_MAX_LENGTH = 40;
export const NOTE_MAX_LENGTH = 200;

export const categoryFormSchema = z.object({
  type: z.enum(["income", "expense", "subscription", "calendar"]),
  name: z.string().trim().min(1, "name").max(NAME_MAX_LENGTH, "nameLength"),
  icon: z.string().refine(isCategoryIconName, "icon"),
  color: z.enum(CATEGORY_COLORS, "color"),
  budget: z.string().trim(),
  note: z.string().trim().max(NOTE_MAX_LENGTH, "note"),
});

export type CategoryFormField = keyof z.infer<typeof categoryFormSchema>;
export type CategoryFormErrorKey = "name" | "nameLength" | "duplicate" | "icon" | "color" | "budget" | "note";

export type CategoryFormState = {
  errors?: Partial<Record<CategoryFormField, CategoryFormErrorKey>>;
  formError?: "summary" | "notFound";
};
