# Pickaly – Teknik Altyapı ve Mimari

> **Sürüm:** 2.1.
> - Sürüm 2: Açık kararların tamamı kapatıldı (§12, Karar Kaydı). Mobil plan güncellendi (§10).
> - Sürüm 2.1: Token ve sınıf adları [DESIGN.md](DESIGN.md) adlandırmasına hizalandı (Ç-8).
> - Sürüm 2.2: [PRD.md](PRD.md) ile uyum. V1'de TR + EN (D-31, D-20'nin revizyonu), mobil = ileride Expo ile iOS + Android (D-28a).
> - Sürüm 2.3: Veri modeli (§5.2, §5.4, §5.6) ve RPC listesi (§4.1) PRD ürün kararlarına (Q-1…Q-24) göre güncellendi. `notifications` tablosu eklendi.
> - Sürüm 2.4: Dile bağlı biçimlendirme (§3.4), hukuki metinlerin yayın engeli olduğu (§6.6, R5), CI'da kabul kriteri kontrolleri (§9.2), D-25'e tüm gün hatırlatma saati.
> - Sürüm 2.5: Kategori arşivleme (D-32, §5.2, §5.6, §4.1). Kurulum planı (§13, D-33): onay noktaları, ortam ayrımı, ortam değişkenleri ve sırlar, güvenlik/RLS kontrol listesi, test verisi politikası, bölge ve KVKK notu.
> - Sürüm 2.6: Kurulum ilerlemesi (S-1…S-3). Branch koruması tek geliştiriciye göre güncellendi (§9.1: PR zorunlu, onay 0).
> - Sürüm 2.7: S-4 ve S-5 tamamlandı. Production bölgesi eu-west-1 (D-21a).
> - Sürüm 2.8: Phase 1 (proje altyapısı) uygulama notları ve plandan sapmalar (§14).
> - Sürüm 2.9: Phase 2 (UI bileşenleri, navigasyon, rota iskeletleri) notları (§14.1).
> **Durum:** Mimari analiz dokümanı. Kod, paket kurulumu veya proje iskeleti içermez.
> **İlgili doküman:** [RESPONSIVE.md](RESPONSIVE.md)
> **Tasarım kaynağı:** Figma `Fatih-Test` dosyasının yalnızca **Pages** ve **Components** sekmeleri. AI Pages kapsam dışıdır.

**Kapsam:** Bu doküman yalnızca **responsive web uygulamasını** (mobil, tablet, masaüstü) kapsar. iOS ve Android uygulamaları **çok ileri bir aşamada Expo ile** yapılacak. Şimdiki mimari bunun için yeniden şekillendirilmez. Yalnızca maliyetsiz ve engel oluşturmayan hazırlıklar yapılır (§10).

**İşaretler**

| İşaret | Anlamı |
|---|---|
| **[Öneri]** | Teknik öneri |
| **[Karar D-n]** | Kesinleşmiş karar. Gerekçesi Karar Kaydı'nda (§12) |
| **[Risk]** | Dikkat edilmesi gereken teknik/ürün riski |
| **[Eksik]** | Pages/Components'ta tasarımı bulunmayan ekran veya akış |
| **[Hukuki]** | Teknik olarak karar verilemeyen, hukuki görüş gerektiren konu |

---

## 0. Yönetici Özeti

Önerilen stack, yani Next.js + React + TypeScript + Tailwind CSS + Supabase/PostgreSQL + Supabase Auth + GitHub + Vercel, Pickaly için **uygundur ve olduğu gibi onaylanmıştır.**

**Temel mimari kararlar:**
1. **İş kuralları PostgreSQL'de** tutulur: kısıtlar, RPC fonksiyonları, view'lar ve RLS. Next.js arayüzü ve sunum katmanıdır. Bu, ileride hangi istemci gelirse gelsin backend'in değişmeden kullanılmasını sağlar (§4.1).
2. **Para tutarları kuruş cinsinden tam sayı (`bigint`)** olarak saklanır. Zamanlar `timestamptz` tipindedir (§5.3).
3. **Design token'lar tek bir JSON kaynağından** üretilir. Akış tek yönlüdür: Figma → JSON → CSS değişkenleri / Tailwind (§8).
4. **Tek uygulamalı repo** kullanılır. Klasörler katmanlı tutulur, monorepo'ya bölünmesi gerekirse mekanik bir taşımayla yapılabilir (§2).
5. **Veri bölgesi AB'dir:** staging Frankfurt (eu-central-1), production İrlanda (eu-west-1) [D-21a]. Vercel fonksiyonları her ortamda kendi veritabanına yakın çalışır (§6.6).

**İlk sürümü (v1.0) şekillendiren ürün kararları:**

| Konu | v1.0'daki karşılığı |
|---|---|
| Giriş | E-posta + şifre. Doğrulama ve şifre sıfırlama **6 haneli kod (OTP)** ile [D-1] |
| Hatırlatmalar | **Uygulama içi.** Push bildirim v1.1 [D-3] |
| "Hemen öde" butonu | **Kaldırılır.** Tek aksiyon "Ödendi olarak işaretle" [D-5] |
| Çevrimdışı kullanım | **Online-first.** Yalnızca uygulama kabuğu önbelleklenir [D-7] |
| PIN / biyometrik kilit | Yok [D-4] |
| Silme | Onaylı **kalıcı silme** [D-10] |

---

## 1. Teknoloji Seçimi ve Gerekçeleri

### 1.1 Ana stack

| Katman | Tercih | Gerekçe |
|---|---|---|
| Framework | **Next.js (App Router)** | Server Components ile hızlı ilk yükleme. Route grupları ve layout'lar, AppShell'in (alt pill nav / rail / sidebar) yapısına doğal oturuyor. Parallel + intercepting routes, "mobilde tam sayfa, masaüstünde drawer/panel" davranışını URL'yi koruyarak çözüyor. |
| UI | **React** | Next.js ile birlikte gelen tercih. |
| Dil | **TypeScript (strict)** | Supabase şemasından tip üretimi ile uçtan uca tip güvenliği. |
| Styling | **Tailwind CSS v4** | CSS-first `@theme` yapısı token entegrasyonuna uygun. **Koşul:** Varsayılan renk paleti kapatılır, yalnızca Pickaly token'ları kullanılır (§8). |
| Backend / DB | **Supabase + PostgreSQL** | İlişkisel veri, RLS, Storage, Realtime, Edge Functions ve `pg_cron` tek platformda. PostgreSQL taşınabilir; vendor lock-in orta seviyede. |
| Auth | **Supabase Auth** | RLS ile doğrudan entegre (`auth.uid()`). |
| VCS | **Git + GitHub** | GitHub Actions ile CI. |
| Deployment | **Vercel** | Next.js için birinci sınıf destek, PR başına preview. |

### 1.2 Tamamlayıcı kütüphaneler ve araçlar

