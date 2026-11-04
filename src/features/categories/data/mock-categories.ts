import "server-only";
import type { Category } from "../domain/types";

// GEÇİCİ YEREL ÖRNEK VERİ — gerçek kullanıcı verisi değildir; Supabase bağlanınca kaldırılır.
// Veriler sunucu belleğinde tutulur: sunucu yeniden başlayınca örnek verilere döner.
// Kategori adları Pages → "Yeni İşlem / Gelir", "/ Gider" ve "/ Abonelik" Kategori Seçimi listesinden alınmıştır.
// Abonelik: Pages listesinde "Abonelik" iki kez görünüyor; PRD §6.2 listesi esas alındı (tek "Abonelik").
// [Varsayım] Abonelik kategorilerinin renkleri: Kira / Ev ve Fatura Ana Sayfa "Yaklaşan Ödemeler" ile Ödeme Detayı
// örneklerinden (ev yeşil, fatura turuncu, internet mavi); diğerleri Genel.
// İkonu Pages'ta görünmeyen kategorilerde icon: null (türün varsayılan ikonu) kullanılır.

const seeds: Category[] = [
  { id: "cat-market", type: "expense", name: "Market", icon: "shopping-cart", color: "orange", archived: false },
  { id: "cat-food", type: "expense", name: "Yemek", icon: null, color: "orange", archived: false },
  { id: "cat-bills", type: "expense", name: "Fatura", icon: "zap", color: "orange", archived: false },
  { id: "cat-transport", type: "expense", name: "Ulaşım", icon: "fuel", color: "blue", archived: false },
  { id: "cat-gift-out", type: "expense", name: "Hediye", icon: null, color: "pink", archived: false },
  { id: "cat-other-out", type: "expense", name: "Diğer", icon: null, color: "slate", archived: false },
  { id: "cat-salary", type: "income", name: "Maaş", icon: null, color: "green", archived: false },
  { id: "cat-freelance", type: "income", name: "Freelance / Ek İş", icon: "notebook-pen", color: "green", archived: false },
  { id: "cat-investment", type: "income", name: "Yatırım Getirisi", icon: null, color: "green", archived: false },
  { id: "cat-rent", type: "income", name: "Kira Geliri", icon: "house", color: "green", archived: false },
  { id: "cat-gift-in", type: "income", name: "Hediye", icon: null, color: "pink", archived: false },
  { id: "cat-other-in", type: "income", name: "Diğer", icon: null, color: "slate", archived: false },
  { id: "cat-sub-home", type: "subscription", name: "Kira / Ev", icon: "house", color: "green", archived: false },
  { id: "cat-sub-bills", type: "subscription", name: "Fatura", icon: "zap", color: "orange", archived: false },
  { id: "cat-sub-dues", type: "subscription", name: "Aidat", icon: null, color: "slate", archived: false },
  { id: "cat-sub-digital", type: "subscription", name: "Abonelik", icon: "wifi", color: "blue", archived: false },
  { id: "cat-sub-loan", type: "subscription", name: "Kredi / Borç", icon: null, color: "slate", archived: false },
  { id: "cat-sub-other", type: "subscription", name: "Diğer", icon: null, color: "slate", archived: false },
  // Görev / Takvim kategorileri: Pages → Takvim ajandası ve Kayıt Detayı ("Sağlık", "Ev İhtiyaçları").
  // [Varsayım] "İş" kategorisi ve renkler örnek veridir.
  { id: "cat-cal-health", type: "calendar", name: "Sağlık", icon: "hospital", color: "green", archived: false },
  { id: "cat-cal-work", type: "calendar", name: "İş", icon: null, color: "blue", archived: false },
  { id: "cat-cal-home", type: "calendar", name: "Ev İhtiyaçları", icon: "shopping-cart", color: "orange", archived: false },
];

const store = globalThis as typeof globalThis & { __pickalyMockCategories?: Category[] };

/** Değiştirilebilir örnek kategori listesi (Kategori Yönetimi ile eklenir, düzenlenir, arşivlenir). */
export function mockCategories(): Category[] {
  store.__pickalyMockCategories ??= seeds.map((category) => ({ ...category }));
  return store.__pickalyMockCategories;
}
