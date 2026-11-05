# Pickaly – Responsive Tasarım Stratejisi

> **Sürüm:** 5.
> - Sürüm 2: 14 açık sorunun kararları işlendi (§7).
> - Sürüm 3: Tasarım kaynağı **yalnızca Pages ve Components** olarak sınırlandırıldı.
> - Sürüm 4: Kalan teknik konular [TECH_STACK.md](TECH_STACK.md) Karar Kaydı ile kapatıldı.
> - Sürüm 5: [DESIGN.md](DESIGN.md) ile çelişkiler giderildi (Ç-1…Ç-13).
> - Sürüm 6: [PRD.md](PRD.md) kaynaklı 21 eksik öğe (§8.1 #21–#41) ve responsive kuralları (§8.2.11) eklendi.
> - Sürüm 7: Geçici tablet/masaüstü geliştirme kuralı (§8.5), kategori arşivleme sunumu (§8.1 #30, §8.2.11).
>
> Değişiklik özeti: §10.
>
> **Kapsam:** Responsive web uygulaması. Mobil uygulamalar çok ileride Expo ile yapılacak, bu doküman onları kapsamaz.
> **Resmi tasarım kaynağı:** Figma dosyası `Fatih-Test` (`fRjZAdt4WTgyRRsPrUTTab`):
> - **Pages** sayfasındaki 19 mobil ekran (390 px)
> - **Components** sayfası
>
> **Kapsam dışı:** AI Pages, Research, "-" ve Thumbnail sekmeleri. Bu dokümandaki hiçbir karar bu sekmelere dayanmaz.
> **Kapsam:** Bu bir strateji dokümanıdır. Kod veya Figma değişikliği içermez.
> **İlke:** Mobil tasarımın görsel dili tüm cihazlarda **aynen korunur**: Manrope, teal marka rengi, slate nötrler, 24 px köşeli kartlar, yumuşak gölgeler, chip ve segmented yapıları. Cihazlar arasında değişen yalnızca *yerleşim* ve *etkileşim modeli*dir.

İşaretler:
- **[Figma]** → Figma'dan doğrudan okunan bilgi
- **[Karar]** → Kesinleşmiş karar (§7'de numarasıyla) veya bu dokümanın tasarım kararı
- **[Varsayım]** → Pages/Components'ta karşılığı olmayan, tasarlanması/doğrulanması gereken öneri
- **[Eksik]** → Tasarımda bulunmayan ekran veya component. Geliştirme önerisi ayrı olarak §8'de
- **[D-n]** → [TECH_STACK.md](TECH_STACK.md) §12 Karar Kaydı'ndaki teknik/ürün kararı
- **[Ç-n]** → [DESIGN.md](DESIGN.md) §11'de çözülen doküman çelişkisi

---

## 0. Mevcut Mobil Tasarımın Özeti (Temel Alınan Ölçüler)

| Öğe | Değer | Kaynak |
|---|---|---|
| Ekran genişliği | 390 px | [Figma] |
| Sayfa yatay padding | 16 px (`Spacing/16` değişkenine bağlı) | [Figma] |
| İçerik genişliği | 358 px | [Figma] |
| Bölümler arası boşluk | 24 px | [Figma] |
| Bölüm içi boşluk | 8 / 12 px | [Figma] |
| Kart padding | 16 px | [Figma] |
| Ana kart radius | 24 px (`Radius/2XL`) | [Figma] |
| Segmented control / input radius | 12 px (`Radius/MD`) | [Figma] |
| Button LG / SM yükseklik | 48 / 38 px, radius 12 | [Figma] |
| Alt navigasyon | 324×60 px yüzen "pill" (radius 999), 5 sekme | [Figma] |
| Üst header | "Pickaly / Life & Money Planner" + arama, bildirim, profil (hesap) ikonları | [Figma] |
| Üst 40 px dikdörtgen | Cihaz status bar yer tutucusu. Web'de eleman değil, `safe-area-inset-top` | [Figma] / [Karar] |

**İki ekran tipi:**

1. **Sekme ekranları:** Header → içerik → (Floating "Yeni işlem" butonu) → Nav Bar
   - Ana Sayfa, Takvim (Aylık / Haftalık / Günlük), İşlemler, Birikimler, Profil ve Ayarlar
2. **Odak ekranları:** Geri oklu "Top Navigation Header" → içerik → sabit alt aksiyon barı ("Detay-Nav Bar")
   - Detaylar, formlar, raporlar, kategori ekranları

Tablet ve masaüstünde bu ikili yapı korunur. Odak ekranları ise tam sayfa olmaktan çıkıp, bağlamı koruyan **panel / drawer / modal** biçimlerine dönüşür (§2.4).

---

## 1. Responsive Breakpoints

### 1.1 Breakpoint tanımları [Karar]

| Ad | Aralık | Hedef cihaz | Figma referans frame genişliği |
|---|---|---|---|
| `mobile` | 0 – 767 px | Telefon | **390** (mevcut) |
| `tablet` | 768 – 1023 px | Tablet dikey, küçük tablet yatay | **834** |
| `laptop` | 1024 – 1439 px | Tablet yatay, 13–14" dizüstü | **1280** |
| `desktop` | ≥ 1440 px | Geniş masaüstü | **1440** (1920'de de kontrol edilir) |

- **1280 px eşiği:** Laptop aralığının içinde ek bir eşik. İşlemler ekranında liste + detay paneli ancak 1280 px'de yan yana sığar. Bu genişliğin altında detay **drawer** olarak, üstünde **satır içi panel** olarak açılır (§3.3).
- **Minimum desteklenen genişlik:** 360 px.
  - [Varsayım] 360'ta 4'lü hızlı aksiyon kartlarının ve 5'li nav'ın sığdığı görsel olarak kontrol edilmeli.

### 1.2 İçerik genişliği, padding ve grid [Karar]

| | mobile | tablet | laptop | desktop |
|---|---|---|---|---|
| Navigasyon | Alt pill nav | Sol rail **80 px** | Sol sidebar **240 px** | Sol sidebar **264 px** |
| Sayfa yatay padding | 16 | 24 | 32 | 40 |
| Grid sütun | 4 | 8 | 12 | 12 |
| Gutter | 16 | 16 | 24 | 24 |
| İçerik max-width | akışkan | akışkan | akışkan | **1200 px**, kalan alanda ortalanır |
| Bölümler arası dikey boşluk | 24 | 24 | 32 | 32 |
| Kart iç padding | 16 | 20 | 24 | 24 |
| Sayfa üst padding | 16 | 24 | 32 | 32 |

**Örnek hesaplar:**

| Viewport | Hesap | İçerik genişliği |
|---|---|---|
| tablet 834 | 834 − 80 − 2×24 | **706 px** |
| laptop 1280 | 1280 − 240 − 2×32 | **976 px** |
| desktop 1440 | 1440 − 264 − 2×40 | **1096 px** |

**Okuma genişliği (max-width):**

| İçerik | Max-width |
|---|---|
| Formlar | 560 px |
| Ayarlar | 720 px |
| Boş durum blokları | 480 px |

---

## 2. Navigation

### 2.1 Mobil (mevcut, korunur) [Figma]
- **Alt nav (yüzen pill):** Ana Sayfa · Takvim · İşlemler · Birikimler · Profil. Butonlar `Nav Bar Buttons` (on/off) component'i.
- **Floating Button:** "Yeni işlem".
- **Header:** Logo + arama + bildirim + profil ikonu.
- **Odak ekranlarında:** Alt nav gizlenir, `Detay-Nav Bar` gelir.

### 2.2 Tablet (768–1023): Navigation Rail [Karar #10]
- **Genişlik:** Solda **80 px** dikey rail.
- **Butonlar:** Mevcut `Nav Bar Buttons` component'i (ikon üstte + label altta, 72×52) **dikey dizilir**. Yeni bir buton tasarımı gerekmez.
- **Rail içeriği (üstten alta):**
  1. Pickaly logo işareti
  2. "Yeni işlem" butonu: 56 px kare, `Brand/Primary`, `+` ikonu, "Yeni" etiketi. FAB'ın rail içindeki hali.
  3. 5 sekme
- **İçerik üst barı:**
  - Solda sayfa başlığı + alt başlık
  - Sağda arama, bildirim ve **hesap menüsü** ikonu (§2.5)
- Tablet dikey ve yatayda aynı rail kullanılır. Cihaz döndürüldüğünde navigasyonun yeri değişmez.

### 2.3 Laptop ve Desktop (≥1024): Kalıcı Sidebar [Karar]

```
┌──────────────────────┐
│ Pickaly              │  ← Header'daki logo + "Life & Money Planner"
│ Life & Money Planner │
│ [ + Yeni işlem     ] │  ← FAB'ın yerini alan Button LG / Primary
│ ⌂  Ana Sayfa         │  ← aktif: Neutral/200 zemin + Brand/Primary ikon/metin [Ç-3]
│ ▦  Takvim            │
│ ▤  İşlemler          │
│ ◫  Birikimler        │
│ ──────────────       │
│ ◯  Profil            │  ← Profil sekmesi korunur [Karar #5]
└──────────────────────┘
```
- **Menü öğeleri:** Mevcut 5 sekme. Ayrı bir "Görevler" öğesi **yok** [Karar #1].
- **Öğe yapısı:** İkon + metin, 40 px yükseklik, `Radius/MD`.
- **"Yeni işlem":** Sidebar'ın üstünde sabit Primary buton. Masaüstünde yüzen buton (FAB) yok.
- **Üst bar (64 px):**
  - Solda sayfa başlığı + alt başlık
  - Sağda sayfa aksiyonları ("Bugün", ay seçici vb.), arama, bildirim ve **hesap menüsü** (§2.5)

### 2.4 Odak ekranlarının sunumu [Karar]

| Ekran tipi | mobile | tablet | laptop / desktop |
|---|---|---|---|
| Kayıt detayları (Görev, İşlem, Ödeme) | Tam sayfa | Sağ **drawer** 480 px | 1024–1279: drawer 480 px · ≥1280: İşlemler'de **satır içi panel** |
| Formlar (Yeni İşlem, Yeni Birikim, Kategori Ekle; [Eksik] Görev Ekle) | Tam sayfa | Sağ **drawer** 560 px | Sağ **drawer** 560 px |
| Zengin sayfalar (Birikim Hesabı Detayı, Aylık Finans Raporu, Kategori Yönetimi) | Tam sayfa | Tam sayfa (rail görünür) | Tam sayfa (sidebar görünür) |
| Paylaşılabilir Rapor | Tam sayfa | **Modal** | **Modal** |
| Silme onayı | **Bottom sheet** | **Modal** | **Modal** |

**Genel kurallar:**
- Tablet ve üstünde ana navigasyon asla gizlenmez.
- Drawer ve modal'da geri oku yerine **×** kullanılır.

### 2.5 Hesap menüsü (header profil ikonu) [Karar #5]

Header'daki profil ikonu korunur ve **hesap menüsü** açar. Alt nav / rail / sidebar'daki **Profil** sekmesi de korunur. İkisinin rolü farklı:
- **Profil sekmesi:** Ayarlar sayfasına giden kalıcı navigasyon.
- **Hesap menüsü:** Hesaba ait hızlı işlemler.

**Menü içeriği** [Varsayım]. Yalnızca Profil ve Ayarlar ekranında zaten var olan öğeler kullanılır:
1. Profil özeti: avatar, ad, e-posta, "Senkronize" durumu (Profil kartından)
2. "Profil ve Ayarlar" bağlantısı
3. "Çıkış Yap" (Destek & Bilgi grubundan)

**Sunum:**

| | mobile | tablet / laptop / desktop |
|---|---|---|
| Hesap menüsü | Bottom sheet | İkona bağlı dropdown (sağa hizalı, ~280 px) |

- [Eksik] Hesap menüsü Pages'ta tasarlanmamıştır. Pages'ta yalnızca ikon var. Geliştirme önerisi: §8.2.4.
- Profil ve Ayarlar ekranındaki "Çıkış Yap" satırı da yerinde kalır. Aynı aksiyonun iki erişim noktası olması bu menünün amacına uygundur.

---

## 3. Page Layouts (Ekran Ekran)

Gösterim: `[n/12]` = 12 sütunluk grid'de kapladığı sütun, tablette `[n/8]`.

### 3.1 Ana Sayfa (Dashboard)

**Mobil içerik sırası [Figma]:**
1. Toplam Bakiye kartı
2. Hızlı Aksiyonlar (Gelir · Gider · Ödeme · Görev) [sıra: ürün sahibi kararı 2026-11-05]
3. Bugünün Akışı
4. Yaklaşan Ödemeler
5. Birikim Hedefi

**Tablet [Karar]:**
```
┌──────────── Bakiye kartı [8/8] ────────────┐
├──────── Hızlı Aksiyonlar (4'lü) [8/8] ─────┤
├ Bugünün Akışı [4/8] ┬ Yaklaşan Ödemeler [4/8] ┤
├──────────── Birikim Hedefi [8/8] ──────────┤
```

**Laptop / Desktop [Karar]:**
```
┌ Bakiye kartı [8/12] ───────────┬ Birikim Hedefi [4/12] ─┐
├ Bugünün Akışı [7/12] ──────────┼ Hızlı Aksiyonlar 2×2 [5/12]
│                                ├ Yaklaşan Ödemeler [5/12]
└────────────────────────────────┴────────────────────────┘
```

**PRD ile eklenenler [Eksik tasarım]:**
- **Haftalık özet kartı** (PRD Q-3): Bugünün Akışı'nın altında. Laptop ve üstünde sol sütunda [7/12].
- **Bugünün Akışı içi:** En üstte "Gecikmiş" grubu, tamamlananlar soluk görünümle kalır (PRD Q-19, Q-20).
- Ayrıntılar §8.2.11'de.

**Hızlı Aksiyonlar hedefleri [Karar #2, #3]:**

| Buton | Açtığı ekran |
|---|---|
| Gelir | Yeni İşlem formu, **Gelir** sekmesi seçili |
| Gider | Yeni İşlem formu, **Gider** sekmesi seçili |
| Görev | **Görev Ekle** formu. [Eksik] Formun tasarımı yok, bkz. §3.2.5 ve §8.2 |
| Ödeme | Yeni İşlem formu, **Abonelik** sekmesi seçili |

**Link hedefleri [Karar #9]:**

| Link | Hedef |
|---|---|
| Bugünün Akışı → "Tümü (n)" | **Takvim**, bugünün tarihi seçili. Mobilde/tablette seçili günün ajandasına scroll edilir; laptop+'ta sağ panelde bugünün ajandası açık gelir. |
| Yaklaşan Ödemeler → "Tümü (n)" | **İşlemler** |
| Bakiye kartı → "Aylık Rapor" | **Aylık Finans Raporu** |

### 3.2 Takvim (Görevler dahil)

Ayrı bir Görevler ekranı **oluşturulmaz**. Görevler Takvim içinde listelenir, eklenir, tamamlanır ve detaylandırılır [Karar #1]. Görevler randevu ve ödemelerle aynı ajandada, renk koduyla ayrışarak gösterilir.

#### 3.2.1 Aylık Görünüm
- **Mobil [Figma]:** Ay matrisi (nokta göstergeleri) + seçili gün özeti + Yapılacaklar / Tamamlandı listeleri.
- **Tablet [Karar]:** Matris tam genişlik. Gün hücresinde nokta yerine **adet rozetleri**. Ajanda 2 sütun: Yapılacaklar [4/8] | Tamamlandı [4/8].
- **Laptop / Desktop [Karar]:** Matris [8/12] | seçili gün ajandası [4/12], sticky.
  - Gün hücresinde ilk 2 kaydın başlığı küçük `Chip` olarak gösterilir, fazlası "+n".
  - Ajandadaki kayda tıklama → Görev Detayı drawer'da açılır.

#### 3.2.2 Haftalık Görünüm
- **Mobil / Tablet [Figma]:** 7 günlük kompakt şerit + seçili günün saat çizelgesi.
- **Laptop / Desktop [Karar]:** Saat sütunu (64 px) + 7 gün sütunlu haftalık zaman ızgarası. Kayıtlar saat aralığında blok olarak yerleşir.
  - [Varsayım] Masaüstü ızgarası Figma'da çizilmedi.

#### 3.2.3 Günlük Görünüm [Karar #4] · [Eksik]
- **Pages'taki durum:** Takvim'in segmented control'ünde "Günlük" seçeneği var [Figma], ama **ekranı tasarlanmamış**.
- **Karar:** Seçenek kaldırılmaz. Haftalık görünümün tek güne odaklanan, daha detaylı saat çizelgesi olarak tasarlanması önerilir.
- **Geliştirme önerisi:** §8.2.2.

#### 3.2.4 Görev Detayı ve Durum Yönetimi
- **Mobil [Figma]:** Tam sayfa. Alt bar: "Düzenle | Görevi tamamla". En altta "Kaydı kalıcı olarak sil".
- **Tablet ve üstü [Karar]:** Sağ drawer 480 px. Alt aksiyonlar drawer footer'ına sabitlenir.
- **"Kaydı kalıcı olarak sil":** Silme onayı açar (§4.5.2) [Karar #7].
- **"Düzenle":** Görev Ekle formunu dolu halde açar [Varsayım]. Görev Ekle formu da [Eksik].

#### 3.2.5 Görev Ekle [Karar #2] · [Eksik]
- **Pages'taki durum:** Ana Sayfa Hızlı Aksiyonlar'da "Görev" butonu var [Figma], ama açtığı **form tasarlanmamış**.
- **Karar:** Yeni İşlem formunun tasarım dili ve bileşenleriyle bir **Görev Ekle** drawer/form akışı oluşturulacak.
- **Responsive sunum:** Diğer formlarla aynı kural. Mobilde tam sayfa, tablet ve üstünde 560 px sağ drawer (§2.4).
- **Önerilen alanlar ve davranışlar:** §8.2.1. Tamamı varsayımdır.

### 3.3 İşlemler (Finans)

#### 3.3.1 İşlemler – Gelir ve Gider Listesi
- **Mobil [Figma]:** Özet kartı, Tümü/Gelir/Gider segmented control, yatay kaydırılan kategori chip'leri, güne göre gruplanmış liste.
- **Tablet [Karar]:** Özet tek satır: Net [4/8] | Gelir [2/8] | Gider [2/8]. Kategori chip'leri wrap ile alt satıra geçer.
- **Laptop (1024–1279) [Karar]:** Gün grupları korunur, satırlar sütunlara hizalanır (liste-tablo hibriti):

| İkon + Başlık | Kategori | Hesap | Durum | Saat | Tutar |
|---|---|---|---|---|---|

  - Satıra tıklama → İşlem Detayı drawer'da açılır.
- **≥1280 [Karar]:** Master-detail. Liste [7/12] | İşlem/Ödeme Detayı paneli [5/12], sticky. Satır seçili değilken panel gizli, liste 12/12.
- **Gelen link:** Ana Sayfa "Yaklaşan Ödemeler → Tümü" buraya gelir [Karar #9].
  - Filtre uygulanmaz [D-26].

#### 3.3.2 İşlem Detayı · Ödeme Detayı
- **Mobil [Figma]:** Tam sayfa.
- **Tablet ve üstü [Karar]:** §3.3.1'deki drawer / panel kuralı. İçerik mobil tek sütun yapısını korur.
- **"İşlemi sil":** Silme onayı açar (§4.5.2).

#### 3.3.3 Yeni İşlem (Gelir · Gider · Abonelik)
- **Mobil [Figma]:** Tam sayfa form. Gelir / Gider / Abonelik arasında segmented control ile geçiş.
- **Tablet ve üstü [Karar]:** Sağ drawer 560 px, tek sütun. Tarih/Saat ve Tekrarlama/Hatırlatma çiftleri yan yana kalır.
- **Açılış noktaları ve seçili sekme:**

| Tetikleyici | Seçili sekme |
|---|---|
| Sidebar / rail / FAB "Yeni işlem" | Gelir (mobil tasarımdaki varsayılan) |
| Hızlı Aksiyon "Gelir" | Gelir |
| Hızlı Aksiyon "Gider" | Gider |
| Hızlı Aksiyon "Ödeme" | **Abonelik** [Karar #3] |

- **Hızlı gider girişi:** Ayrı bir ekran **yok**. Mevcut Yeni İşlem / Gider akışı kullanılır [Karar #12].
- **Seçiciler:**
  - Hesap "Değiştir", Tekrarlama Sıklığı, Hatırlatma Bildirimi → §4.5.1
  - Tarih / Saat → özel seçiciler
  - Açık halleri [Eksik]
- **Doğrulama ve başarı geri bildirimi:** §4.5.3. Bu durumlar da [Eksik].

### 3.4 Birikimler

#### 3.4.1 Birikimler – Ana Sayfa
- **Tablet [Karar]:**
  - "Aylık Rapor" (Secondary) ve "Yeni birikim hesabı ekle" (Primary) butonları üst bara taşınır.
  - Birikim kartları 2 sütun.
- **Laptop / Desktop [Karar]:** Özet [12/12], birikim kartları 3 sütun.

#### 3.4.2 Birikimler – Boş Durum
- **Mobil [Figma]:** Pages'taki "Birikimler – Ana Sayfa – Boş" ekranı.
- **Tüm büyük ekranlar [Karar]:** Boş durum bloğu ortalanır, max 480 px. Üst bardaki "Yeni birikim hesabı ekle" butonu boş durumda gizlenir.
- Pages'taki **tek boş durum tasarımı** budur. Diğer ekranların boş durumları için bu kalıbın referans alınması önerilir (§8.2.6).

#### 3.4.3 Birikim Hesabı Detayı
- **Laptop / Desktop [Karar]:**
  - Sol [8/12]: Durum kartı + Geçmiş Hareketler
  - Sağ [4/12]: Hesap Parametreleri + bilgi notu + tehlike bölgesi
  - Aksiyonlar üst barda: "Para ekle / Çek" (Primary), "Hesabı düzenle" (Secondary)
- **"Birikim hesabını kapat / Sil":** Silme onayı açar (§4.5.2).

#### 3.4.4 Yeni Birikim Hesabı Ekle
Yeni İşlem ile aynı drawer kalıbı (560 px).

### 3.5 Raporlar

#### 3.5.1 Aylık Finans Raporu
- **Gelen link:** Ana Sayfa → "Aylık Rapor" [Karar #9]. Ayrıca Birikimler → "Aylık Rapor" butonu.
- **Tablet [Karar]:** Net kartı [8/8]. Altında Karşılaştırma [4/8] | En Çok Harcama [4/8].
- **Laptop / Desktop [Karar]:**
  - Üst bar: ay seçici + "Paylaş" butonu
  - Net kartı [12/12], 4 metrik tek satır
  - Altında 2 sütun [6/12 + 6/12]
- **Grafikler:** Yeni grafik tipi eklenmez. Oranlı yatay çubuklar genişler.
- **"Paylaş" butonu** [Varsayım]: Mobilde paylaşım ekranına nasıl geçildiği tasarımda görünmüyor. Üst bara bu buton öneriliyor.

#### 3.5.2 Paylaşılabilir Rapor Görünümü
- **Tablet ve üstü [Karar]:** Modal (max 520 px).
- Paylaşım kartı her cihazda **sabit 358 px**. Dışa aktarılan görselin cihaza göre değişmemesi gerekir.

### 3.6 Profil ve Ayarlar

#### 3.6.1 Profil ve Ayarlar
- **Tablet [Karar]:** Tek sütun, max 720 px, ortalı.
- **Laptop / Desktop [Karar]:** Profil kartı [4/12], sticky | Ayar grupları [8/12, max 720].
- **Değer seçimli satırlar** (Para Birimi, Uygulama Dili, Haftanın İlk Günü): mobilde bottom sheet, tablet ve üstünde satıra bağlı popover/dropdown [Karar #6].
- **"Hatırlatma ve Bildirimler" satırı:** Satır Pages'ta var ("Hatırlatma tercihleri · Açık") [Figma], ama açtığı ekran tasarlanmamış [Eksik] (§3.6.4).
- **"PIN / Biyometrik Kilit" satırı [Karar #8]:**
  - İlk sürümde Face ID / biyometrik kilit **yok**. Satırdaki "FaceID" ifadesi kaldırılır.
  - PIN kilidi de v1.0'da **yok** [D-4]. Satır v1.0'da gizlenir.
  - Uygulama kilidi, hesap kimlik doğrulaması ve oturum güvenliği ayrı kavramlardır (§9.2).
- **"Çıkış Yap":** Yerinde kalır, hesap menüsünde de bulunur (§2.5).

#### 3.6.2 Kategori Yönetimi
- **Tablet:** 2 sütunlu grid.
- **Laptop / Desktop:** 3 sütunlu grid.
- Segmented control (Harcama / Gelir – Görev / Takvim) üst barda.
- **"Görev / Takvim" kategorileri:** [Varsayım] Görev Ekle formundaki Kategori alanının kaynağı olması önerilir (§8.2.1).

#### 3.6.3 Kategori Ekle ve Düzenle
- **Tablet ve üstü:** Drawer 560 px. "Canlı Önizleme" kartı drawer üstünde sticky kalır.

#### 3.6.4 Hatırlatma Ayarları · [Eksik]
- **Pages'taki durum:** Profil ve Ayarlar'da "Hatırlatma ve Bildirimler – Hatırlatma tercihleri – Açık" satırı var [Figma], ama satırın açtığı **ekran tasarlanmamış**.
- **Hatırlatma ile ilgili Pages'ta görünenler:** Kayıt bazında "Hatırlatma Bildirimi" seçimi (Yeni İşlem formunda, örn. "1 saat önce"), Görev Detayı'ndaki "Zaman & Hatırlatma" bölümü ve header'daki bildirim ikonu.
- **Ekranın içeriği:** Hangi genel tercihlerin bu ekranda yer alacağı tasarımda **tanımlı değil**. Bu doküman içerik önermez.
- **Geliştirme önerisi:** §8.2.5.

### 3.7 Eksik Durum Ekranları

Pages'taki akışlar boş veri, başarı/hata ve onay gibi **durumların** tasarımını büyük ölçüde içermiyor. Bu durumlar yeni özellik değildir, mevcut akışların tamamlanması için gereklidir. Pages'ta bu konuda var olan ve olmayanlar aşağıda.

#### 3.7.1 Boş durumlar
| Ekran / alan | Pages'ta boş durum tasarımı |
|---|---|
| Birikimler | **Var** ("Birikimler – Ana Sayfa – Boş") [Figma] |
| Takvim ajandası (seçili gün boş) | [Eksik] |
| İşlemler listesi (dönem veya filtre sonucu boş) | [Eksik] |
| Ana Sayfa – Bugünün Akışı, Yaklaşan Ödemeler | [Eksik] |
| Kategori Yönetimi | [Eksik] |
| Birikim Hesabı Detayı – Geçmiş Hareketler · Ödeme Detayı – Geçmiş Ödemeler | [Eksik] |

**Geliştirme önerisi:** §8.2.6.

#### 3.7.2 Geri bildirim ve onay durumları
| Durum | Pages'taki karşılık |
|---|---|
| Silme onayı | [Eksik]. Silme butonları var, onay ekranı yok |
| Başarı bildirimi (kaydet, tamamla, ödendi) | [Eksik] |
| Form doğrulama hatası | [Eksik]. Zorunlu alanlar "*" ile işaretli [Figma], hata görünümü yok |
| Tamamlandı / Ödendi durumu | **Kısmen var.** Takvim'de "Tamamlandı" bölümü ve "Bitti" etiketi, İşlemler'de "Ödendi" chip'i [Figma] |
| Kaydedilmemiş değişiklik uyarısı | [Eksik] |

**Geliştirme önerisi:** §8.2.3 (silme onayı), §8.2.7 (bildirim ve doğrulama).

---

## 4. Components – Responsive Davranışlar

### 4.1 Kartlar
- **Radius:** Tüm breakpoint'lerde aynı [Ç-1]:
  - Hero ve durum kartları (Toplam Bakiye, detay ekranlarındaki Durum & Başlık kartı, tutar kartı): **24 px** (`Radius/2XL`)
  - Liste kartları, ajanda kartı, ayar grupları, Hızlı Aksiyon, Birikim Hedefi: **16 px** (`Radius/LG`)
- **Padding:** 16 → 20 → 24.
- **Hover (laptop+):** Gölge eklenmez [Ç-6]. Tıklanabilir satırlarda zemin `Neutral/50`, tıklanabilir kartlarda çerçeve `Border/Strong` olur.
- **Yükseklik:** Aynı satırdaki kartlar eşit yükseklikte durur.

### 4.2 Listeler
- **mobile:** Satır kartları.
- **tablet:** Aynı satırlar, ikincil bilgi kesilmeden gösterilir.
- **laptop+:** İşlemler'de sütunlu liste-tablo hibriti (semantik `<table>`). Diğer listeler satır yapısını korur.

### 4.3 Takvim
| Görünüm | mobile | tablet | laptop+ |
|---|---|---|---|
| Aylık | Nokta göstergeleri | Adet rozetleri | İlk 2 kayıt chip'i + "+n" |
| Haftalık | Şerit + tek gün çizelgesi | Aynı | 7 sütunlu ızgara |
| Günlük | Detaylı tek gün çizelgesi | Aynı | Çizelge + sağ özet paneli |

Günlük görünüm henüz tasarlanmadı (§3.2.3).

### 4.4 Grafikler
- Oranlı yatay çubuklar ve segmentli çubuk kullanılır.
- Geniş ekranda etiket, çubuk ve değer aynı satıra alınır.
- Renkler yalnızca `Chart/*` token'larından gelir.

### 4.5 Overlay bileşenleri

| Kalıp | mobile | tablet / laptop / desktop |
|---|---|---|
| **Drawer (sağ)** | – | Detay 480 px, form 560 px |
| **Modal** | – | Paylaşılabilir Rapor, silme onayı. Max 520 px (onay modalı 440 px) |
| **Bottom sheet** | Seçiciler, hesap menüsü, silme onayı | – |
| **Popover / dropdown** | – | Seçiciler, hesap menüsü |
| **Toast** | Alt nav'ın üstünde | Sağ alt köşe (laptop+), alt orta (tablet) |

**Ortak davranışlar:**
- Esc ve overlay tıklaması kapatır. Silme onayında overlay tıklaması **Vazgeç** sayılır.
- Açılınca odak içeriye taşınır, kapanınca tetikleyen elemana döner.
- Bottom sheet tutamaçlı (drag handle) ve aşağı kaydırılarak kapanabilir.
  - [Varsayım] Tutamaç tasarımı yok.

#### 4.5.1 Seçiciler [Karar #6] · [Eksik]
Pages'ta seçicilerin **kapalı halleri** var (örn. "Haftalık ⌄", "Değiştir ⇅"). Açık halleri ve seçenek listeleri tasarlanmamış. Aşağıdaki kurallar kararın responsive uygulamasıdır. Görsel tasarım §8.3'te.

**Sunum:**
- **Mobil:** Bottom sheet
- **Tablet ve masaüstü:** Alanın altına bağlı popover/dropdown

**Seçici tipleri.** Hepsi aynı görsel dilde tasarlanır [Varsayım]:

| Seçici | Kullanıldığı yer | Seçenek kaynağı |
|---|---|---|
| Hesap | Yeni İşlem / Yeni Birikim "İşlem Yapılan Hesap → Değiştir" | Hesap listesi (ad + bakiye; mevcut "Ana Hesap / Bakiye 24.850 ₺" satır yapısı) |
| Tekrarlama Sıklığı | Yeni İşlem, Yeni Birikim | [Varsayım] Günlük / Haftalık / Aylık / Yıllık. Tasarımda yalnızca "Haftalık" ve "Aylık" değerleri görünüyor |
| Hatırlatma | Yeni İşlem ([Eksik] Görev Ekle'de de kullanılması önerilir) | [Varsayım] Pages'ta görünen tek değer "1 saat önce". Seçenek listesi tanımlı değil |
| Para Birimi | Profil → Uygulama Tercihleri | [Varsayım] Tasarımda yalnızca "Türk Lirası (₺)" görünüyor |
| Tarih | Tüm formlar | Takvim'in ay matrisi görsel dilinde **özel tarih seçici**: aynı gün hücresi, seçili gün `Brand/Primary` |
| Saat | Tüm formlar | **Özel saat seçici**: saat ve dakika listesi |

**Ortak görsel kurallar:**
- Satır yüksekliği 48 px.
- Seçili öğe: `Brand/Primary Subtle` zemin + `Brand/Primary` check ikonu.
- Başlık `Heading/H4`.
- Mobil sheet'te alt güvenli alan payı bırakılır.
- Tarih ve saat için tarayıcının native seçicileri **kullanılmaz** [Karar #6]. Klavye ile giriş desteklenmelidir (§9.4).

#### 4.5.2 Silme onay diyaloğu [Karar #7] · [Eksik]
Tüm silme işlemlerinde onay **zorunlu**. Pages'ta silme butonları var, onay ekranı yok. Aşağıdaki içerik kuralları karardan gelir. Görsel tasarım önerisi §8.2.3'te.

**Sunum:**
- **Mobil:** Bottom sheet
- **Tablet ve masaüstü:** Modal (440 px)

**İçerik:**
1. Başlık [Varsayım]: "[Kayıt türü] silmek istiyor musunuz?" (örn. "İşlemi silmek istiyor musunuz?")
2. **Silinecek kaydın adı:** Detay ekranındaki başlık (örn. "Haftalık Süpermarket Alışverişi").
3. **Olası sonucun açıklaması.** Pages'taki ekranlarda bu metinlerin kaynağı zaten var:
   - İşlem Detayı'ndaki "İşlem silindiğinde harcama tut…" bilgi notu
   - Birikim Hesabı Detayı'ndaki "Bu hesapta tutulan bakiye…" bilgi notu
4. Aksiyonlar:
   - **Vazgeç:** Tertiary, varsayılan odak [Ç-5]
   - **Sil:** **Danger stili** (`Button / State=Destructive`, `Semantic/Gider - Hata`)

**Uygulandığı yerler:**

| Ekran | Tetikleyen buton |
|---|---|
| Görev Detayı | "Kaydı kalıcı olarak sil" |
| İşlem Detayı | "İşlemi sil" |
| Birikim Hesabı Detayı | "Birikim hesabını kapat / Sil" |
| Kategori Ekle ve Düzenle | Düzenleme modunda bir silme aksiyonu tasarımda yok. Eklenirse aynı kalıp kullanılır |

#### 4.5.3 Geri bildirim durumları · [Eksik]
Pages'ta başarı bildirimi ve form doğrulama hatası **tasarlanmamış** (§3.7.2). Aşağıdakiler yalnızca **yerleşim kurallarıdır**. Görsel tasarım önerisi §8.2.7'de.

- **Başarı bildirimi (toast):** Kaydet, Görevi tamamla ve "Ödendi olarak işaretle" sonrası gösterilmesi önerilir.
  - Konum: mobilde alt nav'ın üstünde, tablette alt ortada, laptop ve üstünde sağ altta.
- **Form doğrulama:** Pages'ta hazır olan token'lar kullanılır: hatalı alanda `Border/Error` çerçeve, alan altında `Semantic/Gider - Hata` renkli mesaj. Drawer'da ilk hatalı alana scroll edilir ve odaklanılır.
- **Tamamlandı / Ödendi durumları:** Pages'ta var [Figma]. Takvim'de "Tamamlandı" bölümü ve onay işareti, İşlemler'de "Ödendi" chip'i. Bu görünümler aynen kullanılır.

### 4.6 Butonlar
- **Boyutlar:** Button LG (48) form footer'larında. Button SM (38) üst bar ve satır içi aksiyonlarda.
- **Ödeme kartlarındaki aksiyonlar** [D-5]:
  - **Pages'taki durum:** Ana Sayfa "Bugünün Akışı" / "Yaklaşan Ödemeler" ve Takvim ajandasındaki ödeme kartlarında iki buton var [Figma]:
    - "Ödendi olarak işaretle": **Tertiary** görünüm (beyaz + çerçeve)
    - "Hemen öde": **Secondary** görünüm (açık teal zemin)
  - **Karar:** "Hemen öde" kaldırılır. "Ödendi olarak işaretle" kartta **tek buton** olarak kalır ve **Secondary** varyanta geçer [D-5, Ç-4].
  - **Responsive:** mobile/tablet'te kartın altında tam genişlik, laptop ve üstünde kartın sağında, tutarın altında SM boyutta.
  - Takvim'deki "14:00 Son Gün" ödeme kartı da aynı kurala uyar.
  - Tasarım ekibinin Pages'ta güncellemesi gerekir (§8.1).
- **Form alt barındaki "İptal"** [Ç-10]:
  - **Pages'taki durum:** Yeni İşlem formunda açık kırmızı zemin + çöp kutusu ikonuyla çizilmiş [Figma].
  - **Karar:** Tertiary, ikonsuz. Tehlike rengi ve `trash` ikonu yalnızca gerçek silme işlemlerinde kullanılır. Tüm form footer'ları (Yeni İşlem, Görev Ekle, Yeni Birikim, Kategori Ekle) bu kurala uyar.
- **"Yeni işlem":**
  - mobile: FAB
  - tablet: rail içi buton
  - laptop+: sidebar Primary buton
- **Eklenmesi gereken varyantlar:** Hover / Focus / Disabled.
  - Hover: `Brand/Primary Hover`
  - Focus: 2 px `Border/Focus` halkası
  - Disabled: [Varsayım] `Neutral/300` zemin / `Neutral/500` metin
- **Destructive varyantı:** Silme onayında "Sil" için kullanılır.

### 4.7 Formlar
- **Input:** 46 px yükseklik, radius 12, `Border/Default` [Ç-2]. Select alanları da 46 px (Figma'da 45). Hata halinde `Border/Error`, odakta `Border/Focus`.
  - [Varsayım] Input component'i henüz tanımlı değil.
- **Chip ile seçim:** Wrap ile çok satır.
- **Hızlı tutar chip'leri:** Tutar kartı içinde ortalı.
- **Seçiciler:** §4.5.1.

### 4.8 Chip · Segmented Control · Ay seçici
- **Kategori filtre şeridi:** mobile'da yatay scroll, tablet ve üstünde wrap.
- **Segmented Control:** mobile'da tam genişlik, tablet ve üstünde sabit genişlik.
  - Takvim'in Aylık / Haftalık / Günlük seçicisi 3 seçenekle korunur [Karar #4].
- **Ay / gün seçici:** laptop ve üstünde üst barda kompakt.

### 4.9 Header / Nav component'leri
| Component | mobile | tablet | laptop+ |
|---|---|---|---|
| `Header - Ust Başlık` | Logo + arama + bildirim + hesap menüsü | Sayfa başlığı + arama + bildirim + hesap menüsü | Üst bar: sayfa başlığı + sayfa aksiyonları + arama + bildirim + hesap menüsü |
| `Nav Bar` + `Nav Bar Buttons` | Alt pill | Dikey rail (aynı butonlar) [Karar #10] | Sidebar (yeni yatay öğe varyantı) |
| `Floating-Button` | ✔ | Rail içi | Sidebar Primary Button |
| `Detay-Nav Bar` | Sabit alt bar | Drawer footer | Drawer footer / üst bar aksiyonları |

---

## 5. UX Adaptation

### 5.1 Geniş ekranda açılan bilgiler
| Ekran | Mobilde | Geniş ekranda |
|---|---|---|
| Ana Sayfa | Birikim Hedefi en altta | Bakiye kartının yanında |
| Takvim – Aylık | Gün hücresinde nokta | Adet rozeti / kayıt başlıkları; ajanda yan panelde |
| Takvim – Haftalık | Sadece seçili gün | 7 gün aynı anda |
| Takvim – Günlük | Detaylı tek gün | Çizelge + sağ özet paneli |
| İşlemler | Filtreler yatay scroll ile gizli; detay için sayfa değişimi | Filtreler görünür; liste + detay yan yana (≥1280) |
| Birikimler | Kartlar alt alta | 3 hedef yan yana |
| Birikim Hesabı Detayı | Bölümler alt alta | 2 sütun |
| Aylık Rapor | Bölümler alt alta | Yan yana |
| Kategori Ekle | Önizleme scroll ile kayboluyor | Sticky önizleme |

### 5.2 Tutarlılık kuralları
1. Renk, tipografi ailesi, radius ve gölge **tüm breakpoint'lerde aynı**. Yalnızca ölçü token'ları değişir.
2. Sütunlara bölünürken okuma ve klavye sırası, mobildeki bilgi sırasını izler.
3. Bir aksiyon her breakpoint'te tek bir yerde durur.
   - **İstisna:** Profil'e erişim hem Profil sekmesinden hem hesap menüsünden yapılır [Karar #5]. Bu, kalıcı navigasyon ile hızlı hesap işlemlerinin bilinçli olarak ayrılmasıdır.
4. Görev / Randevu / Ödeme renk kodlaması gösterim değişse de aynı kalır.
5. Çıktı üreten bileşenler (paylaşım kartı) responsive olmaz.
6. Silme işlemleri her cihazda onaylı [Karar #7]. Başarılı işlemlerin her cihazda toast ile bildirilmesi önerilir [Eksik, §8.2.7].

### 5.3 PWA [Karar #14]
- **Manifest değerleri:**
  - `theme_color` / `<meta name="theme-color">` ve `background_color`: **`#F5F6F7`** (DESIGN_SYSTEM_PICKALY §7). Eski `#0F766E` / `#F8FAFC` geçersiz.
  - Not: PWA notundaki `#4f46e5` değeri geçersizdir.
- **Güvenli alan:** Mobil tasarımdaki 40 px üst alan `safe-area-inset-top` ile karşılanır. Alt pill nav ve Detay-Nav Bar, `safe-area-inset-bottom` kadar yukarı itilir.
- **Standalone mod:** Tablet ve masaüstü kuralları aynen geçerli.

---

## 6. Design System – Responsive Tokenlar

### 6.1 Mevcut tokenlar [Figma]
- **Colors** (36): Brand, Neutral, Text, Semantic, Category, Chart
- **Spacing** (10): 4–64
- **Border & Radius** (18)
- **Text styles** (13, Manrope)
- **Effect styles** (8)

### 6.2 Yeni koleksiyon: `Layout` (Mobile · Tablet · Laptop · Desktop) [Karar]

| Token | Mobile | Tablet | Laptop | Desktop |
|---|---|---|---|---|
| `Layout/Breakpoint/Min` | 0 | 768 | 1024 | 1440 |
| `Layout/Page/Padding-X` | →16 | →24 | →32 | →40 |
| `Layout/Page/Padding-Top` | →16 | →24 | →32 | →32 |
| `Layout/Content/Max-Width` | – | – | – | 1200 |
| `Layout/Grid/Columns` | 4 | 8 | 12 | 12 |
| `Layout/Grid/Gutter` | →16 | →16 | →24 | →24 |
| `Layout/Section/Gap` | →24 | →24 | →32 | →32 |
| `Layout/Stack/Gap` | →12 | →12 | →16 | →16 |
| `Layout/Card/Padding` | →16 | →20 | →24 | →24 |
| `Layout/Nav/Width` | 0 | **80** | 240 | 264 |
| `Layout/TopBar/Height` | 65 | 64 | 64 | 64 |
| `Layout/Drawer/Width-Detail` | – | 480 | 480 | 480 |
| `Layout/Drawer/Width-Form` | – | 560 | 560 | 560 |
| `Layout/Modal/Max-Width` | – | 520 | 520 | 520 |
| `Layout/Modal/Confirm-Width` | – | 440 | 440 | 440 |
| `Layout/Popover/Min-Width` | – | 240 | 240 | 240 |
| `Layout/Form/Max-Width` | – | 560 | 560 | 560 |
| `Layout/Settings/Max-Width` | – | 720 | 720 | 720 |
| `Layout/Touch/Min` | 44 | 44 | 40 | 40 |

`→` ile gösterilen değerler mevcut `Spacing` değişkenlerine alias olarak bağlanır. Yeni spacing değeri gerekirse (ör. kategori şeridindeki bağlanmamış 6 px gap [Figma]) önce `Spacing` koleksiyonuna eklenir.

### 6.3 Responsive tipografi ve line-height [Karar #11]

**Kurallar:**
- Font ailesi (Manrope) ve ağırlıklar değişmez.
- Line-height sabit ve tutarlı:

| Grup | Line-height |
|---|---|
| Başlıklar | **%125** |
| Gövde metinleri | **%150** |
| Tutarlar | **%110** |

- Hesaplanan değerler en yakın tam piksele yuvarlanır (.5 yukarı).
- Font boyutları: Mobile ve Tablet aynı. Laptop ve Desktop'ta başlık ve tutarlar bir kademe büyür, gövde sabit kalır.

| Style | Grup | Mobile / Tablet<br>font-size / line-height | Laptop / Desktop<br>font-size / line-height |
|---|---|---|---|
| Display/Large | Başlık %125 | 32 / **40** | 36 / **45** |
| Heading/H1 | Başlık %125 | 28 / **35** | 32 / **40** |
| Heading/H2 | Başlık %125 | 24 / **30** | 28 / **35** |
| Heading/H3 | Başlık %125 | 20 / **25** | 20 / **25** |
| Heading/H4 | Başlık %125 | 18 / **23** (22,5) | 18 / **23** |
| Body/Large | Gövde %150 | 16 / **24** | 16 / **24** |
| Body/Default | Gövde %150 | 14 / **21** | 14 / **21** |
| Body/Small | Gövde %150 | 12 / **18** | 12 / **18** |
| Label/Default | Gövde %150 | 14 / **21** | 14 / **21** |
| Label/Small | Gövde %150 | 12 / **18** | 12 / **18** |
| Button/Default | Gövde %150 | 14 / **21** | 14 / **21** |
| Label/XS *(yeni, Bold, yalnızca nav etiketleri)* [Ç-11] | Gövde %150 | 10 / **15** | 10 / **15** |
| Data/Large | Tutar %110 | 32 / **35** (35,2) | 40 / **44** |
| Data/Medium | Tutar %110 | 24 / **26** (26,4) | 28 / **31** (30,8) |

**Sınıflandırma notları:**
- **Label stilleri:** Gövde grubunda (%150) sayıldı. Kararda label için ayrı grup tanımlı değil. Tek satırlık etiketlerde de aynı ritmin korunması için bu seçildi.
- **Button/Default:** Figma'da şu an sabit **20 px** [Figma]. Karar gereği 21 px'e (%150) çekilir. Buton yükseklikleri sabit (48 / 38) olduğu için görsel etki 1 px'lik dikey ortalama farkıdır.
- **Tutar tanımı:** Para ve sayısal değer gösteren `Data/*` stilleri (bakiye, net değişim, hedef tutarı). Kart içindeki küçük tutarlar (ör. liste satırındaki "-1.280,00 ₺") Label/Body stillerini kullanıyorsa gövde grubunda kalır.

**Figma'da güncellenmesi gerekenler (tasarım ekibine):**
1. 13 text style'ın line-height değeri "Auto" yerine yukarıdaki piksel (veya yüzde) değerlerine çekilmeli. Button/Default 20 → 21.
2. `Typography` adlı FLOAT değişken koleksiyonu oluşturulmalı (modlar: Mobile, Tablet, Laptop, Desktop). İçinde font-size ve line-height değişkenleri olmalı, text style'lar bu değişkenlere bağlanmalı.
3. Line-height değişince satır içi yükseklikler değişeceği için tüm ekranlarda metin kırpılma / taşma kontrolü yapılmalı. Özellikle hero kartlar (Data/Large) ve liste satırları.
4. `Label/XS` (Manrope Bold 10 / 15) text style'ı oluşturulmalı ve `Nav Bar Buttons` etiketine bağlanmalı [Ç-11].

### 6.4 Renk mimarisi ve ileride ikinci tema [Karar #13]

İlk sürümde **dark mode yok**. Ama renk mimarisi ikinci temayı kaldıracak şekilde kurulur.

**Kurallar:**
1. **Bütün renk kullanımları token üzerinden yapılır.** Bileşenlerde ve kodda sabit HEX değeri yazılmaz.
2. **İki katmanlı yapı:**
   - **Primitive** (ham palet): `Neutral/50…950`, teal tonları, kırmızı/yeşil/turuncu tonları. Modu yoktur, bileşenler doğrudan kullanmaz.
   - **Semantic** (anlamsal): `Text/*`, `Border/*`, `Brand/*`, `Semantic/*`, `Category/*`, `Chart/*` ve eklenecek `Surface/*`. Bileşenler **yalnızca** bu katmanı kullanır. İlk sürümde tek mod: `Light`. İkinci tema geldiğinde `Dark` modu eklenir ve aynı semantic token'lar farklı primitive'lere alias edilir.
3. **Mevcut durumdan farklar** [Figma]:
   - `Colors` koleksiyonunda primitive ve semantic token'lar tek koleksiyonda karışık. Örn. `Neutral/50 - BG` ve `Brand/White`, arka plan rengi olarak doğrudan kullanılıyor.
   - Tüm renk değişkenleri `ALL_SCOPES`.
4. **Önerilen ek semantic token'lar** [Varsayım]:
   - Değerler mevcut tasarımdaki kullanımdan alınır. Yeni renk **icat edilmez**.

| Token | Alias |
|---|---|
| `Surface/Page` | → `Neutral/50 - BG` |
| `Surface/Card` | → `Brand/White` |
| `Surface/Overlay` | → `Neutral/900` + opaklık |
| `Surface/Inverse` | → koyu bakiye kartı zemini |

5. **Scope'lar:** Değişkenlere doğru scope'lar verilir:
   - Text token'ları → `TEXT_FILL`
   - Surface token'ları → `FRAME_FILL`, `SHAPE_FILL`
   - Border token'ları → `STROKE_COLOR`
6. **Kod tarafı:** Semantic token'lar CSS değişkenleri olarak üretilir. Tema geçişi tek bir kök seçiciyle (`data-theme`) yapılabilecek şekilde kurgulanır.
   - İlk sürümde yalnızca `light` tanımlanır.

### 6.5 Component ölçüleri
| Component | Tüm breakpoint'ler | Laptop+ |
|---|---|---|
| Button LG / SM | 48 / 38 h, radius 12 | SM üst bar ve satır içi |
| Input / Select | 46 h, radius 12 [Ç-2] | – |
| Seçici satırı (sheet / popover) | 48 h | – |
| Chip (durum) / Chip-Kategori (seçilebilir) | 24 / 32 h [Ç-9] | – |
| OTP kutusu | 48 h [Ç-13] | – |
| Segmented Control | 42 h, radius 12 | Sabit genişlik |
| Nav öğesi | Pill / rail: 72×52 | Sidebar: 40 h |
| Liste satırı | min 64 h | min 56 h |
| Takvim hücresi (aylık) | min 44 | min 120 |
| Onay modalı | Mobilde sheet | 440 px |

---

## 7. Kesinleşen Kararlar

| # | Konu | Karar | Doküman bölümü |
|---|---|---|---|
| 1 | Görevler ekranı | Ayrı ekran yok. Görevler Takvim içinde yönetilir | §2.3, §3.2 |
| 2 | Görev ekleme | Yeni **Görev Ekle** drawer/form akışı. Yeni İşlem'in dili ve bileşenleri referans. Alanlar: başlık, öncelik, kategori, tarih-saat, hatırlatma, konum, not, ilişkili harcama. Henüz tasarlanmadı, varsayım | §3.2.5 |
| 3 | Ödeme hızlı aksiyonu | Yeni İşlem formu **Abonelik** sekmesi seçili açılır | §3.1, §3.3.3 |
| 4 | Günlük görünüm | Korunur. Haftalığın tek güne odaklanan detaylı saat çizelgesi olarak tasarlanması önerilir. Henüz tasarlanmadı | §3.2.3 |
| 5 | Header profil ikonu | Korunur, **hesap menüsü** açar. Profil sekmesi de korunur | §2.5 |
| 6 | Seçiciler | Mobil: bottom sheet · Tablet/masaüstü: popover-dropdown · Tarih/saat: özel seçiciler · Hesap/tekrarlama/hatırlatma/para birimi aynı görsel dilde | §4.5.1 |
| 7 | Silme onayı | Zorunlu. Mobil: bottom sheet · Tablet/masaüstü: modal · Kayıt adı + sonuç açıklaması · Vazgeç / Sil (danger) | §4.5.2 |
| 8 | Uygulama kilidi | İlk sürümde Face ID / biyometrik yok. PIN de v1.0'da yok [D-4]. Uygulama kilidi, hesap doğrulama ve oturum güvenliği ayrı kavramlar. Passkey/WebAuthn sonraki sürüm | §3.6.1, §9.2 |
| 9 | Link hedefleri | Bugünün Akışı → Takvim (bugün seçili) · Yaklaşan Ödemeler → İşlemler · Aylık Rapor → Aylık Finans Raporu | §3.1 |
| 10 | Tablet navigasyonu | Solda 80 px dikey rail. `Nav Bar Buttons` dikey yerleşir | §2.2 |
| 11 | Line-height | Başlık %125 · Gövde %150 · Tutar %110, sabit değerler | §6.3 |
| 12 | Yardımcı ekranlar *(Sürüm 3'te güncellendi)* | AI Pages kapsam dışı ve referans alınmaz. Hatırlatma Ayarları, boş durumlar ve geri bildirim/onay durumları Pages'ta bulunmadığı için **eksik** olarak listelenir, geliştirme önerileri ayrı sunulur. Hızlı gider girişi için ayrı ekran yok, Yeni İşlem / Gider kullanılır | §3.6.4, §3.7, §8 |
| 13 | Dark mode | İlk sürümde yok. Tüm renkler token üzerinden. İkinci temaya hazır mimari | §6.4 |
| 14 | PWA renkleri | `theme-color: #0F766E` · `background_color: #F8FAFC` | §5.3 |

---

## 8. Eksik Ekranlar ve Componentler – Geliştirme Önerileri

> **Kaynak kuralı:** Bu bölümdeki öğelerin hiçbiri Pages veya Components'ta tasarlanmış **değildir**. Önerilen yapılar tasarlanmış ekran gibi okunmamalıdır.
> - **İdeal yol:** Tasarım ekibinin bu öğeleri Pages/Components'ta çizmesi.
> - **Geçici yol:** Tasarım gecikirse geliştirme, aşağıdaki önerilere göre yalnızca **mevcut Pages bileşenleri ve token'larıyla** ilerleyebilir. Tasarım geldiğinde uyarlanır.
> - Bu doküman Figma'yı değiştirmez.

### 8.1 Eksikler listesi

| # | Öğe | Pages / Components'taki durum | Öncelik | Öneri |
|---|---|---|---|---|
| 1 | Görev Ekle / Düzenle formu | "Görev" butonu ve Görev Detayı var, form yok | Yüksek | §8.2.1 |
| 2 | Takvim – Günlük görünüm | Segmented seçeneği var, ekran yok | Orta | §8.2.2 |
| 3 | Silme onay diyaloğu | Silme butonları var, onay yok | Yüksek | §8.2.3 |
| 4 | Hesap menüsü | Header'da ikon var, menü yok | Orta | §8.2.4 |
| 5 | Hatırlatma Ayarları ekranı | Profil'de satır var, ekran yok | Orta | §8.2.5 |
| 6 | Boş durumlar (Birikimler dışında) | Yalnızca Birikimler boş durumu var | Orta | §8.2.6 |
| 7 | Başarı bildirimi ve form doğrulama | Yok | Yüksek | §8.2.7 |
| 8 | Seçicilerin açık halleri (bottom sheet / popover, tarih, saat) | Kapalı halleri var | Yüksek | §8.3 |
| 9 | Input / Textarea / Switch component'leri | Ekranlarda çizim olarak var, Components'ta yok | Yüksek | §8.3 |
| 10 | Hover / Focus / Disabled durumları | Yok | Yüksek (masaüstü) | §8.3 |
| 11 | Rail ve Sidebar nav varyantları | Yalnızca alt pill nav var | Yüksek | §8.3 |
| 12 | Drawer / Modal / Bottom sheet / Popover / Toast kabukları | Yok | Yüksek | §8.3 |
| 13 | Kaydedilmemiş değişiklik uyarısı | Yok | Orta [D-19] | §8.2.3 kalıbı |
| 14 | Tablet ve masaüstü referans frame'leri | Yok (yalnızca 390 px) | Yüksek | §8.4 |
| 15 | Auth ekranları: Giriş, Kayıt, E-posta Doğrulama, Şifremi Unuttum | Yok | Yüksek [D-1, D-2] | §8.2.8 |
| 16 | Hesap Silme akışı | Yok | Yüksek [D-10] | §8.2.8 |
| 17 | Bildirimler paneli | Header'da ikon var, panel yok | Orta [D-24] | §8.2.9 |
| 18 | Çevrimdışı bandı | Yok | Düşük [D-7] | §8.2.10 |
| 19 | Bütçe limiti uyarısı | Kategori Ekle'de açıklaması var, görünümü yok | Düşük [D-16] | §8.2.10 |
| 20 | Ödeme kartlarında "Hemen öde"nin kaldırılması (**Pages güncellemesi**) | İki buton var | Orta [D-5] | §4.6 |

**PRD.md kaynaklı eksikler** (PRD §17 ve §16.3 kararları):

| # | Öğe | Pages / Components'taki durum | Öncelik | PRD | Öneri |
|---|---|---|---|---|---|
| 21 | Hesaplarım ekranı (liste + ekle / düzenle / arşivle) | Yok, yalnızca formda "Değiştir" | Yüksek | FR-FIN-021, Q-10 | §8.2.11 |
| 22 | Dil seçici (Türkçe / English) | Profil'de satır var, seçici yok | Yüksek | FR-SET-003, D-31 | §4.5.1 seçici kuralı |
| 23 | Kategori Seçimi'nde zorunlu "*" işareti | "*" yok | Yüksek | Q-11 | – (Pages güncellemesi) |
| 24 | Abonelik formunda "Tekrarlama yok" seçeneği | Yok | Yüksek | FR-FIN-004, Q-8 | §4.5.1 |
| 25 | Birikime para ekle / çek akışı | "Para ekle / Çek" butonu var, akış yok | Yüksek | FR-SAV-005/006, Q-18 | §8.2.11 |
| 26 | Haftalık özet kartı | Yok | Orta | FR-DSH-011, Q-3 | §8.2.11 |
| 27 | Bugünün Akışı'nda "Gecikmiş" grubu ve tamamlandı görünümü | Yok | Orta | Q-19, Q-20 | §8.2.11 |
| 28 | Global arama sonuçları | Header'da ikon var | Orta | FR-FIN-011, Q-9 | §8.2.11 |
| 29 | "Tutarı düzenle" (ödendi işaretlerken) | Yok | Orta | Q-16 | §8.2.11 |
| 30 | Kategori arşivleme onayı ve "Arşivlenenler" bölümü | Yok | Orta | BR-CAT-002…005 | §8.2.3 kalıbı + §8.2.11 |
| 31 | Birikim kapatmada aktarım seçimi | Yok | Orta | Q-15 | §8.2.3 kalıbı + seçici |
| 32 | Hesaplar arası aktarım formu | Yok | Orta | FR-FIN-020 | §8.2.11 |
| 33 | Tekrarlayan ödemeyi duraklatma / sonlandırma | Yok | Orta | FR-FIN-019 | Ödeme Detayı aksiyonu |
| 34 | Görev Ekle'de tekrar alanları | Görev formu yok | Orta | FR-CAL-012 | §8.2.1 + Yeni İşlem "Tekrar Eden İşlem" kalıbı |
| 35 | Birikim hedef tarihi ve Saklama Kurumu giriş alanları | Detayda Saklama Kurumu var, formda yok; hedef tarihi hiç yok | Orta | FR-SAV-009/010 | Yeni Birikim formuna alan |
| 36 | Geçmiş dönemle karşılaştırma (önceki aya göre değişim) | Ay seçici var, karşılaştırma yok | Orta | FR-REP-006 | §8.2.11 |
| 37 | Profil düzenleme (ad, avatar) | Yok | Orta | FR-SET-002 | §8.2.11 |
| 38 | Fiş/belge ve konum/mağaza giriş alanları | Detayda görünüyor, formda yok | Orta | FR-FIN-013/014 | Yeni İşlem formuna alan |
| 39 | "Ana Sayfa'da göster" kontrolü (birikim) | Yok | Düşük | FR-DSH-009, Q-2 | Birikim Detayı'nda switch |
| 40 | Negatif bakiye uyarısı | Yok | Düşük | Q-14 | Form içi `InlineAlert` (DESIGN §8.11) |
| 41 | Yaklaşan etkinlikler ("Sıradaki") satırı | Yok | Düşük | FR-DSH-010 | Bugünün Akışı boşken tek satır |

### 8.2 Ekran önerileri

#### 8.2.1 Görev Ekle / Düzenle [Karar #2]
Tamamı **varsayım**. Yeni İşlem formunun tasarım dili referans alınır.

**Erişim:** Hızlı Aksiyonlar → "Görev", Görev Detayı → "Düzenle" (dolu hali).

**Sunum:**
- **Mobil:** Tam sayfa. Header "Yeni Görev" + "× İptal". Sabit alt bar "İptal | Kaydet".
- **Tablet ve üstü:** 560 px drawer, aynı header ve sticky footer.

**Alanlar:**

| # | Alan | Zorunlu | Referans (Pages) | Not |
|---|---|---|---|---|
| 0 | Tür | ✔ | Yeni İşlem "İşlem Türü" segmented control | Görev / Randevu, varsayılan Görev [D-14] |
| 1 | Görev başlığı | ✔ | Yeni İşlem "Başlık *" | |
| 2 | Öncelik | – | Yeni İşlem segmented control | Düşük / Normal / Yüksek, varsayılan Normal [D-15] |
| 3 | Kategori | – | Yeni İşlem "Kategori Seçimi" chip'leri | Kategori Yönetimi → "Görev / Takvim" sekmesi kaynak olabilir |
| 4 | Tarih ve saat | ✔ | Yeni İşlem "Tarih / Saat" | Özel seçiciler (§4.5.1) |
| 5 | Hatırlatma | – | Yeni İşlem "Hatırlatma Bildirimi" | |
| 6 | Konum | – | Input | Görev Detayı "Konum & Notlar → Adres" alanının giriş karşılığı |
| 7 | Not | – | Yeni İşlem "Not (İsteğe Bağlı)" (x/200) | |
| 8 | İlişkili harcama | – | Yeni İşlem tutar kartının sade hali | Görev Detayı "Planlanan Finansal Harcama" alanının giriş karşılığı |

**Davranış:** Kaydet sonrası form kapanır ve görev Takvim'de ilgili günde görünür. Doğrulama ve bildirim için §8.2.7.

#### 8.2.2 Takvim – Günlük görünüm [Karar #4]
Tamamı **varsayım**. Yeni veri alanı eklenmez; yalnızca ajanda kartlarında ve Görev Detayı'nda zaten olan bilgiler kullanılır.

| | mobile | tablet | laptop / desktop |
|---|---|---|---|
| Gün seçimi | Ay seçici kalıbında gün seçici ("◀ 16 Mayıs Perşembe ▶") | Aynı | Üst barda |
| Çizelge | Haftalık çizelgedeki saat ekseni yapısı (08:00, 09:00…). Kart başına açıklama, konum, süre ("45 dk") ve tutar | Aynı, geniş kartlar | Çizelge [8/12] + gün özeti [4/12] |
| Gün özeti | "Bugün: 2 Görev, 1 Randevu, 1 Ödeme" satırı (Aylık/Haftalık'taki ile aynı) | Aynı | Sağ panelin üstünde |

#### 8.2.3 Silme onay diyaloğu [Karar #7]
Mevcut bileşenlerden kurulur:
- Kart zemini ve radius: `Brand/White`, `Radius/2XL`
- Başlık: `Heading/H4`. Açıklama: `Body/Default`, `Text/Secondary`
- **Vazgeç:** `Button / State=Tertiary` [Ç-5]
- **Sil:** `Button / State=Destructive`
- **Mobil:** Alttan açılan sheet, üst köşeler 24 px
- **Tablet ve üstü:** 440 px modal, `Shadow/Overlay`, arka plan `Neutral/900` %40

Aynı kalıp, ikincil buton etiketleri değiştirilerek **kaydedilmemiş değişiklik uyarısı** için de kullanılabilir.

#### 8.2.4 Hesap menüsü [Karar #5]
- **İçerik:** Yalnızca Profil ekranında var olan öğeler: profil özeti (avatar, ad, e-posta, "Senkronize"), "Profil ve Ayarlar" bağlantısı, "Çıkış Yap".
- **Mobil:** Bottom sheet.
- **Tablet ve üstü:** İkona bağlı ~280 px dropdown.
- **Görsel dil:** Profil ekranındaki ayar listesi satırları (ikon + başlık + açıklama) kullanılır.

#### 8.2.5 Hatırlatma Ayarları
- **Pages'tan bilinenler:** Yalnızca giriş noktası (Profil satırı) ve kayıt bazında hatırlatma seçimi.
- **İçerik [D-25]:**

| Sürüm | Satır | Bileşen |
|---|---|---|
| v1.0 | Uygulama içi hatırlatmalar | Switch |
| v1.0 | Varsayılan ödeme hatırlatma zamanı | Seçici |
| v1.0 | Varsayılan görev hatırlatma zamanı | Seçici |
| v1.0 | Tüm gün kayıtların hatırlatma saati (varsayılan 09:00) [PRD Q-6] | Saat seçici |
| v1.1 | Anlık bildirimler (Web Push) | Switch |

- **Varsayılan değerlerin işlevi:** Yeni İşlem ve Görev Ekle formlarındaki "Hatırlatma" alanının ön değerini belirler.
- **Yapı:** Profil ve Ayarlar ekranının grup başlığı + ayar listesi yapısı ve mevcut switch görünümü (Yeni İşlem "Tekrar Eden İşlem") kullanılır.
- **Responsive:** Tam sayfa, tek sütun, tablet ve üstünde max 720 px. Seçimler §4.5.1 kuralıyla açılır.

#### 8.2.6 Boş durumlar
- **Referans:** Pages'taki tek boş durum olan "Birikimler – Boş" ekranının bloğu: başlık + açıklama + birincil aksiyon.
- Her listeye aynı kalıp uygulanır, ekrana özel başlık ve aksiyon kullanılır:

| Alan | Önerilen aksiyon [Varsayım] |
|---|---|
| Takvim ajandası | Görev Ekle (§8.2.1) |
| İşlemler | Yeni İşlem |
| Bugünün Akışı / Yaklaşan Ödemeler | Aksiyonsuz kısa mesaj |
| Kategori Yönetimi | Kategori Ekle |

- **Metinler:** `i18n/tr.json` ve `i18n/en.json` içinde tek yerde tutulur, yazımı ürün tarafındadır [D-31].
- **Responsive:** Liste alanında ortalı, max 480 px. Masaüstünde detay paneli gizli.

#### 8.2.7 Başarı bildirimi ve form doğrulama
- **Toast:**
  - Zemin: `Neutral/900`, metin `Brand/White`, radius `Radius/MD`, `Shadow/Floating`
  - Başarı ikonu: `Semantic/Gelir - Tamamlandı`
  - Konum: §4.5.3
  - Süre 4 sn. "Görevi tamamla" ve "Ödendi olarak işaretle" sonrası 5 sn boyunca "Geri al" bağlantısı (`Brand/Accent`) gösterilir [D-18]
- **Doğrulama:**
  - Hatalı input'ta `Border/Error`
  - Alan altında `Body/Small` + `Semantic/Gider - Hata` renkli mesaj
  - Zorunlu alanlarda mevcut "*" işareti korunur
  - Mesaj metinleri `i18n/tr.json` ve `i18n/en.json` içinde

#### 8.2.8 Auth ekranları ve Hesap Silme [D-1, D-2, D-10]
Tamamı **varsayım**. Yalnızca mevcut bileşen ve token'larla kurulur.

**Ekranlar:**

| Ekran | İçerik |
|---|---|
| **Giriş** | Pickaly logosu + "Life & Money Planner" (Header'daki marka bloğu), e-posta, şifre, "Giriş yap" (Button LG Primary), "Şifremi unuttum", "Hesap oluştur" bağlantıları |
| **Kayıt** | Ad, e-posta, şifre, kullanım koşulları / gizlilik onay kutusu, "Hesap oluştur" |
| **E-posta Doğrulama** | 6 haneli kod girişi: 6 ayrı 48 px kutu, `Radius/MD`, odakta `Border/Focus`. "Kodu tekrar gönder" (geri sayımlı), "Doğrula" |
| **Şifremi Unuttum** | E-posta → 6 haneli kod → yeni şifre, tek akışta 3 adım |
| **Hesap Silme** (Profil → Veri & Güvenlik) | Silinecek verilerin özeti, onay için şifre veya kod, `Button / Destructive` "Hesabımı kalıcı olarak sil". Silme onayı kalıbı (§8.2.3) |

**Responsive:**

| | mobile | tablet ve üstü |
|---|---|---|
| Yerleşim | Tam sayfa, tek sütun, sayfa padding 16 | `Neutral/50 - BG` zeminde ortalı kart (max 440 px, `Radius/2XL`, `Shadow/Card`) |
| Navigasyon | Yok (oturumsuz) | Yok (oturumsuz) |

#### 8.2.9 Bildirimler paneli [D-24]
- **İçerik:**
  - Zamanı gelmiş ve yaklaşan hatırlatmalar
  - Vadesi yaklaşan ödemeler
  - Satır yapısı Bugünün Akışı satırlarıyla aynı: ikon, başlık, saat/vade, tür chip'i
  - Okunmamış satırlarda sol kenarda `Brand/Primary` nokta
- **Tetikleyici:** Header bildirim ikonu. Okunmamış sayısı rozeti `Semantic/Gider - Hata` zeminli küçük chip.
- **Sunum:**
  - Mobil: Bottom sheet (yüksek, kaydırılabilir).
  - Tablet ve üstü: İkona bağlı popover, 360 px genişlik, en fazla 480 px yükseklik.
- **Satıra tıklama:** İlgili kaydın detayını açar (drawer / tam sayfa kuralı, §2.4).
- **Boş durum:** §8.2.6 kalıbı, aksiyonsuz.

#### 8.2.10 Çevrimdışı bandı ve bütçe uyarısı
- **Çevrimdışı bandı** [D-7]:
  - Üst bar altında tam genişlik, 40 px.
  - Zemin `Semantic/Bilgilendirme`, metin `Text/Primary`.
  - Bağlantı yokken yazma butonları disabled görünür.
- **Bütçe limiti uyarısı** [D-16]:
  - Kategori Yönetimi satırında ve Aylık Rapor "En Çok Harcama Yapılanlar" satırında gösterilir.
  - Limit aşılmışsa `Semantic/Gider - Hata`, %80 üstündeyse `Semantic/Yaklaşan` renkli küçük durum etiketi.
  - Mevcut `Chip` görsel dili kullanılır.

#### 8.2.11 PRD kaynaklı ekran ve akışlar
Tamamı **varsayım**. Yalnızca mevcut kalıplar ve RESPONSIVE §2.4 sunum kurallarıyla kurulur.

| Öğe | mobile | tablet | laptop / desktop | Referans kalıp |
|---|---|---|---|---|
| **Hesaplarım** (Q-10) | Tam sayfa, Profil'in alt sayfası | Tam sayfa, max 720 | Tam sayfa, max 720, sidebar'da "Profil" aktif | Profil ayar listesi satırları. Hesap satırı: ikon kutusu + ad + tür/son 4 hane + bakiye |
| Hesap ekle / düzenle | Tam sayfa form | Drawer 560 | Drawer 560 | Yeni İşlem form alanları. Arşivleme Tertiary buton, onaylı |
| **Para ekle / çek** (birikim) | Bottom sheet | Drawer 480 | Drawer 480 | Segmented "Ekle / Çek" + tutar kartı (adet/gram birimde miktar alanı, Q-18) + hesap seçici |
| **Hesaplar arası aktarım** | Tam sayfa form | Drawer 560 | Drawer 560 | Yeni İşlem formu; "Kaynak hesap → Hedef hesap" iki hesap seçici |
| **Haftalık özet** (Q-3) | Bugünün Akışı'nın altında tam genişlik kart | [8/8], iki sütunlu satırın altında | Sol sütunda [7/12], Bugünün Akışı'nın altında | Liste kartı (`radius.lg`). Satırlar: görev x/y, gelir / gider / net, ödemeler. Her satır ilgili modüle bağlantı |
| **Gecikmiş grubu** (Q-20) | Bugünün Akışı'nın en üstünde, `status.danger` başlıklı grup | Aynı | Aynı | Ajanda satırları |
| **Tamamlandı görünümü** (Q-19) | Satır `text.secondary`, başlık üstü çizili, ✓ dolu | Aynı | Aynı | Takvim "Tamamlandı" bölümü [Figma] |
| **Global arama** (Q-9) | Header ikonundan tam ekran arama sayfası | Üst barda genişleyen arama alanı + altında sonuç popover'ı (560 px) | Aynı, sonuçlar türe göre gruplu | Liste satırları, tür chip'leri |
| **Tutarı düzenle** (Q-16) | "Ödendi olarak işaretle" yanında küçük bağlantı → bottom sheet (tutar + tarih) | Popover | Popover | Tutar input'u + tarih seçici |
| **Geçmiş dönemle karşılaştırma** | Net kartında metriklerin altında "Geçen aya göre ±%n" satırı | Aynı | Aynı | `body.sm`; artış/azalış `status.*` renkleriyle |
| **Profil düzenleme** | Tam sayfa form | Drawer 560 | Drawer 560 | Avatar + ad input'u |
| **Kategori arşivleme** (BR-CAT-002) | Onay bottom sheet'i: bağlı kayıt ve tekrarlayan kayıt sayısı + "Arşivle" (Tertiary değil, Secondary; işlem geri alınabilir olduğu için Destructive kullanılmaz). Kullanılmamış kategoride standart silme onayı | Onay modalı | Aynı | §8.2.3 |
| **"Arşivlenenler" bölümü** (BR-CAT-005) | Kategori Yönetimi listesinin altında kapalı (genişletilebilir) grup; satırlar `text.secondary`, sağda "Geri al" | Aynı | Aynı | Profil ayar listesi satırları |
| **Birikim kapatmada aktarım** (Q-15) | Silme onayı sheet'i içinde hesap seçici + "aktarmadan kapat" | Onay modalı içinde | Aynı | §8.2.3 + §4.5.1 |

### 8.3 Component ve token işleri (Components sayfası için)
1. **Nav varyantları:** `Nav Bar Buttons` için `Orientation=Vertical|Horizontal`, `Nav Bar` için `Layout=Pill|Rail|Sidebar`.
2. **Overlay kabukları:** Drawer, Modal, Bottom Sheet, Popover, Toast.
3. **Form bileşenleri:** Input, Textarea, Switch, Select tetikleyici; hata ve odak durumlarıyla. Ölçüler: 46 px yükseklik, radius 12, `Border/Default` [Ç-2].
4. **Seçici içerikleri:** Liste satırı (48 px, seçili halde `Brand/Primary Subtle` + check), özel tarih seçici (Takvim ay matrisi görsel dili), saat seçici.
5. **Etkileşim durumları:** Button, Chip-Kategori, nav öğeleri ve liste satırları için Hover / Focus / Disabled.
6. **Değişken koleksiyonları:** `Layout` ve `Typography` (§6.2, §6.3).
7. **Line-height güncellemesi:** Text style'larda (§6.3).
8. **Renk koleksiyonu:** Primitive / Semantic ayrımı, `Surface/*` token'ları, scope'lar (§6.4).
9. **Yer tutucu temizliği (Pages):** Paylaşılabilir Rapor'daki "Uygulama Adı" / "uygulama-adı" ve Profil'deki "UygulamaAdi v1.0" ifadeleri "Pickaly" ile değiştirilmeli.
10. **Orphan component:** Ana Sayfa ve Takvim'deki "Button-test" instance'larının kaynağı dosyada yok. Ana `Button` component'iyle değiştirilmeli.

### 8.4 Responsive referans frame'ler
- **Ekranlar:** Ana Sayfa, Takvim (Aylık / Haftalık), İşlemler (laptop + ≥1280 master-detail), Birikimler, Birikim Hesabı Detayı, Aylık Rapor, Profil
- **Genişlikler:** 834 (tablet), 1280 (laptop), 1440 (desktop)
- **Drawer örneği:** Yeni İşlem
- **Modal örneği:** Paylaşılabilir Rapor

### 8.5 Tasarım beklenirken geçici tablet / masaüstü geliştirmesi [Karar – ürün sahibi onayı]
- Tablet ve masaüstü geliştirmesi, §8.1 #11 (rail/sidebar) ve #14 (referans frame'ler) beklenmeden **bu dokümandaki kurallarla** başlar.
- **Uydurma tasarım yapılmaz:** Yalnızca bu dokümandaki yerleşimler, DESIGN.md token'ları ve mevcut Pages/Components bileşenleri kullanılır. Yeni görsel öğe, renk, gölge veya etkileşim eklenmez.
- Kuralı olmayan bir detayda mobil bileşenin en yakın kullanımı uygulanır ve PRD §19.2.1'e "tasarım bekliyor" olarak yazılır.
- Yayın öncesi koşul: PRD LB-03.

---

## 9. Teknik Kararların Tasarıma Etkisi

Önceki sürümlerde burada açık duran teknik konuların tamamı [TECH_STACK.md](TECH_STACK.md) §12 Karar Kaydı'nda kapatıldı. Bu bölüm, o kararların **tasarımı ve responsive davranışı nasıl etkilediğini** özetler.

### 9.1 Bildirimler ve hatırlatmalar [D-3, D-24, D-25]
- **v1.0 yalnızca uygulama içi.** Header'daki bildirim ikonu **Bildirimler panelini** açar ve okunmamış rozeti gösterir. [Eksik] Panel tasarımı yok, öneri §8.2.9.
- **Web Push v1.1'de.** İzin isteme ve izin reddedildi durumları o sürümde tasarlanır.
- **Hatırlatma Ayarları (v1.0):**
  - Varsayılan ödeme hatırlatma zamanı
  - Varsayılan görev hatırlatma zamanı
  - Uygulama içi hatırlatmalar aç/kapa
  - Öneri §8.2.5

### 9.2 Güvenlik kavramları [Karar #8, D-1, D-4]

| Kavram | v1.0 |
|---|---|
| Hesap kimlik doğrulaması | E-posta + şifre. Doğrulama ve şifre sıfırlama 6 haneli kodla. [Eksik] Auth ekranları, öneri §8.2.8 |
| Oturum güvenliği | Cookie tabanlı oturum. "Çıkış Yap" yalnızca bu cihazdaki oturumu kapatır [Figma] |
| Uygulama kilidi | **Yok.** Profil'deki "PIN / Biyometrik Kilit" satırı v1.0'da gizlenir |
| Passkey / WebAuthn | Sonraki sürüm |

### 9.3 Akış kararları

| Konu | Karar |
|---|---|
| "Yaklaşan Ödemeler → Tümü" | İşlemler'e filtresiz gider [D-26] |
| Randevu | Görev Ekle formunda "Görev / Randevu" tür seçimi [D-14] |
| Öncelik | Düşük / Normal / Yüksek, varsayılan Normal. Yalnızca Yüksek etiketlenir [D-15] |
| Toast | 4 sn görünür. "Görevi tamamla" ve "Ödendi olarak işaretle" sonrası 5 sn "Geri al". Silmede geri al yok [D-18] |
| Kaydedilmemiş değişiklik | Tüm formlarda kapatırken onay [D-19] |
| "Hemen öde" | **Kaldırılır.** "Ödendi olarak işaretle" tek ve birincil aksiyon olur [D-5], bkz. §4.6 |
| Bütçe limiti aşımı | Kategori Yönetimi ve Aylık Rapor'da uygulama içi uyarı [D-16]. [Eksik] Görünüm |
| Çevrimdışı | Üstte "Çevrimdışısınız" bandı, yazma aksiyonları devre dışı [D-7]. [Eksik] Görünüm |
| Metinler | Boş durum, hata ve toast metinleri `i18n/tr.json` ve `i18n/en.json` içinde tek yerde yazılır [D-31]. Bu doküman taslak metin önermez; yazım ürün tarafında |
| Dil | V1'de Türkçe (varsayılan) + İngilizce [D-31]. Butonlar metne göre genişler. [Risk] 72 px'lik nav butonlarında İngilizce etiketler (örn. "Transactions") `Label/XS` ile sığmayabilir; iki dilde de kontrol edilmeli, gerekirse kısa karşılık ("Activity") seçilmeli |

### 9.4 Erişilebilirlik
- **Özel tarih/saat seçicileri:** Klavyeyle yazarak giriş ve ekran okuyucu etiketleri desteklenir.
- **Odak yönetimi:** Drawer, modal ve sheet'lerde odak içeride tutulur, kapanınca tetikleyen elemana döner.
- **Kontrast:** `Category/*` açık zeminler üzerindeki metinlerde kontrast kontrolü yapılır.

### 9.5 Teknoloji
- **Stack:** Next.js + Tailwind CSS + Supabase. Ayrıntılar TECH_STACK.md'de.
- **PWA:** `next-pwa` yerine Serwist.
- **Para formatı:** Para birimi TRY. Biçim seçili dile göre: `tr-TR` ("24.850,00 ₺") veya `en` ("₺24,850.00") [D-31, PRD Q-22].

---

## 10. Değişiklik Geçmişi

### Sürüm 6 – PRD.md ile uyum
- **§8.1:** PRD'de istenen ama Pages'ta tasarımı olmayan 21 öğe eklendi (#21–#41). Örnekler: Hesaplarım, dil seçici, kategori "*", "Tekrarlama yok", para ekle/çek, haftalık özet, global arama.
- **§8.2.11:** Bu öğelerin mobil / tablet / masaüstü sunum kuralları.
- **§3.1:** Ana Sayfa'ya haftalık özet kartı ve Bugünün Akışı'ndaki "Gecikmiş" grubu notu.
- **§8.2.5:** Tüm gün hatırlatma saati satırı. **§9.5:** Dile bağlı para biçimi.
- **Takip:** §8.1'deki 41 öğenin A / B / C sınıflandırması ve engelleyici olanlar PRD §19'da (TD-01…TD-41).

### Sürüm 5 – DESIGN.md ile tutarlılık
| Çelişki | Değişiklik | Bölüm |
|---|---|---|
| Ç-1 | Kart radius'u ikiye ayrıldı: hero/durum kartları 24, liste ve küçük kartlar 16 | §4.1 |
| Ç-2 | Input ve select 46 px (önceden 48) | §4.7, §6.5, §8.3 |
| Ç-3 | Sidebar aktif öğe zemini Neutral/200 (mobil nav ile aynı) | §2.3 |
| Ç-4 | "Ödendi olarak işaretle" mevcut görünüm Tertiary olarak düzeltildi, tek buton olarak Secondary'ye geçer | §4.6 |
| Ç-5 | Silme onayında "Vazgeç" Tertiary | §4.5.2, §8.2.3 |
| Ç-6 | Kart hover'ında gölge kaldırıldı, yerine zemin/çerçeve değişimi | §4.1 |
| Ç-9 | Durum chip'i 24, seçilebilir chip 32 | §6.5 |
| Ç-10 | Form footer'larında "İptal" Tertiary, ikonsuz | §4.6 |
| Ç-11 | Yeni `Label/XS` (Bold 10/15) stili | §6.3 |
| Ç-13 | OTP kutusu 48 px olarak tabloya eklendi | §6.5 |

Ç-7, Ç-8 ve Ç-12 bu dokümanda değişiklik gerektirmedi.

### Sürüm 4 – Teknik kararların işlenmesi
- **§9 yeniden yazıldı:** "Açık Kalan Teknik Konular" bölümü, "Teknik Kararların Tasarıma Etkisi" bölümüne dönüştü. Tüm açık konular TECH_STACK.md §12'deki kararlarla (D-1…D-30) kapatıldı.
- **"Hemen öde" kaldırıldı:** "Ödendi olarak işaretle" tek ve birincil aksiyon oldu (§4.6) [D-5]. Pages'ta güncelleme gerektirir.
- **PIN kilidi:** v1.0'da yok, Profil satırı gizli (§3.6.1) [D-4].
- **Görev Ekle önerisine eklenenler:** "Görev / Randevu" tür alanı ve öncelik seviyeleri (§8.2.1).
- **Hatırlatma Ayarları:** İçerik tanımlandı (§8.2.5) [D-25].
- **Toast:** Süre ve "Geri al" kuralları (§8.2.7) [D-18].
- **Yeni eksik öğe önerileri:** Auth ekranları ve Hesap Silme (§8.2.8), Bildirimler paneli (§8.2.9), çevrimdışı bandı ve bütçe uyarısı (§8.2.10). Eksikler listesi 20 maddeye çıktı.
- **Kapsam notu:** Mobil uygulamalar çok ileride Expo ile yapılacak.

### Sürüm 3 – Tasarım kaynağı kapsamı düzeltmesi
**Kapsam kuralı:** Resmi tasarım kaynağı yalnızca **Pages** ve **Components**. AI Pages ve diğer sekmeler kapsam dışı. Figma'da hiçbir sekme silinmedi veya değiştirilmedi.

**Kaldırılanlar:**
- AI Pages'tan alınmış tüm ekran içerikleri, metinler, değerler, bulgular ve görsel referanslar.
- Bunlara dayanan responsive tablolar ve teknik notlar.

**Değişen yapı:**
- Yeni işaret: **[Eksik]**, tasarımda olmayan öğeler için.
- §3.2.3 Günlük görünüm, §3.2.5 Görev Ekle, §3.6.4 Hatırlatma Ayarları ve §3.7 durum ekranları kısa "eksik" notlarına dönüştürüldü. Önerilen yapılar §8'e taşındı.
- §2.5 hesap menüsü, §4.5.1 seçiciler, §4.5.2 silme onayı ve §4.5.3 geri bildirim bölümleri [Eksik] olarak işaretlendi. Görsel öneriler yalnızca Pages bileşenleri ve token'larına dayandırıldı.
- §8 yeniden yazıldı: "Eksik Ekranlar ve Componentler – Geliştirme Önerileri". Eksikler listesi öncelikli, ekran önerileri ayrı.
- Karar #12 güncellendi. Yardımcı ekranlar AI Pages'tan alınmıyor, eksik olarak listeleniyor.
- §9.1 ve §9.3 yalnızca Pages'ta görünen öğelere göre yeniden yazıldı. Bildirim izni durumları, bildirim ikonunun hedefi ve görev öncelik seviyeleri eklendi.

### Sürüm 2 – 14 kararın işlenmesi
Bu sürümün AI Pages'a dayanan kısımları Sürüm 3'te kaldırıldı. Aşağıdaki notlar Sürüm 3'teki haliyle güncellendi.

**Eski varsayımların yerine gelen kararlar:**
- Header profil ikonunun "tablet+ gizlenir" varsayımı kaldırıldı. İkon tüm cihazlarda korunuyor ve **hesap menüsü** açıyor (§2.5). Profil sekmesi de korunuyor.
- "Ödeme → Abonelik" varsayımı **kesin karar** oldu (§3.1, §3.3.3).
- Link hedefleri varsayım olmaktan çıktı, kesinleşti (§3.1).
- Tablet navigasyonunda alternatif (alt nav) kaldırıldı. **80 px rail** kesinleşti (§2.2).
- PWA tema rengi `#0F766E` ve arka plan `#F8FAFC` olarak kesinleşti. Eski `#4f46e5` geçersiz (§5.3).
- Seçicilerde "bottom sheet varsayımı" kesin karara dönüştü. Tarih/saat için özel seçiciler eklendi (§4.5.1).
- Silme onayı "tasarlanması gerekir" notundan **zorunlu kalıba** dönüştü (§4.5.2).
- Line-height önerisi kesinleşti. Tüm text style'lar için piksel değerleri hesaplandı (§6.3).

**Yeni eklenen içerik:**
- **Görev Ekle** formu önerisi (Sürüm 3'te §8.2.1'e taşındı).
- **Günlük Görünüm** önerisi (Sürüm 3'te §8.2.2'ye taşındı).
- PIN / biyometrik kararı ve güvenlik kavramlarının ayrımı (§3.6.1, §9.2).
- Renk mimarisi: primitive / semantic katmanlar ve ikinci temaya hazırlık (§6.4).
- `Layout` koleksiyonuna onay modalı ve popover ölçüleri eklendi (§6.2).
- Yeni bölümler: **Kesinleşen Kararlar** (§7), **Eksik Ekranlar** (§8), **Açık Teknik Konular** (§9).

**Diğer:**
- Hızlı gider girişi için ayrı bir ekran yok. Yeni İşlem / Gider akışı kullanılıyor (§3.3.3).
- Önceki sürümdeki "Açık Sorular" tablosu kaldırıldı. Kesinleşenler §7'ye, kalan teknik konular §9'a taşındı.
