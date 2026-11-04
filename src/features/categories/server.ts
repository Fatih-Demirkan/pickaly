import "server-only";
import { calendarRepository } from "@/features/calendar/server";
import { listRecurringPayments } from "@/features/payments/server";
import { recurringRuleRepository, transactionRepository } from "@/features/transactions/server";
import type { Category, CategoryType } from "./domain/types";
import { mockCategories } from "./data/mock-categories";

// Kategori verisine sunucu tarafı erişim. Şimdilik yerel örnek veri; Supabase repository'si
// geldiğinde yalnızca bu dosyanın içi değişir, imzalar korunur.

export async function listCategories(type?: CategoryType): Promise<Category[]> {
  return mockCategories().filter((category) => !type || category.type === type);
}

export async function getCategoryMap(): Promise<Map<string, Category>> {
  return new Map(mockCategories().map((category) => [category.id, category]));
}

export async function getCategory(id: string): Promise<Category | null> {
  return mockCategories().find((category) => category.id === id) ?? null;
}

export async function createCategory(input: Omit<Category, "id" | "archived">): Promise<Category> {
  const category: Category = { ...input, id: crypto.randomUUID(), archived: false };
  mockCategories().push(category);
  return category;
}

export async function updateCategory(id: string, patch: Partial<Omit<Category, "id">>): Promise<Category | null> {
  const category = mockCategories().find((item) => item.id === id);
  if (!category) return null;
  Object.assign(category, patch);
  return category;
}

export async function removeCategory(id: string): Promise<void> {
  const list = mockCategories();
  const index = list.findIndex((category) => category.id === id);
  if (index !== -1) list.splice(index, 1);
}

export type CategoryUsage = {
  /** Bağlı işlem (gelir / gider) veya görev / randevu sayısı (Pages: "42 işlem"). */
  records: number;
  /** Bu kategoriyi kullanan aktif tekrarlayan kayıtlar: abonelik ve Tekrar Eden İşlem kuralları (BR-CAT-007). */
  recurring: number;
};

/**
 * Kategori kimliği → kullanım. "Kullanılmış" = en az bir işlem, tekrarlayan ödeme/kural, görev veya randevu kaydına
 * bağlı (BR-CAT-002). Kullanılmış kategori silinmez, arşivlenir.
 * [Supabase aşaması] Sayım tek bir SQL sorgusuna (count … group by category_id) taşınır.
 */
export async function getCategoryUsage(): Promise<Map<string, CategoryUsage>> {
  const [transactions, rules, payments, items] = await Promise.all([
    transactionRepository.listAll(),
    recurringRuleRepository.listActive(),
    listRecurringPayments(),
    calendarRepository.listBetween("0000-01-01", "9999-12-31"),
  ]);
  const usage = new Map<string, CategoryUsage>();
  const add = (id: string | null, key: keyof CategoryUsage) => {
    if (!id) return;
    const current = usage.get(id) ?? { records: 0, recurring: 0 };
    current[key] += 1;
    usage.set(id, current);
  };
  for (const transaction of transactions) add(transaction.categoryId, "records");
  for (const item of items) add(item.categoryId, "records");
  for (const rule of rules) add(rule.template.categoryId, "recurring");
  for (const series of payments) add(series.categoryId, "recurring");
  return usage;
}
