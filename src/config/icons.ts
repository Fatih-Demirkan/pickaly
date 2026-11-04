import {
  BellRing,
  Calendar1,
  ChartBarStacked,
  CircleDollarSign,
  Download,
  LogOut,
  ArrowDown,
  ArrowLeft,
  ArrowRightLeft,
  ArrowUp,
  BadgeCheck,
  BanknoteArrowDown,
  BanknoteArrowUp,
  Birdhouse,
  Bell,
  BriefcaseMedical,
  Calendar,
  CalendarCheck,
  CalendarClock,
  Check,
  CheckCheck,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Clock,
  Coffee,
  Copy,
  Car,
  CreditCard,
  CreditCardCheck,
  File,
  FileText,
  Save,
  Share2,
  Fuel,
  Gift,
  HandCoins,
  Heart,
  Hash,
  Hospital,
  House,
  Info,
  Languages,
  MapPin,
  Minus,
  NotebookPen,
  OctagonAlert,
  PawPrint,
  Pencil,
  Plus,
  ReceiptText,
  Repeat,
  Scroll,
  StickyNote,
  ScrollText,
  Search,
  ShoppingCart,
  SquareArrowOutUpRight,
  Store,
  Timer,
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
  // İşlemler, İşlem Detayı ve Yeni İşlem ekranları (Pages)
  previous: ChevronLeft,
  next: ChevronRight,
  dropdown: ChevronDown,
  switch: ChevronsUpDown,
  time: Clock,
  trendUp: ArrowUp,
  trendDown: ArrowDown,
  paymentMethod: CreditCard,
  receipt: ReceiptText,
  store: Store,
  openExternal: SquareArrowOutUpRight,
  note: ScrollText,
  code: Hash,
  copy: Copy,
  info: Info,
  // Abonelik, Ödeme Detayı ve Ana Sayfa "Yaklaşan Ödemeler" (Pages)
  payments: HandCoins,
  paid: BadgeCheck,
  // Ana Sayfa (Pages): Hızlı Aksiyonlar, Bugünün Akışı, Toplam Bakiye kartı
  subtract: Minus,
  task: CheckCheck,
  payment: CreditCardCheck,
  agenda: CalendarClock,
  today: CalendarCheck,
  // Takvim ve Kayıt Detayı (Pages)
  location: MapPin,
  description: File,
  notes: StickyNote,
  reminder: Timer,
  // Birikimler (Pages): Aylık Rapor, Para ekle / Çek, hesap kartı ikonları
  report: FileText,
  transfer: ArrowRightLeft,
  emergency: OctagonAlert,
  savingsHome: Birdhouse,
  // Aylık Finans Raporu ve Paylaşılabilir Rapor (Pages): paylaş, PDF indir
  share: Share2,
  save: Save,
  // Profil ve Ayarlar (Pages) satır ikonları
  categories: ChartBarStacked,
  reminders: BellRing,
  currencySetting: CircleDollarSign,
  weekStart: Calendar1,
  download: Download,
  logout: LogOut,
} satisfies Record<string, LucideIcon>;

export type AppIconName = keyof typeof appIcons;

/**
 * Kullanıcının kategori için seçebileceği ikonlar (Kategori Ekle → "İkon Seçimi").
 * GEÇİCİ başlangıç seti: yalnızca Pages'taki kategori satırlarında görülen ikonlar.
 * Nihai 40–60 ikonluk küratörlü liste DESIGN.md'ye eklendiğinde burası güncellenir (PRD Q-23, UX-004).
 * Veritabanında ikon, aşağıdaki anahtar (Lucide adı) olarak saklanır (TECH_STACK §5.2 categories.icon).
 */
export const categoryIcons = {
  // Pages → Kategori Ekle "İkon Seçimi" ızgarası (birdhouse, ev, araba, kahve, sağlık, kalp, fatura, cüzdan, hediye, pati)
  birdhouse: Birdhouse,
  car: Car,
  coffee: Coffee,
  "briefcase-medical": BriefcaseMedical,
  heart: Heart,
  "receipt-text": ReceiptText,
  wallet: Wallet,
  gift: Gift,
  "paw-print": PawPrint,
  "shopping-cart": ShoppingCart,
  store: Store,
  zap: Zap,
  wifi: Wifi,
  fuel: Fuel,
  house: House,
  hospital: Hospital,
  "notebook-pen": NotebookPen,
} satisfies Record<string, LucideIcon>;

export type CategoryIconName = keyof typeof categoryIcons;

export function isCategoryIconName(value: string): value is CategoryIconName {
  return value in categoryIcons;
}
