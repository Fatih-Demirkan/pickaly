import "server-only";
import type { CategoryIconName } from "@/config/icons";
import { db, fromBigInt, toBigIntOrNull, unwrap } from "@/lib/supabase/data";
import type { Category, CategoryColor, CategoryType } from "../domain/types";

// Kategoriler — Supabase (tablo: categories). Varsayılan kategoriler kayıtta veritabanı tetikleyicisiyle oluşturulur
// (FR-AUTH-005). Liste sırası: oluşturma sırası (position), sonra oluşturulma zamanı.

type CategoryRow = {
  id: string;
  type: CategoryType;
  name: string;
  icon: CategoryIconName | null;
  color: CategoryColor;
  archived: boolean;
  monthly_budget_minor: number | null;
  note: string | null;
};

const COLUMNS = "id, type, name, icon, color, archived, monthly_budget_minor, note";

function toCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    type: row.type,
    name: row.name,
    icon: row.icon,
    color: row.color,
    archived: row.archived,
    monthlyBudgetMinor: toBigIntOrNull(row.monthly_budget_minor),
    note: row.note,
  };
}

function patchRow(patch: Partial<Omit<Category, "id">>) {
  const row: Record<string, unknown> = {};
  if (patch.type !== undefined) row.type = patch.type;
  if (patch.name !== undefined) row.name = patch.name;
  if (patch.icon !== undefined) row.icon = patch.icon;
  if (patch.color !== undefined) row.color = patch.color;
  if (patch.archived !== undefined) row.archived = patch.archived;
  if (patch.monthlyBudgetMinor !== undefined) row.monthly_budget_minor = fromBigInt(patch.monthlyBudgetMinor ?? null);
  if (patch.note !== undefined) row.note = patch.note;
  return row;
}

export async function listCategoriesFromDb(type?: CategoryType): Promise<Category[]> {
  let query = (await db()).from("categories").select(COLUMNS).order("position").order("created_at");
  if (type) query = query.eq("type", type);
  return (unwrap(await query) as CategoryRow[]).map(toCategory);
}

export async function getCategoryFromDb(id: string): Promise<Category | null> {
  const row = unwrap(await (await db()).from("categories").select(COLUMNS).eq("id", id).maybeSingle());
  return row ? toCategory(row as CategoryRow) : null;
}

export async function createCategoryInDb(input: Omit<Category, "id" | "archived">): Promise<Category> {
  // Yeni kategori listenin sonuna eklenir.
  const row = unwrap(await (await db()).from("categories").insert({ ...patchRow(input), position: 1000 }).select(COLUMNS).single());
  return toCategory(row as CategoryRow);
}

export async function updateCategoryInDb(id: string, patch: Partial<Omit<Category, "id">>): Promise<Category | null> {
  const row = unwrap(await (await db()).from("categories").update(patchRow(patch)).eq("id", id).select(COLUMNS).maybeSingle());
  return row ? toCategory(row as CategoryRow) : null;
}

export async function removeCategoryFromDb(id: string): Promise<void> {
  unwrap(await (await db()).from("categories").delete().eq("id", id));
}
