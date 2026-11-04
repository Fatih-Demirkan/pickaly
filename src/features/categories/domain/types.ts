import type { CategoryIconName } from "@/config/icons";

// Kategori modeli (TECH_STACK §5.2 categories, PRD DM-003). Her kategori tek bir türe aittir.

/** "subscription": Abonelik (tekrarlayan ödeme) kategorileri (TECH_STACK §5.2 categories.kind = recurring).
 *  "calendar": Görev / randevu kategorileri (categories.scope = calendar). */
export type CategoryType = "income" | "expense" | "subscription" | "calendar";

/** Kategori paleti (PRD §9.1, DESIGN §2.6): Pages → Kategori Ekle "Renk Paleti" sırası. */
export const CATEGORY_COLORS = ["teal", "blue", "violet", "pink", "orange", "amber", "green", "red", "slate"] as const;
export type CategoryColor = (typeof CATEGORY_COLORS)[number];

export type Category = {
  id: string;
  type: CategoryType;
  name: string;
  /** null: Pages'ta bu kategori için ikon görünmüyor; türün varsayılan ikonu kullanılır (PRD Q-23). */
  icon: CategoryIconName | null;
  color: CategoryColor;
  /** Kullanılmış kategori silinmez, arşivlenir (BR-CAT-002). Arşivli kategori yeni kayıtta seçilemez. */
  archived: boolean;
  /** Aylık bütçe limiti, kuruş; yalnızca gider kategorilerinde (PRD §9.1). */
  monthlyBudgetMinor?: bigint | null;
  note?: string | null;
};

/** Finans sekmesi türleri (Kategori Yönetimi "Harcama / Gelir"). */
export const FINANCE_TYPES: readonly CategoryType[] = ["income", "expense", "subscription"];