| İhtiyaç | Seçim | Gerekçe |
|---|---|---|
| Paket yöneticisi | **pnpm** | Hızlı, katı bağımlılık çözümü |
| Supabase istemcisi | **`@supabase/supabase-js` + `@supabase/ssr`** | Next.js'te cookie tabanlı oturum |
| Sunucu verisi | **TanStack Query** | Önbellek, optimistic update, Realtime sonrası yenileme |
| URL durumu | **nuqs** | Filtre, sekme ve seçili kayıt için tip güvenli `searchParams` |
| Form | **React Hook Form + Zod** | Uzun formlar. Aynı Zod şeması istemci ve sunucuda kullanılır |
| Erişilebilir primitive'ler | **Radix UI** | Dialog, Popover, Dropdown, Tabs, Switch. Görsel katman tamamen Pickaly token'larıyla yazılır |
| Bottom sheet | **Vaul** | Mobil seçiciler, hesap menüsü ve silme onayı (RESPONSIVE Karar #6, #7) |
| Tarih | **date-fns** + `@date-fns/tz` | Türkçe yerel ayar, Pazartesi hafta başı, "3 gün kaldı" gibi göreli hesaplar |
| Tarih seçici tabanı | **react-day-picker** | Stilsiz taban, Takvim ay matrisi görsel diliyle stillenir |
| Toast | **Sonner** | Hafif, erişilebilir, stillenebilir |
| PWA | **Serwist** (`@serwist/next`) | Figma'daki PWA notunda geçen `next-pwa` bakım almıyor, Serwist onun güncel karşılığı |
| i18n | **next-intl** | v1.0'da **Türkçe (varsayılan) + İngilizce** [D-31]. Tüm metinler çeviri anahtarıyla yazılır, iki dil eksiksiz olmadan yayın yapılmaz |
| Paylaşım görseli | **html-to-image** + Web Share API | Paylaşılabilir Rapor kartı [D-11] |
| CSV dışa aktarma | **papaparse** (veya yerleşik yazıcı) | "JSON / Excel formatında" satırı [D-17] |
| Test | **Vitest**, **Playwright**, **pgTAP** | Birim, E2E (4 viewport), RLS testleri |
| Kod kalitesi | ESLint (katman kuralları dahil), Prettier, Husky + lint-staged | |
| Token üretimi | **Style Dictionary** | JSON → CSS değişkenleri |
| Hata izleme | **Sentry** [D-9] | Next.js istemci + sunucu. Loglarda kişisel veri yok (§6.6) |

**Bilinçli olarak kullanılmayanlar:**

| Araç | Gerekçe |
|---|---|
| Grafik kütüphanesi | Pages'taki tüm grafikler oranlı yatay çubuk. CSS ile çizilir. |
| Global state kütüphanesi (Redux vb.) | Bkz. §7. |
| ORM (Prisma/Drizzle) | Sorgular kullanıcı oturumuyla yapılmalı ki RLS çalışsın. ORM'ler genelde servis bağlantısıyla çalışır ve RLS'i atlama riski taşır. Migration'lar SQL ile Supabase CLI üzerinden yönetilir. |
| Monorepo araçları (Turborepo vb.) | Şu an tek uygulama var. Gerekirse ileride eklenir (§10.3). |

---

## 2. Proje Klasör Yapısı

```
pickaly/
├─ src/
│  ├─ app/                          # Next.js App Router – YALNIZCA routing, layout, sayfa kompozisyonu
│  │  ├─ (auth)/                    # giris · kayit · dogrulama · sifremi-unuttum   [Eksik: tasarım yok]
│  │  ├─ (app)/                     # oturum gerektiren alan – AppShell
│  │  │  ├─ layout.tsx
│  │  │  ├─ page.tsx                # Ana Sayfa
│  │  │  ├─ takvim/                 # ?gorunum=aylik|haftalik|gunluk ; görevler burada
│  │  │  ├─ islemler/               # liste · [id] · yeni (?tur=gelir|gider|abonelik)
│  │  │  ├─ birikimler/             # liste · [id] · yeni
│  │  │  ├─ raporlar/[donem]/       # Aylık Finans Raporu · paylas
│  │  │  └─ profil/                 # ayarlar · kategoriler · hatirlatmalar · hesap-sil
│  │  ├─ @drawer/                   # parallel route: formlar ve detaylar için drawer slotu
│  │  ├─ api/                       # yalnızca zorunlu Route Handler'lar (export)
│  │  ├─ manifest.ts                # PWA manifest (#F5F6F7, DESIGN_SYSTEM_PICKALY §7)
│  │  └─ layout.tsx                 # kök: font, tema, provider'lar
│  │
│  ├─ features/                     # dikey modüller
│  │  ├─ transactions/              # gelir · gider · tekrarlayan ödemeler
│  │  │  ├─ components/             # feature'a özel UI
│  │  │  ├─ hooks/                  # TanStack Query hook'ları
│  │  │  ├─ data/                   # repository: Supabase sorguları ve RPC çağrıları
│  │  │  ├─ domain/                 # SAF TypeScript: hesaplar, kurallar, biçimler
│  │  │  └─ schemas.ts              # Zod şemaları
│  │  ├─ calendar/                  # görevler · randevular · ajanda
│  │  ├─ savings/
│  │  ├─ reports/
│  │  ├─ accounts/
│  │  ├─ categories/
│  │  ├─ reminders/                 # uygulama içi hatırlatmalar · bildirim paneli
│  │  ├─ settings/
│  │  └─ auth/
│  │
│  ├─ components/
│  │  ├─ ui/                        # tasarım sistemi bileşenleri (Figma isimleriyle)
│  │  └─ layout/                    # AppShell · BottomNav · NavRail · Sidebar · TopBar · PageHeader
│  │
│  ├─ lib/
│  │  ├─ supabase/                  # client.ts · server.ts · middleware.ts
│  │  ├─ money.ts                   # kuruş ↔ gösterim (tr-TR, TRY)
│  │  ├─ dates.ts                   # saat dilimi, hafta başı, göreli zaman
│  │  └─ query-client.ts
│  │
│  ├─ i18n/tr.json · en.json        # tüm arayüz metinleri (TR varsayılan) [D-31]
│  ├─ styles/
│  │  ├─ globals.css                # Tailwind girişi, @theme
│  │  └─ tokens.css                 # ÜRETİLEN – elle düzenlenmez
│  ├─ types/database.ts             # ÜRETİLEN – `supabase gen types`
│  └─ middleware.ts                 # oturum yenileme, korumalı rota yönlendirmesi
│
├─ tokens/                          # design token KAYNAĞI (DTCG JSON)
│  ├─ primitives.json
│  ├─ semantic.light.json
│  ├─ layout.json
│  └─ typography.json
│
├─ supabase/
│  ├─ migrations/                   # sıralı SQL migration'lar – tek doğruluk kaynağı
│  ├─ functions/                    # Edge Functions (export, hesap silme, v1.1'de push)
│  ├─ tests/                        # RLS ve fonksiyon testleri (pgTAP)
│  ├─ seed.sql                      # yerel geliştirme verisi (Pages'taki örnek veriler)
│  └─ config.toml
│
├─ public/                          # PWA ikonları (192, 512, maskable), apple-touch-icon
├─ tests/e2e/                       # Playwright: 390 · 834 · 1280 · 1440
├─ .github/workflows/
├─ .env.example
├─ RESPONSIVE.md
└─ TECH_STACK.md
```

**Katman kuralları (ESLint ile zorlanır):**

```
app/ → features/*/components → features/*/hooks → features/*/data → lib/supabase
                 ↓                                     ↓
           components/ui                    features/*/domain  (saf TS, hiçbir şeye bağımlı değil)
```
- `domain/` React, Next.js veya Supabase import edemez.
- Bir feature, başka bir feature'ın iç dosyalarını import edemez. Ortak kod `lib/` veya `components/ui/` altına çıkar.
- `components/ui` hiçbir feature'ı bilmez.

---

## 3. Frontend Mimarisi ve Component Yaklaşımı

### 3.1 Render ve veri stratejisi

| Durum | Yaklaşım |
|---|---|
| Sayfanın ilk verisi | **Server Component.** Sunucu Supabase istemcisi kullanıcı oturumuyla çalışır, RLS aktiftir |
| Etkileşimli listeler, filtreler, tek dokunuşluk aksiyonlar | **Client Component** + TanStack Query. İlk veri sunucudan gelir |
| Basit CRUD | Supabase istemcisi ile doğrudan, RLS korumalı |
| Çok adımlı iş kuralları | **PostgreSQL RPC** (§4.1) |
| Yalnızca web'e özgü işler (export) | Route Handler / Edge Function |
| Korumalı rotalar | `middleware.ts` oturumu yeniler, `(app)` layout'u oturum yoksa `/giris`'e yönlendirir |

### 3.2 Component katmanları

| Katman | Kapsam | Kural |
|---|---|---|
| **UI** (`components/ui`) | Components'taki bileşenler: `Button` (Size LG/SM × State Primary/Secondary/Tertiary/Destructive), `Chip` (Görev/Ödeme/Genel/Yeşil/Turuncu), `Chip-Kategori` (on/off), `Nav Bar Buttons`, `Floating-Button`, SegmentedControl, Card | Figma isim ve varyantlarıyla birebir eşleşir, ör. `<Button size="lg" variant="destructive">`. Yalnızca token kullanır. "Button-test"in kodda karşılığı yoktur. |
| **UI – eksikler** [Eksik] | Input, Textarea, Switch, Select tetikleyici, Drawer, Modal, BottomSheet, Popover, Toast, DatePicker, TimePicker, OtpInput | RESPONSIVE.md §8 önerilerine göre token'larla kurulur. Tasarım gelince güncellenir. |
| **Layout** (`components/layout`) | AppShell, BottomNav, NavRail, Sidebar, TopBar, PageHeader | Navigasyon öğeleri tek bir yapılandırma dizisinden gelir |
| **Feature** (`features/*/components`) | BalanceCard ("Section - 1. Ana Finansal Odak"), QuickActions, SavingsGoalCard ("Birikim Hedefi"), TransactionRow, AgendaCard | Veriyi prop olarak alır. Veri çekmez. |
| **Sayfa** (`app/**/page.tsx`) | Ekranlar | Yalnızca veri yükler ve feature bileşenlerini yerleştirir |

**Bileşen içi responsive:** Container query (`@container`) ile yapılır. Böylece aynı detay içeriği 480 px drawer'da ve tam sayfada doğru dizilir.

### 3.3 Odak ekranları ve routing

- **URL'ler:** Her detay ve formun kendi URL'si vardır: `/islemler/[id]`, `/islemler/yeni?tur=abonelik`, `/takvim/yeni?tur=gorev`.
- **Davranış:** Liste içinden açılan kayıt `@drawer` slotunda görünür (intercepting route). Doğrudan URL ile açılırsa tam sayfa görünür.
- **`Drawer` bileşeni:** Mobilde tam ekran, tablet ve üstünde 480 / 560 px sağ panel. İşlemler ≥1280 px'de detay satır içi paneldir, `?secili=` parametresi ile yönetilir.
- **Filtreler URL'de:** `?ay=2026-05&tur=gider&kategori=market`. Paylaşılabilir ve geri tuşuyla uyumlu.
- **[Risk] Intercepting route'lar:** Next.js'in karmaşık özelliklerinden. Geliştirmenin ilk haftasında prototiple doğrulanır. Sorun çıkarsa URL parametresiyle kontrol edilen drawer'a geçilir.

### 3.4 Biçimlendirme

| Tür | Örnek | Kural |
|---|---|---|
| Para | TR "24.850,00 ₺", EN "₺24,850.00" | `Intl.NumberFormat(locale, { style: 'currency', currency })`, `locale` kullanıcının diline göre `tr-TR` veya `en` [D-31, PRD Q-22]. İşaretli gösterim tek bir yardımcıda. Tarih biçimleri de aynı şekilde dile bağlı |
| Tarih | "16 Mayıs Perşembe", "14 Mayıs 2026, Salı • 15:42", "3 gün kaldı", "(4 ay önce)" | `lib/dates.ts` içinde merkezi |
| Yüzde | "%75", "%59,2" | İşaret başta, virgüllü ondalık |

---

## 4. Supabase Veritabanı ve Authentication Mimarisi

### 4.1 İlkeler

1. **Schema-first, migration-only.** Tüm şema değişiklikleri `supabase/migrations/*.sql` ile yapılır. Dashboard'dan elle değişiklik yapılmaz. Tipler `supabase gen types` ile üretilir.
2. **Veri bütünlüğü veritabanında:** `NOT NULL`, `CHECK`, `FOREIGN KEY` ve enum'lar. Hatalı veri istemciden gelse bile reddedilir.
3. **Çok adımlı iş kuralları RPC'de.** Varsayılan `SECURITY INVOKER`, yani RLS'e tabi:

| RPC | Ne yapar |
|---|---|
| `mark_payment_paid(occurrence_id, amount_minor?, paid_on?)` | Ödemeyi "ödendi" yapar, gider işlemini oluşturur, hesaba bağlar. Tutar/tarih isteğe bağlı değiştirilebilir [PRD Q-16] |
| `undo_mark_payment_paid(occurrence_id)` | "Geri al" [D-18] |
| `complete_task(id)` / `reopen_task(id)` | Görev durumunu değiştirir |
| `savings_move(savings_account_id, direction, quantity, amount_minor?, account_id?)` | Birikime ekleme/çekme. TRY tutarı girildiyse hesap bakiyesine yansır [PRD Q-18]. "Ana hesabınızdan anında aktarılır" [Figma] |
| `transfer_between_accounts(from, to, amount_minor)` | Hesaplar arası aktarım [PRD FR-FIN-020] |
| `archive_category(id)` / `restore_category(id)` | Kullanılmış kategoriyi arşivler / geri alır. Son aktif kategori kontrolü [PRD BR-CAT-002, 003, 005] |
| `delete_category(id)` | Yalnızca hiç kullanılmamış kategoriyi siler; kullanılmışsa hata döner [PRD BR-CAT-004] |
| `close_savings_account(id, transfer_to_account_id?)` | Birikim kapatma [PRD Q-15] |
| `generate_occurrences(horizon)` | Tekrarlayan kayıtları ileriye dönük üretir [D-27] |
| `monthly_report(month)` | Aylık Finans Raporu metrikleri |
| `delete_my_account()` | Hesap silme, Edge Function ile birlikte [D-10] |

4. **Hesaplanan değerler saklanmaz.** Bakiye, net değişim, tasarruf oranı, tamamlanma yüzdesi ve "3 Aktif Hedef" sayısı view veya fonksiyonla hesaplanır [D-13]. Performans gerekirse özet tablo eklenir.
5. **Ortamlar:** `local` (Supabase CLI + Docker), `staging` (ayrı proje) ve `production` (ayrı proje) [D-8].

### 4.2 Şema organizasyonu

| Şema | İçerik |
|---|---|
| `auth` | Supabase yönetimli, doğrudan değiştirilmez |
| `public` | Uygulama tabloları. RLS zorunlu, API'ye açık |
| `private` | API'ye kapalı yardımcı fonksiyonlar ve zamanlanmış iş tabloları |
| `storage` | Fiş/belge dosyaları ve avatarlar |

### 4.3 Authentication [D-1, D-2]

| Konu | Karar |
|---|---|
| Giriş (v1.0) | **E-posta + şifre** |
| E-posta doğrulama ve şifre sıfırlama | **6 haneli kod (OTP).** Neden link değil: Uygulama ana ekrana eklenmiş PWA olarak açıkken e-postadaki bağlantı ayrı bir tarayıcı sekmesinde açılır, oturum PWA'ya geçmez. Kod girişinde bu sorun yok. |
| Sosyal giriş | v1.0'da **yok**. İleride eklenecekse **Google ve Apple birlikte** eklenir. Mobil mağazalarda Google varsa Apple girişi zorunludur. |
| Şifre kuralı | En az 8 karakter. Supabase sızdırılmış şifre kontrolü açık (plan destekliyorsa) |
| Oturum | `@supabase/ssr` ile HttpOnly cookie. `middleware.ts` token'ı yeniler |
| Profil kaydı | `auth.users` oluşunca trigger ile `profiles` ve `user_settings` satırları açılır. Varsayılan "Ana Hesap" ve başlangıç kategorileri de bu trigger'la oluşturulur [D-29] |
| Çıkış | "Oturumu bu cihazda sonlandır" [Figma] → `signOut({ scope: 'local' })` |
| Hesap silme | Profil → Veri & Güvenlik altında. Onay + şifre/OTP ile yeniden doğrulama [D-10] |
| Ekranlar | Giriş, Kayıt, E-posta Doğrulama, Şifremi Unuttum ve Hesap Silme tasarımda yok [Eksik]. RESPONSIVE.md §8.2.8 önerisiyle kurulur |

**Üç ayrı güvenlik kavramı** (RESPONSIVE Karar #8):

| Kavram | v1.0 |
|---|---|
| Hesap kimlik doğrulaması | Supabase Auth, e-posta + şifre |
| Oturum güvenliği | Cookie, token yenileme, cihaz bazlı çıkış |
| Uygulama kilidi (PIN) | **Yok** [D-4]. Profil'deki satır v1.0'da gizlenir |

### 4.4 Storage

| Konu | Karar |
|---|---|
| Bucket'lar | `receipts` (İşlem Detayı "Fiş / Belge" [Figma]) ve `avatars` |
| Yol kuralı | `{user_id}/{entity_id}/{dosya}`. Storage RLS, yolun `auth.uid()` ile başlamasını şart koşar |
| Erişim | Bucket'lar private. Dosyalara kısa ömürlü imzalı URL ile erişilir |
| Kısıtlar | Dosya başına en fazla 10 MB. İzinli türler: PDF, JPEG, PNG, HEIC, WebP [D-30] |
| Silme | Kayıt silinince dosya da silinir (trigger + Edge Function) |

### 4.5 Realtime

| Alan | Realtime | Gerekçe |
|---|---|---|
| İşlemler, tekrarlayan ödemeler ve ödeme kayıtları, takvim kayıtları, birikimler | ✔ | Aynı kullanıcı birden fazla cihaz veya sekmede çalışabilir. Profil'deki "Senkronize" rozeti [Figma] bu beklentiyi yaratır. Olay gelince ilgili TanStack Query anahtarı geçersiz kılınır. |
| Kategoriler, ayarlar, raporlar | ✖ | Sayfa odağa gelince yeniden çekmek yeterli |

- Kullanıcı başına **tek kanal** açılır. Tablolar `user_id=eq.{uid}` filtresiyle dinlenir.

### 4.6 Hatırlatmalar [D-3, D-24, D-25]

**v1.0: Uygulama içi hatırlatma**
- Ana Sayfa'daki "Bugün: 3 Görev, 2 Ödeme bekliyor" özeti [Figma], Bugünün Akışı ve Yaklaşan Ödemeler.
- Header'daki bildirim ikonu **Bildirimler panelini** açar: zamanı gelmiş ve yaklaşan hatırlatmalar, vadesi yaklaşan ödemeler. İkonda okunmamış sayısı rozeti görünür.
  - [Eksik] Panel tasarımı yok, RESPONSIVE.md §8.2.9.
- **Veri modeli:** `reminders` tablosu baştan kurulur (hedef kayıt, tetiklenme zamanı, kanal, durum, okunma zamanı). Kayıtlar, kayıt bazındaki "Hatırlatma Bildirimi" seçimi [Figma] ile oluşturulur.

**v1.1: Web Push**
- `pg_cron` vadesi gelen hatırlatmaları seçer → Edge Function Web Push (VAPID) gönderir → `push_subscriptions` tablosuna kayıtlı cihazlara iletilir.
- Cihaz tablosu platformdan bağımsızdır (`platform` alanı). İleride mobil eklendiğinde şema değişmez.
- [Risk] iOS'ta Web Push yalnızca **ana ekrana eklenmiş PWA**'da çalışır. İzin yalnızca kullanıcı etkileşimiyle istenebilir. Reddedilen izin yeniden istenemez.

### 4.7 Veri dışa aktarma [D-17]

Profil'deki satır: "Verileri Yedekle & Dışa Aktar — JSON / Excel formatında" [Figma].

| Sürüm | Formatlar |
|---|---|
| v1.0 | **JSON** (tam yedek) + **CSV** (işlemler; Excel ile açılır, UTF-8 BOM ve `;` ayraçlı, Türkçe Excel uyumu) |
| v1.1 | **XLSX** |

- Üretim, kullanıcının kendi oturumuyla (RLS'li) çalışan bir Route Handler'da yapılır.

---

## 5. Veri Modelleri

> Varlıklar yalnızca **Pages ekranlarında görünen alanlardan** çıkarılmıştır. Kesin kolon adları ve tipleri migration yazımında netleşir.

### 5.1 Terimler

| Uygulamadaki terim | Anlamı | Tablo |
|---|---|---|
| **Abonelik** (Yeni İşlem sekmesi) | Kullanıcının kendi tekrarlayan ödeme yükümlülüğü: fatura, kira, aidat, dijital abonelik, kredi | `recurring_payments` |
| **Ödeme** (Hızlı Aksiyon, Ödeme Detayı) | Tekrarlayan ödemenin vadesi gelen tekil kaydı (Bekliyor / Ödendi) | `payment_occurrences` |
| Pickaly'nin ücretli planı | Monetizasyon | **Kapsam dışı**, tablo yok |

### 5.2 Varlıklar

| Varlık | Ekran kaynağı | Başlıca alanlar |
|---|---|---|
| **profiles** | Profil | `id` (= auth.users.id), `display_name`, `avatar_path` |
| **user_settings** | Profil → Uygulama Tercihleri | `currency` (TRY), `language` (tr, en) [D-31], `timezone` (cihazdan otomatik, varsayılan Europe/Istanbul) [PRD Q-21], `week_start` (1 = Pazartesi), `default_payment_reminder`, `default_task_reminder`, `all_day_reminder_time` (varsayılan 09:00) [PRD Q-6], `in_app_reminders_enabled` |
| **accounts** | "İşlem Yapılan Hesap", "Ana Hesap / Banka Kartı (••4821)", "Kredi Kartı" | `name`, `type` (cash, bank, credit_card), `last4`, `opening_balance_minor`, `currency`, `is_default`, `archived_at?` [PRD BR-ACC-001]. İşlemi olan hesap silinmez, arşivlenir. Ekran: Profil → Hesaplarım [PRD Q-10] |
| **categories** | Kategori Yönetimi, Kategori Ekle | `scope` (finance, calendar), `kind` (income, expense, recurring; yalnızca finance için), `name`, `icon` (lucide adı), `color` (Category token adı: teal, green, blue…), `monthly_budget_limit_minor`, `note`, `archived_at?` [PRD BR-CAT-002], `is_system_default` + `default_key` (varsayılan kategorinin çeviri anahtarı; kullanıcı adı değiştirince `null`) [PRD Q-24]. `(user_id, scope, kind, lower(name))` **aktif (arşivlenmemiş) kategoriler arasında** benzersiz (kısmi indeks) [PRD BR-DUP-003, BR-CAT-005] |
| **transactions** | İşlemler, İşlem Detayı, Yeni İşlem Gelir/Gider | `type` (income, expense, transfer), `title`, `amount_minor`, `currency`, `account_id`, `counter_account_id?` (transfer), `category_id` (**income/expense için NOT NULL** [PRD Q-11]), `occurred_at`, `note`, `merchant_name`, `merchant_location`, `source` (manual, recurring, payment, savings_transfer), `recurring_rule_id?`, `payment_occurrence_id?` |
| **transaction_attachments** | "Fiş / Belge" | `transaction_id`, `storage_path`, `file_name`, `mime_type`, `size_bytes` |
| **recurring_rules** | Gelir/Gider "Tekrar Eden İşlem" | `template` (tür, tutar, kategori, hesap, başlık), `recurrence`, `next_run_on`, `is_active` |
| **recurring_payments** | Yeni İşlem / Abonelik, Ödeme Detayı | `title`, `amount_minor`, `category_id` (NOT NULL [PRD Q-11]), `account_id`, `recurrence` (**null = tek seferlik ödeme** [PRD Q-8]), `reminder_offset`, `note`, `is_active` (duraklatma [PRD FR-FIN-019]) |
| **payment_occurrences** | Ödeme Detayı "Geçmiş Ödemeler", Ana Sayfa "Yaklaşan Ödemeler" | `recurring_payment_id`, `due_date`, `amount_minor`, `status` (pending, paid, skipped), `paid_at`, `paid_amount_minor?` (ödendi işaretlerken değiştirilen tutar [PRD Q-16]), `transaction_id?`. `(recurring_payment_id, due_date)` benzersiz [PRD BR-DUP-002] |
| **calendar_items** | Takvim, Görev Detayı, Bugünün Akışı | `kind` (task, appointment) [D-14], `title`, `description`, `priority` (low, normal, high) [D-15], `category_id`, `starts_at`, `duration_minutes`, `all_day`, `location_name`, `location_address`, `note`, `planned_expense_minor`, `status` (open, done), `completed_at`, `recurring_rule_id?` + `occurrence_date?` (tekrarlayan görev/randevu örnekleri [PRD FR-CAL-012, Q-7]) |
| **savings_accounts** | Birikimler, Birikim Hesabı Detayı, Yeni Birikim | `title`, `type` (gold, time_deposit, fund, fx, cash), `institution`, `unit` (TRY, piece, gram, ISO döviz kodu), `target_amount`, `target_date?` [PRD FR-SAV-010], `show_on_dashboard` [PRD Q-2], `opened_at`, `status` (active, closed), `closed_at?`, `note` |
| **savings_movements** | "Geçmiş Hareketler" | `savings_account_id`, `direction` (deposit, withdraw), `quantity` (hesabın biriminde, zorunlu), `amount_minor?` (TRY karşılığı; girilirse hesap bakiyesine yansır [PRD Q-18]), `occurred_at`, `account_id?` (kaynak/hedef hesap), `transaction_id?` |
| **reminders** | "Hatırlatma Bildirimi", "Zaman & Hatırlatma" | `target_type`, `target_id`, `fire_at`, `channel` (in_app; v1.1'de web_push), `status`, `read_at` |
| **notifications** | Header bildirim ikonu → Bildirimler paneli [D-24] | `type` (reminder, payment_due, budget_alert), `title_key` + `params` (iki dilde gösterim için çeviri anahtarı [D-31]), `target_type?`, `target_id?`, `reminder_id?`, `created_at`, `read_at?`. `reminders` tetiklenince ve bütçe aşılınca oluşturulur [PRD DM-012] |
| **push_subscriptions** | (v1.1) | `platform`, `endpoint`, `keys`, `user_agent`, `last_seen_at` |

**Tüm tablolarda ortak alanlar:**
- `id uuid`
- `user_id uuid not null default auth.uid()`
- `created_at`, `updated_at` (trigger ile)

Soft delete kullanılmaz [D-10].

### 5.3 Para ve miktar

| Kural | Ayrıntı |
|---|---|
| Para birimi tipi | `bigint`, **kuruş**. 24.850,00 ₺ → `2485000`. JavaScript'te float ile para hesabı yapılmaz |
| İşaret | Tutar her zaman pozitif saklanır. Yön `type` alanından gelir |
| Para birimi alanı | Her parasal satırda `currency` (ISO 4217) bulunur. v1.0'da yalnızca TRY |
| Miktar birimli birikimler | "25 Adet, Hedef: 100 Adet" [Figma] gibi altın ve döviz hesapları `numeric(18,4)` **miktar** olarak tutulur. TL karşılığı v1.0'da **gösterilmez** [D-6]. Toplam Birikim Varlığı yalnızca TRY birimli hesapları toplar; diğerleri ayrı satırda kendi birimiyle gösterilir. |

### 5.4 Tarih, saat ve tekrar [D-27]

- **Tipler:** Zaman damgaları `timestamptz`. Yalnızca tarih olan alanlar (vade, açılış) `date`.
- **Saat dilimi:** `user_settings.timezone` tüm gün sınırı hesaplarında kullanılır: "Bugün", ay dönemleri ve vade.
- **`recurrence` yapısı:** `{ frequency: daily|weekly|monthly|yearly, interval, by_weekday?, by_month_day?, starts_on, ends_on? }`. Arayüzde yalnızca günlük / haftalık / aylık / yıllık sunulur (`interval = 1`) [PRD Q-12]. `recurrence = null` tekrarsız kayıttır [PRD Q-8].
- **Düzenleme kapsamı:** "Yalnızca bu" örneği ayrıştırır; "Bu ve sonrakiler" kuralı o tarihte böler. Geçmiş örnekler ve işlemler değişmez [PRD Q-7, BR-REC-004].
- **Ay sonu kuralı:** Ayın 31'i olmayan aylarda **ayın son günü** kullanılır.
- **Üretim:** `generate_occurrences` günlük `pg_cron` ile **3 ay ileriye** kadar ödeme kayıtlarını ve tekrarlayan görev/randevu örneklerini üretir. Tekrarlayan gelir/gider işlemleri vadesi gelince **onaysız, gerçekleşmiş işlem** olarak oluşturulur [PRD Q-17].
- **[Risk] Test:** Ay sonu, artık yıl ve saat dilimi kenar durumları pgTAP ile test edilir.

### 5.5 Raporlar

- **Hesaplama:** `monthly_report(month)` gelir, gider, net nakit akışı, tasarruf oranını ve birikime aktarılanı, kategori bazlı en çok harcamayla birlikte döner.
  - Tasarruf oranı = (gelir − gider) / gelir.
  - Gelir 0 ise oran gösterilmez.
- **Paylaşılabilir Rapor** [D-11]:

| Sürüm | Çıktı |
|---|---|
| v1.0 | Kart istemcide PNG'ye çevrilir. Destekleniyorsa Web Share API ile paylaşılır, değilse indirilir |
| v1.1 | "PDF / Rapor Özeti İndir" |

### 5.6 Veri modeli kararları

| Konu | Karar |
|---|---|
| "Hemen öde" | Uygulama ödeme yapmıyor. v1.0'da **kaldırılır**. "Ödendi olarak işaretle" tek aksiyon olur ve birincil stile geçer [D-5] |
| Randevu | `calendar_items.kind = appointment`. Görev Ekle formunda "Görev / Randevu" türü seçilir [D-14] |
| Öncelik | Düşük / Normal / Yüksek, varsayılan Normal. Arayüzde yalnızca **Yüksek** etiketlenir ("Yüksek Öncelik", "Öncelikli" [Figma]) [D-15] |
| Hesap bakiyesi | **Hesaplanır:** açılış bakiyesi + gelir − gider ± transfer [D-13] |
| Kredi kartı | v1.0'da limit/borç mantığı yok. Diğer hesaplar gibi davranır [D-13] |
| Bütçe limiti | Aşıldığında Kategori Yönetimi ve Aylık Rapor'da **uygulama içi uyarı** gösterilir. Push yok [D-16]. [Eksik] Uyarı görünümü tasarlanmadı |
| Başlangıç verisi | Kayıtta "Ana Hesap" ile Pages'taki finans ve görev kategorileri (Maaş, Freelance / Ek İş, Market, Fatura…) otomatik oluşturulur [D-29] |
| Kategori zorunluluğu ve arşivleme | Gelir/gider/abonelik kayıtlarında kategori zorunlu [PRD Q-11]. **Kullanılmış kategori silinmez, `archived_at` ile arşivlenir**; geçmiş kayıtlar kategoriye bağlı kalır, yeni kayıt ekleme/kategori değiştirme sırasında arşivli kategori **veritabanı kontrolüyle** reddedilir (trigger). Hiç kullanılmamış kategori silinebilir. Bir türün son aktif kategorisi arşivlenemez/silinemez [PRD BR-CAT-002…008] |
| Negatif bakiye | Engellenmez. İstemci uyarı gösterir [PRD Q-14] |
| Ödeme gideri silinirse | Bağlı `payment_occurrences` satırı `pending`'e döner (trigger) [PRD Q-13] |
| Birikim kapatma | `close_savings_account(id, transfer_to_account_id?)`: bakiye seçilen hesaba aktarılır veya aktarılmadan kapatılır [PRD Q-15] |
| Dashboard öne çıkan hedef | `show_on_dashboard = true` olan hesap; yoksa tamamlanmaya en yakın aktif hesap [PRD Q-2] |
| Global arama | İşlem, görev/randevu, ödeme ve birikim başlıklarında kullanıcı kapsamlı arama (Postgres metin araması, `unaccent` ile Türkçe karakter duyarsız) [PRD Q-9] |

---

## 6. Güvenlik ve RLS

### 6.1 Varsayılan red
- `public` şemasındaki **her tabloda RLS açık** olur. Politika yoksa erişim yoktur.
- CI'da bir kontrol, RLS'i kapalı tablo kalmadığını doğrular.

### 6.2 Standart politika

| İşlem | Kural |
|---|---|
| SELECT / DELETE | `user_id = (select auth.uid())` |
| INSERT | `WITH CHECK (user_id = (select auth.uid()))` |
| UPDATE | `USING (...) WITH CHECK (...)`. Satırın sahibi değiştirilemez |

- **Performans:** `(select auth.uid())` kalıbı ifadeyi sorgu başına bir kez değerlendirir. Her tabloda `user_id` indeksi bulunur.

### 6.3 Çapraz sahiplik
- **Sorun:** RLS tek başına, bir kullanıcının kendi işlemine başkasının kategorisini bağlamasını engellemez.
- **Çözüm:** **Bileşik yabancı anahtar**: `(category_id, user_id) REFERENCES categories(id, user_id)`. Hesap, kategori, ödeme, birikim hesabı ve ek dosya ilişkilerinin hepsinde uygulanır.

### 6.4 Anahtarlar

| Anahtar | Kullanım |
|---|---|
| `anon` / publishable key | İstemcide. Herkese açık sayılır, güvenlik RLS'e dayanır |
| `service_role` / secret key | **Yalnızca** Edge Functions ve zamanlanmış işler. `NEXT_PUBLIC_*` değişkenlerine ve istemci bundle'ına asla girmez |
| VAPID ve diğer sırlar | Supabase secrets / Vercel server env. Repoda yalnızca `.env.example` bulunur |

Pre-commit ve CI'da sır taraması çalışır (açık kaynaklı tarayıcı, örn. gitleaks). GitHub'ın yerleşik push koruması private repoda plan seviyesine bağlıdır (§13.1 K-2, §13.3).

### 6.5 Test
- **RLS testleri:** Her tablo için "başka kullanıcının satırını okuyamaz / yazamaz / sahibini değiştiremez" testleri pgTAP ile yazılır ve CI'da çalışır.
- **Doğrulama:** İstemcide Zod, veritabanında `CHECK`. İkisi birbirinin yerine geçmez.

### 6.6 Gizlilik ve uyumluluk
- **Bölge:** Supabase AB; staging Frankfurt (eu-central-1), production İrlanda (eu-west-1). Vercel fonksiyon bölgesi production'da `dub1` (Dublin), Preview'da `fra1` [D-21a].
- **Kişisel veri:** Loglarda ve Sentry'de tutar, başlık, not, adres gibi kişisel veriler yazdırılmaz (Sentry `beforeSend` filtresi).
- **Hesap silme:** Kullanıcının tüm satırları ve Storage dosyaları **anında** silinir. Yedeklerdeki kopyalar, sağlayıcının yedek saklama süresi sonunda kendiliğinden düşer [D-10]. Bu süre gizlilik metninde belirtilir.
- **[Hukuki]** KVKK kapsamında aydınlatma metni, yurt dışına (AB) veri aktarımı için açık rıza ihtiyacı ve kullanım koşulları. Profil'deki "Kullanım koşulları ve gizlilik" satırı [Figma] bu metinlere bağlanır. Teknik taraf metinlerden bağımsız hazırlanacak: kayıtta onay kutusu, onay zamanı ve metin sürümü saklanır. **Metinler henüz yazılmadı ve hukuki onay almadı.** Hukuk uzmanı onayı yayın engelidir (PRD §1.8, LB-01). Bu dokümandaki hukuki ifadeler hukuki görüş değildir.

---

## 7. State Management ve Form Yönetimi

### 7.1 Durum türleri

| Durum | Örnek | Araç |
|---|---|---|
| Sunucu durumu | İşlemler, görevler, birikimler, rapor | **TanStack Query** |
| URL durumu | Ay, sekme, kategori filtresi, takvim görünümü, seçili kayıt | **nuqs** |
| Form durumu | Yeni İşlem, Görev Ekle, Yeni Birikim, Kategori Ekle | **React Hook Form + Zod** |
| Geçici UI durumu | Drawer, hesap menüsü, bildirim paneli | React state / context |
| Toast kuyruğu | Başarı ve hata bildirimleri | **Sonner** |
| Oturum | Kullanıcı, profil | Supabase Auth + `SessionProvider` |

- **Global store yok.** Sunucu verisinin tek kaynağı TanStack Query önbelleğidir.

### 7.2 Query anahtarları ve güncelleme

```
['transactions', { month, type, category }]   ['transaction', id]
['calendar', { view, date }]                  ['calendar-item', id]
['payments', { status, range }]               ['savings']   ['savings', id]
['report', 'monthly', month]                  ['reminders', 'unread']
```

- **Realtime olayı:** Kök anahtarı geçersiz kılar.
- **Optimistic update:** "Görevi tamamla" ve "Ödendi olarak işaretle" anında güncellenir. Hata olursa geri alınır ve hata toast'ı gösterilir.

### 7.3 Form kuralları
- **Ortak şema:** Her formun tek Zod şeması `features/*/schemas.ts` içindedir.
- **Yeni İşlem:** Tür, Gelir / Gider / Abonelik **discriminated union**'ı ile modellenir. Bu, tasarımcı notundaki "tek ekran, switch ile geçiş" [Figma] yapısının karşılığıdır.
  - Abonelikte tekrar alanları zorunludur.
  - Gelir/Gider'de "Tekrar Eden İşlem" switch'i açılınca zorunlu olur.
- **Tutar:** "8.500,00" gibi metin girişi kuruşa tek bir yardımcıyla çevrilir. Hızlı tutar chip'leri ("+500 ₺" vb. [Figma]) mevcut değere ekleme yapar.
- **Not:** "x/200" sayacı [Figma] → Zod `max(200)` + DB `CHECK`.
- **Zorunlu alanlar:** "*" ile işaretli alanlar [Figma] şemada zorunludur.
- **Hata görünümü:** Gönderimde ilk hatalı alana scroll edilir ve odaklanılır. [Eksik] Görsel tasarım için RESPONSIVE.md §8.2.7.
- **Kaydedilmemiş değişiklik:** `isDirty` iken form kapatılırsa **her formda** onay sorulur [D-19].

---

## 8. Responsive ve Design Token Entegrasyonu

### 8.1 Token akışı [D-12]

```
Figma değişkenleri ve style'ları (Pages/Components'ta kullanılanlar)
        │  tek yönlü dışa aktarım
        ▼
tokens/*.json      ← TEK KAYNAK (DTCG formatı, repoda versiyonlu, PR ile değişir)
        │  Style Dictionary
        ▼
src/styles/tokens.css   (CSS değişkenleri) → Tailwind @theme
```

- **Kaynak Figma'dır.** Token değişikliği önce Figma'da yapılır, sonra JSON'a aktarılır.
- `tokens.css` elle düzenlenmez. CI, üretilen dosyanın JSON ile güncel olduğunu kontrol eder.

### 8.2 Katmanlar ve tema

| Katman | Örnek | Kullanım |
|---|---|---|
| Primitive | `--neutral-900`, `--teal-700` | Bileşenler **kullanmaz** |
| Semantic | `--color-text-primary`, `--color-surface-card`, `--color-border-default`, `--color-brand-primary`, `--color-status-danger` | Bileşenler ve Tailwind sınıfları **yalnızca bunları** kullanır |
| Layout | `--layout-page-padding-x`, `--layout-nav-width` | Breakpoint'e göre değişir |
| Typography | `--font-size-h1`, `--line-height-h1` | Breakpoint'e göre değişir (RESPONSIVE.md §6.3) |

**Tema:**
- Semantic değişkenler `:root[data-theme="light"]` altında tanımlanır. Dark mode geldiğinde yalnızca `[data-theme="dark"]` bloğu eklenir.
- **Yasaklar** (ESLint ile zorlanır): Bileşenlerde HEX değer, Tailwind varsayılan renkleri ve `dark:` varyantı.

### 8.3 Tailwind

| Konu | Yapılandırma |
|---|---|
| Renkler | `@theme` içinde varsayılan palet sıfırlanır. Yalnızca semantic utility'ler: `bg-surface-card`, `text-text-secondary`, `border-border-default`, `bg-brand-primary`, `text-status-success`. Token adları ve tam liste [DESIGN.md](DESIGN.md) §2 ve §10'da [Ç-8] |
| Spacing | 4, 8, 12, 16, 20, 24, 32, 40, 48, 64. Ölçek dışı değerler lint uyarısı verir |
| Radius | `rounded-xs` (4) … `rounded-2xl` (24), `rounded-full` |
| Gölgeler | `shadow-card`, `shadow-floating`, `shadow-overlay` |
| Font | Manrope, `next/font`. **`latin-ext` alt kümesi zorunlu** (ğ, ş, ı, İ) |
| Breakpoint'ler | `tablet` 768 · `laptop` 1024 · `detail` 1280 (master-detail eşiği) · `desktop` 1440. Mobile-first yazılır |
| Metin stilleri | `text-heading-h1`, `text-body-md`, `text-label-xs`, `text-data-lg`… boyut, satır yüksekliği ve ağırlığı birlikte uygular. Adlar DESIGN.md §3.2 token'larından (`type.*`), değerler RESPONSIVE.md §6.3'ten |

### 8.4 Responsive uygulama
- **AppShell:** Tek bir `AppShell` var. Breakpoint'e göre BottomNav, NavRail (80 px) veya Sidebar (240/264 px) gösterir.
- **Gizleme:** Görsel gizleme CSS ile yapılır. Davranış farkı (drawer / tam sayfa) yalnızca istemci bileşenlerinde, SSR'a güvenli varsayılanla uygulanır.
- **Güvenli alan:** `env(safe-area-inset-*)`.
- **Dokunma alanı:** Mobil/tablette en az 44 px.
- **E2E testleri:** Playwright testleri 4 viewport'ta çalışır: 390, 834, 1280, 1440.

### 8.5 PWA [D-7]

| Konu | Karar |
|---|---|
| Manifest | `display: standalone`, `theme_color` ve `background_color: #F5F6F7` (DESIGN_SYSTEM_PICKALY §7), ikonlar 192 / 512 / maskable (`public/icons/`), favicon (`src/app/favicon.ico`, `icon.svg`) ve `apple-touch-icon` (`src/app/apple-icon.png`). Kaynak ürün sahibinin logo kiti `pickaly-logo/`; `pnpm icons:build` kitten kopyalar. ✅ 2026-11-06 |
| Önbellek | **Yalnızca uygulama kabuğu ve statik varlıklar.** Kullanıcı verisi service worker'da önbelleklenmez; finansal veri paylaşılan cihazda kalmasın. [Ertelendi] Service worker (Serwist) henüz yok; kurulum için gerekmiyor (Chrome 108+ mobil, iOS) |
| Çevrimdışı | Bağlantı yokken üstte "Çevrimdışısınız" bandı gösterilir, yazma aksiyonları devre dışı kalır. [Eksik] Bandın tasarımı yok |
| Kurulum | Tarayıcının kendi kurulum akışı. Özel "Yükle" butonu v1.1 |

---

## 9. Git ve Deployment

### 9.1 Branch ve commit
- **Akış:** GitHub Flow. `main` her zaman yayınlanabilir. İş `feature/…`, `fix/…`, `chore/…`, `db/…` branch'lerinde yapılır.
- **Koruma:** `main`'e yalnızca PR ile girilir. Doğrudan push, force push ve dal silme kapalı (GitHub ruleset `main-protection`).
  - **Onay sayısı:** Şu an **0**. Proje tek geliştiricili ve GitHub kişinin kendi PR'ını onaylamasına izin vermiyor. Ekibe ikinci geliştirici katılınca **1**'e çıkarılır.
  - **CI zorunluluğu:** CI kurulunca (S-8) "status checks" kuralı ruleset'e eklenir. O andan itibaren CI yeşil olmadan merge yapılamaz.
- **Commit mesajları:** Conventional Commits.

### 9.2 CI (her PR'da)
1. `pnpm install --frozen-lockfile`
2. Lint + Prettier
3. `tsc --noEmit`
4. Vitest
5. Supabase yerel instance → migration'ları sıfırdan uygula → **RLS ve fonksiyon testleri**
6. Üretilen tiplerin ve token CSS'inin güncellik kontrolü
7. Playwright (kritik akışlar, 4 viewport) ve iki dilde eksik çeviri anahtarı kontrolü (PRD AC-02, AC-04)
8. Staging'de kritik ekranlar için Lighthouse performans bütçesi: mobil, yavaş 4G, LCP < 2 sn (PRD AC-07). Bu adım yayın öncesi kontrol olarak çalışır, her PR'da zorunlu değildir

### 9.3 Ortamlar

| Ortam | Next.js | Supabase | Tetikleyici |
|---|---|---|---|
| Local | `pnpm dev` | Supabase CLI + `seed.sql` | – |
| Preview | Vercel PR preview | **staging** projesi | PR |
| Production | Vercel production | **production** projesi | `main`'e merge |

- **Migration'lar:** `main` merge sonrası GitHub Action `supabase db push` çalıştırır. Bu adım manuel onaylı GitHub Environment arkasındadır.
  - Migration'lar **geriye uyumlu** yazılır: önce ekle, sonra kodu değiştir, en son kaldır.
- **Ortam değişkenleri:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` ortam başına tanımlanır. Sırlar yalnızca sunucu tarafındadır.

### 9.4 Planlar ve yedek [D-22, D-23]

| Konu | Karar |
|---|---|
| Supabase | **production'da Pro plan.** Ücretsiz plan hareketsiz projeyi duraklatır, yedekleme kısıtlıdır. Staging ücretsiz planda kalabilir |
| Vercel | **Pro plan.** Hobby planı ticari kullanıma uygun değildir |
| Yedek | Supabase günlük yedekleri. Point-in-Time Recovery kullanıcı sayısı arttığında açılır |

---

## 10. İleride Mobil Uygulama (Expo) – Hazırlık Sınırı

iOS ve Android uygulamaları **çok ileri bir aşamada Expo (React Native)** ile yapılacak [D-28]. Bu nedenle:

**Şimdi yapılmayanlar:**
- Monorepo ve paylaşılan paketler
- React Native, NativeWind veya EAS hazırlığı
- Mobil push, biyometrik kilit, mağaza süreçleri

**Şimdi yapılanlar.** Hepsi web için zaten doğru olan, ek maliyet getirmeyen kararlar:

| Karar | Web için faydası | İleride mobile faydası |
|---|---|---|
| İş kuralları PostgreSQL'de (RPC, kısıt, RLS) | Tek doğruluk kaynağı, güvenlik | Expo uygulaması aynı backend'i doğrudan kullanır |
| `domain/` katmanı saf TypeScript | Test edilebilirlik | Kod Expo'ya kopyalanmadan paylaşılabilir hale getirilebilir |
| Zod şemaları feature içinde, UI'dan bağımsız | Form + API doğrulaması | Aynı şemalar mobil formlarda kullanılabilir |
| Token'lar JSON kaynağında | Tema altyapısı | Style Dictionary ile RN teması üretilebilir |
| Geriye uyumlu migration'lar | Kesintisiz deploy | Mağazadaki eski uygulama sürümleri bozulmaz |
| Platformdan bağımsız `push_subscriptions` / `reminders.channel` | v1.1 Web Push | Expo Push eklenince şema değişmez |
| OTP kodlu doğrulama | PWA'da güvenilir akış | Mobilde de aynı akış çalışır |
| Anlamlı URL yapısı (`/islemler/[id]`) | Paylaşılabilir linkler | Deep link yolları aynı kalabilir |

**Mobil başladığında hatırlanacaklar** (şimdi iş gerektirmez):
- Google ile giriş eklenmişse iOS'ta Apple ile giriş zorunlu.
- Her iki mağazada uygulama içi hesap silme zorunlu. Bu akış web v1.0'da zaten var.
- İhtiyaç olursa repo o zaman monorepo'ya bölünür. §2'deki katman kuralları bunu mekanik bir taşımaya indirger.

---

## 11. Riskler

| # | Risk | Etki | Önlem |
|---|---|---|---|
| R1 | "Abonelik" teriminin monetizasyonla karışması | Yanlış kapsam | Terim tablosu, `recurring_payments` adı (§5.1) |
| R2 | Tekrar kuralları, ay sonu ve saat dilimi hataları | Yanlış vade, kaçan ödeme | Tek PostgreSQL fonksiyonu + pgTAP testleri (§5.4) |
| R3 | RLS hatası veya çapraz sahiplik | Veri sızıntısı | Varsayılan red, bileşik FK, otomatik testler (§6) |
| R4 | `service_role` anahtarının sızması | Tüm verinin açığa çıkması | Yalnızca Edge Functions, secret scanning (§6.4) |
| R5 | KVKK metinleri ve açık rıza | Hukuki, **yayın engeli** | Teknik altyapı geliştirmede hazırlanır. Metinler hukuk uzmanı onayı olmadan yayına çıkamaz (§6.6, PRD LB-01) |
| R6 | Intercepting route karmaşıklığı | Drawer/sayfa davranış hataları | İlk hafta prototip, yedek plan hazır (§3.3) |
| R7 | Pages'ta eksik ekranlar (auth, hesap silme, Görev Ekle, Günlük, seçiciler, onay, hata, bildirim paneli, Hatırlatma Ayarları, çevrimdışı bandı) | Tasarım boşluğu, sonradan revizyon | RESPONSIVE.md §8 önerileriyle geçici kurulum. Tasarım ekibine öncelikli liste |
| R8 | "Hemen öde" kaldırma kararının tasarımla çelişmesi | Tasarım revizyonu | Tasarım ekibine iletilir. Ana Sayfa ve Takvim kartlarında tek buton (RESPONSIVE.md §4.6) |
| R9 | Web Push (v1.1) iOS kısıtları | Bazı kullanıcılara bildirim gitmez | Uygulama içi hatırlatma her zaman çalışır. Push ek kanaldır |
| R10 | Ücretsiz planların kısıtları | Kesinti, veri kaybı | Production'da Pro planlar (§9.4) |

---

## 12. Karar Kaydı

> Bu kararlar, kapsam sahibinin yetkiyi devretmesiyle teknik ve ürün mantığına göre verildi. Gerekirse revize edilebilir; revizyon bu tabloya yeni satır olarak işlenir.

| # | Konu | Karar | Gerekçe |
|---|---|---|---|
| D-1 | Giriş yöntemi | E-posta + şifre. Doğrulama ve sıfırlama 6 haneli OTP. Sosyal giriş v1.0'da yok; eklenirse Google + Apple birlikte | PWA'da magic link oturumu taşımaz. Tek yöntem, düşük karmaşıklık |
| D-2 | Auth ekranları | Giriş, Kayıt, E-posta Doğrulama, Şifremi Unuttum, Hesap Silme kurulur [Eksik] | Zorunlu akışlar. Tasarım önerisi RESPONSIVE.md §8.2.8 |
| D-3 | Hatırlatmalar | v1.0 uygulama içi. v1.1 Web Push | Push altyapısı en karmaşık parça. Uygulama içi hatırlatma tüm cihazlarda çalışır |
| D-4 | PIN / biyometrik kilit | v1.0'da yok, Profil satırı gizli | Web'de gerçek güvenlik sağlamaz |
| D-5 | "Hemen öde" | Kaldırılır. "Ödendi olarak işaretle" tek, birincil aksiyon | Uygulama ödeme yapmıyor. Monetizasyon/ödeme kapsam dışı. Aynı işi yapan iki buton kafa karıştırır |
| D-6 | Altın/döviz TL karşılığı | Gösterilmez. Yalnızca miktar | Dış fiyat servisi ve sorumluluk gerektirir |
| D-7 | Çevrimdışı | Online-first. Yalnızca kabuk önbelleği + çevrimdışı bandı | Senkron çakışma çözümü v1 için orantısız. Finansal veri cihazda önbelleklenmez |
| D-8 | Staging | Ayrı Supabase projesi | Öngörülebilir, maliyeti düşük |
| D-9 | Hata izleme | Sentry, kişisel veri filtresiyle | Üretim hatalarını görmek için gerekli |
| D-10 | Silme | Onaylı **kalıcı silme**, soft delete yok. Hesap silme: anında tam silme, yedekler süre sonunda düşer | Arayüz "kalıcı olarak sil" diyor [Figma]. KVKK silme hakkı |
| D-11 | Rapor paylaşımı | v1.0 PNG + Web Share. PDF v1.1 | Kart zaten görsel hedefi olarak tasarlanmış |
| D-12 | Token kaynağı | Figma → JSON tek yönlü | Tasarım sisteminin sahibi Figma |
| D-13 | Bakiye ve kredi kartı | Bakiye hesaplanır. Kredi kartında limit yok | Tek doğruluk kaynağı. Pages'ta limit alanı yok |
| D-14 | Randevu | Görevle aynı tablo (`kind`). Görev Ekle'de tür seçimi | Takvim'de aynı listede gösteriliyor [Figma] |
| D-15 | Öncelik | Düşük / Normal / Yüksek. Yalnızca Yüksek etiketlenir | Pages'ta yalnızca yüksek öncelik görünüyor |
| D-16 | Bütçe limiti | Uygulama içi uyarı (Kategori Yönetimi, Aylık Rapor) | Kategori Ekle'deki açıklama bunu vaat ediyor [Figma]. Push v1.1 ile birlikte değerlendirilir |
| D-17 | Dışa aktarma | v1.0 JSON + CSV (Excel uyumlu). XLSX v1.1 | CSV Excel'de açılır, bağımlılık az |
| D-18 | Toast ve geri al | Toast 4 sn. "Görevi tamamla" ve "Ödendi olarak işaretle" için 5 sn "Geri al". Silmede geri al yok (onaylı) | Tek dokunuşluk aksiyonlar kazara yapılabilir. Silme zaten onaylı |
| D-19 | Kaydedilmemiş değişiklik | Tüm formlarda kapatırken onay | Uzun formlarda veri kaybını önler |
| D-20 | Dil | ~~v1.0 yalnızca Türkçe~~ → **D-31 ile revize edildi** | – |
| D-21 | Veri bölgesi | AB (Frankfurt), Vercel `fra1`. **Bölge seçimi tek başına KVKK uyumu sağlamaz** (§13.7, PRD LB-01). → **D-21a ile revize edildi** | Gecikme. Hukuki değerlendirme ayrıca yapılır |
| D-21a | Veri bölgesi *(D-21'in revizyonu)* | **Staging: eu-central-1 (Frankfurt). Production: eu-west-1 (İrlanda).** İkisi de AB. Vercel fonksiyon bölgesi production'da `dub1`, Preview'da `fra1`. KVKK notu aynen geçerli | Supabase'in proje oluşturma ekranı belirli bölge yerine yalnızca bölge grubu ("Central EU") seçtiriyor; production iki denemede de eu-west-1'e atandı. Ürün sahibi kararıyla kabul edildi (2026-11-03) |
| D-32 | Kategori arşivleme | Kullanılmış kategori silinmez, arşivlenir. Son aktif kategori korunur (PRD BR-CAT-002…008) | Ürün sahibi onayı. Geçmiş kayıt ve rapor bütünlüğü |
| D-33 | Kurulum | GitHub (private) + Supabase staging (Frankfurt) / prod (İrlanda) [D-21a] + Vercel. Ücretli veya geri dönüşü zor her adım ayrıca onaylanır (§13) | Ürün sahibi onayı |
| D-22 | Yedek | Günlük yedek. PITR büyümeyle | Maliyet / risk dengesi |
| D-23 | Planlar | Production'da Supabase Pro + Vercel Pro | Duraklatma ve ticari kullanım kısıtları |
| D-24 | Bildirim ikonu | Uygulama içi Bildirimler panelini açar, okunmamış rozeti gösterir | İkon Pages'ta var, hedefi yoktu |
| D-25 | Hatırlatma Ayarları içeriği | v1.0: varsayılan ödeme hatırlatma zamanı, varsayılan görev hatırlatma zamanı, tüm gün kayıtların hatırlatma saati (varsayılan 09:00, PRD Q-6), uygulama içi hatırlatmalar aç/kapa. v1.1: Web Push aç/kapa | Pages'taki kayıt bazlı hatırlatma seçimine varsayılan sağlar [Eksik: tasarım yok] |
| D-26 | "Yaklaşan Ödemeler → Tümü" | İşlemler'e filtresiz gider (RESPONSIVE Karar #9) | İşlemler'de durum filtresi tasarlanmamış |
| D-27 | Tekrar üretimi | Günlük `pg_cron`, 3 ay ileri. Ay sonu → ayın son günü | Takvimde ileriye dönük görünürlük |
| D-28 | Mobil | Expo, çok ileride. Şimdi yalnızca maliyetsiz hazırlık | Kapsam sahibinin talimatı |
| D-29 | Başlangıç verisi | Kayıtta "Ana Hesap" ve Pages'taki varsayılan kategoriler | Boş uygulama ile başlamayı önler. Formlar ilk günden kullanılabilir |
| D-30 | Ek dosya sınırı | 10 MB, PDF/JPEG/PNG/HEIC/WebP | Fiş/belge kullanımına yeter, kötüye kullanımı sınırlar |
| D-31 | Dil *(D-20'nin revizyonu)* | v1.0'da Türkçe (varsayılan) + İngilizce. Tüm arayüz çevrilir, kullanıcı içeriği çevrilmez. Tarih/sayı biçimleri dile göre | PRD kapsam tanımı (PRD UX-007, UX-008, FR-SET-003) |
| D-28a | Mobil *(D-28'in teyidi)* | İleride **Expo ile iOS ve Android**. "Native iOS" ifadesi bu anlamda kullanılır | PRD U-2 kararı |

### 12.1 Sürüm planı

| Sürüm | Kapsam |
|---|---|
| **v1.0** | Pages'taki tüm ekranlar (responsive) + Görev Ekle, Günlük görünüm, auth ekranları, hesap silme, silme onayı, toast/doğrulama, boş durumlar, bildirim paneli, Hatırlatma Ayarları (uygulama içi), JSON/CSV dışa aktarma, PNG paylaşım, PWA kurulabilirliği, **Türkçe + İngilizce arayüz** [D-31] |
| **v1.1** | Web Push, PDF rapor, XLSX dışa aktarma, özel "Yükle" butonu |

> V1'in fonksiyonel kapsamının, kabul kriterlerinin (AC-01…AC-08) ve yayın engellerinin (LB-01…LB-03) tek kaynağı [PRD.md](PRD.md)'dir. Bu tablo yalnızca teknik sürüm özetidir.
| **Sonra** | Dark mode, sosyal giriş (Google + Apple), TR/EN dışında diller, çevrimdışı veri, Expo ile iOS ve Android uygulamaları |

---

## 13. Kurulum Planı (GitHub · Supabase · Vercel) [Karar: ürün sahibi onayı]

> **Durum (2026-11-03):** S-1…S-5 tamamlandı. Supabase projeleri ücretsiz planda. Vercel projesi ve ücretli kaynak henüz yok.
>
> | Adım | Durum | Not |
> |---|---|---|
> | S-1 | ✅ | Yerel git, `main` dalı, `.gitignore`, `.env.example`, ilk commit |
> | S-2 | ✅ | Private repo `Fatih-Demirkan/pickaly`. Commit kimliği GitHub noreply adresiyle |
> | S-3 | ✅ | Ruleset `main-protection` (silme ve force push engeli, PR zorunlu, onay 0). Environments: `staging` (korumasız), `production` (zorunlu onaylayıcı: Fatih-Demirkan, yalnızca `main`). Ücretli plan gerekmedi |
> | S-4 | ✅ | Organizasyon `Pickaly` (Free). `pickaly-staging` eu-central-1, `pickaly-prod` eu-west-1 (D-21a). Production ilk denemede yanlış bölgede açıldı, boşken silinip yeniden oluşturuldu; ikinci denemede de eu-west-1 atandı |
> | S-5 | ✅ | İki projede: Email açık, diğer sağlayıcılar kapalı, Confirm email açık, OTP 600 sn / 6 hane, minimum şifre 8. **Production'da yeni kayıtlar kapalı.** "Prevent use of leaked passwords" yalnızca Pro planda, açılmadı. Site URL / Redirect URL (S-6 sonrası) ve iki dilli e-posta şablonları (S-8) bekliyor |
> | S-6 – S-9 | ⏳ | Bekliyor. Not: Supabase projelerinde GitHub entegrasyonu bağlı görünüyor; migration akışıyla (§9.3) çakışmaması için S-8 öncesi gözden geçirilecek |
>
> **Kurallar:**
> 1. **Gerçek kullanıcı verisi kullanılmaz.** Tüm ortamlarda yalnızca sentetik test verisi bulunur. Yayın engelleri (PRD §1.8) kapanana kadar production ortamı gerçek kullanıcıya açılmaz.
> 2. **Ücretli kaynak, abonelik veya geri dönüşü zor bir işlem** gerekirse ürün sahibine önceden bildirilir ve **ayrıca açık onay alınmadan yapılmaz** (§13.1).
> 3. Staging ve production birbirinden **kesin olarak ayrıdır** (§13.2).

### 13.1 Onay gerektiren noktalar

| # | Konu | Neden onay gerekir | Varsayılan öneri |
|---|---|---|---|
| K-1 | **GitHub hesabı / organizasyonu ve repo adı** | Repo hangi hesapta duracak? Kişisel hesap mı, bir organizasyon mu? Sonradan taşınabilir ama bağlantılar (Vercel, Actions) yeniden kurulur | Kişisel hesapta **private** repo: `pickaly` |
| K-2 | **GitHub branch koruması ve environment onay kuralları** | Private repolarda branch protection / ruleset ve environment koruma kuralları GitHub'ın ücretsiz planında sınırlı olabilir; tam kullanım için **ücretli plan (Pro/Team)** gerekebilir. Kurulumda plan seviyesi kontrol edilir | Önce ücretsiz planda ne açılabildiği kontrol edilir. Ücretli plan gerekiyorsa **ayrıca onay istenir**. Onay yoksa CI kontrolleri + "doğrudan `main`'e push yapılmaz" ekip kuralı ile ilerlenir |
| K-3 | **Supabase organizasyonu ve 2 proje** (`pickaly-staging`, `pickaly-prod`) | Supabase ücretsiz planında kuruluş başına sınırlı sayıda ücretsiz proje var ve hareketsiz projeler duraklatılır | Geliştirme süresince iki proje de **ücretsiz planda** açılır |
| K-4 | **Supabase bölgesi** | Proje bölgesi **oluşturulduktan sonra değiştirilemez** (geri dönüşü zor) | ~~İki proje de Frankfurt~~ → **Sonuç:** staging eu-central-1, production eu-west-1 (D-21a) |
| K-5 | **Supabase production planı (Pro)** | Ücretli abonelik. Yedekleme ve duraklatmama için gerekli (D-23) | Geliştirme sırasında **yükseltilmez.** Yayın engelleri kapanmaya yaklaşınca ayrıca onay istenir |
| K-6 | **Vercel planı** | Ücretsiz plan (Hobby) kişisel / ticari olmayan kullanım içindir. Ticari yayın ve ekip kullanımı için **ücretli plan (Pro)** gerekir (D-23) | Geliştirme ve preview için mevcut hesap. Ticari yayından önce Pro için ayrıca onay istenir |
| K-7 | **E-posta gönderimi (SMTP)** | Supabase'in yerleşik e-posta servisi düşük gönderim limitli ve geliştirme amaçlıdır. Production'da OTP e-postaları (D-1) için harici bir e-posta servisi gerekir. Servis seçimine göre **ücretli** olabilir | Staging'de yerleşik servis. Production için servis seçimi ve maliyeti ayrıca onaya sunulur |
| K-8 | **Alan adı (domain)** | Ücretli. Kayıt sonrası iadesi zor | ✅ 2026-11-05: ürün sahibinin mevcut alan adı **`fatihdemirkan.com`** (GoDaddy) Vercel Production'a bağlandı; `www` → kök 308. DNS: A `@` 216.198.79.1, CNAME `www` Vercel. Supabase Site URL `https://fatihdemirkan.com`, yönlendirme listesine `/auth/callback` eklendi. `pickaly.vercel.app` çalışmaya devam eder (bazı ağlar `*.vercel.app`'i engelliyor) |
| K-9 | **Sentry** (D-9) | Ücretsiz plan geliştirme için yeterli. Kullanım artınca ücretli olabilir | Ücretsiz plan. Yükseltme gerekirse onay istenir |

> Fiyatlar ve plan limitleri sağlayıcılar tarafından değiştirilebilir. Her ücretli adımda o günkü koşullar kontrol edilip onaya sunulur.

### 13.2 Ortam ayrımı

| | Local | Staging | Production |
|---|---|---|---|
| Amaç | Geliştirici makinesi | PR önizlemeleri, test, kabul (PRD AC) | Yayın. LB'ler kapanana kadar gerçek kullanıcıya kapalı |
| Supabase | Supabase CLI ile yerel (Docker) | `pickaly-staging` (Frankfurt, eu-central-1) | `pickaly-prod` (İrlanda, eu-west-1) [D-21a] |
| Vercel | `pnpm dev` | **Preview** ortamı (her PR) | **Production** ortamı (`main`) |
| Veri | `seed.sql` sentetik veri | Sentetik test verisi ve test kullanıcıları | Boş. Yayına kadar yalnızca kabul testi için sentetik hesap |
| Auth ayarları | Yerel | Kendi Site URL / Redirect URL listesi (yalnızca preview adresleri) | Kendi Site URL / Redirect URL listesi (yalnızca production adresi) |
| Anahtarlar | Yerel anahtarlar | Staging'e özel | Production'a özel |

**Ayrım kuralları:**
1. **Anahtarlar paylaşılmaz.** Her ortamın Supabase URL'si, publishable/anon anahtarı, servis anahtarı ve veritabanı şifresi ayrıdır. Bir ortamın anahtarı başka ortamda tanımlanmaz.
2. **Veri yönü:** Production verisi staging'e veya local'e **kopyalanmaz.** Staging'den production'a yalnızca **migration** (şema) geçer, veri geçmez.
3. **Vercel ortam değişkenleri ortam kapsamlıdır.** Production kapsamında yalnızca production değerleri, Preview ve Development kapsamında yalnızca staging değerleri bulunur.
4. **Production migration'ları** yalnızca `main`'e merge sonrası, **onaylı** bir GitHub Actions adımıyla uygulanır. Staging'e PR'larda otomatik uygulanır.
5. **Production'a erişim:** Dashboard ve veritabanı erişimi yalnızca ürün sahibi ve yetkili geliştiricilerdedir. MFA zorunlu (GitHub, Supabase, Vercel hesaplarında).
6. **Görsel ayrım:** Staging arayüzünde sürekli görünen bir "STAGING" etiketi bulunur. Test ortamı production ile karıştırılmaz.

### 13.3 Ortam değişkenleri ve sırlar

| Değişken | Gizli mi | Nerede tutulur | Local | Staging | Production |
|---|---|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Hayır | Vercel env (ortam kapsamlı), `.env.local` | yerel | staging | prod |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` (publishable) | Hayır (RLS ile korunur) | Vercel env, `.env.local` | yerel | staging | prod |
| `SUPABASE_SERVICE_ROLE_KEY` (secret) | **Evet** | **Yalnızca Supabase Edge Functions secrets.** Vercel'e, GitHub'a ve istemciye **eklenmez** | yerel | staging | prod |
| `SUPABASE_ACCESS_TOKEN`, `SUPABASE_DB_PASSWORD`, `SUPABASE_PROJECT_REF` | **Evet** | GitHub Actions **environment secrets** (`staging`, `production` ayrı) | – | staging | prod |
| `SENTRY_DSN` | Hayır | Vercel env | – | staging | prod |
| `SENTRY_AUTH_TOKEN` | **Evet** | Vercel env (yalnızca build) | – | staging | prod |
| SMTP kimlik bilgileri | **Evet** | Yalnızca Supabase Auth ayarları | – | (yerleşik) | prod (K-7) |
| `VAPID_PRIVATE_KEY` (v1.1) | **Evet** | Supabase Edge Functions secrets | – | staging | prod |

**Sır yönetimi kuralları:**
- Repoda yalnızca değer içermeyen bir **`.env.example`** bulunur. `.env*` dosyaları `.gitignore` ile dışarıda tutulur.
- `NEXT_PUBLIC_` önekli değişkenlere **asla** gizli değer konmaz (istemciye gömülür).
- **Sızıntı taraması:** Pre-commit ve CI'da açık kaynaklı bir sır tarayıcısı (örn. gitleaks) çalışır. GitHub'ın yerleşik push koruması private repoda plan seviyesine bağlıdır (K-2).
- Sızdığından şüphelenilen her anahtar **hemen yenilenir** (rotate). Yenileme adımları kurulumla birlikte belgelenir.
- Sırlar sohbet, issue, PR açıklaması veya loglarda paylaşılmaz.

### 13.4 Güvenlik ve RLS kurulum kontrol listesi
Kurulumun her ortamda tamamlanmış sayılması için:

- [ ] Hesaplarda MFA açık (GitHub, Supabase, Vercel)
- [ ] İlk migration: `public` şemasında **RLS varsayılan olarak açık**. Politikasız tablo erişime kapalı (§6.1)
- [ ] CI kontrolü: RLS'i kapalı tablo yoksa geçer (§6.1)
- [ ] pgTAP RLS testleri CI'da çalışıyor (§6.5, PRD AC-06)
- [ ] Storage bucket'ları **private**, yol kuralı `{user_id}/…` (§4.4)
- [ ] Auth: e-posta doğrulaması zorunlu, OTP süresi kısa, şifre kuralı ≥ 8 (§4.3)
- [ ] Auth Site URL / Redirect URL listeleri ortama özel, joker karakter yok
- [ ] `service_role` anahtarı yalnızca Edge Functions secrets'ta (§13.3)
- [ ] Veritabanı şifreleri güçlü ve yalnızca GitHub environment secrets'ta
- [ ] Sır taraması CI'da aktif
- [ ] Staging ve production'da farklı anahtarlar kullanıldığı doğrulandı

### 13.5 Kurulum adımları

| Adım | İşlem | Kim | Ücret / geri dönüş | Ön koşul |
|---|---|---|---|---|
| S-1 | Yerel klasörde git başlatma, `.gitignore`, `.env.example`, mevcut dokümanların ilk commit'i | Claude (yerel) | Ücretsiz, geri alınabilir | – |
| S-2 | GitHub'da **private** repo oluşturma ve ilk push | Claude (`gh` CLI, kullanıcının oturumuyla) veya kullanıcı | Ücretsiz | **K-1 onayı** |
| S-3 | Branch / ruleset ve Actions environment'larını (`staging`, `production`) kurma | Claude veya kullanıcı | Plan seviyesine bağlı (K-2) | S-2, gerekiyorsa **K-2 onayı** |
| S-4 | Supabase organizasyonu ve **iki proje** (AB; bkz. D-21a) | **Kullanıcı** (dashboard; hesap ve ödeme bilgisi kullanıcıya ait) | Ücretsiz plan; **bölge geri alınamaz** | **K-3, K-4 teyidi** |
| S-5 | Supabase Auth ayarları (URL'ler, e-posta doğrulama, OTP) ve MFA | Kullanıcı (Claude adım adım yönlendirir) | Ücretsiz | S-4 |
| S-6 | Vercel projesi, GitHub reposuna bağlama, ortam kapsamlı değişkenler | Kullanıcı (hesap girişi) + Claude yönlendirme | Mevcut plan (K-6) | S-2, S-4 |
| S-7 | Proje iskeleti: Next.js, Tailwind, Supabase istemcileri, token build, lint/test araçları (**paket kurulumu**) | Claude (yerel) | Ücretsiz | **Ayrı onay:** kod ve paket kurulumuna geçiş |
| S-8 | İlk migration (RLS varsayılanları, profiller) + CI (lint, typecheck, test, RLS kontrolü, sır taraması) | Claude | Ücretsiz | S-7 |
| S-9 | Staging'e ilk deploy ve §13.4 kontrol listesinin doğrulanması | Claude + kullanıcı | Ücretsiz | S-8 |

> **Not:** Claude hiçbir hesap oluşturmaz, parola veya ödeme bilgisi girmez. Hesap ve dashboard işlemleri kullanıcı tarafından yapılır (S-4, S-5, S-6). Claude yalnızca kullanıcının yetkilendirdiği CLI oturumlarıyla ve yerel dosyalarla çalışır.

### 13.6 Test verisi politikası
- **Kaynak:** Test verisi yalnızca **sentetik** olur. Pages'taki örnek değerlerden türetilir (Deniz Yılmaz, "Ana Hesap 24.850,00 ₺" gibi kurgusal kayıtlar).
- **Gerçek bilgi yok:** Gerçek ad, e-posta, telefon, IBAN, kart numarası veya finansal veri kullanılmaz.
- **Test hesapları:** Yalnızca test amaçlı e-posta adresleriyle açılır. Production'daki kabul testi hesapları yayından önce silinir.

### 13.7 Veri bölgesi ve KVKK
- **Bölge seçimi:** Supabase projeleri **AB** bölgesindedir: staging Frankfurt, production İrlanda [D-21a].
- **[Hukuki] Bölge seçimi tek başına KVKK uyumu sağlamaz.** AB bölgesi Türkiye dışındadır; yurt dışına veri aktarımına ilişkin hukuki gereklilikler, aydınlatma ve açık rıza metinleri, veri işleme sözleşmeleri ve saklama/silme süreleri ayrıca değerlendirilmelidir.
- Bu değerlendirme hukuk uzmanı tarafından yapılır ve **yayın engelidir** (PRD LB-01). Bu doküman hukuki görüş değildir.

---

## 14. Phase 1 – Uygulama Notları ve Plandan Sapmalar

> Phase 1'de (proje altyapısı) kurulan yapı ve bu dokümandaki plandan bilinçli farklar. Ürün kararı içermez.

| # | Konu | Plan (bu doküman) | Uygulama | Gerekçe |
|---|---|---|---|---|
| P1-1 | Next.js sürümü | Güncel kararlı | **16.4.4** | 16.4.5 kurulum günü yayınlandı; pnpm 12'nin tedarik zinciri politikası (en az 1 gün bekleme) reddetti. Politika gevşetilmedi |
| P1-2 | Paket yöneticisi | pnpm | pnpm **12.16.1**, Node ile gelen **Corepack** üzerinden (`package.json` → `packageManager`). Global kurulum yok | Makinede pnpm kurulu değildi |
| P1-3 | Oturum yenileme dosyası | `src/middleware.ts` | Next.js 16'da adı **`src/proxy.ts`**. Auth aşamasında eklenecek; Phase 1'de yok | Next.js 16 değişikliği |
| P1-4 | Cache Components | – | Açık (Next.js 16 varsayılanı). Dil cookie'den okunduğu için çeviri kullanan içerik kök layout'ta `<Suspense>` içinde; `<html lang>` satır içi script ile boyamadan önce ayarlanıyor | Next.js 16 resmi kalıbı |
| P1-5 | Çeviri dosyaları | `src/i18n/tr.json · en.json` | Metinler **`src/locales/`**, yapılandırma **`src/i18n/`** (config, request, actions) | Metin ile yapılandırmayı ayırmak |
| P1-6 | Dil yönlendirmesi | – | URL'de dil öneki **yok**; dil `pickaly_locale` cookie'sinden. Profil ayarına bağlanmaya hazır (`setLocale` server action) | §2'deki öneksiz adreslerle uyum |
| P1-7 | Token üretimi | Style Dictionary | **Bağımlılıksız betik** (`scripts/build-tokens.mjs`). `pnpm tokens:build` / `tokens:check` | Tek hedef (CSS) için ek paket gereksiz. İkinci hedef (ör. React Native) gerekirse Style Dictionary'e geçilir |
| P1-8 | Tailwind boşluk ölçeği | 4…64 | `--spacing: 1px`. `p-16` = 16 px; token adı = değer (DESIGN §4.1) | Figma'daki token adlarıyla birebir |
| P1-9 | Tailwind varsayılanları | Sıfırlanır | Renk, radius, gölge, breakpoint, font ve metin ölçekleri sıfırlandı. Yalnızca Pickaly token sınıfları var (`bg-surface-card`, `text-heading-h1`, `rounded-lg`, `shadow-floating`, `tablet:` / `laptop:` / `detail:` / `desktop:`) | DESIGN §10.5 |
| P1-10 | z-index katmanları | Tanımlı değil | **[Varsayım]** `base 0 · sticky 10 · nav 20 · fab 30 · drawer 40 · modal 50 · toast 60` (`tokens/layout.json`, durum: proposed) | DESIGN/RESPONSIVE'de z-index yok; overlay hiyerarşisinden türetildi |
| P1-11 | ESLint mimari kuralları | Lint ile zorlanır | Aktif: `process.env` yalnızca `src/lib/env.ts`'te; `lucide-react` yalnızca ikon kayıt defterinde; `.tsx` dosyalarında HEX renk yasak. Feature katman kuralları ilk modülle eklenecek | Kural ihlali deneme dosyasıyla doğrulandı |
| P1-12 | Kurulum betikleri | – | `pnpm-workspace.yaml` → `allowBuilds`: sharp, unrs-resolver, @parcel/watcher, @swc/core **çalıştırılmaz** | Tedarik zinciri güvenliği; bu paketlerin betikleri gerekmiyor |
| P1-13 | Favicon / PWA ikonları | 192 / 512 / maskable | ✅ 2026-11-06: logo kitinden favicon, PWA ve apple-touch ikonları | Logo kiti `pickaly-logo/` (ürün sahibi) |
| P1-14 | Ertelenen paketler | TanStack Query, RHF + Zod, Radix, Vaul, date-fns, Sonner, Serwist, Sentry, Vitest, Playwright, Prettier | Kurulmadı | Phase 1'de kullanılmıyor; ilgili aşamada eklenecek |

### 14.1 Phase 2 – UI temeli ve navigasyon

| # | Konu | Uygulama | Durum |
|---|---|---|---|
| P2-1 | UI bileşenleri | `Button` / `ButtonLink` (LG/SM × Primary/Secondary/Tertiary/Destructive, ikon, loading, disabled, pill), `IconButton`, `Chip` (task/payment/neutral/success/warning), `ChipSelect` (32 px), `SegmentedControl`, `Card` (liste kartı), `Spinner` | Figma Components + DESIGN §8 ölçüleriyle |
| P2-2 | Navigasyon | `AppNavigation` tek yapılandırmadan üç görünüm: mobil alt pill nav, tablet 80 px rail, laptop+ 240/264 px sidebar; `NavLink` aktif durumu `aria-current` | Rail ve sidebar TD-11 tasarımı beklemeden RESPONSIVE kurallarıyla (PRD §19.2) |
| P2-3 | Üst bar | `AppTopBar`: mobilde Figma Header (marka + 3 ikon), tablet+ yalnızca aksiyonlar. Arama, bildirim ve hesap butonları **devre dışı** (özellikler yok) | – |
| P2-4 | Rotalar | `(app)` grubu: `/`, `/takvim`, `/islemler`, `/birikimler`, `/profil`. Sekme sayfaları geçici yer tutucu; başlıklar Pages'tan | Modüller sonraki aşamalarda |
| P2-5 | Yeni token'lar | `color.surface.nav-active` (Neutral/200), `color.text.on-neutral` (Neutral/600), `layout.bottom-nav-offset` (100 px mobil, 0 tablet+), `layout.topbar-height` 64 px | Figma ölçülerinden |
| P2-6 | z-index | `base 0 · sticky 10 · nav 20 · fab 30 · drawer 40 · modal 50 · toast 60` kullanılıyor | **[Varsayım]** Onay bekliyor |
| P2-7 | Dokunma alanı | Görünüm Figma ölçüsünde (ör. segmented 32 px, ikon buton 40 px); `touch-target` yardımcı sınıfı tıklanabilir alanı görünmez şekilde mobil/tablette 44 px, laptop+ 40 px'e genişletiyor | **[Varsayım]** Onay bekliyor |
| P2-8 | İngilizce nav etiketi | "İşlemler" → **"Activity"**. 360 px'de beş etiket de kesilmeden sığıyor (RESPONSIVE §9.3 riski) | – |
| P2-9 | Figma metin düzeltmesi | Profil alt başlığı Figma'da "ayalarlar yapın"; uygulamada **"ayarlar yapın"** | Tasarım ekibine iletilmeli |
| P2-10 | Ertelenenler | "Yeni işlem" (FAB / rail / sidebar butonu; formu yok), rail logo işareti (logo yok), hero kartlar, Top Navigation Header (odak ekranları) | İlgili modüllerle |
