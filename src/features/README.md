# Feature modülleri

Pickaly feature (dikey modül) bazlı düzenlenir (TECH_STACK.md §2). Henüz modül yok; her modül ilk gerçek ihtiyaç doğduğunda oluşturulur.

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
