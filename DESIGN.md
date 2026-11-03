# Pickaly – Design System

> **Sürüm:** 1.2.
> - 1.1: Doküman çelişkileri karara bağlandı (§11, Ç-1…Ç-13).
> - 1.2: TR + EN metin ve biçim kuralları (§1.3, §3.2). Figma güncellemeleri (Ç kararları) PRD §19.4'te TD-F1…TD-F8 olarak takip ediliyor.
> - 1.3: Chip ve uyarı metin renkleri AA kontrast için koyulaştırıldı (§9.2.1, ürün sahibi onayı). Figma takibi TD-F9.
> **Tasarım kaynağı:** Figma `Fatih-Test` (`fRjZAdt4WTgyRRsPrUTTab`). Yalnızca **Pages** (19 mobil ekran, 390 px) ve **Components** sekmeleri kullanıldı. **AI Pages kapsam dışıdır.**
> **İlgili dokümanlar:**
> - [RESPONSIVE.md](RESPONSIVE.md): breakpoint'ler ve ekran yerleşimleri
> - [TECH_STACK.md](TECH_STACK.md): token altyapısı ve kod mimarisi
>
> Bu doküman kod veya Figma değişikliği içermez.

**İşaretler**

| İşaret | Anlamı |
|---|---|
| **[Figma]** | Figma'dan doğrudan okunan değer (değişken, style veya ölçü) |
| **[Karar]** | Önceki dokümanlarda kesinleşmiş değer (RESPONSIVE Karar #n veya TECH_STACK D-n) |
| **[Yeni]** | Bu dokümanla eklenen, Figma'da karşılığı olmayan değer |
| **[Varsayım]** | Tahmin edilen veya ölçülemeyen değer. Doğrulanmalı |
| **[Eksik]** | Figma'da bulunmayan component. Bkz. §8.11 öneriler |
| **[Bulgu]** | Figma'da tespit edilen tutarsızlık veya iyileştirme ihtiyacı. Figma'yı değiştirmez |

---

## 1. Design Philosophy

### 1.1 Görsel kimlik
Pickaly, **para ve zaman planlamasını tek bir sakin arayüzde** birleştiren bir "Life & Money Planner" [Figma: Header alt başlığı]. Görsel dil bu çift rolü yansıtır.

- **Teal marka rengi** (`#0F766E`): güven ve büyüme hissi verir. Finans uygulamalarındaki agresif yeşil/kırmızı yerine dengeli bir birincil renk.
- **Slate nötrler:** Arayüzün %90'ı beyaz kartlar, açık gri zemin ve koyu slate metinden oluşur. Renk yalnızca **anlam taşıdığında** kullanılır: gelir, gider, durum, kategori.
- **İki "hero" kart:** Toplam Bakiye kartı (koyu slate gradyan) ve Birikim Hedefi kartı (teal gradyan). Sayfanın odak noktalarıdır. Gradyan **yalnızca bu iki kartta** bulunur [Figma].
- **Yumuşak, yuvarlak formlar:** 12–24 px köşe yarıçapları, tam yuvarlak chip'ler ve yüzen pill navigasyon. Samimi ama oyuncak gibi değil.
- **Manrope:** Geometrik, okunaklı ve rakamları net bir yazı tipi. Tutarlar büyük ve kalın; etiketler küçük ve yarı kalın.

### 1.2 Arayüz prensipleri
1. **Önce bilgi, sonra süs.** Her ekranın en üstünde kullanıcının o an bilmesi gereken özet durur: bakiye, bugünün akışı, dönem net değişimi.
2. **Tek dokunuşla aksiyon.** Sık işler kart üzerinde doğrudan yapılır: "Ödendi olarak işaretle", görevi tamamla (✓), hızlı tutar chip'leri.
3. **Renk = anlam.** Yeşil gelir veya tamamlandı, kırmızı gider veya hata, turuncu yaklaşan veya uyarı demektir. Bu renkler dekoratif amaçla kullanılmaz.
4. **Yüzey ayrımı gölgeyle değil, zemin ve çizgiyle yapılır** (§6).
5. **Sakin yoğunluk.** Bölümler arası 24 px, kart içi 12–16 px boşluk. Metin satırları kısa, ikincil bilgi `Text/Secondary` ile geri planda.

### 1.3 Tutarlılık ve kullanılabilirlik kuralları
- **Token zorunlu:** Her değer bir token'dan gelir. Token dışı renk, boşluk veya yarıçap kullanılmaz.
- **Tekrar kullanım:** Aynı işi yapan iki farklı görünüm olmaz. Örn. tüm birincil aksiyonlar `Button / Primary`.
- **Dokunma alanı:** Mobil ve tablette en az 44×44 px.
- **Metin dili:** Türkçe (varsayılan) ve İngilizce [TECH_STACK D-31]. Kısa ve eylem odaklı ("Kaydet", "Ödendi olarak işaretle"). Para ve tarih biçimi seçili dile göre: TR "24.850,00 ₺", EN "₺24,850.00" [PRD Q-22].
- **Bir aksiyon, tek yer:** Bir aksiyon her breakpoint'te tek bir yerde durur (RESPONSIVE §5.2).

---

## 2. Color System

### 2.1 Mimari [Karar: RESPONSIVE §6.4, TECH_STACK §8.2]
Renkler iki katmandan oluşur:

| Katman | Açıklama |
|---|---|
| **Primitive** | Ham palet. Bileşenler doğrudan kullanmaz |
| **Semantic** | Anlamsal roller. Bileşenler **yalnızca** bunları kullanır. v1'de tek tema (`light`); dark mode eklenince yalnızca semantic katman yeniden eşlenir |

Figma'da şu anda tek bir `Colors` koleksiyonu var. Primitive ve semantic token'lar karışık, tüm scope'lar `ALL_SCOPES` [Figma]. Aşağıdaki yapı hedef mimaridir.

### 2.2 Brand (primitive) [Figma]

| Token | Değer | Figma değişkeni | Kullanım |
|---|---|---|---|
| `color.brand.primary` | `#0F766E` | `Brand/Primary` | Birincil buton, aktif durum, vurgu metni |
| `color.brand.primary-hover` | `#115E59` | `Brand/Primary Hover` | Birincil buton hover; Birikim Hedefi gradyan sonu |
| `color.brand.primary-subtle` | `#CCFBF1` | `Brand/Primary Subtle` | Secondary buton zemini, seçili durum zemini |
| `color.brand.accent` | `#14B8A6` | `Brand/Accent` | Birikim Hedefi gradyan başı, dekoratif vurgu. **Metin rengi olarak kullanılmaz** (§9.2) |
| `color.brand.white` | `#FFFFFF` | `Brand/White` | Kart yüzeyi, ters metin |

### 2.3 Neutral (primitive) [Figma]

| Token | Değer | Figma değişkeni | Başlıca rol |
|---|---|---|---|
| `color.neutral.50` | `#F8FAFC` | `Neutral/50 - BG` | Sayfa zemini |
| `color.neutral.100` | `#F1F5F9` | `Neutral/100` | Segmented control zemini, ince ayraç |
| `color.neutral.200` | `#E2E8F0` | `Neutral/200 - Border` | Varsayılan çerçeve; nav "on" zemini |
| `color.neutral.300` | `#CBD5E1` | `Neutral/300` | Güçlü çerçeve; koyu kart üzerinde ikincil metin |
| `color.neutral.400` | `#94A3B8` | `Neutral/400` | Placeholder, pasif ikon |
| `color.neutral.500` | `#64748B` | `Neutral/500` | İkincil metin |
| `color.neutral.600` | `#475569` | `Neutral/600` | "Genel" chip metni, yardımcı metin |
| `color.neutral.700` | `#334155` | `Neutral/700` | Bakiye kartı gradyan başı |
| `color.neutral.800` | `#1E293B` | `Neutral/800` | – |
| `color.neutral.900` | `#0F172A` | `Neutral/900` | Birincil metin; bakiye kartı gradyan sonu; overlay |
| `color.neutral.950` | `#020617` | `Neutral/950` | – |

### 2.4 Semantic durum renkleri

| Token | Değer | Figma karşılığı | Anlam |
|---|---|---|---|
| `color.status.success` | `#15803D` | `Semantic/Gelir - Tamamlandı` | Gelir, tamamlandı, ödendi |
| `color.status.danger` | `#DC2626` | `Semantic/Gider - Hata` | Gider, hata, silme |
| `color.status.warning` | `#D97706` | `Semantic/Yaklaşan` | Yaklaşan, bekliyor, son gün |
| `color.status.info` | `#2563EB` | **Yok** [Yeni] | Bilgilendirme metni ve ikonu |

**Zemin tonları:** Figma'daki açık kategori tonları zemin olarak kullanılır.

| Token | Değer | Kaynak |
|---|---|---|
| `color.status.success-subtle` | `#DCFCE7` | `Category/Green` |
| `color.status.danger-subtle` | `#FEE2E2` | `Category/Red` |
| `color.status.warning-subtle` | `#FFEDD5` | `Category/Orange` |
| `color.status.info-subtle` | `#DBEAFE` | `Semantic/Bilgilendirme` ve `Category/Blue` |

> [Bulgu → Karar Ç-7] Figma'daki `Semantic/Bilgilendirme` (`#DBEAFE`) bir **zemin** tonu. **İki ton** kullanılır: `status.info` `#2563EB` (metin/ikon) ve `status.info-subtle` `#DBEAFE` (zemin). `#2563EB`'nin Figma'ya eklenmesi gerekir.

### 2.5 UI semantic renkleri

**Metin**

| Token | Eşlendiği değer | Figma |
|---|---|---|
| `color.text.primary` | → `neutral.900` | `Text/Primary` |
| `color.text.secondary` | → `neutral.500` | `Text/Secondary` |
| `color.text.tertiary` | → `neutral.400` [Yeni] | – (placeholder, pasif) |
| `color.text.inverse` | → `brand.white` | – |
| `color.text.inverse-secondary` | → `neutral.300` | Bakiye kartındaki ikincil metin [Figma] |
| `color.text.brand` | → `brand.primary` | Secondary buton metni, aktif nav |
| `color.text.success` / `danger` / `info` | → `status.*` | Tutar ve durum metinleri |
| `color.text.warning` | → `amber.700` `#B45309` [Karar §9.2.1] | Beyaz zemin üzerinde uyarı metinleri. `status.warning` küçük metinde kullanılmaz |
| `color.text.on-task` / `on-payment` / `on-warning` | → `#4338CA` / `#BE123C` / `#92400E` [Karar §9.2.1] | Görev, Ödeme ve Turuncu chip metinleri |

**Yüzey** (Figma'da semantic karşılığı yok, değerler mevcut kullanımdan alındı)

| Token | Eşlendiği değer | Kullanım [Figma] |
|---|---|---|
| `color.surface.page` | → `neutral.50` | Sayfa zemini |
| `color.surface.card` | → `brand.white` | Kartlar, input'lar, header, nav pill |
| `color.surface.muted` | → `neutral.100` | Segmented control zemini |
| `color.surface.selected` | → `brand.primary-subtle` | Seçili satır/öğe zemini |
| `color.surface.inverse` | → gradyan `neutral.700 → neutral.900` | Toplam Bakiye kartı |
| `color.surface.brand` | → gradyan `brand.accent → brand.primary-hover` | Birikim Hedefi kartı |
| `color.surface.overlay` | → `neutral.900` @ %40 [Varsayım] | Modal/drawer arka planı |

**Çerçeve** (Figma `Border & Radius` koleksiyonu)

| Token | Eşlendiği değer | Figma |
|---|---|---|
| `color.border.default` | → `neutral.200` | `Border/Default` |
| `color.border.subtle` | → `neutral.100` | `Border/Subtle` |
| `color.border.strong` | → `neutral.300` | `Border/Strong` |
| `color.border.focus` | → `brand.primary` | `Border/Focus` |
| `color.border.error` | → `status.danger` | `Border/Error` |
| `color.border.success` | → `status.success` | `Border/Success` |

**Etkileşim** [Yeni] (Figma'da hover/pressed tanımı yok, yalnızca Primary Hover var)

| Token | Değer | Not |
|---|---|---|
| `color.action.primary` / `-hover` | `brand.primary` / `brand.primary-hover` | [Figma] |
| `color.action.primary-pressed` | `#134E4A` [Varsayım] | teal-900 tonu |
| `color.action.secondary-hover` | `#99F6E4` [Varsayım] | Primary Subtle'ın bir koyusu |
| `color.action.tertiary-hover` | → `neutral.50` | |
| `color.action.danger-hover` | `#B91C1C` [Varsayım] | red-700 |

### 2.6 Kategori renkleri [Figma: `Category/*`]
Kategori Yönetimi ekranında renk adlarıyla gösterilir ("Teal", "Green", "Blue"… [Figma]).

| Token | Zemin | Figma |
|---|---|---|
| `color.category.teal` | `#CCFBF1` | `Category/Teal` |
| `color.category.blue` | `#DBEAFE` | `Category/Blue` |
| `color.category.violet` | `#EDE9FE` | `Category/Violet` |
| `color.category.pink` | `#FCE7F3` | `Category/Pink` |
| `color.category.orange` | `#FFEDD5` | `Category/Orange` |
| `color.category.amber` | `#FEF3C7` | `Category/Amber` |
| `color.category.green` | `#DCFCE7` | `Category/Green` |
| `color.category.red` | `#FEE2E2` | `Category/Red` |
| `color.category.slate` | `#E2E8F0` | `Category/Slate` |

- **Kullanım:** Kategori ikon kutusu zemini ve kategori chip'i.
- **Ön plan (ikon/metin) renkleri:** Figma'da kategori başına ön plan rengi **tanımlı değil**.
  - [Varsayım] Her kategori için aynı ailenin 700 tonu önerilir (örn. teal → `#0F766E`, blue → `#1D4ED8`). Bu değerler [Yeni] olup tasarım onayı gerektirir.

### 2.7 Finansal grafik renkleri [Figma: `Chart/*`]

| Token | Değer | Anlam |
|---|---|---|
| `color.chart.income` | `#16A34A` | Gelir çubuğu |
| `color.chart.expense` | `#E11D48` | Gider çubuğu |
| `color.chart.savings` | `#0D9488` | Birikime aktarılan |
| `color.chart.balance` | `#6366F1` | Bakiye / net |
| `color.chart.neutral` | `#CBD5E1` | Boş iz, kalan |

- **Kapsam:** Chart renkleri **yalnızca grafiklerde** kullanılır.
- [Bulgu] Figma'da bazı bileşenler chart token'larını metin rengi olarak kullanıyor:
  - `Chip / Görev` metni → `Chart/Balance`
  - `Chip / Ödeme` metni → `Chart/Expense`
  - Switch açık zemini → `Chart/Income`
  - Görünüm aynı kalır, ama token mimarisinde bunlar `chip.*` / `switch.*` component token'larına bağlanmalıdır (§10.4).

---

## 3. Typography

### 3.1 Font
- **Aile:** **Manrope** (Google Fonts). Web'de `next/font` ile kendi sunucumuzdan sunulur. `latin-ext` alt kümesi zorunlu (ğ, ş, ı, İ) [Karar: TECH_STACK §8.3].
- **Kullanılan ağırlıklar** [Figma]:

| Ağırlık | Değer |
|---|---|
| Regular | 400 |
| SemiBold | 600 |
| Bold | 700 |

  Başka ağırlık yüklenmez.
- **Harf aralığı:** Tüm stillerde 0 [Figma].
- **Rakamlar:** Tutar ve saat gösterimlerinde `font-variant-numeric: tabular-nums` [Yeni]. Liste satırlarında tutarlar alt alta hizalanır.

### 3.2 Ölçek
Boyutlar Figma text style'larından [Figma]. Satır yükseklikleri kesinleşmiş kurala göre [Karar: RESPONSIVE §6.3 / Karar #11]:
- Başlık **%125**
- Gövde **%150**
- Tutar **%110**

| Token | Ağırlık | Mobile / Tablet (size / line-height) | Laptop / Desktop (size / line-height) | Kullanım [Figma] |
|---|---|---|---|---|
| `type.display.lg` | Bold 700 | 32 / 40 | 36 / 45 | Büyük başlık |
| `type.heading.h1` | Bold 700 | 28 / 35 | 32 / 40 | Header "Pickaly", sayfa başlıkları |
| `type.heading.h2` | Bold 700 | 24 / 30 | 28 / 35 | Bölüm başlıkları |
| `type.heading.h3` | SemiBold 600 | 20 / 25 | 20 / 25 | Kart başlığı (Birikim Hedefi) |
| `type.heading.h4` | SemiBold 600 | 18 / 23 | 18 / 23 | "Bugünün Akışı", detay header başlığı |
| `type.body.lg` | Regular 400 | 16 / 24 | 16 / 24 | Ay seçici metni |
| `type.body.md` | Regular 400 | 14 / 21 | 14 / 21 | Input metni, açıklamalar |
| `type.body.sm` | Regular 400 | 12 / 18 | 12 / 18 | Meta bilgi ("Sağlık", "Ana Hesap") |
| `type.label.md` | SemiBold 600 | 14 / 21 | 14 / 21 | Liste satırı başlığı |
| `type.label.sm` | SemiBold 600 | 12 / 18 | 12 / 18 | Chip, kart etiketi ("TOPLAM BAKİYE") |
| `type.button` | SemiBold 600 | 14 / 21 | 14 / 21 | Tüm buton metinleri |
| `type.data.lg` | Bold 700 | 32 / 35 | 40 / 44 | Bakiye, ana tutarlar |
| `type.data.md` | Bold 700 | 24 / 26 | 28 / 31 | İkincil tutarlar |

**Notlar:**
- **Figma'nın mevcut durumu:** Text style'ların satır yüksekliği şu an "Auto", Button/Default'ta ise 20 px [Figma]. Yukarıdaki değerler kesinleşmiş hedef değerlerdir. Figma'da güncellenmesi gerekir (RESPONSIVE §6.3).
- **[Bulgu → Karar Ç-11] Nav etiketi stil dışı:** `Nav Bar Buttons` etiketi (Ana Sayfa, Takvim…) bir text style'a bağlı değil: **Bold 10 px** [Figma].
  - **Karar:** Yeni stil `type.label.xs` → Bold 700, 10 / 15. Figma'ya stil olarak eklenir.
  - 10 px metin **yalnızca nav etiketlerinde** kullanılır.

| Token | Ağırlık | Tüm breakpoint'ler | Kullanım |
|---|---|---|---|
| `type.label.xs` | Bold 700 | 10 / 15 | Alt nav, rail etiketleri |
- **Büyük harf:** "TOPLAM BAKİYE", "BİRİKİM HEDEFİ" gibi etiketler büyük harf yazılıyor [Figma]. Kodda `text-transform` yerine metnin kendisi büyük harfle yazılır. Büyük harfe çevirme gerekirse seçili dilin yerel ayarıyla yapılır (Türkçe'de `i → İ` için `tr-TR`, İngilizce'de `en`).

### 3.3 Hiyerarşi kuralları
- Bir ekranda en fazla bir `heading.h1` bulunur (sayfa başlığı).
- Tutar her zaman çevresindeki metinden daha büyük ve kalındır (`data.*`).
- İkincil bilgi boyutla değil **renkle** geri plana alınır (`text.secondary`).

---

## 4. Spacing System

### 4.1 Ölçek [Figma: `Spacing` koleksiyonu, 4 px tabanlı]

| Token | Değer |
|---|---|
| `space.4` | 4 |
| `space.8` | 8 |
| `space.12` | 12 |
| `space.16` | 16 |
| `space.20` | 20 |
| `space.24` | 24 |
| `space.32` | 32 |
| `space.40` | 40 |
| `space.48` | 48 |
| `space.64` | 64 |

- Token adı değerin kendisidir. Figma'da da öyle [Figma].
- Bu ölçek dışında değer kullanılmaz.

### 4.2 Kullanım haritası [Figma]

| Bağlam | Değer |
|---|---|
| Sayfa yatay padding (mobil) | 16 |
| Bölümler arası | 24 |
| Bölüm başlığı → içerik | 12 |
| Kart iç padding: hero kartlar, Birikim Hedefi | 16 |
| Kart iç padding: liste kartı, ajanda kartı | 12 |
| Kart içi öğeler arası | 8 / 12 |
| Buton yatay padding / ikon–metin arası | 16 / 8 |
| Chip padding (dikey / yatay) / iç boşluk | 4 / 8 / 4 |
| Segmented control padding / öğe arası | 4 / 4 |
| Header padding (dikey / yatay) | 8 / 16 |
| Alt nav padding | 16 / 16 / 24 / 16 (alt 24 güvenli alan payı) |
| Hızlı aksiyon kartları arası | 8 |

- Responsive spacing değerleri `Layout` token'larındadır (RESPONSIVE §6.2): sayfa padding 16 → 24 → 32 → 40.

**[Bulgu] Ölçek dışı değerler:**
- İşlemler'deki kategori filtre şeridinde **6 px** gap var (değişkene bağlı değil).
- `Nav Bar Buttons` içinde **1 px** gap var.
- Header ve bazı satırlarda boşluklar "space-between" ile oluşmuş (79,39 px, 130,66 px vb.). Bunlar sabit değer değildir, kodda `justify-content: space-between` olarak uygulanır.
- Öneri: 6 → 8, 1 → 0 veya 4.

---

## 5. Border Radius

### 5.1 Token'lar [Figma: `Border & Radius` koleksiyonu]

| Token | Değer | Figma |
|---|---|---|
| `radius.none` | 0 | `Radius/None` |
| `radius.xs` | 4 | `Radius/XS` |
| `radius.sm` | 8 | `Radius/SM` |
| `radius.md` | 12 | `Radius/MD` |
| `radius.lg` | 16 | `Radius/LG` |
| `radius.xl` | 20 | `Radius/XL` |
| `radius.2xl` | 24 | `Radius/2XL` |
| `radius.full` | 999 | `Radius/Full` |

### 5.2 Kullanım haritası [Figma]

| Radius | Nerede |
|---|---|
| `sm` (8) | Segmented control içindeki seçenek |
| `md` (12) | Button (LG/SM), Input, select alanı, Segmented control kabı, ay seçici |
| `lg` (16) | Liste kartları (İşlemler grupları, ajanda kartı, ayar grupları), Hızlı Aksiyon kartı, Birikim Hedefi |
| `2xl` (24) | Hero ve odak kartları: Toplam Bakiye, Durum & Başlık kartları, tutar kartı |
| `full` (999) | Chip, Chip-Kategori, Floating Button, Nav Bar pill, Nav Bar Buttons, Detay-Nav Bar kabı ve butonları, switch, avatar, tutar "pill"i |
| `xs` (4), `xl` (20) | Pages'ta kullanımı görülmedi. Rezerv |

**Kurallar:**
- **İç içe yüzeyler:** İç yarıçap = dış yarıçap − iç padding (en az `sm`).
  - Örnek: 12 px radius'lu segmented kap + 4 px padding → 8 px seçenek [Figma].
- **Sabit radius:** Radius breakpoint'e göre **değişmez**.

---

## 6. Shadows & Elevation

### 6.1 İlke
- **Yüzey ayrımı önce zemin ve çizgiyle yapılır.** Sayfa `surface.page` (Neutral/50), kart `surface.card` (beyaz) ve `border.default` 1 px.
- **Pages'taki durum:** Liste kartlarının ve ayar gruplarının çoğunda gölge **yok** [Figma]. Katman adları "Background+Border+Shadow" olsa da effect uygulanmamış.
- **Gölge yalnızca gerçekten yükselen öğelerde kullanılır:** yüzen butonlar, alt barlar, overlay'ler ve hero kartlar.

### 6.2 Effect style'lar [Figma]
Hepsi `#0F172A` renkli drop shadow.

| Token | Figma | Değer (x y blur spread, opaklık) |
|---|---|---|
| `shadow.xs` | `XS` | 0 1 2 0, %5 |
| `shadow.sm` | `SM` | 0 2 4 0, %6 |
| `shadow.md` | `MD` | 0 4 8 0, %8 |
| `shadow.lg` | `LG` | 0 8 16 −2, %10 |
| `shadow.xl` | `XL` | 0 12 24 −4, %12 |
| `shadow.card` | `Shadow/Card` | 0 2 8 0, %5 |
| `shadow.floating` | `Shadow/Floating` | 0 6 16 0, %12 |
| `shadow.overlay` | `Shadow/Overlay` | 0 16 32 −4, %16 |

### 6.3 Elevation seviyeleri

| Seviye | Öğeler [Figma] | Gölge |
|---|---|---|
| 0 – Düz | Sayfa, liste kartları, input'lar, ayar grupları | Yok (çerçeve) |
| 1 – Hafif kabarık | Hızlı Aksiyon kartları, segmented'daki seçili seçenek | `shadow.sm` |
| 2 – Vurgulu | Avatar | `shadow.md` |
| 3 – Yüzen | Floating Button, Toplam Bakiye kartı, Detay-Nav Bar kabı, tutar pill'i | `shadow.floating` |
| 4 – Overlay | Modal, drawer, bottom sheet, popover [Eksik] | `shadow.overlay` |

**Kurallar:**
- **Kullanılmayan style'lar:** `shadow.xs`, `lg`, `xl` ve `card` Pages'taki ürün ekranlarında kullanılmıyor (`card` yalnızca Figma'daki sayfa başlığı yardımcısında). Yeni kullanım için önce seviye tablosuna eklenmeleri gerekir.
- **Gölge + çerçeve:** Aynı öğede gölge ve çerçeve birlikte yalnızca seviye 1 ve 3'te kullanılır. Örn. Hızlı Aksiyon: `border.subtle` + `shadow.sm` [Figma].

---

## 7. Iconography

### 7.1 Kütüphane
- **Kaynak:** **Lucide** (Figma'da `lucide/*` adlı ikonlar [Figma]). Kodda `lucide-react`.
- **Kural:** Başka bir ikon seti veya emoji kullanılmaz.

### 7.2 Boyutlar ve stroke [Figma: Pages'taki 337 ikon ölçüldü]
Lucide'ın 24 px grid'deki **2 px stroke**'u ikonla birlikte **orantılı ölçeklenir**. Kodda `absoluteStrokeWidth` **kapalı**dır.

| Token | Boyut | Ortaya çıkan stroke | Kullanım [Figma] | Adet |
|---|---|---|---|---|
| `icon.size.xs` | 14 | 1,17 | Meta satırı ikonları (konum, saat) | 32 |
| `icon.size.sm` | 16 | 1,33 | Liste satırı içi, chevron, input ikonları | 108 |
| `icon.size.md` | 20 | 1,67 | **Varsayılan.** Butonlar, navigasyon, header aksiyonları, kategori ikonları | 184 |
| – | 30 | 1,33 | [Bulgu] 13 ikon 30 px çerçevede ama 16 px stroke'unda. Büyük olasılıkla 16 px ikon + 30 px kap. Kodda `icon.size.sm` + kap olarak uygulanır [Varsayım] | 13 |

### 7.3 Kullanım kuralları
- **Renk:** İkon rengi bulunduğu metnin rengini alır (`currentColor`). Ayrı ikon rengi yalnızca durum anlatırken kullanılır (`status.*`).
- **İkon kutusu:** Kategori ikonu açık kategori zemininde, yuvarlak köşeli bir kutuda gösterilir [Figma: liste satırları, Hızlı Aksiyonlar].
  - [Varsayım] Kutu boyutu ve yarıçapı ölçülmedi. Liste satırında ~40 px, Hızlı Aksiyonlarda ~40 px ve `radius.md`. Doğrulanmalı.
- **Etiket:** Tek başına ikon buton (header'daki arama, bildirim, hesap) her zaman `aria-label` taşır.
- **Dokunma alanı:** İkon buton görünümü 20 px olsa da en az 44×44 px'tir.
- **Anlam tutarlılığı:** Bir kavram tek ikonla temsil edilir:

| Kavram | İkon |
|---|---|
| Ana Sayfa | `house` |
| Takvim | `calendar` |
| İşlemler | `scroll` |
| Birikimler | `wallet` |
| Profil | `user-round` |
| Gelir / Gider | `banknote-arrow-up` / `banknote-arrow-down` |
| Silme | `trash` |
| Düzenleme | `pencil` |
| Tekrar | `repeat` |
| Para birimi | `turkish-lira` |

  Pages'ta kullanılan 65 farklı ikon var, bu eşleşmeler Pages'taki kullanımdan çıkarıldı.

---

## 8. Component Library

> **Kapsam:** Bu bölüm yalnızca **Figma Components sekmesinde bulunan** component'leri listeler. Pages'ta çizilmiş ama component olmayan kalıplar "Pages kalıbı" olarak ayrıca belirtilir. Components'ta olmayan her şey §8.11'de **öneri** olarak yer alır.
>
> **[Bulgu] Varyant adlandırması:** Figma'da `State` property'si **görsel varyantı** ifade ediyor (Primary, Secondary…), etkileşim durumunu değil. Etkileşim durumları (hover, focus, disabled, loading) hiçbir component'te tanımlı değil. Kodda `variant` ve `state` ayrı tutulur.

### 8.1 Buttons

#### `Button` [Figma: Components → Actions → Button]
- **Amaç:** Tüm metinli aksiyonlar.
- **Property'ler:**

| Property | Tip | Değerler |
|---|---|---|
| `Size` | variant | `LG`, `SM` |
| `State` (görsel varyant) | variant | `Primary`, `Secondary`, `Tertiary`, `Destructive` |
| `Label` | text | |
| `Leading Icon` | boolean | |
| `Trailing Icon` | boolean | |

- **Ölçüler:**

| Ölçü | Değer |
|---|---|
| Yükseklik | LG 48, SM 38 |
| Yatay padding | 16 |
| İkon–metin arası | 8 |
| Radius | `radius.md` |
| Metin | `type.button` |
| İkon | 20 px |

- **Varyantlar:**

| Varyant | Zemin | Metin | Çerçeve | Kullanım |
|---|---|---|---|---|
| Primary | `brand.primary` | `text.inverse` | – | Ekranın birincil aksiyonu ("Kaydet") |
| Secondary | `brand.primary-subtle` | `text.brand` | – | Önerilen ikincil aksiyon; ödeme kartlarındaki "Ödendi olarak işaretle" [D-5, Ç-4] |
| Tertiary | `surface.card` | `text.primary` | `border.default` 1 px | Nötr aksiyon: silme onayında "Vazgeç" [Ç-5], form footer'ında "İptal" [Ç-10] |
| Destructive | `status.danger` | `text.inverse` | – | Silme onayındaki "Sil" |

- **Durumlar:** Figma'da yok [Eksik]. Hedef değerler §9.3'te.
- **Kurallar:**
  - Bir görünümde en fazla **bir** Primary buton bulunur.
  - Destructive yalnızca geri alınamaz işlemlerde kullanılır.
  - Metin fiil ile başlar.
  - Tam genişlik yalnızca mobil form footer'larında ve mobil kart aksiyonlarında kullanılır.

#### `Floating-Button` [Figma]
- **Amaç:** Mobilde "Yeni işlem" (FAB).
- **Ölçüler ve stil:** 48 px yükseklik, padding 16, `radius.full`, `brand.primary` zemin, `shadow.floating`, `+` ikonu + "Yeni işlem" metni.
- **Responsive:** Tablette rail içi buton, laptop ve üstünde sidebar'daki Primary buton olur (RESPONSIVE §2).

### 8.2 Inputs
- **Components'ta durum:** **Component yok** [Eksik]. Components → "Inputs" bölümünde yalnızca iki dikdörtgen var [Figma].
- **Pages kalıbı** (Yeni İşlem formu [Figma]):
  - **Metin input'u:** 46 px yükseklik, padding 12 / 16, `radius.md`, `surface.card`, `border.default` 1 px, metin `type.body.md`.
  - **Select alanı** (Tarih, Saat, Tekrarlama Sıklığı): 45 px yükseklik, padding 12, `radius.md`, sol ikon + değer + sağda chevron-down.
  - **Hesap seçici kartı:** "Ana Hesap / Bakiye 24.850,00 ₺ / Değiştir ⇅".
  - **Textarea:** "Not (İsteğe Bağlı)" ve sağ üstte "x/200" sayaç.
  - **Tutar pill'i:** `type.data.lg`, `radius.full`, `shadow.floating`.
- **[Bulgu → Karar Ç-2] Yükseklik farkı:** Input 46 px, select 45 px [Figma]. **Karar:** İkisi de **46 px**. Select'in Figma'da 1 px büyütülmesi gerekir.
- **İstisnalar [Ç-13]:** Seçici liste satırı (bottom sheet / popover seçeneği) ve OTP kutusu **48 px**. Seçici satırı bir liste öğesidir; OTP kutusu tek karakterlik büyük bir dokunma hedefidir.

### 8.3 Cards

#### `Section - 1. Ana Finansal Odak (Bakiye & Gelir-Gider Özeti Kartı)` [Figma]
- **Amaç:** Ana Sayfa'daki toplam bakiye özeti.
- **İçerik:** "TOPLAM BAKİYE" etiketi, bakiye (`type.data.lg`), "Aylık Rapor ›" linki, Bu Ay Gelir / Gider mini kartları, "Bugün: n Görev, n Ödeme bekliyor" satırı.
- **Stil:** 358×200, padding 16, gap 12, `radius.2xl`, gradyan `neutral.700 → neutral.900`, `shadow.floating`. Metinler `text.inverse` / `text.inverse-secondary`.

#### `Birikim Hedefi` [Figma]
- **Amaç:** Öne çıkan birikim hedefinin ilerlemesi.
- **İçerik:** "BİRİKİM HEDEFİ", yüzde rozeti ("%75 Tamamlandı"), hedef adı (`heading.h4`), hedef tutarı, mevcut tutar (`heading.h3`), ilerleme çubuğu.
- **Stil:** padding 16, gap 8, `radius.lg`, gradyan `brand.accent → brand.primary-hover`, gölge yok.
- **[Bulgu] Genişlik:** Component 303 px, ekranda 358 px olarak kullanılıyor. Component genişliği sabit değil, kapsayıcıyı doldurmalı (fill).

#### `Section - 2. Hızlı Aksiyonlar (Minimalist Bar)` [Figma]
- **Amaç:** Gelir · Gider · Görev · Ödeme kısayolları.
- **Yapı:** 4 kart, aralarında 8 px. Her kart: 84×90, padding 12 / 0, gap 8, `radius.lg`, `surface.card`, `border.subtle`, `shadow.sm`, renkli ikon kutusu + `type.label.sm`.
- **Hedefler:** RESPONSIVE §3.1 (Gelir/Gider/Abonelik formları, Görev Ekle).

#### Pages kalıpları (component değil)

| Kalıp | Ölçüler [Figma] | Not |
|---|---|---|
| Liste kartı | `surface.card`, `border.default`, `radius.lg`, padding 0, satırlar arası ayraç | İşlemler grupları, ayar grupları |
| Ajanda kartı | padding 12, gap 12, `radius.lg`, `border.default`; solda saat kutusu | Takvim |
| Durum & Başlık kartı | `radius.2xl`, padding 16, gap 12 | Detay ekranlarının üst kartı |
| Birikim hesap kartı | – | Birikimler listesi |
| Paylaşım kartı | Sabit 358 px | Paylaşılabilir Rapor. Responsive değil [Karar] |

> Bu kalıpların component'e dönüştürülmesi önerilir (§8.11).

### 8.4 Navigation

#### `Header - Ust Başlık (Top Navigation & Profile Bar)` [Figma]
- **İçerik:** "Pickaly" (`heading.h1`) + "Life & Money Planner" (`body.sm`, `text.secondary`). Sağda arama, bildirim ve hesap ikonları (20 px).
- **Stil:** 64 px yükseklik, padding 8 / 16, `surface.card`, alt çerçeve `border.default`.
- **Davranış:**
  - Bildirim ikonu Bildirimler panelini açar [Karar D-24].
  - Hesap ikonu hesap menüsünü açar [Karar #5].
- **Responsive:** RESPONSIVE §4.9.

#### `Nav Bar` + `Nav Bar Buttons` [Figma]
- **Nav Bar:** Kap 356 (ekranda 390) × 100. Padding 16 / 16 / 24 / 16. İçinde 324×60 beyaz pill, `radius.full`.
- **Nav Bar Buttons property'leri:**

| Property | Tip | Değerler |
|---|---|---|
| `Property` | variant | `on`, `off` |
| `Label` | text | |
| `Instance` | instance swap | İkon |

- **Nav Bar Buttons stili:** 72×52, `radius.full`, ikon 20 px üstte, etiket Bold 10 altta.

| Durum | Zemin | İkon ve metin |
|---|---|---|
| on | `neutral.200` | `brand.primary` |
| off | Şeffaf | `text.secondary` |

- **Davranış:** Aktif sekme `aria-current="page"` taşır. Odak halkası §9.3'e göre.
- **Responsive:** Tablette dikey rail (aynı buton), laptop ve üstünde sidebar [Karar #10].

#### `Detay-Nav Bar` [Figma]
- **Amaç:** Odak ekranlarının sabit alt aksiyon barı.
- **Yapı:** Kap 390×100, padding 16 / 16 / 24 / 16. İçinde 358×56 beyaz pill (`radius.full`, `border.default`, `shadow.floating`) ve iki buton (48 px, `radius.full`).
- **[Bulgu] Bileşen dışı butonlar:**
  - Bardaki butonlar `Button` component'i **değil**: `radius.full` kullanıyorlar, Button ise `radius.md`.
  - Yeni İşlem'de "İptal" butonu `category.red` zemin + `trash` ikonuyla çizilmiş.
- **Karar Ç-10:** İptal = **Tertiary, ikonsuz**. Kaydet = Primary. Tehlike rengi ve `trash` ikonu yalnızca gerçek silme işlemlerinde kullanılır.
- [Varsayım] Bar içindeki butonların pill (`radius.full`) formu, yüzen bar görünümünün parçası olarak korunur. Varyant renkleri `Button` ile aynıdır. Tasarım ekibinin bunu `Button`'a ayrı bir şekil property'si (`Shape=Pill`) olarak eklemesi önerilir.

#### Pages kalıbı: Top Navigation Header (detay ekranları)
- 49 px (form ekranlarında 42 px), padding 8 / 16, `surface.card`, alt çerçeve `border.default`.
- İçerik: geri oku + başlık (`heading.h4`) + sağ aksiyonlar. Formlarda "× İptal".
- Component değil [Eksik].

### 8.5 Dialogs
- **Components'ta durum:** **Yok** [Eksik].
- **Gereken overlay'ler:** Silme onayı (Karar #7), hesap menüsü, bildirim paneli, seçiciler. Önerileri RESPONSIVE §8.2.

### 8.6 Tables
- **Durum:** **Yok**, Pages'ta da tablo tasarımı yok.
- **Masaüstü İşlemler listesi:** Liste-tablo hibriti olarak kurgulandı (RESPONSIVE §3.3). Ayrı bir tablo component'i v1 için **gerekli değil**. Liste satırı component'i yeterli (§8.11).

### 8.7 Chips / Badges

#### `Chip` [Figma]
- **Amaç:** Kayıt türü ve durum etiketi ("Randevu", "Görev", "Bekliyor", "Ödendi", kategori adı).
- **Property'ler:**

| Property | Tip | Değerler |
|---|---|---|
| `State` | variant | `Görev`, `Ödeme`, `Genel`, `Yeşil`, `Turuncu` |
| `Dot` | boolean | |
| `Label` | text | |

- **Ölçüler:** 24 px yükseklik, padding 4 / 8, gap 4, `radius.full`, `type.label.sm`.
- **Varyantlar:**

| Varyant | Zemin | Metin [Figma] |
|---|---|---|
| Görev | `category.blue` | **`text.on-task` `#4338CA`** (Figma: `#6366F1`) [Karar §9.2.1] |
| Ödeme | `category.pink` | **`text.on-payment` `#BE123C`** (Figma: `#E11D48`) [Karar §9.2.1] |
| Genel | `neutral.200` | `neutral.600` |
| Yeşil | `category.green` | `status.success` |
| Turuncu | `category.orange` | **`text.on-warning` `#92400E`** (Figma: `#D97706`) [Karar §9.2.1] |

- [Bulgu → Karar] Figma'daki Görev, Ödeme ve Turuncu chip metinleri AA kontrastı karşılamıyordu. Metin tonları koyulaştırıldı, zeminler korundu (§9.2.1).
- [Bulgu] Varyant adları anlam ("Görev") ve renk ("Yeşil") karışık. Kodda **anlamsal** adlar kullanılır: `task`, `payment`, `neutral`, `success`, `warning`.

#### `Chip-Kategori` [Figma]
- **Amaç:** Seçilebilir filtre veya kategori seçeneği.
- **Property:** `Property` (variant): `on`, `off`.

| Durum | Zemin | Çerçeve | Metin |
|---|---|---|---|
| on | `brand.primary` | `brand.primary` | `text.inverse` (+ check ikonu [Figma: İşlemler]) |
| off | `surface.card` | `border.default` | `text.secondary` |

- **Ölçüler:** Component 24 px yükseklik, `radius.full`, `type.label.sm`.
- [Bulgu → Karar Ç-9] Ekranlarda (İşlemler filtresi, Yeni İşlem kategori seçimi, hızlı tutar chip'leri) **32 px** kullanılıyor, component 24 px. **Karar:** Seçilebilir chip **32 px**. Durum chip'i (`Chip`) 24 px kalır. Figma component'i 32'ye güncellenir.
- **Davranış:**
  - Filtrede **tekli seçim**, "Tüm Kategoriler" varsayılan.
  - Form kategori seçiminde tekli seçim.
  - Erişilebilirlik: `role="radio"` veya `aria-pressed`.

### 8.8 Form elements
- **Components'ta durum:** **Yok** [Eksik].
- **Pages kalıpları:**
  - **Segmented Control:** 42 px kap, `surface.muted`, `border.default`, padding 4, gap 4, `radius.md`. Seçenek 32 px, `radius.sm`; seçili `surface.card` + `shadow.sm`. Metin `type.button`. Kullanıldığı yerler: Aylık/Haftalık/Günlük, Tümü/Gelir/Gider, Gelir/Gider/Abonelik, kategori sekmeleri.
  - **Switch:** 44×24 iz `radius.full`, 20 px beyaz düğme. Açık durumda iz `#16A34A` (`Chart/Income`) [Figma]. Kapalı durum çizilmemiş [Varsayım: `neutral.300`].
  - **Hızlı tutar chip'leri** ("+500 ₺"): `Chip-Kategori` off görünümü.
  - **Karakter sayacı:** "54/200", `body.sm`, `text.secondary`.

### 8.9 Feedback components
- **Components'ta durum:** **Yok** [Eksik]: toast, form hata mesajı, boş durum, yükleniyor (skeleton/spinner), çevrimdışı bandı.
- **Pages'taki tek örnek:** "Birikimler – Boş" ekranındaki boş durum bloğu (başlık + açıklama + buton).
- **İlerleme çubuğu:** Birikim Hedefi ve birikim kartlarında görülüyor [Figma]. Ayrı bir component değil.

### 8.10 Diğer mevcut component'ler

| Component | Not |
|---|---|
| `lucide/calendar`, `lucide/scroll`, `lucide/wallet`, `lucide/user-round`, `lucide/house` | Nav ikonları, 20 px. Kodda `lucide-react`'ten gelir, ayrı component yazılmaz |
| `Page_Title` | Figma dokümantasyon yardımcısı (sayfa numarası, başlık, açıklama). **Ürün component'i değildir**, kodda karşılığı yoktur |
| `Button-test` | [Bulgu] Ana Sayfa ve Takvim'de instance'ı var ama ana component'i dosyada yok (orphan). Kodda karşılığı yok, `Button` kullanılır |

### 8.11 Eksik component önerileri
Aşağıdakiler Figma'da **yoktur**. Kod aşamasında mevcut token'larla kurulabilir; tasarım ekibinin Components'a eklemesi önerilir.

| Öncelik | Component | Kaynak kalıp / gerekçe |
|---|---|---|
| Yüksek | **Input**, **Select tetikleyici**, **Textarea**, **AmountInput** (tutar pill'i), **OtpInput** | Pages'taki form çizimleri; auth (D-1) |
| Yüksek | **SegmentedControl** | Pages'ta 5+ yerde tekrar ediyor |
| Yüksek | **Switch** | "Tekrar Eden İşlem" |
| Yüksek | **ListRow** (ikon kutusu + başlık + meta + sağda tutar/değer/chevron) | İşlemler, ayarlar, ajanda, geçmiş hareketler |
| Yüksek | **ListCard / Card** kabı | Tekrar eden beyaz, çerçeveli, `radius.lg` kap |
| Yüksek | **TopNavHeader** (geri + başlık + aksiyonlar) | Tüm odak ekranları |
| Yüksek | **Drawer**, **Modal**, **BottomSheet**, **Popover** | RESPONSIVE §4.5 |
| Yüksek | **Toast**, **FieldError**, **FormErrorSummary** | RESPONSIVE §8.2.7 |
| Yüksek | Tüm etkileşimli component'ler için **hover / focus / pressed / disabled / loading** varyantları | Masaüstü ve erişilebilirlik |
| Orta | **NavRail** ve **Sidebar** varyantları | Karar #10 |
| Orta | **DatePicker**, **TimePicker**, seçici listesi satırı | Karar #6 |
| Orta | **EmptyState** | Birikimler boş durum bloğundan genelleştirme |
| Orta | **ProgressBar** | Birikim Hedefi ve birikim kartları |
| Orta | **IconBox** (kategori ikon kutusu) | Liste satırları, Hızlı Aksiyonlar |
| Orta | **MonthSwitcher** ("◀ Mayıs 2026 ▶") | İşlemler, Takvim, Aylık Rapor |
| Orta | **Avatar** | Profil kartı (54 px, `radius.full`, 2 px beyaz çerçeve, `shadow.md` [Figma]) |
| Düşük | **Skeleton**, **Spinner** | Yükleniyor durumu |
| Düşük | **Badge** (sayı rozeti) | Bildirim ikonu (D-24) |
| Düşük | **OfflineBanner**, **InlineAlert** (bilgi notları: "İşlem silindiğinde…" [Figma]) | D-7; detay ekranlarındaki bilgi kutuları |

---

## 9. Design Principles

### 9.1 Spacing ve hizalama
- Tüm boşluklar §4 ölçeğinden gelir. Ölçek dışı değer gerekiyorsa önce token eklenir.
- İçerik 4 sütunlu mobil grid'e (16 px kenar) hizalanır. Büyük ekran grid'i RESPONSIVE §1.2'de.
- Liste satırlarında ikon, başlık ve tutar **dikey ortalanır**. Tutarlar **sağa hizalı** ve `tabular-nums`.
- Bir kart içinde aynı seviyedeki öğeler aynı aralıkla (8 veya 12) dizilir. Aynı kartta iki farklı aralık karışmaz.

### 9.2 Erişilebilir kontrast
**Hedef:** WCAG 2.2 AA.
- Normal metin (< 18,66 px bold / < 24 px regular): **4,5:1**
- Büyük metin ve ikon/çerçeve gibi grafik öğeler: **3:1**

**Mevcut kombinasyonlar** (yaklaşık değerler, kodda otomatik testle doğrulanmalı):

| Ön plan / Zemin | Oran | Sonuç | Not |
|---|---|---|---|
| `brand.primary` / beyaz | ~5,5 | ✔ | |
| `brand.primary` / `brand.primary-subtle` (Secondary buton) | ~4,9 | ✔ | |
| beyaz / `brand.primary` (Primary buton) | ~5,5 | ✔ | |
| beyaz / `status.danger` (Destructive) | ~4,8 | ✔ | |
| `text.secondary` / beyaz | ~4,8 | ✔ | |
| `text.secondary` / `neutral.100` | ~4,3 | ✖ küçük metin | Segmented control'de pasif seçenek metni bu kombinasyonsa sorunlu [Varsayım: metin rengi ölçülmedi] |
| `status.success` / `category.green` (Yeşil chip) | ~4,6 | ✔ (sınırda) | |
| `neutral.600` / `neutral.200` (Genel chip) | ~6,2 | ✔ | |
| ~~`#6366F1` / `category.blue` (Görev chip)~~ | ~3,7 | ✖ | Figma'daki değer, **değiştirildi** ↓ |
| ~~`#E11D48` / `category.pink` (Ödeme chip)~~ | ~4,0 | ✖ | Figma'daki değer, **değiştirildi** ↓ |
| ~~`status.warning` / `category.orange` (Turuncu chip)~~ | ~2,8 | ✖ | Figma'daki değer, **değiştirildi** ↓ |
| ~~`status.warning` / beyaz ("Son Gün", "Bekliyor" metni)~~ | ~3,2 | ✖ küçük metin | Figma'daki değer, **değiştirildi** ↓ |
| `brand.accent` / beyaz | ~2,5 | ✖ | Metin için kullanılmaz |
| `status.info` (`#2563EB`) / beyaz | ~5,2 | ✔ | |

#### 9.2.1 Chip ve uyarı metin renkleri [Karar – ürün sahibi onayı]
Figma'daki chip metin renkleri AA eşiğini (4,5:1) karşılamadığı için **koyulaştırıldı.**
- **Değişmeyenler:** Zemin renkleri, chip ölçüleri ve renk aileleri. Görev mor-mavi, Ödeme pembe-kırmızı, Turuncu amber kalır; yalnızca metnin tonu koyulaşır.
- **Ton seçimi:** Her ailenin en açık tonu seçildi, bu sayede görsel değişim olabildiğince küçük tutuldu. Turuncu için önceki taslak öneri (`#B45309`) açık turuncu zemin üzerinde ~4,4:1 verdiği ve eşiğin altında kaldığı için bir ton koyusu seçildi.

| Kullanım | Zemin | Eski metin [Figma] | **Yeni metin** | Yaklaşık kontrast | Sonuç |
|---|---|---|---|---|---|
| Görev chip | `#DBEAFE` | `#6366F1` (~3,7) | **`#4338CA`** (indigo 700) | ~6,5 | ✔ AA |
| Ödeme chip | `#FCE7F3` | `#E11D48` (~4,0) | **`#BE123C`** (rose 700) | ~5,4 | ✔ AA |
| Turuncu chip | `#FFEDD5` | `#D97706` (~2,8) | **`#92400E`** (amber 800) | ~6,2 | ✔ AA |
| Uyarı metni (beyaz zemin: "Son Gün", "Bekliyor", "n gün kaldı") | `#FFFFFF` | `#D97706` (~3,2) | **`#B45309`** (amber 700) | ~5,0 | ✔ AA |

**Token kuralları:**
- Yeni renkler **metin token'ı** olarak tanımlanır (§2.5, §10.4). Primitive palete aile tonları olarak eklenir: `color.indigo.700`, `color.rose.700`, `color.amber.700`, `color.amber.800` [Yeni].
- `status.warning` (`#D97706`) **ikon, nokta ve çerçeve** gibi grafik öğelerde aynen kullanılmaya devam eder. Bu öğeler için gereken 3:1 eşiğini karşılar.
- **Küçük metinde** `status.warning` kullanılmaz; `text.warning` kullanılır.
- Grafik renkleri (`chart.*`) metin rengi olarak kullanılmaz.
- Kontrast değerleri yaklaşık hesaplamadır. Kodda otomatik kontrast testiyle doğrulanır (PRD AC-03).
- **Figma güncellemesi:** Chip varyantlarının metin renkleri Figma'da bu değerlere çekilmeli (PRD §19.4 TD-F9).

### 9.3 Etkileşim durumları
Figma'da hiçbir component'te tanımlı değil [Eksik]. Aşağıdakiler hedef kurallardır.

| Durum | Kural |
|---|---|
| **Hover** (yalnızca işaretçi cihazlar, `@media (hover: hover)`) | Primary → `brand.primary-hover` · Secondary → `action.secondary-hover` · Tertiary → `surface.page` zemin · Destructive → `action.danger-hover` · Liste satırı → `surface.page` zemin · Tıklanabilir kart → `border.strong` çerçeve, **gölge eklenmez** [Ç-6] · Chip-Kategori off → `border.strong` |
| **Focus** (klavye, `:focus-visible`) | 2 px `border.focus` halka + 2 px boşluk (offset). Tüm etkileşimli öğelerde aynı. Asla kaldırılmaz |
| **Active / Pressed** | Primary → `action.primary-pressed` · Diğerleri → bir ton koyu zemin. Hareket yok veya en fazla `scale(0.98)` [Varsayım] |
| **Disabled** | `neutral.100` zemin, `neutral.400` metin/ikon, `border.subtle`. İmleç `not-allowed`, `aria-disabled`. Opaklık ile soldurma **kullanılmaz** (kontrastı öngörülemez yapar) |
| **Loading** | Buton genişliği sabit kalır. Leading icon (yoksa metnin solu) yerine 20 px spinner gelir, metin korunur ve buton tıklanamaz (`aria-busy`). Liste ve kartlarda skeleton |
| **Selected** | `surface.selected` zemin + `brand.primary` metin/ikon (Chip-Kategori on, seçici satırı) |

### 9.4 Form doğrulama ve hata durumları
- **Zorunlu alan:** Etikette "*" işareti [Figma: "Başlık *"].
- **Ne zaman doğrulanır:** Alan ilk kez terk edildiğinde (blur) ve gönderimde. Kullanıcı yazarken hata gösterilmez. Hata düzeltilince mesaj anında kalkar.
- **Hata görünümü:**
  - Input çerçevesi `border.error`.
  - Altında `type.body.sm` + `text.danger` mesaj, 4 px boşlukla.
  - Mesajın başında `octagon-alert` ikonu (14 px) [Varsayım].
- **Gönderimde:** Formun üstünde hata özeti çıkar ve ilk hatalı alana odaklanılır (RESPONSIVE §8.2.7).
- **Başarı:** Kayıttan sonra toast gösterilir (D-18).
- **Metinler:** Ne yanlış ve nasıl düzeltilir anlatılır ("0 ₺'den büyük bir tutar girin"). Kullanıcı suçlanmaz.
- **Erişilebilirlik:** `aria-invalid`, `aria-describedby` ile mesaj bağlantısı.

### 9.5 Responsive uyumlu component yaklaşımı
- **Bağlama uyum:** Component'ler viewport'u değil **kapsayıcılarını** bilir (container query). Aynı detay kartı drawer'da ve tam sayfada doğru dizilir.
- **Sabit ölçüler:** Component ölçüleri (buton, input, chip yüksekliği) breakpoint'e göre **değişmez**. Değişen yalnızca yerleşim, sayfa padding'i ve başlık/tutar tipografisidir (RESPONSIVE §6).
- **Mobil özel desenler:** Bottom sheet, tam ekran form ve FAB, tablet ve üstünde popover, drawer ve sidebar butonuna dönüşür (RESPONSIVE §4).
- **Dokunma alanı:** Görsel boyuttan bağımsız olarak en az 44 px.

---

## 10. Design Tokens

### 10.1 Yapı [Karar: TECH_STACK §8.1, D-12]
```
Figma değişkenleri + style'lar (Pages/Components)
      │ tek yönlü aktarım
      ▼
tokens/*.json   (W3C DTCG formatı; repoda versiyonlu)
  ├─ primitives.json     → color.brand.*, color.neutral.*, color.status.* (ham), color.category.*, color.chart.*
  ├─ semantic.light.json → color.text.*, color.surface.*, color.border.*, color.action.*  (alias)
  ├─ dimension.json      → space.*, radius.*, border-width.*, icon.size.*
  ├─ typography.json     → font.family, font.weight.*, type.* (mobile/laptop modları)
  ├─ effect.json         → shadow.*
  ├─ layout.json         → RESPONSIVE §6.2 Layout token'ları
  └─ component.json      → button.*, chip.*, input.*, nav.*, … (alias)
      │ Style Dictionary
      ▼
src/styles/tokens.css  → CSS değişkenleri → Tailwind @theme
```

### 10.2 Adlandırma

| Katman | Biçim | Örnek |
|---|---|---|
| Token | `kategori.alt.rol` (nokta) | `color.text.secondary` |
| CSS değişkeni | `--kategori-alt-rol` | `--color-text-secondary` |
| Tailwind utility | Semantic adlardan | `text-text-secondary`, `bg-surface-card`, `rounded-md`, `shadow-floating` |

**Figma → token eşlemesi** (Figma adları Türkçe ve boşluklu, token adları İngilizce kebab-case):

| Figma | Token |
|---|---|
| `Brand/Primary Hover` | `color.brand.primary-hover` |
| `Neutral/50 - BG` | `color.neutral.50` (+ `color.surface.page`) |
| `Neutral/200 - Border` | `color.neutral.200` (+ `color.border.default`) |
| `Semantic/Gelir - Tamamlandı` | `color.status.success` |
| `Semantic/Gider - Hata` | `color.status.danger` |
| `Semantic/Yaklaşan` | `color.status.warning` |
| `Semantic/Bilgilendirme` | `color.status.info-subtle` |
| `Border Width/Thin · Medium · Thick` | `border-width.thin (1) · medium (1.5) · thick (2)` |
| `Spacing/16` | `space.16` |
| `Radius/2XL` | `radius.2xl` |
| `Heading/H1` | `type.heading.h1` |
| `Shadow/Floating` | `shadow.floating` |

### 10.3 Primitive ve semantic örneği (DTCG)
```json
{
  "color": {
    "brand":   { "primary": { "$type": "color", "$value": "#0F766E" } },
    "neutral": { "900":     { "$type": "color", "$value": "#0F172A" } },
    "text":    { "primary": { "$type": "color", "$value": "{color.neutral.900}" } }
  },
  "radius": { "md":  { "$type": "dimension", "$value": "12px" } },
  "space":  { "16":  { "$type": "dimension", "$value": "16px" } },
  "shadow": { "floating": { "$type": "shadow",
    "$value": { "color": "#0F172A1F", "offsetX": "0px", "offsetY": "6px", "blur": "16px", "spread": "0px" } } }
}
```
*Bu bir biçim örneğidir, uygulama kodu değildir.*

### 10.4 Component token'ları
Component'ler doğrudan primitive kullanmaz. Değerleri aşağıdaki token'lardan alır.

| Token | Değer | Kaynak |
|---|---|---|
| `button.height.lg` / `.sm` | 48 / 38 | [Figma] |
| `button.padding-x` | → `space.16` | [Figma] |
| `button.gap` | → `space.8` | [Figma] |
| `button.radius` | → `radius.md` | [Figma] |
| `button.icon-size` | → `icon.size.md` (20) | [Figma] |
| `button.primary.bg` / `.fg` / `.bg-hover` | → `brand.primary` / `text.inverse` / `brand.primary-hover` | [Figma] / hover [Figma değişkeni] |
| `button.secondary.bg` / `.fg` | → `brand.primary-subtle` / `text.brand` | [Figma] |
| `button.tertiary.bg` / `.fg` / `.border` | → `surface.card` / `text.primary` / `border.default` | [Figma] |
| `button.destructive.bg` / `.fg` | → `status.danger` / `text.inverse` | [Figma] |
| `fab.height` / `.radius` / `.shadow` | 48 / → `radius.full` / → `shadow.floating` | [Figma] |
| `chip.height` | 24 | [Figma] |
| `chip.padding-y` / `-x` / `.gap` | → `space.4` / `space.8` / `space.4` | [Figma] |
| `chip.radius` | → `radius.full` | [Figma] |
| `chip.task.bg` / `.fg` | → `category.blue` / `text.on-task` (`#4338CA`) | [Figma] zemin / [Karar §9.2.1] metin |
| `chip.payment.bg` / `.fg` | → `category.pink` / `text.on-payment` (`#BE123C`) | [Figma] zemin / [Karar §9.2.1] metin |
| `chip.neutral.bg` / `.fg` | → `neutral.200` / `neutral.600` | [Figma] |
| `chip.success.bg` / `.fg` | → `category.green` / `status.success` | [Figma] |
| `chip.warning.bg` / `.fg` | → `category.orange` / `text.on-warning` (`#92400E`) | [Figma] zemin / [Karar §9.2.1] metin |
| `chip-select.height` | 32 | [Karar Ç-9] |
| `chip-select.on.bg` / `.fg` | → `brand.primary` / `text.inverse` | [Figma] |
| `chip-select.off.bg` / `.fg` / `.border` | → `surface.card` / `text.secondary` / `border.default` | [Figma] |
| `input.height` | 46 (input + select) | [Karar Ç-2] |
| `picker.row.height` | 48 | [Karar Ç-13] |
| `otp.cell.size` | 48 | [Karar Ç-13] |
| `input.padding-y` / `-x` | → `space.12` / `space.16` | [Figma] |
| `input.radius` | → `radius.md` | [Figma] |
| `input.border` / `-focus` / `-error` | → `border.default` / `border.focus` / `border.error` | [Figma] / durumlar [Varsayım] |
| `segmented.height` | 42 | [Figma] |
| `segmented.padding` / `.gap` | → `space.4` | [Figma] |
| `segmented.radius` | → `radius.md` | [Figma] |
| `segmented.bg` / `.border` | → `surface.muted` / `border.default` | [Figma] |
| `segmented.item.height` / `.radius` | 32 / → `radius.sm` | [Figma] |
| `segmented.item.selected.bg` / `.shadow` | → `surface.card` / `shadow.sm` | [Figma] |
| `switch.track` | 44 × 24 | [Figma] |
| `switch.thumb` | 20 | [Figma] |
| `switch.on.bg` | `#16A34A` → önerilen token `color.status.success-strong` | [Figma] |
| `switch.off.bg` | → `neutral.300` | [Varsayım] |
| `card.list.bg` / `.border` / `.radius` | → `surface.card` / `border.default` / `radius.lg` | [Figma] |
| `card.hero.radius` / `.padding` / `.gap` | → `radius.2xl` / `space.16` / `space.12` | [Figma] |
| `card.hero.balance.bg` | gradyan `neutral.700 → neutral.900` | [Figma] |
| `card.hero.balance.shadow` | → `shadow.floating` | [Figma] |
| `card.hero.savings.bg` | gradyan `brand.accent → brand.primary-hover` | [Figma] |
| `quick-action.size` | 84 × 90 | [Figma] |
| `quick-action.radius` / `.border` / `.shadow` | → `radius.lg` / `border.subtle` / `shadow.sm` | [Figma] |
| `header.height` | 64 | [Figma] |
| `header.padding-y` / `-x` | → `space.8` / `space.16` | [Figma] |
| `header.bg` / `.border` | → `surface.card` / `border.default` | [Figma] |
| `nav.pill.size` / `.radius` | 324 × 60 / → `radius.full` | [Figma] |
| `nav.item.size` / `.radius` | 72 × 52 / → `radius.full` | [Figma] |
| `nav.item.on.bg` / `.fg` | → `neutral.200` / `brand.primary` | [Figma] |
| `nav.item.off.fg` | → `text.secondary` | [Figma] |
| `nav.item.label` | → `type.label.xs` (Bold 10 / 15) | [Figma] / stil [Karar Ç-11] |
| `action-bar.pill.height` / `.radius` / `.shadow` | 56 / → `radius.full` / → `shadow.floating` | [Figma] |
| `action-bar.button.height` | 48 | [Figma] |
| `avatar.size.md` | 54 | [Figma] |
| `avatar.border` / `.shadow` | 2 px `brand.white` / → `shadow.md` | [Figma] |
| `focus-ring.width` / `.offset` / `.color` | 2 / 2 / → `border.focus` | [Yeni] |
| `overlay.bg` | → `neutral.900` @ %40 | [Varsayım] |
| `drawer.width.detail` / `.form` | → `Layout/Drawer/*` (480 / 560) | [Karar: RESPONSIVE §6.2] |
| `modal.width.confirm` | 440 | [Karar] |

### 10.5 Token yönetimi kuralları
1. **Kaynak:** Token değişikliği önce Figma'da yapılır, sonra JSON'a aktarılır (D-12). Kod tarafında JSON dışında değer tanımlanmaz.
2. **Yeni değerin yolu:** [Yeni] ve [Varsayım] olarak işaretli değerler Figma'ya eklenene kadar JSON'da `"$extensions": { "pickaly": { "status": "proposed" } }` ile işaretlenir. Böylece hangi değerin tasarım onayı beklediği kodda da görünür.
3. **Lint:** Bileşenlerde HEX, ölçek dışı boşluk ve Tailwind varsayılan renkleri lint ile engellenir (TECH_STACK §8).
4. **Tema:** Dark mode için yalnızca `semantic.dark.json` eklenir. Primitive ve component token'ları değişmez.

---

## 11. Doküman Tutarlılık Kontrolü

> DESIGN.md, RESPONSIVE.md (Sürüm 4) ve TECH_STACK.md (Sürüm 2) karşılaştırıldı. 13 çelişkinin tamamı tek tek değerlendirildi ve **önerilen çözümler kabul edildi.** Kararlar RESPONSIVE.md Sürüm 5'e ve TECH_STACK.md Sürüm 2.1'e işlendi.

### 11.1 Kararlar

| # | Karar | İşlendiği yer | Figma'da yapılacak |
|---|---|---|---|
| Ç-1 | Hero/durum kartları 24 px, liste ve küçük kartlar 16 px | RESPONSIVE §4.1 | – |
| Ç-2 | Input ve select 46 px | RESPONSIVE §4.7, §6.5, §8.3 · DESIGN §8.2, §10.4 | Select 45 → 46 px |
| Ç-3 | Aktif nav öğesi her cihazda Neutral/200 zemin + Brand/Primary | RESPONSIVE §2.3 | – |
| Ç-4 | Ödeme kartındaki tek buton Secondary | RESPONSIVE §4.6 · DESIGN §8.1 | "Hemen öde" kaldırılır, "Ödendi olarak işaretle" Secondary yapılır |
| Ç-5 | Silme onayında "Vazgeç" Tertiary | RESPONSIVE §4.5.2, §8.2.3 · DESIGN §8.1 | – |
| Ç-6 | Kart hover'ında gölge yok, zemin/çerçeve değişimi | RESPONSIVE §4.1 · DESIGN §9.3 | Hover varyantları bu kurala göre çizilir |
| Ç-7 | Info iki ton: `#2563EB` + `#DBEAFE` | DESIGN §2.4 | `#2563EB` değişken olarak eklenir |
| Ç-8 | Token ve sınıf adları DESIGN adlandırmasıyla | TECH_STACK §8.2, §8.3 | – |
| Ç-9 | Durum chip'i 24, seçilebilir chip 32 | RESPONSIVE §6.5 · DESIGN §8.7, §10.4 | Chip-Kategori 24 → 32 px |
| Ç-10 | Form footer'ında "İptal" Tertiary, ikonsuz | RESPONSIVE §4.6 · DESIGN §8.4 | Yeni İşlem alt barındaki İptal güncellenir |
| Ç-11 | Yeni `Label/XS` stili (Bold 10/15) | RESPONSIVE §6.3 · DESIGN §3.2 | Text style oluşturulur, nav etiketine bağlanır |
| Ç-12 | Button/Default line-height 21 (bilinen güncelleme) | – | 20 → 21 px |
| Ç-13 | Seçici satırı ve OTP kutusu 48 px | RESPONSIVE §6.5 · DESIGN §8.2, §10.4 | – |

### 11.2 Tespit kaydı (karar öncesi durum)

| # | Konu | RESPONSIVE / TECH_STACK | Figma ve DESIGN.md | Önerilen çözüm |
|---|---|---|---|---|
| Ç-1 | Kart köşe yarıçapı | RESPONSIVE §4.1: "Radius 24 px" (tüm kartlar için gibi) | Hero/durum kartları 24, **liste kartları, ajanda kartı, ayar grupları, Hızlı Aksiyon ve Birikim Hedefi 16** | RESPONSIVE §4.1 "hero kartlar 24, liste kartları 16" olarak düzeltilsin |
| Ç-2 | Input yüksekliği | RESPONSIVE §4.7, §6.5, §8.3: **48 px** | Input **46**, select **45** | DESIGN'daki 46 px esas alınsın, RESPONSIVE güncellensin |
| Ç-3 | Sidebar aktif öğe rengi | RESPONSIVE §2.3: "Brand/Primary Subtle zemin … mobil nav 'on' varyantının yatay karşılığı" | Nav "on" zemini **Neutral/200**, metin Brand/Primary | Ya mobil "on" ile aynı (Neutral/200) olsun ya da Primary Subtle kasıtlı bir fark olarak yazılsın. Öneri: Neutral/200, tutarlılık için |
| Ç-4 | Ödeme kartı butonlarının adı | RESPONSIVE §4.6: "Ödendi olarak işaretle (**Secondary** görünüm)" | Bu görünüm (beyaz + çerçeve) Button sisteminde **Tertiary**. "Hemen öde"nin açık teal zemini ise **Secondary** | §4.6 metni "Tertiary → Secondary görünümüne geçer" olarak düzeltilsin |
| Ç-5 | Silme onayında "Vazgeç" | RESPONSIVE §4.5.2 ve §8.2.3: `Button / Secondary` | Secondary teal-subtle, yani "önerilen aksiyon" gibi görünür | "Vazgeç" = **Tertiary** önerilir |
| Ç-6 | Kart hover gölgesi | RESPONSIVE §4.1: "Hover (laptop+): Shadow/Card → MD" | DESIGN §6: liste kartları düz, yüzey ayrımı çerçeveyle. Hover zemin değişimiyle | Hover'da gölge yerine `surface.page` zemin veya `border.strong` kullanılsın |
| Ç-7 | Info rengi | TECH_STACK ve RESPONSIVE'de yok. RESPONSIVE §8.2.10 çevrimdışı bandında `Semantic/Bilgilendirme` (açık ton) zemin | DESIGN: `status.info` `#2563EB` [Yeni] + `info-subtle` `#DBEAFE` | Çelişki değil ama `#2563EB` Figma'ya eklenmeli. RESPONSIVE'deki kullanım `info-subtle` ile uyumlu |
| Ç-8 | Tailwind sınıf adı örnekleri | TECH_STACK §8.3: `text-semantic-income` | DESIGN: `color.status.success` → `text-status-success` | TECH_STACK örnekleri DESIGN adlandırmasına göre güncellensin |
| Ç-9 | Chip-Kategori yüksekliği | RESPONSIVE §6.5: "Chip / Chip-Kategori 24 / 32 h" | Component 24, ekran kullanımı 32 (Figma içi çelişki) | DESIGN: seçilebilir chip 32. Figma component'i güncellensin |
| Ç-10 | Detay-Nav Bar "İptal" butonu | RESPONSIVE §3.3.3: footer "İptal \| Kaydet", İptal ikincil buton | Figma: İptal = kırmızı açık zemin + çöp kutusu ikonu, `Button` component'i değil | İptal = Tertiary, ikon yok (DESIGN §8.4). Tasarım onayı gerekir |
| Ç-11 | Nav etiketi tipografisi | RESPONSIVE §6.3 tablosunda yok | Bold 10 px, stil dışı | `type.label.xs` (10/15) eklensin. RESPONSIVE §6.3'e satır eklensin |
| Ç-12 | Button/Default line-height | RESPONSIVE §6.3: 21 (karar) | Figma: 20 | Çelişki değil, bilinen güncelleme. Figma güncellenene kadar kod 21 kullanır |
| Ç-13 | Seçici liste satırı ve OTP kutusu yüksekliği | RESPONSIVE §4.5.1 / §8.2.8: 48 px | Input 46 px | Seçici satırı 48 kalabilir (liste öğesi). OTP kutusu input ile aynı ailede olduğu için 46 veya 48 seçilmeli. Öneri: 48 (tek karakterli büyük hedef) |

**Tutarlı bulunan başlıca konular:**
- Renk paleti (brand, neutral, semantic, category, chart) ve değerleri
- Spacing ölçeği
- Radius token'ları
- Typography boyutları ve line-height kuralı (Karar #11)
- Breakpoint'ler ve layout token'ları
- Lucide kullanımı
- Tema mimarisi (primitive/semantic, `data-theme`)
- Token akışı (Figma → JSON → CSS)
- Silme onayında Destructive kullanımı
- PWA renkleri (`#0F766E` / `#F8FAFC`)
- AI Pages'ın hiçbir dokümanda kaynak olarak kullanılmaması
