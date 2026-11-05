# Pickaly – Tasarım Sistemi Uyarlaması (DESIGN_SYSTEM.md Part A tamamlayıcısı)

> **Sürüm:** 1.0 – **Onaylandı** (ürün sahibi, 2026-11-04). §8'deki K-1…K-7 önerileri olduğu gibi kabul edildi.
> **Temel:** [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) **Part A (FinPilot)**. Part B (Behance) kullanılmaz [Karar: ürün sahibi, 2026-11-04].
> **Amaç:** Part A'yı Pickaly'nin ekranlarına, erişilebilirlik şartına (PRD UX-015, WCAG 2.2 AA) ve teknik yapısına (TECH_STACK §8) uygulanabilir hâle getirmek; Part A'da olmayan değerleri **Part A'nın görsel dilinden türeterek** doldurmak.
> **Bu doküman kod değişikliği içermez.** Kod geçişi ayrı bir adımdır (§9).

**İşaretler**

| İşaret | Anlamı |
|---|---|
| **[DS]** | `DESIGN_SYSTEM.md`'de kesin değer (tasarımcının yazdığı HEX veya açık kural) |
| **[DS≈]** | `DESIGN_SYSTEM.md`'de tahmini değer (`≈`, "suggested", "inferred"); aynen alındı |
| **[Uyarlama]** | DS değeri erişilebilirlik veya Pickaly ihtiyacı nedeniyle ayarlandı. Ton ailesi korunur, gerekçe yazılır |
| **[Türetme]** | DS'de yok; DS'deki bir kalıptan veya değerden mekanik olarak türetildi (yöntem yazılır) |
| **[Karar K-n]** | Birden fazla seçenek vardı; ürün sahibi §8'deki seçeneği onayladı |

Tüm kontrast oranları WCAG 2.x formülüyle hesaplandı (`sRGB` göreli parlaklık). Kodda otomatik kontrast testiyle doğrulanmalı (PRD AC-03).

---

## 1. Öncelik ve kapsam

1. Görsel değerler: `DESIGN_SYSTEM.md` Part A → bu doküman → (yalnızca boşluk kalırsa) `DESIGN.md`.
2. Bu doküman Part A ile **çelişmez**; yalnızca iki durumda ondan ayrılır ve bunu **[Uyarlama]** ile gösterir:
   - Değer, WCAG AA kontrastını karşılamıyorsa.
   - Değer Pickaly'nin kesinleşmiş bir ürün kuralıyla (dokunma alanı 44 px, TR/EN biçim, kategori veri anahtarları) çakışıyorsa.
