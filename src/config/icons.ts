import {
  ArrowLeft,
  BanknoteArrowDown,
  BanknoteArrowUp,
  Bell,
  Calendar,
  Check,
  Fuel,
  House,
  Languages,
  Pencil,
  Plus,
  Repeat,
  Scroll,
  Search,
  ShoppingCart,
  Store,
  Trash,
  TurkishLira,
  UserRound,
  UserRoundCog,
  Wallet,
  Wifi,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react";

// Pickaly ikon kayıt defteri. Tek ikon kütüphanesi: Lucide (DESIGN.md §7).
// Kural: Bileşenler ikonları doğrudan "lucide-react"tan değil, buradaki KAVRAM adlarıyla kullanır.
// Böylece aynı işlev uygulamanın her yerinde aynı ikonla gösterilir (PRD UX-006).
// Eşleşmeler DESIGN.md §7.3 tablosundan ve Pages'ta kullanılan ikonlardan alınmıştır.

export const appIcons = {
  // Navigasyon (DESIGN §7.3)
  home: House,
  calendar: Calendar,
  transactions: Scroll,
  savings: Wallet,
  profile: UserRound,
  // Header aksiyonları (Pages: Header)
  search: Search,
  notifications: Bell,
  account: UserRoundCog,
  // Finans kavramları (DESIGN §7.3)
  income: BanknoteArrowUp,
  expense: BanknoteArrowDown,
  currency: TurkishLira,
  repeat: Repeat,
  // Genel aksiyonlar (DESIGN §7.3, Pages)
  add: Plus,
  edit: Pencil,
  delete: Trash,
  confirm: Check,
  close: X,
  back: ArrowLeft,
  language: Languages,
} satisfies Record<string, LucideIcon>;

export type AppIconName = keyof typeof appIcons;

/**
 * Kullanıcının kategori için seçebileceği ikonlar (Kategori Ekle → "İkon Seçimi").
 * GEÇİCİ başlangıç seti: yalnızca Pages'taki kategori satırlarında görülen ikonlar.
 * Nihai 40–60 ikonluk küratörlü liste DESIGN.md'ye eklendiğinde burası güncellenir (PRD Q-23, UX-004).
 * Veritabanında ikon, aşağıdaki anahtar (Lucide adı) olarak saklanır (TECH_STACK §5.2 categories.icon).
 */
export const categoryIcons = {
  "shopping-cart": ShoppingCart,
  store: Store,
  zap: Zap,
  wifi: Wifi,
  fuel: Fuel,
  house: House,
} satisfies Record<string, LucideIcon>;

export type CategoryIconName = keyof typeof categoryIcons;

export function isCategoryIconName(value: string): value is CategoryIconName {
  return value in categoryIcons;
}
