import { isMonthKey, type MonthKey } from "@/lib/dates";
import type { TransactionType } from "./domain/types";
import type { TransactionFormType } from "./schemas";

// İşlemler ekranının URL durumu. Ay, tür ve kategori filtresi adreste tutulur; böylece bağlantı
// paylaşılabilir, geri tuşu çalışır ve sayfa sunucuda doğru filtreyle çizilir.
//   ?ay=2026-05   ?tur=gelir|gider   ?kategori=<id>
// Yeni İşlem: ?tur=gelir|gider|gorev|abonelik seçili sekmeyi belirler (TECH_STACK §4).

export type ListQuery = {
  month?: MonthKey;
  type?: TransactionType;
  categoryId?: string;
};

const typeParam: Record<TransactionType, string> = { income: "gelir", expense: "gider" };

export function parseTypeParam(value: unknown): TransactionType | undefined {
  if (value === typeParam.income) return "income";
  if (value === typeParam.expense) return "expense";
  return undefined;
}

type SearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function parseListQuery(params: SearchParams): ListQuery {
  const month = first(params.ay);
  const categoryId = first(params.kategori);
  return {
    month: isMonthKey(month) ? month : undefined,
    type: parseTypeParam(first(params.tur)),
    categoryId: categoryId || undefined,
  };
}

function queryString(query: ListQuery) {
  const params = new URLSearchParams();
  if (query.month) params.set("ay", query.month);
  if (query.type) params.set("tur", typeParam[query.type]);
  if (query.categoryId) params.set("kategori", query.categoryId);
  const value = params.toString();
  return value ? `?${value}` : "";
}

export function listHref(query: ListQuery) {
  return `/islemler${queryString(query)}`;
}

/** Detay bağlantısı liste filtrelerini taşır: ≥1280'de liste aynı filtreyle yanında çizilir. */
export function detailHref(id: string, query: ListQuery) {
  return `/islemler/${encodeURIComponent(id)}${queryString(query)}`;
}

/** Yeni İşlem sheet'inin türleri: işlem türleri + Görev (Görev Ekle formu). */
export type NewEntryType = TransactionFormType | "task";

const entryParam: Record<NewEntryType, string> = { ...typeParam, subscription: "abonelik", task: "gorev" };

/** Yeni İşlem formunun sekmesi; liste filtresinden farklı olarak Abonelik de vardır. */
export function parseFormTypeParam(value: unknown): TransactionFormType | undefined {
  return value === entryParam.subscription ? "subscription" : parseTypeParam(value);
}

/** Yeni İşlem sheet'inin açılış sekmesi (Gelir / Gider / Görev / Ödeme). */
export function parseEntryParam(value: unknown): NewEntryType | undefined {
  return value === entryParam.task ? "task" : parseFormTypeParam(value);
}

export function newTransactionHref(type: NewEntryType) {
  return `/islemler/yeni?tur=${entryParam[type]}`;
}
