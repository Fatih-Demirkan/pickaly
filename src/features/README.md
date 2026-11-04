# Feature modülleri

Pickaly feature (dikey modül) bazlı düzenlenir (TECH_STACK.md §2). Her modül ilk gerçek ihtiyaç doğduğunda oluşturulur.

Mevcut modüller: `transactions` (İşlemler liste / detay / Gelir-Gider-Abonelik formu, Tekrar Eden İşlem), `payments` (Abonelik: tekrarlayan ödemeler, Ödeme Detayı, Yaklaşan Ödemeler), `categories`, `accounts`, `savings` (Birikimler: hesaplar, Para ekle / Çek, düzenli katkı), `dashboard` (Ana Sayfa), `calendar` (Takvim: görev ve randevular, Kayıt Detayı, Görev Ekle / Düzenle).
Şimdilik **yerel örnek veri** kullanırlar (`data/mock-*.ts`, sunucu belleği; yeniden başlatınca sıfırlanır).
Supabase geldiğinde yalnızca `server.ts` içindeki repository değişir.

## Genel arayüz
- `index.ts`: istemcide de kullanılabilen tipler ve bileşenler.
- `server.ts`: sunucu tarafı veri erişimi (`server-only`).
- Başka modül yalnızca bu iki dosyayı import eder. İstisna: `dashboard` gibi birden çok modülü bir araya getiren ekranlar, sayfalar gibi diğer modüllerin `components/` altındaki ekran parçalarını (ör. `UpcomingPayments`) doğrudan yerleştirebilir.

Planlanan modüller: `dashboard`, `calendar`, `transactions`, `savings`, `reports`, `accounts`, `categories`, `reminders`, `settings`, `auth`.

## Bir modülün yapısı
```
features/<modül>/
├─ components/   # yalnızca bu modüle ait UI (veriyi prop olarak alır)
├─ hooks/        # veri hook'ları (TanStack Query)
├─ data/         # Supabase sorguları ve RPC çağrıları (repository)
├─ domain/       # SAF TypeScript: hesaplar, kurallar, biçimler (React/Next/Supabase import etmez)
└─ schemas.ts    # Zod doğrulama şemaları
```

## Kurallar
- Bir modül başka bir modülün iç dosyalarını import etmez. Ortak kod `src/lib/` veya `src/components/ui/` altına çıkar.
- `src/components/ui` hiçbir modülü bilmez.
- Sayfalar (`src/app/**/page.tsx`) yalnızca veri yükler ve modül bileşenlerini yerleştirir.
- Metinler `src/locales/*.json`, ikonlar `src/config/icons.ts`, renk/ölçüler token sınıfları üzerinden gelir.
