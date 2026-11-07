"use server";

import { getLocale } from "next-intl/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { CategoryIconName } from "@/config/icons";
import { intlLocale, isLocale } from "@/i18n/config";
import { parseMoneyInput } from "@/lib/money";
import { ReferencedRecordError } from "@/lib/supabase/data";
import type { Category } from "./domain/types";
import { categoriesHref, tabOfType } from "./routes";
import { categoryFormSchema, type CategoryFormErrorKey, type CategoryFormField, type CategoryFormState } from "./schemas";
import { createCategory, getCategory, getCategoryUsage, listCategories, removeCategory, updateCategory } from "./server";

// Kategori ekleme, düzenleme, arşivleme, geri alma ve silme (PRD FR-SET-008, BR-CAT-001…007).
// [Auth aşaması] Her aksiyonda oturum ve sahiplik kontrolü eklenecek (TECH_STACK §6.3).

function revalidateCategories() {
  // Kategoriler formlarda, listelerde ve raporlarda görünür (BR-CAT-001): tüm uygulama yenilenir.
  revalidatePath("/", "layout");
}

async function sameName(a: string, b: string) {
  const locale = await getLocale();
  const tag = intlLocale[isLocale(locale) ? locale : "tr"];
  return a.toLocaleLowerCase(tag) === b.toLocaleLowerCase(tag);
}

/** Ad, tür içinde aktif kategoriler arasında benzersiz (BR-DUP-003, DM-003). */
async function hasDuplicate(type: Category["type"], name: string, exceptId?: string) {
  for (const category of await listCategories(type)) {
    if (category.id !== exceptId && !category.archived && (await sameName(category.name, name))) return true;
  }
  return false;
}

export async function saveCategory(id: string | null, _previous: CategoryFormState, formData: FormData): Promise<CategoryFormState> {
  const existing = id ? await getCategory(id) : null;
  if (id && !existing) return { formError: "notFound" };
  const parsed = categoryFormSchema.safeParse({
    // Tür düzenlemede değişmez: bağlı kayıtların türü korunur.
    type: existing?.type ?? formData.get("type"),
    name: formData.get("name") ?? "",
    icon: formData.get("icon") ?? "",
    color: formData.get("color"),
    budget: formData.get("budget") ?? "",
    note: formData.get("note") ?? "",
  });
  const errors: Partial<Record<CategoryFormField, CategoryFormErrorKey>> = {};
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as CategoryFormField;
      if (field !== "type") errors[field] ??= issue.message as CategoryFormErrorKey;
    }
    return { errors, formError: "summary" };
  }
  const data = parsed.data;
  if (await hasDuplicate(data.type, data.name, id ?? undefined)) errors.name = "duplicate";
  // Aylık bütçe limiti yalnızca gider kategorilerinde (PRD §9.1 [Öneri]).
  let budget: bigint | null = null;
  if (data.type === "expense" && data.budget) {
    const locale = await getLocale();
    budget = parseMoneyInput(data.budget, isLocale(locale) ? locale : "tr");
    if (budget === null || budget <= BigInt(0)) errors.budget = "budget";
  }
  if (Object.keys(errors).length > 0) return { errors, formError: "summary" };

  const values = { name: data.name, icon: data.icon as CategoryIconName, color: data.color, monthlyBudgetMinor: budget, note: data.note || null };
  if (existing) await updateCategory(existing.id, values);
  else await createCategory({ ...values, type: data.type });
  revalidateCategories();
  redirect(categoriesHref(tabOfType(data.type)));
}

export type CategoryActionResult = { ok: true } | { ok: false; reason: "lastActive" | "inUse" | "conflict" | "notFound" };

/** Bir türün son aktif kategorisi arşivlenemez ve silinemez (BR-CAT-003). */
async function isLastActive(category: Category) {
  return (await listCategories(category.type)).filter((item) => !item.archived).length <= 1;
}

/** Kullanılmış kategori arşivlenir (BR-CAT-002). Tekrar kuralları mevcut kategoriyle örnek üretmeye devam eder (BR-CAT-007). */
export async function archiveCategoryAction(id: string): Promise<CategoryActionResult> {
  const category = await getCategory(id);
  if (!category) return { ok: false, reason: "notFound" };
  if (await isLastActive(category)) return { ok: false, reason: "lastActive" };
  await updateCategory(id, { archived: true });
  revalidateCategories();
  return { ok: true };
}

/** Hiç kullanılmamış kategori onayla kalıcı silinir (BR-CAT-004). */
export async function deleteCategoryAction(id: string): Promise<CategoryActionResult> {
  const category = await getCategory(id);
  if (!category) return { ok: false, reason: "notFound" };
  if (await isLastActive(category)) return { ok: false, reason: "lastActive" };
  const usage = (await getCategoryUsage()).get(id);
  if (usage && usage.records + usage.recurring > 0) return { ok: false, reason: "inUse" };
  try {
    await removeCategory(id);
  } catch (error) {
    // Kullanım sayımında görünmeyen bir kayıt (ör. silinmiş bir aboneliğin satırı) kategoriye hâlâ bağlıysa veritabanı
    // silmeyi reddeder; aksiyon çökmez, kullanıcı "silinemedi" bildirimini görür.
    if (error instanceof ReferencedRecordError) return { ok: false, reason: "inUse" };
    throw error;
  }
  revalidateCategories();
  return { ok: true };
}

/** Arşivden geri al (BR-CAT-005): aynı türde aynı adlı aktif kategori varsa önce yeniden adlandırma istenir. */
export async function restoreCategoryAction(id: string): Promise<CategoryActionResult> {
  const category = await getCategory(id);
  if (!category) return { ok: false, reason: "notFound" };
  if (await hasDuplicate(category.type, category.name, id)) return { ok: false, reason: "conflict" };
  await updateCategory(id, { archived: false });
  revalidateCategories();
  return { ok: true };
}