3. Breakpoint ve yerleşim: [RESPONSIVE.md](RESPONSIVE.md). Mimari ve token akışı: [TECH_STACK.md](TECH_STACK.md). İş kuralları: [PRD.md](PRD.md).
4. **Kapsam dışı:** AI componentleri (AI Insight card, AI chat, sparkle vurgusu, "● Live"), dark mode (V1'de yok, PRD UX-009), Part B'nin tamamı.

---

## 2. Renk sistemi

### 2.1 Primitive palet

**Marka (mavi)**

| Token | HEX | Kaynak | Kullanım |
|---|---|---|---|
| `blue.100` | `#D6E9FF` | [DS≈] `brand-100` | Gelir kartı zemini, Secondary buton zemini, bilgi zemini, seçili gün zemini |
| `blue.200` | `#A8D3FE` | [DS≈] `brand-200` | İlerleme göstergesi knob halesi |
| `blue.300` | `#7BBEFE` | [DS≈] `brand-300` | İlerleme izi noktaları (dekoratif) |
| `blue.500` | `#41A1FD` | **[DS] exact** | Marka rengi: logo karosu, ilerleme dolgusu, grafik vurgusu, büyük dekoratif yüzeyler. **Metin ve beyaz metinli buton zemini olarak kullanılmaz** (§2.4) |
| `blue.600` | `#0267C5` | [Uyarlama] DS `brand-600 ≈ #2D7FE0` beyaz metinle 4,02:1 veriyor. Aynı ton (209°) ve doygunlukta, beyaz / `neutral.50` / `blue.100` üzerinde ≥4,5:1 sağlayan en açık ton | Birincil aksiyon zemini, marka metni, metin butonu, odak halkası, form kontrolü "açık" durumu |
| `blue.650` | `#0258A9` | [Türetme] aynı ton, 7:1 | Birincil aksiyon hover |
| `blue.700` | `#0B4C9A` | [DS≈] `brand-700` | Birincil aksiyon pressed |
| `blue.900` | `#0A2347` | [DS≈] `brand-900` | Rezerv (Paylaşım kartı koyu varyantı gerekirse) |

**Veri tonları**

| Token | HEX | Kaynak | Kullanım |
|---|---|---|---|
| `lavender.200` | `#D0D1FF` | **[DS] exact** | Gider kartı zemini; `violet` kategori zemini |
| `lilac.200` | `#E7D0FF` | **[DS] exact** | "Geçen aya göre" karşılaştırma kartı zemini |

**Nötrler**

| Token | HEX | Kaynak | Kullanım |
|---|---|---|---|
| `white` | `#FFFFFF` | **[DS] exact** | Kart, sheet, input zemini |
| `neutral.50` | `#F5F6F7` | **[DS] exact** | Uygulama zemini (canvas) |
| `neutral.100` | `#ECEDEF` | [DS≈] `border-subtle` | İnce ayraç, muted yüzey, skeleton |
| `neutral.150` | `#E6E8EB` | [DS≈] disabled zemini | Disabled zemin, `slate` kategori zemini |
| `neutral.400` | `#A3A7AE` | [DS≈] `text-tertiary` | Yalnızca disabled metin ve dekoratif öğe (§2.4) |
| `neutral.500` | `#8B8F96` | [Uyarlama] DS tertiary (`#A3A7AE`) beyazda 2,41:1. Aynı griden 3:1 sağlayan en açık ton | Büyük metinde soluk ondalık, form kontrolü çerçevesi, switch kapalı izi |
| `neutral.600` | `#6B6F76` | [DS≈] `text-secondary` | İkincil metin (yalnızca beyaz ve `neutral.50` üzerinde) |
| `neutral.700` | `#595D63` | [Türetme] aynı gri, `neutral.100` üzerinde 5,65:1 | `neutral.100` gibi muted yüzeylerde ikincil metin |
| `black` | `#000000` | **[DS] exact** | Birincil metin, tab bar, seçili chip, Contrast buton, toast |

**Durum renkleri**

| Token | HEX | Kaynak | Kullanım |
|---|---|---|---|
| `red.500` | `#EF4E54` | [DS≈] `danger-500` | Grafik öğesi (ikon, nokta, çerçeve; beyazda 3,57:1 ✔ 3:1) |
| `red.600` | `#E0151C` | [Uyarlama] beyaz metinle 4,89:1 | Destructive buton, delta rozeti, sayı rozeti, hata metni |
| `red.700` | `#C11515` | [Türetme] | Destructive hover; kırmızı zemin üzerindeki metin |
| `green.500` | `#22C55E` | [DS≈] `success-500` | Yalnızca yanında metin olan dekoratif nokta (beyazda 2,28:1) |
| `green.700` | `#0E8138` | [Uyarlama] beyazda 4,98:1, yeşil zeminde 4,53:1 | Gelir tutarı, "Ödendi / Tamamlandı" metni ve ikonu |
| `amber.500` | `#F5A524` | [DS≈] `warning` (suggested) | Siyah metinli uyarı zemini (10,29:1). Beyaz üzerinde ikon/metin olarak kullanılmaz (2,04:1) |
| `amber.700` | `#8C6710` | [Türetme] beyazda 5,17:1, amber zeminde 4,51:1 | "Yaklaşan / Bekliyor / Son gün" metni ve ikonu |

### 2.2 Kategori renkleri

Veritabanı kategori rengini **ad olarak** saklar (`teal`, `blue`, `violet`, `pink`, `orange`, `amber`, `green`, `red`, `slate`). Bu 9 anahtar **değişmez** (mevcut kayıtlar bozulmaz); yalnızca değerleri yeni sisteme geçer.

**Yöntem [Türetme]:** DS'nin veri tonları HSL'de doygunluk %100, açıklık ~%91 kalıbında (`#D6E9FF` 212°/100/92, `#D0D1FF` 239°/100/91, `#E7D0FF` 269°/100/91). Zemin tonları bu kalıpla üretildi; `blue` ve `violet` DS değerlerinin kendisi. Ön plan (ikon/metin) rengi aynı tonda, hem zeminde hem beyazda ≥4,5:1 veren en açık ton.

| Anahtar | Zemin | Ön plan | Ön plan / zemin | Ön plan / beyaz |
|---|---|---|---|---|
| `teal` | `#D1FFF9` | `#0E7E6F` | 4,58 | 4,96 |
| `blue` | `#D6E9FF` [DS≈] | `#1667C3` | 4,51 | 5,58 |
| `violet` | `#D0D1FF` [DS] | `#3E41EA` | 4,52 | 6,67 |
| `pink` | `#FFD1E8` | `#BC1569` | 4,50 | 6,09 |
| `orange` | `#FFDEC7` | `#A34E12` | 4,52 | 5,74 |
| `amber` | `#FFEEC7` | `#8C6710` | 4,51 | 5,17 |
| `green` | `#D1FFE2` | `#0E8138` | 4,53 | 4,98 |
| `red` | `#FFD1D1` | `#C11515` | 4,52 | 6,20 |
| `slate` | `#E6E8EB` [DS≈] | `#616975` | 4,52 | 5,55 |

- Siyah metin tüm kategori zeminlerinde ≥14:1.
- İkon kutusunda ikon = ön plan rengi; chip'te metin = ön plan rengi.

### 2.3 Semantic token'lar (eski → yeni eşleme)

Token **adları** TECH_STACK §8.2 yapısında kalır (bileşenler yalnızca semantic katmanı kullanır); **değerleri** değişir. Kod geçişinde bu tablo `tokens/color.*.json` için kaynaktır.

| Semantic token | Eski değer | **Yeni değer** |
|---|---|---|
| `color.brand.primary` | teal.700 | `blue.600` |
| `color.brand.primary-hover` | teal.800 | `blue.650` |
| `color.brand.primary-subtle` | teal.100 | `blue.100` |
| `color.brand.accent` | teal.500 | `blue.500` (yalnızca grafik/dekor) |
| `color.text.primary` | neutral.900 | `black` |
| `color.text.secondary` | neutral.500 | `neutral.600` |
| `color.text.secondary-on-muted` | – | `neutral.700` [Yeni] |
| `color.text.tertiary` | neutral.400 | `neutral.500` (yalnızca büyük metin ≥24 px veya ≥18,66 px bold) |
| `color.text.disabled` | – | `neutral.400` [Yeni] |
| `color.text.inverse` | white | `white` |
| `color.text.inverse-secondary` | neutral.300 | `white` %70 (siyah üzerinde 10:1) |
| `color.text.brand` | teal.700 | `blue.600` |
| `color.text.success` | green.700 | `green.700` |
| `color.text.danger` | red.600 | `red.600` |
| `color.text.warning` | amber.700 | `amber.700` |
| `color.text.info` | blue.600 | `blue.600` |
| `color.text.on-task` | indigo.700 | `category.violet` ön planı `#3E41EA` |
| `color.text.on-payment` | rose.700 | `category.pink` ön planı `#BC1569` |
| `color.text.on-warning` | amber.800 | `amber.700` |
| `color.text.on-neutral` | neutral.600 | `#616975` |
| `color.surface.page` | neutral.50 | `neutral.50` |
| `color.surface.card` | white | `white` |
| `color.surface.muted` | neutral.100 | `neutral.100` |
| `color.surface.selected` | neutral.100 | `blue.100` (seçili liste ve seçici satırı, §5.3) |
| `color.surface.selected-strong` | – | `black` [Yeni] (seçili chip, seçili gün: seçim = siyah dolgu, §5.4, §5.10) |
| `color.surface.nav-active` | neutral.200 | `black` (rail / sidebar aktif öğe, §5.6) |
| `color.surface.tabbar` / `tabbar-active` | – | `black` / `white` [Yeni] (mobil tab bar ve içindeki aktif daire) |
| `color.surface.disabled` | – | `neutral.150` [Yeni] |
| `color.surface.inverse` | neutral.900 | `black` |
| `color.surface.inverse-raised` / `-control` | neutral.700 / 600 | `#1F1F1F` / `#333333` [Türetme: siyah üzerinde kademeler] |
| `color.surface.income` | – | `blue.100` [Yeni, DS `card-income`] |
| `color.surface.expense` | – | `lavender.200` [Yeni, DS `card-expense`] |
| `color.surface.compare` | – | `lilac.200` [Yeni, DS `card-compare`] |
| `color.surface.overlay` | neutral.900 %40 | `black` %40 [Türetme] |
| `color.control.track-off` | neutral.200 | `neutral.500` (3:1) |
| `color.control.thumb-off` | neutral.400 | `white` |
| `color.control.track-on` | green.600 | `blue.600` |
| `color.control.thumb-on` | white | `white` |
| `color.border.default` | neutral.200 | `neutral.100` [DS `border-subtle`] |
| `color.border.subtle` | neutral.100 | `neutral.100` |
| `color.border.strong` | neutral.300 | `#DCDDE0` [Türetme: hover çerçevesi] |
| `color.border.control` | – | `neutral.500` [Yeni: input, checkbox, radio; 3:1] |
| `color.border.focus` | teal.700 | `blue.600` |
| `color.border.error` | red.600 | `red.600` |
| `color.border.success` | green.700 | `green.700` |
| `color.status.success` / `danger` / `warning` / `info` | – | `green.700` / `red.600` / `amber.700` / `blue.600` |
| `color.status.*-subtle` | – | `category.green` / `category.red` / `category.amber` / `blue.100` zeminleri |
| `color.action.primary-pressed` | teal.900 | `blue.700` |
| `color.action.secondary-hover` | teal.200 | `#C2DEFF` [Türetme: `blue.100` bir kademe koyu] |
| `color.action.tertiary-hover` | neutral.50 | `neutral.50` |
| `color.action.contrast-hover` | – | `#1F1F1F` [Yeni] |
| `color.action.danger-hover` | red.700 | `red.700` |
| `color.category.*` | – | §2.2 zeminleri; yeni `color.category-fg.*` §2.2 ön planları |
| `color.chart.*` | – | §2.5 |

### 2.4 Kontrast kuralları (Part A'ya göre değişenler)

| Kombinasyon | Oran | Kural |
|---|---|---|
| beyaz / `blue.500` | 2,71 ✖ | Beyaz metinli Primary buton `blue.500` değil **`blue.600`** (5,60 ✔) [Uyarlama] |
| `blue.500` metin / beyaz | 2,71 ✖ | Metin butonu ve vurgulu metin **`blue.600`** |
| siyah / `blue.500` | 7,74 ✔ | `blue.500` zeminde metin gerekiyorsa siyah |
| `neutral.400` / beyaz | 2,41 ✖ | Bilgi taşıyan metinde kullanılmaz. Büyük bakiyedeki soluk ondalık **`neutral.500`** (3,25 ✔ büyük metin) |
| `neutral.600` / `neutral.100` | 4,31 ✖ | Muted yüzeyde ikincil metin `neutral.700` |
| `neutral.600` / tint kartlar (`blue.100` 4,08 · `lavender` 3,42 · `lilac` 3,57) | ✖ | **Renkli kartlardaki tüm metin `text.primary` (siyah).** Etiket/değer ayrımı boyut ve ağırlıkla yapılır |
| `green.500` / beyaz | 2,28 ✖ | Durum metni ve ikonu `green.700` |
| `red.500` + beyaz metin | 3,57 ✖ | Delta rozeti ve destructive zemin `red.600` (4,89 ✔) |
| `amber.500` / beyaz | 2,04 ✖ | Uyarı metni/ikonu `amber.700`; `amber.500` yalnızca siyah metinli zemin |
| `border.subtle` (`#ECEDEF`) / beyaz | 1,17 | Kart ayrımında yeterli (dekoratif). **Form kontrolü sınırı** `border.control` (3,25 ✔ 3:1, WCAG 1.4.11) |
| odak halkası | – | `blue.600` (beyazda 5,60, canvas'ta 5,18 ✔) |

Disabled öğeler kontrast şartından muaftır (WCAG 1.4.3 istisnası) ama "disabled" bilgisi yalnızca renkle verilmez (`aria-disabled`).

### 2.5 Grafik renkleri [Türetme]

Part A'nın imza grafiği **nokta matrisli çubuk** (siyah = içinde bulunulan dönem, gri = arka plan ızgarası). Grafik renkleri beyaz ve canvas üzerinde ≥3:1 (WCAG 1.4.11) olacak şekilde, DS veri tonlarının ailesinden seçildi.

| Token | HEX | Aile | Anlam |
|---|---|---|---|
| `chart.current` | `#000000` [DS] | siyah | İçinde bulunulan dönem / net |
| `chart.income` | `#1C90FD` | marka mavisi (3,25) | Gelir |
| `chart.expense` | `#8082F5` | lavanta (3,27) | Gider |
| `chart.savings` | `#0DA08D` | teal (3,27) | Birikime aktarılan |
| `chart.compare` | `#B16FF3` | lila (3,26) | Önceki dönem / karşılaştırma |
| `chart.grid` | `neutral.100` [DS≈] | gri | Boş nokta, kalan, iz |

- Renk tek başına anlam taşımaz: her grafikte değer metni veya lejant bulunur.
- Chart renkleri metin rengi olarak kullanılmaz (eski kural korunur).

### 2.6 Tutar renkleri
- PRD UX-014 korunur: gelir `text.success` (`green.700`) ve "+", gider `text.danger` (`red.600`) ve "−".
- [Karar K-2] Part A işlem listesinde gideri siyah gösteriyor ("−$84.20"); Pickaly'de PRD UX-014 korunur, gider `red.600` (renk = anlam ilkesi).
- Büyük bakiyede (`display-balance`) ondalık kısım `text.tertiary` (`neutral.500`) [DS kalıbı]. 14 px ve altındaki tutarlarda ondalık soluklaştırılmaz (kontrast).

---

## 3. Tipografi

### 3.1 Font
- **Geist** [DS], `next/font/google` ile kendi sunucumuzdan; alt kümeler `latin` + **`latin-ext`** (ğ, ş, ı, İ). Geist'in Google Fonts sürümünde `latin-ext` bulunduğu doğrulandı (`next/font` font verisi).
- Ağırlıklar: 400, 500, 600, 700 [DS]. Değişken font (`wght`) olarak yüklenir.
- Tutar ve saatlerde `font-variant-numeric: tabular-nums` [DS: "tabular-style alignment"]. Geist'te `tnum` desteği kodda görsel olarak doğrulanmalı.
- Google Fonts `@import` (DS export §1) **kullanılmaz** (TECH_STACK §8.3).

### 3.2 Ölçek

| Token | Boyut / satır | Ağırlık | Harf aralığı | Kaynak | Pickaly kullanımı (eski token) |
|---|---|---|---|---|---|
| `type.display-balance` | 44 / 48 | 500 | −0,02em | [DS≈] | Ana Sayfa toplam bakiye (`data.lg`) |
| `type.display-hero` | 34 / 40 | 400 | −0,02em | [DS≈] | Boş durum ve auth başlıkları (`display.lg`) |
| `type.title-lg` | 28 / 34 | 500 | −0,01em | [DS≈] | Detay ekranı tutarı, rapor net değişimi (`data.md`, `heading.h1`) |
| `type.title-md` | 20 / 26 | 600 | −0,01em | [DS≈] | Sayfa başlığı, "Pickaly" header (`heading.h2`, `h3`) |
| `type.title-sm` | 16 / 22 | 600 | 0 | [DS≈] | Kart ve bölüm başlıkları (`heading.h4`) |
| `type.body` | 14 / 20 | 400 | 0 | [DS≈] | Gövde, input metni (`body.md`, `body.lg`) |
| `type.body-strong` | 14 / 20 | 600 | 0 | [DS≈] | Liste satırı başlığı, satır tutarı (`label.md`) |
| `type.caption` | 12 / 16 | 400 | 0 | [DS≈] | Meta bilgi (`body.sm`) |
| `type.caption-strong` | 12 / 16 | 600 | 0 | [Türetme: DS chip "caption/600"] | Chip, kart etiketi (`label.sm`) |
| `type.micro` | 10 / 14 | 500 | +0,04em, BÜYÜK HARF | [DS≈] | Rozet, bölüm üst etiketi ("TOPLAM BAKİYE") |
| `type.nav` | 10 / 14 | 600 | 0 | [Türetme: `micro` boyutu, büyük harfsiz] | Rail ve sidebar dışı etiket gerekirse (`label.xs`) |
| `type.button` | 14 / 20 | 600 | 0 | [DS≈] | Tüm butonlar |

**Kurallar:**
- [Karar K-3] Boyutlar breakpoint'e göre **değişmez**; tek istisna `display-balance`: laptop ve desktop'ta **48 / 52**. Part A yalnızca 390 pt mobil tasarım; RESPONSIVE §6.3'teki "laptop'ta bir kademe büyüme" kuralı Manrope ölçeğine göre yazılmıştı ve bu ölçekte uygulanmaz.
- Büyük harf dönüşümü seçili dilin yerel ayarıyla (`tr-TR`: i → İ). `micro` stilindeki metinler kaynakta büyük harf yazılır.
- Bir ekranda tek `title-md` sayfa başlığı. Tutar çevresindeki metinden büyük ve daha ağırdır.
- 10 px yalnızca `micro`/`nav`; uzun metinde kullanılmaz.

---

## 4. Boşluk, boyut, radius, gölge

### 4.1 Boşluk
DS 4 pt ölçeği [DS≈]: 4 · 8 · 12 · 16 · 20 · 24 · 32. RESPONSIVE §6.2 düzen token'larının ihtiyacı için **40 · 48 · 64 korunur** [Türetme: 4 pt'nin katları]. Eski ölçekle aynı; değişiklik yok.

| Bağlam | Değer | Kaynak |
|---|---|---|
| Mobil sayfa kenarı | 16 | [DS] |
| Bölümler arası | 20 (mobil) | [DS `space-5`] — eski 24'ten değişir |
| Büyük bloklar arası | 32 | [DS] |
| Kart iç padding | 16 (standart), 12 (kompakt stat kartı), 24 (büyük kart) | [DS] |
| Stat kartları / chip'ler arası | 8 | [DS] |
| İkon ↔ etiket | 4 (inline), 8 (buton) | [DS] / [Türetme] |
| Liste satırı yüksekliği | 56 (tek satır meta yok), 64 (meta'lı) | [DS≈ 56–64] |

### 4.2 Radius [DS≈]

| Token | px | Kullanım |
|---|---|---|
| `radius.xs` | 6 | Delta rozeti, küçük rozetler |
| `radius.sm` | 8 | İkon karosu (liste/stat), stat kartı ok butonu, segmented seçeneği |
| `radius.md` | 12 | Stat kartı, liste grubu, input, popover |
| `radius.lg` | 16 | Ana kartlar (Birikim, rapor, ajanda), drawer iç köşe |
| `radius.xl` | 24 | Bottom sheet üst köşeleri, modal, paylaşım kartı |
| `radius.2xl` | 28 | Uygulama ikonu (PWA manifest maskesi) |
| `radius.full` | 9999 | Butonlar, chip'ler, tab bar, avatar, ikon butonları, switch |

> **Geçiş uyarısı:** `xs` (4→6), `xl` (20→24), `2xl` (24→28) aynı adla farklı değer alıyor. Kod geçişinde `rounded-xl` / `rounded-2xl` kullanan her yer gözden geçirilmeli.

İç içe yüzey kuralı korunur: iç radius = dış radius − padding (en az `sm`).

### 4.3 Gölge [DS≈]

| Token | Değer | Kullanım |
|---|---|---|
| `elev-0` | yok | Renkli (tint) kartlar, liste satırları, input |
| `elev-1` | `0 1px 2px rgba(0,0,0,.04), 0 2px 8px rgba(0,0,0,.04)` | Canvas üzerindeki beyaz kartlar, segmented seçili öğe |
| `elev-2` | `0 8px 24px rgba(0,0,0,.08)` | Tab bar, FAB, yüzen alt aksiyon barı, popover, toast |
| `elev-3` | `0 16px 40px rgba(0,0,0,.12)` | Modal, drawer, bottom sheet |

- **İlke değişikliği:** Eski "yüzey ayrımı çizgiyle" ilkesi yerine Part A ilkesi geçerli: **beyaz kart + `elev-1`, sert çerçeve yok** [DS: "almost no hard borders"]. Çerçeve yalnızca outline chip, Tertiary buton, ikon butonu ve form kontrollerinde.
- Eski 8 gölge stili (`shadow.xs…overlay`) yerine bu 3 seviye.

### 4.4 İkonlar
- Kütüphane **Lucide** kalır (PRD UX-003; DS ikon seti belirtmiyor). Kavram–ikon tablosu DESIGN.md §7.3'ten aynen geçerli.
- Boyutlar [DS]: 16 (inline, meta), 20 (liste, buton), 24 (navigasyon). Eski 14 px meta ikonu → 16.
- Stroke: Lucide varsayılanı 2 px, orantılı ölçek (eski kural).
- Renk: `currentColor`; durum anlatırken `status.*` veya `category-fg.*`.

### 4.5 Dokunma alanı
Mobil ve tablette en az **44×44** (eski kural, korunur). Görsel olarak daha küçük öğeler (32 px buton, 28–32 px chip, 36 px ikon butonu) görünmez genişletilmiş alanla (padding veya `::after`) 44'e tamamlanır.

---

## 5. Componentler

### 5.1 Butonlar

| Varyant | Zemin | Metin | Çerçeve | Hover | Pressed | Kaynak |
|---|---|---|---|---|---|---|
| **Primary** | `blue.600` | beyaz | – | `blue.650` | `blue.700` | [DS] Primary + [Uyarlama] ton |
| **Secondary** | `blue.100` | `blue.600` (4,52) | – | `#C2DEFF` zemin + `blue.650` metin (5,11) | `blue.200` zemin + `blue.700` metin (5,33) | [Türetme: DS AI card "Adjust budget" brand-100 + mavi metin] |
| **Contrast** | `black` | beyaz | – | `#1F1F1F` | `#333333` | [DS] "GET" |
| **Tertiary** | `white` | `black` | `border.subtle` 1 px | `neutral.50` | `neutral.100` | [Türetme: DS default chip görünümü] |
| **Text** | yok | `blue.600` veya `black` | – | alt çizgi | `blue.700` | [DS] + [Uyarlama] ton |
| **Destructive** | `red.600` | beyaz | – | `red.700` | `red.700` | [Türetme: DS danger] |

**Ölçüler:**

| Boyut | Yükseklik | Yatay padding | Metin | İkon | Radius | Kaynak |
|---|---|---|---|---|---|---|
| `LG` | 44 | 20 | `type.button` | 20, metinden 8 | `full` | [DS] h 44 |
| `SM` | 32 | 14 | `type.button` | 16, metinden 6 | `full` | [DS] Contrast h 32 |

- Eski 48 / 38 ve `radius.md` → **44 / 32 ve `radius.full`** (Part A'da tüm butonlar pill).
- SM'nin dokunma alanı 44'e genişletilir (§4.5).
- Kullanım eşlemesi: "Kaydet" = Primary · "Ödendi olarak işaretle" = Secondary · "Vazgeç / İptal" = Tertiary · "Sil" = Destructive · "Aylık Rapor ›", "Değiştir", "Tümünü gör" = Text.
- Görünümde en fazla bir Primary (eski kural).
- **Durumlar** [DS inferred + Uyarlama]: odak 2 px `blue.600` halka, 2 px offset · disabled `neutral.150` zemin + `neutral.400` metin, opaklık kullanılmaz · loading: genişlik sabit, ikon yerine 16/20 px spinner, `aria-busy`.

**İkon butonları** [DS]:
- Outline: 36 daire, `white` zemin, `border.subtle` 1 px, 20 px ikon (header bildirim/arama/hesap).
- Filled: 28 kare, `white`, `radius.sm`, 16 px ikon (stat kartı köşe oku).

**FAB "Yeni işlem"** [Türetme: DS Primary + leading icon]: Primary LG, `+` ikon, `elev-2`, tab bar'ın 16 px üstünde, sağda. Responsive davranış RESPONSIVE §2'ye göre.

### 5.2 Kartlar

| Kart | Zemin | Radius | Padding | Gölge | Kaynak |
|---|---|---|---|---|---|
| Standart kart | `white` | `lg` | 16 | `elev-1` | [DS] |
| Liste grubu | `white` | `md` | 0, satırlar arası `border.subtle` ayraç | `elev-1` | [DS] |
| Stat kartı | `surface.income` / `expense` / `compare` | `md` | 12 | `elev-0` | [DS] |
| Bilgi kartı (inline alert) | `blue.100` / `category.amber` / `category.red` | `lg` | 16 | `elev-0` | [Türetme: DS AI card yapısı, AI öğeleri olmadan] |

**Pickaly ekranlarına eşleme:**

- **Toplam Bakiye (Ana Sayfa)** → DS **Balance header** [DS]. Gradyanlı koyu kart **kaldırılır** (Part A'da gradyan yok).
  - Canvas üzerinde ortalı: `caption` "Toplam bakiye" (`text.secondary`) → `display-balance` tutar, ondalık `text.tertiary` → `caption` "n hesapta".
  - Altında 3'lü stat kartı ızgarası (gap 8): **Bu ay gelir** (`surface.income`, `+` önekli) · **Bu ay gider** (`surface.expense`, `−` önekli) · **Geçen aya göre** (`surface.compare`, `±%`). Her kartta köşede filled ok ikon butonu (↗ / ↙) → ilgili liste veya rapor.
  - "Bugün: n Görev, n Ödeme bekliyor" → stat ızgarasının altında `caption` satırı + Text buton.
  - "Aylık Rapor ›" → Text buton.
- **Birikim Hedefi** → DS **Progress meter** [DS] standart beyaz kartta.
  - Başlık (`title-sm`) + sağda `caption` ("%75 tamamlandı").
  - Noktalı iz: dolu kısım `blue.500`, iz noktaları `blue.300` %40, knob halesi `blue.200`.
  - Alt satır: "x ₺ / y ₺" | "%n". Yüzde her zaman metin olarak da yazılır (renk tek başına anlam taşımaz).
  - Teal gradyan **kaldırılır**.
- **Hızlı Aksiyonlar** (Gelir · Gider · Görev · Ödeme) → standart kart, `radius.md`, padding 12, `elev-1`; 36 px ikon karosu (`radius.sm`, kategori zemini + ön planı) + `caption-strong` etiket. 4'lü ızgara, gap 8 [Türetme: DS stat kartı ölçüleri + işlem satırı ikon karosu].
  - Renkler: Gelir `category.green` · Gider `category.red` · Görev `category.violet` · Ödeme `category.pink`.
- **Ajanda kartı (Takvim)** → standart kart; solda saat kutusu `neutral.50` zemin, `radius.sm`, `body-strong` saat.
- **Durum & Başlık kartı (detay ekranları)** → standart kart, `radius.lg`; tutar `title-lg`, durum chip'i (§5.4).
- **Birikim hesabı kartı** → standart kart + basit ilerleme çubuğu (§5.9).
- **Paylaşım kartı (rapor)** → 358 px sabit genişlik korunur [Karar: RESPONSIVE]. `white` zemin, `radius.xl`, padding 24, `elev-2`; üstte 28 px `blue.500` logo karosu + "Pickaly"; içerik Balance header ve stat kartı düzeniyle.

### 5.3 Liste satırı (işlem, ödeme, ayar) [DS]
- 36 px ikon karosu (`radius.sm`, kategori zemini, 20 px ikon ön plan renginde) → başlık `body-strong` + meta `caption` `text.secondary` ("Market · Ana Hesap · 15:11") → sağda tutar `body-strong` (§2.6 rengi).
- Satır yüksekliği 56/64, yatay padding 16, ikon–metin 12.
- Gruplama: tarih başlığı ("Bugün", "1 Eki") `caption-strong` `text.secondary`, sağda günlük toplam; satırlar beyaz `radius.md` grupta.
- Ayar satırı: aynı yapı, sağda değer (`caption` `text.secondary`) + chevron (16 px).
- Hover (işaretçi cihaz): `neutral.50` zemin. Seçili satır (master-detail): `blue.100` zemin.

> **Not:** DS meta metni `text-tertiary` (#A3A7AE) ile gösteriyor; kontrast nedeniyle `text.secondary` [Uyarlama].

### 5.4 Chip ve rozetler

**Seçilebilir chip (filtre, kategori seçimi, hızlı tutar)** [DS "Filter chips"]

| Durum | Zemin | Metin | Çerçeve |
|---|---|---|---|
| Seçili | `black` | `white` | – |
| Seçili değil | `white` | `black` | `border.subtle` 1 px |
| Hover (seçili değil) | `neutral.50` | `black` | `border.strong` |

- Yükseklik **32** [Uyarlama: DS ≈28; Pickaly Ç-9 kararı ve dokunma alanı], padding 12 yatay, `caption-strong`, `radius.full`, gap 8.
- Seçili durumda check ikonu kullanılmaz; siyah dolgu yeterli. [DS]
- `role="radio"` veya `aria-pressed` (eski kural).

**Durum chip'i (salt okunur)** [Türetme: kategori zemin/ön plan çiftleri]

| Anlam (kod adı) | Zemin | Metin |
|---|---|---|
| `task` (Görev) | `category.violet` | `#3E41EA` |
| `payment` (Ödeme) | `category.pink` | `#BC1569` |
| `neutral` (Genel, Randevu) | `category.slate` | `#616975` |
| `success` (Ödendi, Tamamlandı) | `category.green` | `#0E8138` |
| `warning` (Bekliyor, Yaklaşan) | `category.amber` | `#8C6710` |
| `danger` (Gecikmiş) | `category.red` | `#C11515` |

- Yükseklik 24, padding 8 yatay, `caption-strong`, `radius.full`, isteğe bağlı 6 px nokta (metin rengiyle).

**Rozetler** [DS]
- **Delta rozeti** ("+%12,3"): `red.600` zemin (artış kötü), `green.700` zemin (iyi yönde), beyaz `micro`/600, `radius.xs`, öncü ↑/↓ ikon. [Uyarlama: DS danger-500]
- **Sayı rozeti** (bildirim): `red.600`, beyaz `micro`/600, en az 16 px, `radius.full`.
- **Etiket rozeti** ("PRO" vb.): Part A'nın status pill'i (1 px siyah çerçeve, `micro`) — V1'de kullanım yeri yok, rezerv.

### 5.5 Segmented control (Aylık/Haftalık/Günlük, Tümü/Gelir/Gider, Gelir/Gider/Abonelik) [Türetme]
Part A'da yok. Filtre chip'i diliyle türetildi:
- Kap: `neutral.100`, `radius.full`, padding 4, yükseklik 40.
- Seçenek: 32 yükseklik, `radius.full`, `type.button`.
- Seçili: `white` zemin + `elev-1` + `black` metin. Seçili değil: şeffaf + `neutral.700` metin (5,65 ✔).
- [Karar K-4] Seçili görünüm beyaz pill + `elev-1`. Segmented "görünüm değiştirir", filtre chip'i (siyah seçili) "veri süzer"; ikisi bilinçli olarak farklı görünür.

### 5.6 Navigasyon

**Mobil tab bar** [DS "Floating tab bar"]
- Siyah pill, `radius.full`, yükseklik 56, `elev-2`, güvenli alanın 16 px üstünde, ortalı; yatay kenar 16.
- 5 öğe (Ana Sayfa · Takvim · İşlemler · Birikimler · Profil), 24 px ikon.
- Aktif: 40 px beyaz daire + siyah ikon. Pasif: beyaz %70 ikon.
- **Etiket:** Part A'da yok (yalnızca ikon). [Karar K-5] Görünür etiket yok (Part A'ya sadık); her öğe `aria-label` taşır.
- `aria-current="page"` korunur.

**Tablet rail (80 px) ve laptop/desktop sidebar (240/264 px)** [Türetme: tab bar'ın dikey hâli]
- Zemin `white`, sağ kenarda `border.subtle`, gölge yok.
- Öğe: 44 yükseklik, `radius.full`, 24 px ikon + (sidebar'da) `type.body-strong` etiket.
- Aktif: `black` zemin, beyaz ikon ve metin. Pasif: şeffaf zemin, `neutral.600` ikon ve metin (5,05). Hover: `neutral.50`.
- Rail'de etiketler `type.nav` ile ikonun altında.
- Sidebar'daki "Yeni işlem": Primary LG tam genişlik.

**Header (sekme ekranları)** [Türetme: DS Balance header üst satırı]
- Zemin `neutral.50` (canvas ile aynı; alt çerçeve yok), yükseklik 64, padding 8/16.
- Solda "Pickaly" `title-md` + "Life & Money Planner" `caption` `text.secondary`.
- Sağda outline ikon butonları (36): arama, bildirim (sayı rozetiyle), hesap → 40 px avatar daire.
- [Karar K-6] Ana Sayfa header'ı Part A selamlama dilini kullanır: 40 px avatar + `caption` "Günaydın" (saate göre "İyi günler / İyi akşamlar"; EN çevirisiyle) + `title-md` kullanıcı adı. Diğer sekmelerde yukarıdaki "Pickaly" + alt başlık düzeni kalır. Ad yoksa yalnızca selamlama gösterilir.

**Detay / form header (odak ekranları)** [DS AI chat header yapısı, AI öğeleri olmadan]
- 56 yükseklik, `neutral.50` zemin; solda geri chevron (outline ikon butonu), ortada `title-sm` başlık, sağda aksiyonlar. Formlarda solda "×".

**Alt aksiyon barı (Detay-Nav Bar)** [Türetme]
- `white` pill, `radius.full`, padding 6, `elev-2`, güvenli alanın 16 px üstünde.
- İçinde butonlar LG (44) pill: "Kaydet" Primary, "İptal" Tertiary (çerçevesiz, şeffaf).

### 5.7 Form elemanları [Türetme]
Part A'da form tasarımı yok; DS'nin composer'ı (pill input) ve kart diliyle türetildi.

| Eleman | Ölçü ve stil |
|---|---|
| Etiket | `caption-strong` `text.primary`, alanın 6 px üstünde; zorunlu alanda " *" |
| Input / Select tetikleyici | 48 yükseklik, `radius.md`, `white` zemin, `border.control` 1 px, padding 0/16, metin `type.body`, placeholder `text.secondary` |
| — hover / focus | çerçeve `black` / 2 px `blue.600` (çerçeve + halka tek görünür sınır) |
| — hata | çerçeve `red.600`; altında 4 px boşlukla `caption` `red.600` mesaj, öncü `octagon-alert` 16 px |
| — disabled | `neutral.150` zemin, `neutral.400` metin, çerçeve `border.subtle` |
| Textarea | Input stili, en az 96 yükseklik, padding 12/16; sağ altta sayaç `caption` `text.secondary` ("54/200") |
| Tutar alanı (Yeni İşlem) | Çerçevesiz, ortalı `display-balance` (44/48, 500), ₺ öneki `text.secondary`; altında `caption` "Tutar" etiketi [DS Balance header tipografisi] |
| Hesap seçici kartı | Standart kart, ikon karosu + "Ana Hesap" `body-strong` + bakiye `caption`, sağda "Değiştir" Text buton |
| Switch | 44×24 iz `radius.full`; kapalı iz `neutral.500`, açık iz `blue.600`; 20 px beyaz düğme, `elev-1` |
| Checkbox / Radio | 20 px, `border.control` 1,5 px; seçili `blue.600` dolgu + beyaz işaret; radius 6 / daire |
| OTP kutusu | 48×56, `radius.md`, `border.control`; odakta `blue.600` 2 px; rakam `title-md` |
| Arama alanı | 44 yükseklik **pill** (`radius.full`), `white`, `border.subtle`, öncü 20 px arama ikonu [DS composer] |

- **Input yüksekliği 46 → 48** [Türetme: 44 dokunma alanı + DS seçici satır ritmi] [Karar K-7]. Eski Ç-2 kararının (46) yerine geçer.
- `border.control` kontrast gereği DS'nin "çerçevesiz" görünümünden daha belirgindir [Uyarlama, WCAG 1.4.11].
- Doğrulama zamanlaması ve metin kuralları DESIGN.md §9.4'ten aynen geçerli.

### 5.8 Overlay'ler [Türetme]

| Overlay | Stil |
|---|---|
| Arka plan (backdrop) | `black` %40 |
| Modal / onay diyaloğu | `white`, `radius.xl`, padding 24, `elev-3`; başlık `title-md`, metin `body` `text.secondary`; butonlar sağa hizalı (mobilde alt alta, tam genişlik) |
| Bottom sheet (mobil) | `white`, üst köşeler `radius.xl`, `elev-3`; 36×4 tutamak `neutral.100`; başlık `title-sm` |
| Drawer (tablet+) | `white`, iç köşeler `radius.lg`, `elev-3`; genişlikler RESPONSIVE §6.2 |
| Popover / menü | `white`, `radius.md`, padding 6, `elev-2`; satır 44 yükseklik, `radius.sm`, hover `neutral.50` |
| Seçici satırı | 48 yükseklik, seçili satırda sağda check (`blue.600`) + `body-strong` |
| Toast | `black` pill, beyaz `body` metin, `radius.full`, padding 12/16, `elev-2`; "Geri al" Text buton `blue.300` (siyahta 10,64:1) |
| Tooltip | `black`, beyaz `caption`, `radius.sm`, padding 6/10 |

- Silme onayı içeriği ve davranışı RESPONSIVE §4.5.2 ve PRD UX-010'dan.

### 5.9 Geri bildirim ve durum
- **İlerleme çubuğu (basit)**: 8 yükseklik, `radius.full`, iz `blue.100`, dolgu `blue.500`; yüzde metni her zaman yazılır.
- **Progress meter (noktalı)**: §5.2 Birikim Hedefi.
- **Spinner**: 16/20/24 px, `blue.600` (butonda metin rengi).
- **Skeleton**: `neutral.100`, öğenin radius'u, 1,2 s nabız; `prefers-reduced-motion`'da sabit.
- **Boş durum**: 48 px ikon karosu (`blue.100` zemin, `blue.600` ikon, `radius.lg`) → `title-sm` başlık → `body` `text.secondary` açıklama → Primary LG buton. Ortalı, en fazla 320 px genişlik.
- **Inline alert (bilgi notu)**: §5.2 bilgi kartı; öncü 20 px ikon (`blue.600` / `amber.700` / `red.700`), metin `body` `text.primary`.
- **Çevrimdışı bandı**: `amber.500` zemin, `black` `caption-strong` metin, tam genişlik, 36 yükseklik.

### 5.10 Takvim [Türetme]
- Ay matrisi hücresi: 40 daire hedef; gün numarası `body`.
- **Seçili gün**: `black` daire, beyaz `body-strong` (seçim = siyah).
- **Bugün** (seçili değilse): `blue.100` daire, `blue.600` `body-strong`.
- Başka aydaki günler: `text.secondary`. Disabled günler: `text.disabled`.
- Etkinlik noktaları (6 px): görev `#3E41EA`, ödeme `#BC1569`, en fazla 3 nokta.
- Hafta şeridi: aynı kurallar, `radius.full` pill hücre.
- Ajanda kartları §5.2.

### 5.11 Grafikler [DS + Türetme]
- **Aylık rapor gelir/gider çubukları** → nokta matrisli çubuk (DS imza öğesi): 6 px nokta, 3 px aralık; içinde bulunulan dönem `chart.current`, arka plan ızgarası `chart.grid`; gelir/gider karşılaştırmasında `chart.income` / `chart.expense`.
- **Kategori dağılımı** → DS **Budget donut**: kalın halka (14 px), segmentler kategori ön plan renkleri, segmentler arası 2 px boşluk; ortada `title-lg` toplam; altta noktalı lejant (`caption` + tutar `body-strong`).
- Spending chart kartı: etiket + delta rozeti → `title-lg` tutar → "Ayrıntılar" Text buton → grafik → alt karşılaştırma satırı ("Eyl 2.250,23 ₺ · Eki **4.230,23 ₺**").

### 5.12 Avatar
40 daire [DS]; profil kartında 56. Fotoğraf yoksa `blue.100` zemin + `blue.600` baş harf (`title-sm`).

---

## 6. Hareket [Türetme]
Part A hareket tanımı vermiyor; Part B kullanılmadığı için sade bir set:
- Renk/zemin geçişleri 150 ms `ease-out`; overlay açılışı 200 ms, kapanışı 150 ms.
- Pressed: `scale(0.98)` en fazla.
- `prefers-reduced-motion: reduce` → tüm geçişler anlık, skeleton sabit.

---

## 7. Teknik uygulama notları (TECH_STACK §8 ile)
- Token adları TECH_STACK yapısında kalır (`--color-*`, `--radius-*`, `--shadow-*`); DS'deki `--fp-*` adları **kullanılmaz**.
- DS'nin `tailwind.config.js` örneği Tailwind v3 içindir; projede Tailwind v4 `@theme` kullanılır.
- Primitive değerler `tokens/color.primitives.json`, semantic eşleme `tokens/color.semantic.light.json` dosyalarına §2.3'e göre işlenir; `tokens.css` üretilir, elle düzenlenmez.
- Kategori anahtarları (§2.2) veritabanında değişmez; yalnızca token değerleri değişir.
- PWA tema rengi (`manifest.ts`, `theme-color`): `#F5F6F7` zemin; ikon karosu `blue.500`, `radius.2xl` maske.
- Eski tasarımın Figma ile eşleşen değerleri (teal, Manrope, gradyanlar) artık geçerli değil; Figma Pages yalnızca ekran içeriği ve akış referansıdır.

---

## 8. Kararlar [ürün sahibi onayı, 2026-11-04]

| # | Konu | Karar |
|---|---|---|
| K-1 | [Uyarlama] renkleri (`blue.600`, `red.600`, `green.700`, `amber.700`, `neutral.500` vb.) | Onaylandı: WCAG AA için koyulaştırılmış tonlar kullanılır |
| K-2 | Gider tutarı rengi (§2.6) | PRD UX-014 korunur: gelir yeşil, gider kırmızı |
| K-3 | Masaüstü tipografi (§3.2) | Yalnızca bakiye laptop+ 48 / 52; diğerleri sabit |
| K-4 | Segmented control seçili görünümü (§5.5) | Beyaz pill + `elev-1` |
| K-5 | Tab bar etiketi (§5.6) | Görünür etiket yok, `aria-label` var |
| K-6 | Ana Sayfa selamlama header'ı (§5.6) | Yalnızca Ana Sayfa'da avatar + selamlama + ad |
| K-7 | Input yüksekliği (§5.7) | 48 px |

---

## 9. Kod geçişi (bu dokümanın kapsamı dışında, sıradaki adım)
Onaydan sonra önerilen sıra: (1) token JSON + `tokens.css` + Geist font · (2) temel componentler (Button, Chip, Input, Card, ListRow, Segmented, Switch) · (3) navigasyon (tab bar, rail, sidebar, header) · (4) ekranlar (Ana Sayfa → İşlemler → Takvim → Birikimler → Raporlar → Profil → Auth) · (5) kontrast testi ve 4 viewport'ta görsel kontrol.
