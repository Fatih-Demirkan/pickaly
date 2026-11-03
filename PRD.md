# Pickaly – Product Requirements Document (PRD)

> **Sürüm:** 1.2 (taslak) · **Durum:** İnceleme bekliyor
> - 1.1: Dil (U-1) ve mobil platform (U-2) çelişkileri çözüldü
> - 1.2: 24 açık soru karara bağlandı (§16.3)
> - 1.3: Uyum işleri tamamlandı (U-3, U-6, U-7). Tüm U maddeleri çözüldü veya uyumlu
> - 1.4: V1 kabul kriterleri (§1.6), yayın engelleri (§1.8, hukuki onay dahil), tasarım işleri takibi (§19), son tutarlılık kontrolü (§18 U-11…U-15)
> - 1.5: Kategori arşivleme (BR-CAT-002…008), geçici tablet/masaüstü geliştirme izni (§19.2, LB-03), chip renkleri TD-F9, NFR-SEC-006 (gerçek veri yok, ortam ayrımı)
> **Kapsam:** V1 – responsive web uygulaması (mobil, tablet, masaüstü)
> **Tasarım kaynağı:** Figma `Fatih-Test`. Yalnızca **Pages** ve **Components** sekmeleri. AI Pages kapsam dışıdır.
> **İlgili dokümanlar:**
>
> | Doküman | Konu |
> |---|---|
> | [DESIGN.md](DESIGN.md) | Tasarım sistemi |
> | [RESPONSIVE.md](RESPONSIVE.md) | Responsive davranışlar |
> | [TECH_STACK.md](TECH_STACK.md) | Teknik mimari ve teknik karar kaydı (D-n) |
>
> Bu doküman **ne** yapılacağını tanımlar. **Nasıl** yapılacağı TECH_STACK.md'nin konusudur.

---

## 0. Doküman Kuralları

### 0.1 Gereksinim ID'leri

| Önek | Alan |
|---|---|
| `FR-AUTH` | Kimlik doğrulama ve hesap |
| `FR-DSH` | Dashboard (Ana Sayfa) |
| `FR-CAL` | Takvim ve Planlama |
| `FR-FIN` | Finans ve İşlemler |
| `FR-SAV` | Birikim |
| `FR-REP` | Raporlar |
| `FR-SET` | Profil ve Ayarlar |
| `FR-NTF` | Hatırlatma ve bildirim |
| `BR` | İş kuralı |
| `DM` | Veri modeli |
| `UX` | Kullanıcı deneyimi ve tasarım kuralı |
| `NFR` | Fonksiyonel olmayan gereksinim (güvenlik, performans, erişilebilirlik) |

### 0.2 Öncelik (MoSCoW)

| Öncelik | Anlamı |
|---|---|
| **M** – Must Have | V1 yayını için zorunlu |
| **S** – Should Have | V1'de olmalı. Gerekirse V1.x'e kayabilir |
| **C** – Could Have | Zaman kalırsa |

### 0.3 Tasarım durumu (Pages / Components karşılığı)

| İşaret | Anlamı |
|---|---|
| ✅ | Pages'ta tasarlanmış |
| ◐ | Kısmen var (giriş noktası, alan veya ekranın bir kısmı) |
| ❌ | Tasarım **yok**. Gereksinim tasarım bekliyor. Geçici çözüm RESPONSIVE.md §8 önerilerine göre |

### 0.4 Bilgi türleri

| İşaret | Anlamı |
|---|---|
| **[Karar]** | Kesinleşmiş. Kaynağı belirtilir (RESPONSIVE Karar #n, TECH_STACK D-n, DESIGN Ç-n veya bu PRD'yi isteyen kapsam tanımı) |
| **[Öneri]** | Bu dokümanın önerisi. Onay bekler |
| **[Varsayım]** | Doğrulanmamış kabul |
| **[Açık]** | Karar verilmesi gereken soru. Ürün soruları §16.3'te karara bağlandı. Açık kalan konular yayın engelleri (§1.8) ve tasarım işleridir (§19) |
| **[LB]** | Yayın engeli (Launch Blocker). Kapanmadan yayın yapılmaz (§1.8) |
| **[Çelişki]** | Diğer dokümanlarla uyuşmayan konu (§18'de listelenir) |

---

## 1. Ürün Tanımı

### 1.1 Özet
Pickaly; **kişisel görev yönetimi, takvim ve planlama, gelir-gider takibi ve birikim yönetimini** tek bir deneyimde birleştiren kişisel organizasyon uygulamasıdır. Uygulamanın alt başlığı "Life & Money Planner" [Figma].

### 1.2 Problem
Kullanıcılar günlük işlerini, randevularını, faturalarını ve birikimlerini farklı uygulamalarda takip ediyor. Bu yüzden şu soruların cevabı dağınık kalıyor:
- "Bugün ne yapmam ve ne ödemem gerekiyor?"
- "Bu ay ne kadar harcadım?"
- "Hedefime ne kadar yaklaştım?"

### 1.3 Değer önerisi
- **Tek bakışta gün:** Görevler, randevular ve vadesi gelen ödemeler aynı akışta.
- **Zaman ve para birlikte:** Bir görevin planlanan harcaması, bir faturanın vadesi ve hatırlatması tek kayıtta.
- **Sakin ve anlaşılır finans:** Bakiye, aylık net değişim ve tasarruf oranı yorumsuz ve net.
- **Her cihazda uygulama hissi:** Kurulabilir (PWA), mobil öncelikli, masaüstünde verimli.

### 1.4 Hedef kullanıcı [Varsayım]
- Kişisel bütçesini ve günlük planını kendisi yöneten, Türkiye'de yaşayan, TRY kullanan bireysel kullanıcı.
- Banka entegrasyonu beklemeyen, verisini **elle** giren kullanıcı.
- Aile/ortak hesap kullanımı V1 hedefi değil (§14).

### 1.5 Platform
- **V1:** Responsive web uygulaması. Mobil (≥360 px), tablet ve masaüstü aynı uygulamada desteklenir [Karar: RESPONSIVE §1]. Ana ekrana eklenebilir (PWA) [Karar: D-7].
- **Gelecek:** Mobil uygulama. Veri modeli ve iş mantığı farklı istemcilerin aynı backend'i kullanabileceği şekilde tasarlanır (NFR-ARCH-001, §15).
  - **[Karar: U-2, D-28a]** Mobil uygulamalar **çok ileride Expo ile iOS ve Android** için geliştirilecek. V1 mimarisi bunun için yeniden şekillendirilmez.

### 1.6 V1 kabul kriterleri [Karar]

> **Önemli:** Bunlar **mevcut ürün performansı değildir.** Ürün henüz geliştirilmedi. Aşağıdakiler V1'in yayına çıkabilmesi için geliştirme ve test aşamasında **doğrulanması gereken** kabul kriterleridir. Bir kriter karşılanmadan V1 yayınlanmaz.

| ID | Kriter | Hedef | Ölçüm yöntemi | Doğrulama koşulu |
|---|---|---|---|---|
| AC-01 | Ana modüllerin fonksiyonel gereksinimlerinin tamamlanması | **%100** (Must Have) | Gereksinim izlenebilirlik listesi: her **Must Have** FR ID'si en az bir kabul testine bağlanır. Should Have'ler ayrıca raporlanır | Tüm Must Have FR'lerin testleri staging'de geçer. Kapsam dışına alınan her Should/Could, ürün sahibinin yazılı onayıyla V1.x'e kaydırılır |
| AC-02 | Kritik kullanıcı akışlarının başarıyla tamamlanması | **%100** | §2'deki A-1…A-8 akışları için uçtan uca otomatik testler (Playwright) + elle keşif testi | Her akış, temiz bir test hesabıyla **4 viewport'ta** (390, 834, 1280, 1440) baştan sona hatasız tamamlanır. Son 3 ardışık CI koşusunda geçer |
| AC-03 | Mobil, tablet ve masaüstü responsive gereksinimlerinin karşılanması | **%100** | RESPONSIVE.md'deki ekran bazlı yerleşim kurallarından türetilen kontrol listesi + 4 viewport'ta görsel karşılaştırma | Hiçbir ekranda yatay kaydırma, kırpılmış metin veya üst üste binen öğe yok. Dokunma alanları ≥ 44 px. Kontrol listesinin tüm maddeleri işaretli. Tasarımı olmayan ekranlarda referans RESPONSIVE §8 önerileridir |
| AC-04 | Türkçe ve İngilizce dil desteğinin tamamlanması | **%100** | Çeviri dosyalarında anahtar karşılaştırması (eksik anahtar = 0) + iki dilde ekran ekran gözden geçirme | Her iki dilde **eksik veya çevrilmemiş arayüz metni yok**. Tarih, sayı ve para biçimleri seçili dile uyar (Q-22). Nav etiketleri iki dilde sığar. Kullanıcı içeriği çevrilmez |
| AC-05 | Kritik hata sayısı | **0** | Test süresince hata kaydı. "Kritik" tanımı: veri kaybı/bozulması, yanlış bakiye veya rapor hesabı, güvenlik/izolasyon ihlali, bir kritik akışı tamamlanamaz kılan hata | Yayın adayında açık kritik hata yok. Kapatılan her kritik hata için regresyon testi eklenmiş |
| AC-06 | Kullanıcılar arası veri izolasyonu | **%100** | Her tablo ve dosya deposu için otomatik RLS testleri (NFR-SEC-RLS-006) + iki test kullanıcısıyla elle çapraz erişim denemesi (URL/ID ile başka kullanıcının kaydını açma, değiştirme, silme) | Tüm RLS testleri geçer. Hiçbir çapraz erişim denemesi veri döndürmez veya değiştirmez. RLS'i kapalı tablo yok |
| AC-07 | Kritik ekranlarda yükleme süresi | **< 2 sn** | Kritik ekranlar: Ana Sayfa, Takvim (aylık), İşlemler, Birikimler, Aylık Rapor. Staging'de Lighthouse / Web Vitals ölçümü, mobil profil ve yavaş 4G simülasyonu, temsilî veri seti (≈ 500 işlem, 100 takvim kaydı) | Her kritik ekranda ekranın kullanılabilir olduğu süre (LCP) 5 ölçümün medyanında **< 2 sn**. Masaüstü ölçümleri ayrıca raporlanır |
| AC-08 | Veri kaybı ve mükerrer işlem | **0** | BR-DUP-001…004 ve BR-PAY / BR-REC kuralları için otomatik testler: çift tıklama, ağ tekrarı, sekme yenileme, iki cihazda eşzamanlı işlem, tekrar üretiminin iki kez çalışması, aynı ödemenin iki kez "Ödendi" yapılması | Hiçbir senaryoda mükerrer kayıt oluşmaz ve kaydedildiği onaylanan veri kaybolmaz. Bakiye ve rapor toplamları test öncesi/sonrası beklenen değerle birebir eşleşir |

**Genel doğrulama koşulları:**
- Testler **staging** ortamında, production ile aynı yapılandırmada çalıştırılır.
- Sonuçlar bir V1 kabul raporunda kayıt altına alınır. Ürün sahibi raporu onaylamadan yayın yapılmaz.
- Kabul kriterleri karşılansa bile §1.8'deki yayın engelleri kapanmadan yayın yapılmaz.

### 1.7 Yayın sonrası izlenecek ürün ölçütleri [Öneri]
V1 yayınından sonra izlenir. Hedef değerleri ilk kullanım verisine göre belirlenir. Kabul kriteri değildir.

| Ölçüt | Tanım |
|---|---|
| Aktivasyon | Kayıttan sonraki 7 gün içinde en az 1 işlem ve 1 görev oluşturan kullanıcı oranı |
| Haftalık aktif kullanım | Haftada en az 3 gün uygulamayı açan kullanıcı oranı |
| Ödeme takibi | Vadesi gelen ödemelerin "Ödendi" olarak işaretlenme oranı |
| Görev tamamlama | Planlanan görevlerin tamamlanma oranı |
| Kurulum | PWA olarak ana ekrana ekleyen kullanıcı oranı |

### 1.8 Yayın engelleri (Launch Blockers – Yayın Öncesi Zorunlu)

> Aşağıdakiler kapanmadan V1 **hiçbir ortamda gerçek kullanıcılara açılamaz.** Durumları burada takip edilir.

| ID | Konu | Durum | Kapanma koşulu |
|---|---|---|---|
| LB-01 | **Hukuki metinler: KVKK aydınlatma metni, açık rıza metni (yurt dışına/AB'ye veri aktarımı dahil), kullanım koşulları, gizlilik politikası, çerez bilgilendirmesi** | ❌ **Hukuki onay ALINMADI.** Metinler henüz yazılmadı ve bir hukuk uzmanı tarafından incelenmedi | Nihai metinler **hukuk uzmanı tarafından incelenip yazılı olarak onaylanır**. Onaylı metinler uygulamaya (kayıt onayı, Profil → "Kullanım koşulları ve gizlilik") iki dilde eklenir ve metin sürümleri kayıt altına alınır |
| LB-02 | V1 kabul kriterlerinin (AC-01…AC-08) karşılanması | ❌ Geliştirme başlamadı | V1 kabul raporu ürün sahibince onaylanır |
| LB-03 | A sınıfı tasarım işleri (TD-11, TD-14). Geliştirme bunları beklemeden RESPONSIVE.md kurallarıyla ilerler (§19.2) | ❌ Tamamlanmadı | Yayından önce **ya** Figma tasarımı onaylanır **ya da** ürün sahibi RESPONSIVE.md kurallarıyla yapılmış tablet/masaüstü uygulamasını açıkça onaylar |

**Hukuki konularda not:**
- Bu dokümandaki ve diğer dokümanlardaki hukuki ifadeler (KVKK, açık rıza, veri saklama ve silme süreleri, yedeklerin saklama süresi) yalnızca **teknik hazırlık** niteliğindedir. Hiçbiri hukuki görüş veya onay değildir.
- Teknik altyapı (kayıtta onay kutusu, onay zamanı ve metin sürümünün saklanması, hesap ve veri silme, AB bölgesinde barındırma) metinlerden bağımsız olarak hazırlanır. Ancak bu altyapı hukuki uygunluk anlamına gelmez.

---

## 2. Kullanıcı Akışları (özet)

| # | Akış | Adımlar | Tasarım |
|---|---|---|---|
| A-1 | İlk kullanım | Kayıt → e-posta doğrulama (6 haneli kod) → Ana Sayfa (varsayılan "Ana Hesap" ve kategoriler hazır) | ❌ auth ekranları |
| A-2 | Günü planlama | Ana Sayfa → Bugünün Akışı → kaydı tamamla (✓) veya Takvim'e geç → güne kayıt ekle | ✅ / ❌ Görev Ekle |
| A-3 | Harcama girme | Hızlı Aksiyon "Gider" veya "Yeni işlem" → tutar, başlık, kategori, hesap → Kaydet → toast → liste ve bakiye güncellenir | ✅ |
| A-4 | Fatura/abonelik takibi | Hızlı Aksiyon "Ödeme" → Yeni İşlem (Abonelik sekmesi) → tekrar sıklığı + hatırlatma → vadesi gelince Yaklaşan Ödemeler'de görünür → "Ödendi olarak işaretle" → gider işlemi oluşur | ✅ (form, detay) / ◐ (yaklaşan) |
| A-5 | Birikime para ekleme | Birikimler → hesap detayı → "Para ekle / Çek" → tutar + kaynak hesap → kaynak hesap azalır, birikim artar | ◐ (buton var, akış yok) |
| A-6 | Ay sonu değerlendirme | Ana Sayfa "Aylık Rapor" → Aylık Finans Raporu → ay değiştir → "Paylaş" → görsel | ✅ |
| A-7 | Kayıt düzeltme / silme | Detay → "Düzenle" (form dolu açılır) veya "Sil" → onay → toast | ✅ detay / ❌ onay |
| A-8 | Ayarlar | Profil → dil, para birimi, hafta başı, hatırlatma tercihleri, kategori yönetimi, dışa aktarma, çıkış, hesap silme | ✅ liste / ❌ alt ekranların bir kısmı |

---

## 3. Kimlik Doğrulama ve Hesap (FR-AUTH)

**Tasarım durumu:** ❌ Giriş, kayıt, doğrulama, şifre sıfırlama ve hesap silme ekranları Pages'ta yok. Geçici öneri: RESPONSIVE §8.2.8.

| ID | Gereksinim | Öncelik | Tasarım |
|---|---|---|---|
| FR-AUTH-001 | Kullanıcı e-posta ve şifreyle kayıt olabilir. Kayıtta ad, e-posta, şifre ve kullanım koşulları/gizlilik onayı alınır. Onay metinleri hukuki onay bekliyor [LB-01] | M | ❌ |
| FR-AUTH-002 | E-posta adresi 6 haneli kodla doğrulanır. Kod tekrar gönderilebilir (geri sayımlı) [Karar: D-1] | M | ❌ |
| FR-AUTH-003 | Kullanıcı e-posta ve şifreyle giriş yapar | M | ❌ |
| FR-AUTH-004 | Şifremi unuttum: e-posta → 6 haneli kod → yeni şifre [Karar: D-1] | M | ❌ |
| FR-AUTH-005 | Kayıt sonrası "Ana Hesap" ve varsayılan kategoriler otomatik oluşturulur [Karar: D-29] | M | – |
| FR-AUTH-006 | "Çıkış Yap" yalnızca bu cihazdaki oturumu kapatır [Figma: "Oturumu bu cihazda sonlandır"] | M | ✅ |
| FR-AUTH-007 | Hesap silme: kimlik yeniden doğrulanır, onay alınır, tüm kullanıcı verisi kalıcı olarak silinir [Karar: D-10] | M | ❌ |
| FR-AUTH-008 | Sosyal giriş (Google ve Apple birlikte) | – | V1 dışı [Karar: D-1] |

**Validasyonlar:**

| Alan | Kural |
|---|---|
| E-posta | Geçerli e-posta biçimi, kayıtta benzersiz |
| Şifre | En az 8 karakter [Karar: TECH_STACK §4.3] |
| Ad | Zorunlu, 1–50 karakter [Öneri] |
| Doğrulama kodu | 6 rakam. Süresi dolmuş veya yanlış kodda hata mesajı |
| Onay kutusu | Kayıtta zorunlu |

**Hata senaryoları:**

| Durum | Davranış |
|---|---|
| Yanlış e-posta veya şifre | Tek bir genel mesaj ("E-posta veya şifre hatalı"). Hangisinin hatalı olduğu söylenmez |
| Doğrulanmamış hesapla giriş | Doğrulama ekranına yönlendirilir |
| Çok sayıda başarısız deneme | Geçici kilit mesajı gösterilir [Varsayım: sağlayıcının hız sınırı] |
| Bağlantı yok | Form gönderilmez, çevrimdışı bandı gösterilir [Karar: D-7] |

---

## 4. Dashboard / Ana Sayfa (FR-DSH)

**Tasarım durumu:** ✅ Ana Sayfa [Figma]. İçerik sırası: Toplam Bakiye kartı → Hızlı Aksiyonlar → Bugünün Akışı → Yaklaşan Ödemeler → Birikim Hedefi.

### 4.1 Gereksinimler

| ID | Gereksinim | Öncelik | Tasarım |
|---|---|---|---|
| FR-DSH-001 | **Günlük özet:** "Bugün: n Görev, n Ödeme bekliyor" satırı. Sayılar bugün tarihli ve **tamamlanmamış** görevleri ve **bekleyen** ödemeleri gösterir (BR-TSK-002) | M | ✅ |
| FR-DSH-002 | **Toplam Bakiye kartı:** Toplam bakiye (BR-BAL-003), bu ayın toplam geliri ve gideri, "Aylık Rapor" bağlantısı | M | ✅ |
| FR-DSH-003 | **Hızlı Aksiyonlar:** Gelir, Gider, Görev, Ödeme. Her biri ilgili formu ilgili tür seçili açar [Karar: RESPONSIVE §3.1] | M | ✅ (Görev formu ❌) |
| FR-DSH-004 | **Bugünün Akışı:** Bugünün görevleri, randevuları ve vadesi gelen ödemeleri saat sırasıyla. Her satırda tür chip'i, saat, kategori. Görev için tamamla (✓), ödeme için "Ödendi olarak işaretle" [Karar: D-5] | M | ✅ |
| FR-DSH-005 | "Bugünün Akışı → Tümü (n)" Takvim'i bugün seçili açar [Karar: RESPONSIVE #9] | M | ✅ |
| FR-DSH-006 | **Yaklaşan Ödemeler:** Bekleyen ödemeler, vade sırasıyla. Tutar, vade tarihi, "n gün kaldı". "Tümü (n)" İşlemler'e gider [Karar: RESPONSIVE #9, D-26] | M | ✅ |
| FR-DSH-007 | **Yaklaşan Ödemeler'in zaman penceresi:** Vadesi geçmiş (en üstte, "Gecikmiş") + önümüzdeki 7 gün [Karar: Q-1] | M | – |
| FR-DSH-008 | **Birikim Hedefi kartı:** Öne çıkan bir birikim hedefi: ad, hedef tutar, mevcut tutar, tamamlanma yüzdesi, ilerleme çubuğu | M | ✅ |
| FR-DSH-009 | **Hangi hedefin öne çıkacağı:** Birikim detayındaki "Ana Sayfa'da göster" seçimi; seçim yoksa tamamlanmaya en yakın aktif hedef [Karar: Q-2] | S | ❌ seçim yok |
| FR-DSH-010 | **Yaklaşan etkinlikler:** Bugünden sonraki ilk randevu ve etkinlikler [Öneri: Bugünün Akışı boşsa "Sıradaki" satırı] | S | ❌ |
| FR-DSH-011 | **Haftalık özet:** Bu haftanın görev tamamlama, gelir/gider ve yaklaşan ödemeler özeti. İlgili modüllere yönlendirme | S | ❌ |
| FR-DSH-012 | Floating "Yeni işlem" butonu (mobil). Tablet ve masaüstünde rail/sidebar butonu [Karar: RESPONSIVE §2] | M | ✅ |

> **FR-DSH-011 Haftalık özet:** Pages'ta karşılığı **yok**. [Karar: Q-3] Ana Sayfa'da, Bugünün Akışı'nın altında kompakt kart: tamamlanan / toplam görev, haftanın geliri, gideri ve neti, bu haftaki ödemeler. Her satır ilgili modüle gider. Tasarım bekliyor; V1 yayınını bloklamaz (Should Have).

### 4.2 Boş durumlar

| Bölüm | Davranış |
|---|---|
| Bugünün Akışı | Kısa mesaj, aksiyonsuz [Karar: RESPONSIVE §8.2.6] |
| Yaklaşan Ödemeler | Kısa mesaj, aksiyonsuz |
| Birikim Hedefi | Hiç birikim hesabı yoksa kart yerine "Birikim hesabı ekle" çağrısı [Öneri]. Birikimler boş durumuyla aynı dil |
| Yeni kullanıcı | Bakiye 0,00 ₺ gösterilir. Hızlı Aksiyonlar her zaman görünür |

### 4.3 Geri bildirim
- **Tamamla (✓) ve "Ödendi olarak işaretle":** Anında güncellenir, toast gösterilir. Toast 5 sn boyunca "Geri al" içerir [Karar: D-18].

---

## 5. Takvim ve Planlama (FR-CAL)

**Tasarım durumu:**
- ✅ Takvim Aylık, Takvim Haftalık, Görev Detayı
- ❌ Günlük görünüm (seçenek var, ekran yok)
- ❌ Görev/Randevu ekleme formu

**Kavramlar:**

| Kavram | Tanım |
|---|---|
| **Görev** | Yapılacak iş. Tamamlanabilir |
| **Randevu** | Belirli bir saatte bir yerde/biriyle buluşma. Görev gibi tamamlanabilir [Karar: Q-4; Figma'da randevu satırında ✓ var] |
| **Etkinlik** | Bu PRD'nin kapsam tanımında geçiyor. Pages'ta ayrı bir "etkinlik" türü **yok**; ajanda yalnızca Görev, Randevu ve Ödeme gösteriyor [Figma]. V1'de "etkinlik" = randevu. Ayrı tür açılmaz [Karar: Q-5] |

Görev ve randevu Takvim içinde yönetilir. Ayrı Görevler ekranı **yoktur** [Karar: RESPONSIVE #1].

### 5.1 Gereksinimler

| ID | Gereksinim | Öncelik | Tasarım |
|---|---|---|---|
| FR-CAL-001 | **Aylık görünüm:** Ay matrisi. Gün hücresinde kayıt türü göstergeleri (Görev/Randevu/Ödeme renkleri ve lejant). Seçili günün ajandası. "Bugün" butonu, ay ileri/geri | M | ✅ |
| FR-CAL-002 | **Haftalık görünüm:** 7 günlük şerit ve seçili günün saat çizelgesi | M | ✅ |
| FR-CAL-003 | **Günlük görünüm:** Tek gün, saat bazlı detaylı çizelge [Karar: RESPONSIVE #4] | S | ❌ |
| FR-CAL-004 | **Ajanda:** Seçili günün kayıtları "Yapılacaklar" ve "Tamamlandı" olarak ayrılır. Gün özeti ("2 Görev, 1 Randevu, 1 Ödeme") | M | ✅ |
| FR-CAL-005 | **Görev oluşturma:** Bkz. §5.2 alanlar | M | ❌ |
| FR-CAL-006 | **Randevu oluşturma:** Aynı formda "Görev / Randevu" tür seçimi [Karar: D-14] | M | ❌ |
| FR-CAL-007 | **Görev/randevu detayı:** Durum ve başlık kartı (öncelik, kategori, başlık, açıklama), Zaman & Hatırlatma, Konum & Notlar ("Haritada aç"), Planlanan Finansal Harcama | M | ✅ |
| FR-CAL-008 | **Düzenleme:** Detaydaki "Düzenle" formu dolu açar | M | ✅ buton / ❌ form |
| FR-CAL-009 | **Tamamlama:** Detayda "Görevi tamamla", listede ✓. Tamamlanan kayıt yeniden açılabilir | M | ✅ |
| FR-CAL-010 | **Silme:** "Kaydı kalıcı olarak sil" → onay → kalıcı silme [Karar: #7, D-10] | M | ✅ buton / ❌ onay |
| FR-CAL-011 | **Hatırlatıcı:** Kayıt başına hatırlatma zamanı (örn. "1 saat önce"). Varsayılan Hatırlatma Ayarları'ndan gelir [Karar: D-25] | M | ◐ |
| FR-CAL-012 | **Tekrarlayan görevler:** Görev/randevu için tekrar sıklığı (günlük, haftalık, aylık, yıllık) | S | ❌ |
| FR-CAL-013 | **Ödemeler takvimde:** Bekleyen ödemeler vade gününde ajandada "Ödeme" olarak görünür. "Son Gün" etiketi ve "Ödendi olarak işaretle" | M | ✅ |
| FR-CAL-014 | **"Haritada aç":** Adresi cihazın harita uygulamasında / yeni sekmede açar [Varsayım: dış harita bağlantısı, uygulama içi harita yok] | S | ✅ |
| FR-CAL-015 | **Takvim üzerinden yönetim:** Ajandadan tamamla, detaya git, güne kayıt ekle | M | ◐ |
| FR-CAL-016 | **Sürükle-bırak ile tarih/saat değiştirme** (haftalık ve aylık görünüm, masaüstü) | C | ❌ |

> **FR-CAL-012 Tekrarlayan görevler:** Pages'ta görev formu olmadığı için tekrar alanı da yok. Yeni İşlem formundaki "Tekrar Eden İşlem" kalıbı referans alınır [Öneri].

### 5.2 Alanlar ve validasyonlar (Görev / Randevu) [Öneri: form tasarlanmadı]

| Alan | Zorunlu | Kural | Kaynak |
|---|---|---|---|
| Tür | ✔ | Görev / Randevu. Varsayılan Görev | D-14 |
| Başlık | ✔ | 1–80 karakter [Öneri] | Görev Detayı |
| Açıklama | – | ≤ 200 karakter [Öneri] | Görev Detayı |
| Öncelik | – | Düşük / Normal / Yüksek. Varsayılan Normal. Arayüzde yalnızca Yüksek etiketlenir | D-15 |
| Kategori | – | Kullanıcının "Görev / Takvim" kategorilerinden biri | Kategori Yönetimi |
| Tarih | ✔ | Geçerli tarih. Geçmiş tarih **izinli** (geriye dönük kayıt) [Öneri] | |
| Saat / tüm gün | – | Saat boşsa "tüm gün" kaydı [Öneri] | |
| Süre | – | Dakika, > 0 ("45 dk" [Figma]) | Takvim |
| Hatırlatma | – | Kayıt zamanından önce bir süre. Tüm gün kayıtlarda gün başında sabit saat (varsayılan 09:00): o gün / 1 gün önce / 1 hafta önce [Karar: Q-6] | |
| Konum adı / adres | – | ≤ 120 karakter [Öneri] | Görev Detayı |
| Not | – | ≤ 200 karakter (x/200 sayaç) | Yeni İşlem kalıbı |
| İlişkili harcama | – | Tutar > 0. Bilgi amaçlı, bakiyeyi **etkilemez** (BR-TSK-003) | Görev Detayı |
| Tekrar | – | Sıklık + bitiş (yok / tarih / adet) [Öneri] | FR-CAL-012 |

### 5.3 Senaryolar
- **Başarılı kayıt:** Form kapanır, kayıt ilgili günde görünür, toast gösterilir.
- **Zorunlu alan boş:** Alan altında hata, form gönderilmez, ilk hatalı alana odaklanılır [Karar: DESIGN §9.4].
- **Kaydedilmemiş değişiklikle kapatma:** Onay sorulur [Karar: D-19].
- **Tamamlama:** Kayıt "Tamamlandı" bölümüne geçer. Dashboard sayıları güncellenir (BR-TSK-001). 5 sn "Geri al".
- **Tekrarlayan kaydın tekini tamamlama:** Yalnızca o örnek tamamlanır. Sonraki örnek takvimde kalır.
- **Tekrarlayan kaydı düzenleme/silme:** "Yalnızca bu" veya "Bu ve sonrakiler" seçimi. Geçmiş örnekler değişmez [Karar: Q-7].

### 5.4 Boş durumlar
| Durum | Davranış |
|---|---|
| Seçili gün boş | Ajandada boş durum + "Görev ekle" aksiyonu [Karar: RESPONSIVE §8.2.6] |
| Ayda hiç kayıt yok | Matris normal görünür, seçili gün boş durumu gösterilir |

---

## 6. Finans ve İşlemler (FR-FIN)

**Tasarım durumu:** ✅ İşlemler listesi, İşlem Detayı, Ödeme Detayı, Yeni İşlem (Gelir / Gider / Abonelik).

**Kavramlar:**

| Kavram | Tanım |
|---|---|
| **İşlem** | Gerçekleşmiş para hareketi: gelir, gider veya hesaplar arası aktarım |
| **Tekrarlayan ödeme** ("Abonelik" sekmesi) | Kullanıcının düzenli ödeme yükümlülüğü: fatura, kira, aidat, dijital abonelik, kredi. Uygulamanın ücretli üyeliğiyle **ilgisi yoktur** [Karar: TECH_STACK §5.1] |
| **Ödeme** | Tekrarlayan ödemenin vadesi gelen tekil kaydı: **Bekliyor** veya **Ödendi** |
| **Hesap** | Paranın durduğu yer: Ana Hesap, banka kartı, kredi kartı, nakit [Figma] |

### 6.1 Gereksinimler

| ID | Gereksinim | Öncelik | Tasarım |
|---|---|---|---|
| FR-FIN-001 | **Gelir kaydı:** Yeni İşlem → Gelir | M | ✅ |
| FR-FIN-002 | **Gider kaydı:** Yeni İşlem → Gider | M | ✅ |
| FR-FIN-003 | **Tekrarlayan ödeme kaydı:** Yeni İşlem → Abonelik. "Ödeme" hızlı aksiyonu bu sekmeyi açar [Karar: RESPONSIVE #3] | M | ✅ |
| FR-FIN-004 | **Tek seferlik ödeme kaydı:** Tekrarsız, ileri tarihli, bekleyen bir ödeme (örn. tek seferlik bir fatura). Abonelik formunda tekrar sıklığına "Tekrarlama yok" seçeneği [Karar: Q-8] | M | ◐ form var, seçenek yok |
| FR-FIN-005 | **Tekrar Eden İşlem** (Gelir/Gider): Switch açılınca sıklık ve hatırlatma seçilir | M | ✅ |
| FR-FIN-006 | **Hızlı tutar chip'leri:** Gelirde +500 / +1.000 / +2.500, giderde −500 / −1.000 / −2.500. Mevcut tutara ekler | M | ✅ |
| FR-FIN-007 | **İşlem listesi:** Seçili ay, güne göre gruplu. Her gün için "Net: ±…". Satırda başlık, kategori, hesap, tutar, saat, durum chip'i | M | ✅ |
| FR-FIN-008 | **Dönem özeti:** Dönem net değişimi ("Pozitif/Negatif Bakiye" etiketi), toplam gelir ve gider, işlem adetleri | M | ✅ |
| FR-FIN-009 | **Filtreleme:** Ay (ileri/geri + "Bugün"), tür (Tümü / Gelir / Gider), kategori (tekli seçim, "Tüm Kategoriler" varsayılan) | M | ✅ |
| FR-FIN-010 | **Özel tarih aralığıyla filtreleme** | C | ❌ |
| FR-FIN-011 | **Global arama:** Header'daki arama ikonu. İşlem, görev, randevu, ödeme ve birikim başlıklarında arar, sonuçlar türe göre gruplanır [Karar: Q-9] | S | ◐ ikon / ❌ sonuç ekranı |
| FR-FIN-012 | **İşlem detayı:** Kategori, tür, başlık, tutar, tarih-saat. Kayıt Parametreleri (Hesap / Ödeme Yöntemi, Konum / Mağaza, Fiş / Belge). "Düzenle", "İşlemi sil" | M | ✅ |
| FR-FIN-013 | **Fiş/belge ekleme:** PDF veya görsel, ≤ 10 MB [Karar: D-30] | S | ◐ detayda görünüyor, formda giriş alanı yok |
| FR-FIN-014 | **Konum / mağaza girişi** | C | ◐ detayda görünüyor, formda giriş alanı yok |
| FR-FIN-015 | **Ödeme detayı:** Durum (Bekliyor / Ödendi), vade ve "n gün kaldı", tekrarlama sıklığı ("Her ayın 22'sinde"), kaynak hesap, Geçmiş Ödemeler | M | ✅ |
| FR-FIN-016 | **Ödendi olarak işaretle:** Ödemeyi "Ödendi" yapar, gider işlemini oluşturur (BR-PAY-002). 5 sn "Geri al" | M | ✅ |
| FR-FIN-017 | **"Hemen öde" kaldırılır:** Uygulama ödeme yapmaz [Karar: D-5] | M | Pages güncellemesi bekliyor |
| FR-FIN-018 | **Bekleyen ve tamamlanan ödemeler:** Bekleyenler Ana Sayfa ve Takvim'de, tamamlananlar Geçmiş Ödemeler'de ve İşlemler'de (Ödendi chip'i) görünür | M | ✅ |
| FR-FIN-019 | **Tekrarlayan ödemeyi duraklatma / sonlandırma** | S | ❌ |
| FR-FIN-020 | **Hesaplar arası aktarım** (örn. Ana Hesap → Kredi Kartı borç ödemesi) | S | ❌ |
| FR-FIN-021 | **Hesap yönetimi:** Hesap ekleme, düzenleme, arşivleme. Hesap adı, türü, son 4 hane, açılış bakiyesi | M | ❌ (yalnızca "Değiştir" seçimi var) |
| FR-FIN-022 | **Hesap bakiyesi ve toplam bakiye:** BR-BAL kurallarına göre hesaplanır | M | ✅ |

> **FR-FIN-021 Hesap yönetimi:** Pages'ta hesap listesi veya hesap ekleme ekranı **yok**. Formlarda ve detaylarda birden fazla hesap görünüyor (Ana Hesap, Banka Kartı ••4821, Kredi Kartı) [Figma]. Bu yüzden Must Have. **Karar [Q-10]:** Profil ve Ayarlar'a "Hesaplarım" satırı; liste + ekle / düzenle / arşivle. Tasarım bekliyor.

### 6.2 Alanlar ve validasyonlar

**Gelir / Gider** [Figma: Yeni İşlem]

| Alan | Zorunlu | Kural |
|---|---|---|
| İşlem Türü | ✔ [Figma "*"] | Gelir / Gider / Abonelik |
| Tutar | ✔ [Öneri] | > 0, en fazla 2 ondalık. Üst sınır 999.999.999,99 ₺ [Öneri] |
| Başlık | ✔ [Figma "*"] | 1–80 karakter [Öneri] |
| Kategori | ✔ [Karar: Q-11] | Türüne uygun bir kategori seçilmeli. Figma'da "*" işareti yok; eklenmesi gerekir |
| Hesap | ✔ [Öneri] | Varsayılan "Ana Hesap" |
| Tarih | ✔ | Varsayılan bugün. Geçmiş ve gelecek tarih izinli |
| Saat | – | Varsayılan şu an |
| Tekrar Eden İşlem | – | Açıksa sıklık zorunlu |
| Hatırlatma Bildirimi | – | Yalnızca tekrar açıkken [Figma] |
| Not | – | ≤ 200 karakter |

**Abonelik / tekrarlayan ödeme** [Figma: Yeni İşlem / Abonelik]

| Alan | Zorunlu | Kural |
|---|---|---|
| Başlık | ✔ | 1–80 karakter |
| Tutar | ✔ | > 0 |
| Kategori | ✔ [Karar: Q-11] | Kira / Ev, Fatura, Aidat, Abonelik, Kredi / Borç, Diğer [Figma] |
| Hesap | ✔ | Ödemenin yapılacağı hesap |
| İlk vade tarihi | ✔ | |
| Tekrar sıklığı | ✔ | Günlük, Haftalık, Aylık, Yıllık + "Tekrarlama yok" [Karar: Q-12, Q-8] |
| Hatırlatma | – | Varsayılan Hatırlatma Ayarları'ndan |
| Bitiş | – | Yok / tarih [Öneri] |
| Not | – | ≤ 200 karakter |

### 6.3 Senaryolar
- **Başarılı kayıt:** Form kapanır, liste ve bakiye güncellenir, toast gösterilir ("Gider kaydedildi").
- **Geçersiz tutar** (0, boş, harf): Alan altında hata.
- **Kategori seçilmeden kaydetme:** Kategori alanında hata, form gönderilmez [Karar: Q-11].
- **Kategorisi arşivlenen işlemler:** Kategori bilgisi (ad, ikon, renk) korunur ve geçmiş işlemde görünür. Hiçbir işlem kategorisiz kalmaz (BR-CAT-002).
- **Arşivlenmiş kategorili bir işlemi düzenleme:** Mevcut kategori korunabilir. Kategori değiştirilirse arşivli kategoriler seçenek olarak sunulmaz (BR-CAT-002).
- **Gelecek tarihli gelir/gider:** Kaydedilir. Bakiyeye etkisi BR-BAL-002'ye göre.
- **Mükerrer gönderim:** Çift tıklama tek kayıt oluşturur (BR-DUP-001).

### 6.4 Düzenleme ve silme
- **Düzenleme:** İşlemin tüm alanları düzenlenebilir. Bakiye ve raporlar yeniden hesaplanır (BR-EDIT-001).
- **Ödeme işleminin silinmesi:** "Ödendi" ile oluşan bir gider işlemi silinirse ilgili ödeme **Bekliyor**'a döner. Silme onayında bu belirtilir [Karar: Q-13].
- **Silme:** Onay zorunlu. Onayda kayıt adı ve sonuç yazar (örn. "Bu işlem silinince hesap bakiyesi güncellenir") [Karar: #7]. Kalıcı silme [Karar: D-10].
- **Tekrarlayan ödemeyi silme:** Geçmiş "Ödendi" kayıtları ve oluşan işlemler **korunur**, gelecekteki bekleyen ödemeler silinir [Öneri].

### 6.5 Boş durumlar
| Durum | Davranış |
|---|---|
| Seçili ayda işlem yok | Boş durum + "Yeni işlem" aksiyonu |
| Filtre sonucu boş | "Bu filtreyle işlem bulunamadı" + "Filtreleri temizle" [Öneri] |
| Geçmiş Ödemeler boş | Kısa mesaj |

---

## 7. Birikim (FR-SAV)

**Tasarım durumu:** ✅ Birikimler (dolu ve boş), Birikim Hesabı Detayı, Yeni Birikim Hesabı Ekle.

**Kavram:** Pages'ta birikim, **"birikim hesabı"** olarak modellenmiş. Kendi bakiyesi, türü (Altın / Kıymetli, Vadeli Mevduat, Yatırım Fonu, Döviz Sepeti, Nakit / Kasa), saklama kurumu ve hedef tutarı var [Figma]. Bu PRD'deki "birikim hedefi" kavramı **birikim hesabının hedefi** olarak ele alınır. Bir hesap = bir hedef [Öneri].

### 7.1 Gereksinimler

| ID | Gereksinim | Öncelik | Tasarım |
|---|---|---|---|
| FR-SAV-001 | **Birikim hesabı/hedefi oluşturma:** Başlık, hesap türü, hedef tutar, başlangıç bakiyesi, kaynak hesap, not | M | ✅ |
| FR-SAV-002 | **Birden fazla birikim hedefi:** "Kayıtlı Birikimler – n Aktif Hedef" listesi | M | ✅ |
| FR-SAV-003 | **Toplam Birikim Varlığı** ve "bu ay eklenen" tutar/yüzde | M | ✅ |
| FR-SAV-004 | **İlerleme:** Mevcut / hedef, tamamlanma yüzdesi, kalan tutar, ilerleme çubuğu | M | ✅ |
| FR-SAV-005 | **Para ekleme:** Kaynak hesaptan birikime aktarım (BR-SAV-001) | M | ◐ ("Para ekle / Çek" butonu var, akış yok) |
| FR-SAV-006 | **Para çıkarma:** Birikimden bir hesaba aktarım (BR-SAV-002) | M | ◐ |
| FR-SAV-007 | **Düzenli katkı:** Yeni Birikim formundaki "Tekrar Eden İşlem" ile periyodik otomatik aktarım ("Düzenli Katkı" [Figma]) | S | ✅ form |
| FR-SAV-008 | **Geçmiş Hareketler:** Tarih, tutar, açıklama | M | ✅ |
| FR-SAV-009 | **Hesap Parametreleri:** Saklama Kurumu, Açılış Tarihi, Son İşlem Tarihi | M | ✅ detay / ◐ (Saklama Kurumu formda yok) |
| FR-SAV-010 | **Hedef tarihi:** Hedefe ulaşılması planlanan tarih ve buna göre aylık gereken tutar | S | ❌ |
| FR-SAV-011 | **Hesabı kapatma / silme:** "Birikim hesabını kapat / Sil" → onay [Karar: #7] | M | ✅ buton / ❌ onay |
| FR-SAV-012 | **Hedefe ulaşıldığında bildirim/kutlama** | C | ❌ |
| FR-SAV-013 | **Adet/gram birimli birikimler** ("25 Adet, Hedef: 100 Adet" [Figma]). TL karşılığı gösterilmez [Karar: D-6] | S | ✅ |

> **FR-SAV-010 Hedef tarihi:** Bu PRD'nin kapsam tanımında isteniyor ama Pages'taki Yeni Birikim formunda ve detay ekranında **yok**. Tasarım bekliyor.
>
> **FR-SAV-009:** "Saklama Kurumu" detayda görünüyor ama formda giriş alanı yok.

### 7.2 Alanlar ve validasyonlar

| Alan | Zorunlu | Kural |
|---|---|---|
| Başlık | ✔ [Figma "*"] | 1–80 karakter |
| Hesap türü | ✔ [Öneri] | 5 türden biri [Figma] |
| Birim | ✔ | Türden türetilir: TRY, adet, gram, döviz [Öneri] |
| Hedef tutar | – [Öneri] | > 0. Boşsa hedefsiz birikim, ilerleme gösterilmez |
| Başlangıç bakiyesi | – | ≥ 0. Kaynak hesaptan aktarılır [Figma: "Ana hesabınızdan anında aktarılır"] |
| Kaynak hesap | Başlangıç bakiyesi > 0 ise ✔ | |
| Hedef tarihi | – | Bugünden sonra (FR-SAV-010) |
| Not | – | ≤ 200 karakter |

### 7.3 Senaryolar ve geri bildirim
- **Başarılı ekleme:** Birikim bakiyesi artar, kaynak hesap azalır, hareket listeye eklenir, toast gösterilir.
- **Yetersiz kaynak bakiyesi:** Uyarı gösterilir ("Bakiye eksiye düşecek") ama işleme izin verilir [Karar: Q-14].
- **Birikimden çekilecek tutar birikim bakiyesinden büyük:** Hata, işlem engellenir.
- **Hedefe ulaşma:** %100'de "Tamamlandı" chip'i görünür. Hesap aktif kalır.
- **Kapatma/silme:** Onay. Bakiyesi olan hesap kapatılırken bakiyenin aktarılacağı hesap sorulur (varsayılan Ana Hesap); istenirse "aktarmadan kapat" seçilir [Karar: Q-15]. Kayıt kalıcı silinir.

### 7.4 Boş durum
- ✅ "Bir Birikim Hesabı bulunmuyor!" + açıklama + "Birikim hesabı ekle" [Figma].

---

## 8. Raporlar (FR-REP)

**Tasarım durumu:** ✅ Aylık Finans Raporu, Paylaşılabilir Rapor Görünümü.

| ID | Gereksinim | Öncelik | Tasarım |
|---|---|---|---|
| FR-REP-001 | **Aylık gelir-gider raporu:** Ay seçici. Net nakit akışı, toplam gelir (kalem sayısıyla), toplam gider, tasarruf oranı | M | ✅ |
| FR-REP-002 | **Gelir & gider karşılaştırması:** Oranlı çubuklar. Gelir %100, gider ve birikime aktarılanın gelire oranı | M | ✅ |
| FR-REP-003 | **Kategori bazında harcama analizi:** "En Çok Harcama Yapılanlar". Kategori, açıklama, tutar | M | ✅ |
| FR-REP-004 | **Birikim ilerlemesi:** Dönemde birikime aktarılan tutar | M | ✅ |
| FR-REP-005 | **Hedef bazında birikim ilerlemesi** (raporda her hedefin dönemlik değişimi) | S | ❌ |
| FR-REP-006 | **Geçmiş dönemlerle karşılaştırma:** Ay seçiciyle her ay ayrı görülebilir ✅. Önceki aya göre değişim (örn. "geçen aya göre giderler %12 arttı") ❌ | S | ◐ |
| FR-REP-007 | **Görsel paylaşım:** Paylaşım kartı (ay, net değişim, tasarruf oranı, gelir/gider, dağılım çubuğu, ilk 3 harcama) PNG olarak paylaşılır veya indirilir [Karar: D-11] | M | ✅ |
| FR-REP-008 | **PDF / Rapor Özeti İndir** | – | V1.1 [Karar: D-11] |
| FR-REP-009 | **Bütçe limiti aşım uyarısı:** Kategori limiti aşılmışsa veya %80 üzerindeyse raporda ve Kategori Yönetimi'nde uyarı [Karar: D-16] | S | ❌ |

**Boş durum:** Seçili ayda işlem yoksa metrikler 0 gösterilir, tasarruf oranı "–" gösterilir (BR-REP-003). Paylaş butonu devre dışı olur [Öneri].

---

## 9. Profil ve Ayarlar (FR-SET)

**Tasarım durumu:** ✅ Profil ve Ayarlar, Kategori Yönetimi, Kategori Ekle ve Düzenle.

| ID | Gereksinim | Öncelik | Tasarım |
|---|---|---|---|
| FR-SET-001 | **Profil kartı:** Avatar, ad, e-posta, senkronizasyon durumu ("Senkronize") | M | ✅ |
| FR-SET-002 | **Profil düzenleme:** Ad ve avatar | S | ❌ |
| FR-SET-003 | **Dil seçimi:** Türkçe (varsayılan) ve İngilizce. Seçim tüm arayüzü anında çevirir (UX-008) | M | ✅ satır / ❌ seçici |
| FR-SET-004 | **Para birimi:** V1'de yalnızca Türk Lirası (₺) [Karar: TECH_STACK §5.3]. Satır bilgi amaçlı gösterilir | M | ✅ |
| FR-SET-005 | **Haftanın ilk günü:** Takvim ve hafta hesaplarını etkiler. Varsayılan Pazartesi | S | ✅ |
| FR-SET-006 | **Hatırlatma tercihleri:** Uygulama içi hatırlatmalar aç/kapa, varsayılan ödeme ve görev hatırlatma zamanı, tüm gün kayıtların hatırlatma saati (varsayılan 09:00) [Karar: D-25, Q-6] | M | ◐ satır var, ekran ❌ |
| FR-SET-007 | **Bildirim ayarları:** V1'de uygulama içi bildirimler. Anlık (push) bildirim V1.1 [Karar: D-3] | M | ❌ |
| FR-SET-008 | **Kategori yönetimi:** "Harcama / Gelir" ve "Görev / Takvim" sekmeleri. Liste (ad, renk, kullanım sayısı). Ekle, düzenle, **arşivle** (kullanılmış kategori) veya **sil** (hiç kullanılmamış kategori), arşivden geri al (BR-CAT-002…005) | M | ✅ liste / ❌ arşiv |
| FR-SET-009 | **Kategori ekle/düzenle:** Canlı önizleme, tür, başlık, ikon, renk, aylık bütçe limiti, not | M | ✅ |
| FR-SET-010 | **Verileri yedekle ve dışa aktar:** JSON ve CSV (Excel uyumlu) [Karar: D-17] | S | ✅ satır |
| FR-SET-011 | **PIN / biyometrik kilit:** V1'de yok, satır gizlenir [Karar: D-4] | – | V1 dışı |
| FR-SET-012 | **Hakkında & Sürüm**, kullanım koşulları ve gizlilik metinleri. Metinler hukuki onay bekliyor [LB-01] | M | ✅ satır |
| FR-SET-013 | **Hesap ve oturum:** Çıkış yap, hesap silme (FR-AUTH-006, -007) | M | ◐ |
| FR-SET-014 | **Hesap menüsü** (header profil ikonu): Profil özeti, Profil ve Ayarlar bağlantısı, Çıkış Yap [Karar: RESPONSIVE #5] | S | ❌ |

### 9.1 Kategori validasyonları [Figma: Kategori Ekle]

| Alan | Zorunlu | Kural |
|---|---|---|
| Tür | ✔ [Figma "*"] | Gelir / Gider / Abonelik (finans kategorilerinde) |
| Başlık | ✔ [Figma "*"] | 1–40 karakter [Öneri]. Aynı türde aynı ad **tekrar edemez** (BR-DUP-003) |
| İkon | ✔ [Figma "*"] | Lucide kütüphanesinden seçilir (UX-004) |
| Renk | ✔ [Figma "*"] | Kategori paletinden biri (Teal, Blue, Violet, Pink, Orange, Amber, Green, Red, Slate) [DESIGN §2.6] |
| Aylık bütçe limiti | – | > 0. Yalnızca gider kategorilerinde [Öneri] |
| Not | – | ≤ 200 karakter |

**Arşivleme ve silme** [Karar: ürün sahibi onayı, Q-11b'nin yerine geçer]:
- **Kullanılmış kategori** (bağlı işlem, tekrarlayan ödeme/kural, görev veya randevu varsa) **silinmez, arşivlenir.** Onayda bağlı kayıt sayısı gösterilir ("42 işlem bu kategoride. Geçmiş kayıtlarda görünmeye devam edecek, yeni kayıtlarda seçilemeyecek").
- **Hiç kullanılmamış kategori** onayla kalıcı olarak silinir.
- Bir türün **son aktif** kategorisi arşivlenemez ve silinemez (BR-CAT-003).
- Arşivlenen kategoriler Kategori Yönetimi'nde ayrı bir "Arşivlenenler" bölümünde listelenir ve geri alınabilir.
- [Eksik tasarım] Arşivleme onayı ve "Arşivlenenler" bölümü (TD-30).

---

## 10. Hatırlatma ve Bildirim (FR-NTF)

| ID | Gereksinim | Öncelik | Tasarım |
|---|---|---|---|
| FR-NTF-001 | Hatırlatma zamanı gelince kayıt uygulama içi **Bildirimler** paneline düşer. Header'daki bildirim ikonunda okunmamış rozeti görünür [Karar: D-24] | M | ◐ ikon / ❌ panel |
| FR-NTF-002 | Panelde zamanı gelmiş ve yaklaşan hatırlatmalar ile vadesi yaklaşan ödemeler listelenir. Satıra tıklayınca kaydın detayı açılır | M | ❌ |
| FR-NTF-003 | Okundu işaretleme (tek tek ve "tümünü okundu yap") [Öneri] | S | ❌ |
| FR-NTF-004 | Anlık (push) bildirim | – | V1.1 [Karar: D-3] |
| FR-NTF-005 | Hatırlatma, ilişkili kayıt silinince veya tamamlanınca iptal olur (BR-REM-002) | M | – |

---

## 11. İş Kuralları (BR)

> **[Karar]** kesinleşmiş, **[Öneri]** onay bekleyen kurallardır. Açık sorular §16.3'te.

### 11.1 Bakiye

| ID | Kural | Durum |
|---|---|---|
| BR-BAL-001 | **Hesap bakiyesi** = açılış bakiyesi + gelirler − giderler ± aktarımlar. Bakiye kaydedilmez, her zaman işlemlerden hesaplanır | [Karar: D-13] |
| BR-BAL-002 | Bakiyeye yalnızca **gerçekleşmiş** işlemler (tarihi geçmiş veya bugün olan) etki eder. Gelecek tarihli gelir/gider, tarihi gelene kadar bakiyeyi etkilemez | [Öneri] |
| BR-BAL-003 | **Toplam Bakiye** = kullanıcının tüm (arşivlenmemiş) hesaplarının bakiyelerinin toplamı. **Birikim hesapları dahil değildir.** Figma'da Toplam Bakiye 24.850 ₺ Ana Hesap bakiyesine eşit, Toplam Birikim Varlığı (135.000 ₺) ayrı gösteriliyor | [Öneri, Figma verisine dayalı] |
| BR-BAL-004 | Kredi kartı hesabı v1'de diğer hesaplar gibi davranır. Limit ve borç mantığı yok. Bakiyesi negatif olabilir | [Karar: D-13] |
| BR-BAL-005 | Hesap bakiyesi negatife düşebilir. Engellenmez, uyarı gösterilir | [Karar: Q-14] |

### 11.2 Bekleyen ödemeler ve tekrarlayan kayıtlar

| ID | Kural | Durum |
|---|---|---|
| BR-PAY-001 | **Bekleyen ödemeler mevcut bakiyeyi etkilemez.** Yalnızca "Ödendi" olunca bakiyeden düşer | [Öneri] |
| BR-PAY-002 | "Ödendi olarak işaretle": ödeme **Ödendi** olur ve ödemenin hesabından, ödeme tutarında, ödeme tarihli bir **gider işlemi** oluşur. İşlem ödemeye bağlıdır | [Karar: TECH_STACK §4.1] |
| BR-PAY-003 | Ödendi işaretlenirken tutar ve tarih değiştirilebilir (örn. fatura beklenenden farklı geldi). Varsayılan tek dokunuş tutarı ve bugünü kullanır; "Tutarı düzenle" ile değiştirilir [Eksik tasarım] | [Karar: Q-16] |
| BR-PAY-004 | "Geri al" (5 sn) veya oluşan işlemin silinmesi ödemeyi **Bekliyor**'a döndürür | [Karar: D-18, Q-13] |
| BR-PAY-005 | Vadesi geçmiş ve ödenmemiş ödeme "Gecikmiş" olarak işaretlenir ve Yaklaşan Ödemeler'in başında gösterilir. Otomatik ödendi sayılmaz | [Öneri] |
| BR-REC-001 | Tekrarlayan ödeme kaydedilince ileriye dönük **3 aylık** ödeme kayıtları oluşturulur ve süre ilerledikçe yenilenir | [Karar: D-27] |
| BR-REC-002 | Ayın 29–31'i seçilmişse, o gün olmayan aylarda ayın **son günü** kullanılır | [Karar: D-27] |
| BR-REC-003 | Tekrarlayan **gelir/gider işlemleri** (Tekrar Eden İşlem) tarihi geldiğinde otomatik olarak **gerçekleşmiş işlem** olarak oluşur. Onay istenmez | [Karar: Q-17] |
| BR-REC-004 | Tekrar kuralının düzenlenmesi yalnızca **gelecekteki** örnekleri etkiler. Geçmiş işlemler ve ödenmiş ödemeler değişmez | [Öneri] |
| BR-REC-005 | Tekrarlayan görevler aynı kurallarla örnek üretir. Tamamlama örnek bazındadır | [Öneri] |

### 11.3 Birikim

| ID | Kural | Durum |
|---|---|---|
| BR-SAV-001 | Birikime para ekleme bir **aktarımdır:** kaynak hesap bakiyesi azalır, birikim hesabı bakiyesi aynı tutarda artar. **Gider sayılmaz** | [Karar: TECH_STACK §4.1] |
| BR-SAV-002 | Birikimden para çekme ters aktarımdır: birikim azalır, hedef hesap artar. **Gelir sayılmaz** | [Öneri] |
| BR-SAV-003 | Toplam Bakiye birikimleri içermediği için birikime aktarım **Toplam Bakiye'yi düşürür**, Toplam Birikim Varlığı'nı artırır | [Öneri, BR-BAL-003'e bağlı] |
| BR-SAV-004 | Adet/gram birimli birikimlere para eklerken miktar zorunlu, TL tutarı isteğe bağlıdır. TL girilirse kaynak hesaptan düşülür, girilmezse hesaplara dokunulmaz. Toplam Birikim Varlığı yalnızca TRY birimli hesapları toplar | [Karar: D-6, Q-18] |
| BR-SAV-005 | Tamamlanma yüzdesi = mevcut / hedef. %100'ü geçebilir, çubuk %100'de durur | [Öneri] |

### 11.4 Görevler

| ID | Kural | Durum |
|---|---|---|
| BR-TSK-001 | Tamamlanan görev ajandada "Tamamlandı" bölümüne geçer ve Ana Sayfa'daki "Bugün: n Görev" sayısından düşer. Bugünün Akışı'nda **tamamlandı görünümüyle** (soluk/üstü çizili) kalır | [Karar: Q-19] |
| BR-TSK-002 | Dashboard sayıları yalnızca **bugün** tarihli, tamamlanmamış görevleri sayar. Geçmiş tarihli tamamlanmamış görevler Bugünün Akışı'nın en üstünde "Gecikmiş" grubunda gösterilir | [Karar: Q-20] |
| BR-TSK-003 | Görevdeki "İlişkili / Planlanan harcama" **bilgi amaçlıdır.** Bakiyeyi ve raporları etkilemez, işlem oluşturmaz | [Öneri] |
| BR-TSK-004 | Görev tamamlanınca bekleyen hatırlatması iptal olur | [Öneri] |

### 11.5 Raporlar

| ID | Kural | Durum |
|---|---|---|
| BR-REP-001 | Raporlar seçili ayda (kullanıcının saat dilimine göre) **gerçekleşmiş** gelir ve gider işlemlerinden hesaplanır. Bekleyen ödemeler dahil değildir | [Öneri] |
| BR-REP-002 | Hesaplar arası aktarımlar ve birikim aktarımları gelir/gider **sayılmaz**. Birikime aktarılan tutar ayrı satırda gösterilir. Figma'da: Gelir 42.000, Gider 17.150, Birikime Aktarılan 8.500 ayrı | [Öneri, Figma verisine dayalı] |
| BR-REP-003 | Tasarruf oranı = (gelir − gider) / gelir. Figma: 24.850 / 42.000 = %59,2. Gelir 0 ise oran gösterilmez ("–") | [Karar: TECH_STACK §5.5] |
| BR-REP-004 | Gider oranı = gider / gelir (Figma: %40,8) | [Figma] |
| BR-REP-005 | Kategori analizi gider işlemlerini kategoriye göre toplar. Her işlemin kategorisi olduğu için "Kategorisiz" grubu yoktur | [Karar: Q-11] |

### 11.6 Düzenleme ve silme etkileri

| ID | Kural | Durum |
|---|---|---|
| BR-EDIT-001 | Bir işlemin düzenlenmesi veya silinmesi bakiyeleri ve **ilgili tüm dönemlerin** raporlarını anında yeniden hesaplar. Geçmiş raporlar "dondurulmaz" | [Öneri] |
| BR-EDIT-002 | Daha önce paylaşılmış rapor görselleri değişmez (statik görsellerdir) | [Karar: D-11] |
| BR-EDIT-003 | Silme kalıcıdır, çöp kutusu yoktur. Tek dokunuşluk aksiyonlarda 5 sn "Geri al" vardır, silmede yoktur (onaylıdır) | [Karar: D-10, D-18] |
| BR-CAT-001 | Kategori düzenlenince (ad, renk, ikon) bağlı tüm kayıtlarda yeni hali görünür | [Öneri] |
| BR-CAT-002 | **Kullanılmış kategori silinmez, arşivlenir.** "Kullanılmış" = en az bir işlem, tekrarlayan ödeme/kural, görev veya randevu kaydına bağlı. Arşivlenen kategori: (a) geçmiş kayıtlarda adı, ikonu ve rengiyle görünmeye devam eder; (b) raporlarda ve kategori analizinde yer almaya devam eder; (c) **yeni kayıt formlarında sunulmaz**; (d) bütçe limiti uyarısı üretmez. Görev/Takvim kategorileri için de aynı kural geçerlidir | [Karar: ürün sahibi onayı; Q-11b'nin yerine geçer] |
| BR-CAT-003 | Bir işlem türünün (gelir, gider, abonelik) **son aktif** kategorisi silinemez ve arşivlenemez, çünkü o türde kayıt girişi kategori gerektirir (Q-11) | [Karar: ürün sahibi onayı] |
| BR-CAT-004 | Hiç kullanılmamış kategori, onay alınarak kalıcı olarak silinebilir | [Karar] |
| BR-CAT-005 | Arşivlenen kategori Kategori Yönetimi'ndeki "Arşivlenenler" bölümünden geri alınabilir. Geri alınınca yeniden seçilebilir. Aynı türde aynı adlı aktif kategori varsa önce yeniden adlandırma istenir | [Öneri] |
| BR-CAT-006 | **Arşivli kategorili mevcut kayıtlar:** Düzenlenirken mevcut kategori korunabilir, ancak başka arşivli kategori seçilemez | [Öneri] |
| BR-CAT-007 | **Arşivli kategoriyi kullanan aktif tekrarlayan kayıtlar** (abonelik, tekrar eden işlem/görev): Arşivleme onayında sayıları gösterilir ve kullanıcı uyarılır. Tekrar kuralları mevcut kategoriyle örnek üretmeye devam eder. Kullanıcı kuralı düzenleyerek aktif bir kategoriye geçebilir | [Öneri] |
| BR-CAT-008 | **Filtrelerde** (İşlemler kategori filtresi) arşivli kategori yalnızca seçili dönemde kaydı varsa "Arşivlendi" etiketiyle görünür | [Öneri] |
| BR-ACC-001 | İşlemi olan hesap silinemez, yalnızca **arşivlenebilir.** Arşivli hesap yeni işlemlerde seçilemez, geçmiş işlemlerde görünür | [Karar: Q-10] |

### 11.7 Tarih ve saat

| ID | Kural | Durum |
|---|---|---|
| BR-TIME-001 | Tüm "bugün", ay ve hafta sınırları kullanıcının saat dilimine göre hesaplanır. Varsayılan Europe/Istanbul | [Karar: TECH_STACK §5.4] |
| BR-TIME-002 | Yalnızca tarih taşıyan alanlar (vade, açılış tarihi) saat dilimi dönüşümünden etkilenmez | [Karar] |
| BR-TIME-003 | Haftanın ilk günü ayardan gelir (varsayılan Pazartesi) | [Karar: FR-SET-005] |
| BR-TIME-004 | Saat dilimi cihazdan otomatik alınır ve farklı bir cihazdan girişte güncellenir. Ayarlarda ayrı seçim yoktur | [Karar: Q-21] |
| BR-TIME-005 | Biçimler dile göre değişir. TR: "16 Mayıs Perşembe", "24.850,00 ₺". EN: "₺24,850.00", "Thursday, May 16". Para birimi her iki dilde TRY | [Karar: Q-22] |

### 11.8 Mükerrer kayıt önleme

| ID | Kural | Durum |
|---|---|---|
| BR-DUP-001 | Bir formun art arda gönderilmesi (çift tıklama, ağ tekrarı) **tek kayıt** oluşturur | [Öneri] |
| BR-DUP-002 | Bir tekrar kuralı aynı tarih için **en fazla bir** örnek üretir. Bir ödeme en fazla bir kez "Ödendi" olabilir ve tek bir gider işlemi oluşturur | [Öneri] |
| BR-DUP-003 | Aynı kullanıcıda aynı türde aynı adlı ikinci kategori oluşturulamaz | [Öneri] |
| BR-DUP-004 | Aynı gün, aynı tutar ve aynı başlıkla ikinci işlem girilirken "Benzer bir işlem zaten var" uyarısı gösterilir. Kullanıcı yine de kaydedebilir | [Öneri, C] |

### 11.9 Hatırlatmalar

| ID | Kural | Durum |
|---|---|---|
| BR-REM-001 | Hatırlatma zamanı geçmişte kalan bir kayıt oluşturulursa hatırlatma oluşturulmaz | [Öneri] |
| BR-REM-002 | Kayıt silinir, tamamlanır veya ödenirse bekleyen hatırlatması iptal olur. Kayıt zamanı değişirse hatırlatma yeniden hesaplanır | [Öneri] |

---

## 12. Veri Modeli (DM)

> Bu bölüm **kavramsal** modeldir. Fiziksel tablo yapısı TECH_STACK.md §5'tedir. İki model arasındaki farklar her varlıkta belirtilir.

### 12.1 Genel sahiplik kuralı
- **DM-000:** User dışındaki **her** varlık tek bir kullanıcıya aittir (`owner = User`).
  - Bir kullanıcı yalnızca kendi kayıtlarını görebilir, oluşturabilir, değiştirebilir ve silebilir.
  - Varlıklar arası her ilişki **aynı kullanıcının** kayıtları arasında kurulabilir. Örn. bir işlem başkasının kategorisine bağlanamaz.
  - Paylaşım veya ortak hesap V1'de yok.

### 12.2 Varlıklar

| ID | Varlık | Temel alanlar | İlişkiler | Not |
|---|---|---|---|---|
| DM-001 | **User** | id, ad, e-posta, avatar, dil (tr/en), saat dilimi, para birimi (TRY), haftanın ilk günü, varsayılan hatırlatma tercihleri, onay kayıtları (koşullar sürümü, tarih) | Tüm varlıkların sahibi | Kimlik bilgisi kimlik sağlayıcıda; profil ve tercihler ayrı tutulur |
| DM-002 | **Account** | ad, tür (nakit / banka / kredi kartı), son 4 hane, açılış bakiyesi, para birimi, varsayılan mı, arşivli mi | 1 User → N Account; 1 Account → N Transaction | Bakiye hesaplanır (BR-BAL-001) |
| DM-003 | **Category** | kapsam (finans / takvim), tür (gelir / gider / abonelik), ad, ikon (Lucide adı), renk (kategori paleti), aylık bütçe limiti, not, arşiv tarihi | 1 User → N Category; Transaction, RecurringRule, Task ve Appointment'a bağlanır (isteğe bağlı) | Ad, kapsam ve tür içinde **aktif kategoriler arasında** benzersiz. Kullanılmış kategori arşivlenir, silinmez (BR-CAT-002) |
| DM-004 | **Transaction** | tür (gelir / gider / aktarım), başlık, tutar, para birimi, tarih-saat, hesap, karşı hesap (aktarımda), kategori, not, mağaza/konum, kaynak (elle / tekrar / ödeme / birikim) | N → 1 Account; N → 1 Category; 0..1 → Payment; 0..1 → RecurringRule; 0..N → Attachment | Tutar her zaman pozitif, yön türden gelir |
| DM-005 | **RecurringRule** | ne üretir (işlem / ödeme / görev / randevu / birikim katkısı), şablon (başlık, tutar, kategori, hesap), sıklık, aralık, ayın günü / haftanın günü, başlangıç, bitiş, aktif mi | 1 → N üretilmiş örnek | "Abonelik" (tekrarlayan ödeme) bu kuralın ödeme üreten türüdür |
| DM-006 | **Payment** *(ödeme örneği)* | vade tarihi, tutar, durum (bekliyor / ödendi / atlandı), ödenme zamanı | N → 1 RecurringRule; 0..1 → Transaction | Bu PRD'nin listesinde yok ama "bekleyen/tamamlanan ödeme" gereksinimi için **gerekli** [Öneri] |
| DM-007 | **Task** | başlık, açıklama, öncelik, kategori, tarih, saat / tüm gün, süre, konum adı, adres, not, planlanan harcama, durum (açık / tamamlandı), tamamlanma zamanı | N → 1 Category; 0..1 → RecurringRule; 0..N → Reminder | |
| DM-008 | **Appointment** | Task ile aynı alanlar (öncelik hariç [Öneri]), katılımcı/kişi metni ("Dr. Selin Yıldız" [Figma]) | Task ile aynı | TECH_STACK'te Task ve Appointment **tek tabloda** (`kind`) [D-14]. Kavramsal ayrım korunur |
| DM-009 | **Reminder** | hedef kayıt (görev / randevu / ödeme), tetiklenme zamanı veya göreli süre, kanal (uygulama içi; V1.1 push), durum (bekliyor / tetiklendi / iptal) | N → 1 hedef kayıt | |
| DM-010 | **SavingsGoal** *(birikim hesabı)* | başlık, tür, birim, saklama kurumu, hedef tutar, hedef tarihi (FR-SAV-010), açılış tarihi, durum (aktif / kapalı), not | 1 → N SavingsMovement | Pages'ta "Birikim Hesabı". TECH_STACK'te `savings_accounts` |
| DM-011 | **SavingsMovement** | yön (ekleme / çekme), tutar / miktar, tarih, kaynak/hedef hesap | N → 1 SavingsGoal; 0..1 → Account | Bu PRD'nin listesinde yok, "Geçmiş Hareketler" için **gerekli** [Öneri] |
| DM-012 | **Notification** | tür (hatırlatma / ödeme vadesi / bütçe uyarısı), başlık, ilgili kayıt, oluşma zamanı, okunma zamanı | N → 1 User; 0..1 → Reminder; 0..1 → ilgili kayıt | Uygulama içi bildirim paneli (FR-NTF) |
| DM-013 | **Attachment** | dosya adı, tür, boyut, saklama yolu | N → 1 Transaction | Fiş / Belge [Figma] |

### 12.3 İlişki özeti
```
User ─┬─< Account ──────────< Transaction >──── Category
      ├─< Category                 │  └──< Attachment
      ├─< RecurringRule ──< Payment ┘ (ödendiğinde 1 Transaction)
      │        └───────────< Task / Appointment (tekrarlayan örnekler)
      ├─< Task / Appointment ──< Reminder
      ├─< SavingsGoal ──< SavingsMovement >── Account
      └─< Notification
```

### 12.4 RLS gereksinimleri
| ID | Gereksinim |
|---|---|
| NFR-SEC-RLS-001 | Kullanıcı verisi tutan **her** tabloda satır düzeyi güvenlik zorunludur. Politika tanımlanmamış tabloya erişim reddedilir |
| NFR-SEC-RLS-002 | Okuma, ekleme, güncelleme ve silme yalnızca satırın sahibi olan kullanıcıya izinlidir |
| NFR-SEC-RLS-003 | Bir kayıt başka bir kullanıcıya devredilemez (sahip alanı güncellenemez) |
| NFR-SEC-RLS-004 | İlişkili kayıtlar (hesap, kategori, ödeme, birikim) aynı kullanıcıya ait olmak zorundadır |
| NFR-SEC-RLS-005 | Dosyalar (fiş, avatar) yalnızca sahibine, süreli bağlantıyla açılır |
| NFR-SEC-RLS-006 | Her tablo için "başka kullanıcının verisine erişemez" testi yayından önce geçmelidir |

Uygulama yöntemi: TECH_STACK.md §6.

---

## 13. Kullanıcı Deneyimi ve Tasarım Kuralları (UX)

| ID | Kural | Öncelik |
|---|---|---|
| UX-001 | **Tasarım sistemi:** [DESIGN.md](DESIGN.md) ana referanstır. Renk, tipografi, boşluk, radius, gölge ve component kuralları oradan alınır | M |
| UX-002 | **Responsive:** [RESPONSIVE.md](RESPONSIVE.md) ana kaynaktır. Mobil alt nav, tablet rail, masaüstü sidebar; formlar drawer'da, detaylar drawer/panelde | M |
| UX-003 | **İkonlar:** Yalnızca **Lucide** ikonları, DESIGN.md §7 boyut ve kullanım kurallarıyla kullanılır | M |
| UX-004 | **İkon seçimi** (Kategori Ekle "İkon Seçimi"): Seçenekler Lucide kütüphanesinden gelir. Kullanıcıya 40–60 ikonluk küratörlü bir set sunulur; liste DESIGN.md'ye eklenir [Karar: Q-23] | M |
| UX-005 | **Geçici ikonlar:** Figma'daki ekranlarda kullanılan ikonlar örnek amaçlıdır ve nihai referans değildir. Kavram–ikon eşleşmesi DESIGN.md §7.3 tablosundan gelir. Tabloda olmayan bir kavram için ikon, tablo güncellenerek belirlenir | M |
| UX-006 | **İkon tutarlılığı:** Aynı işlev uygulama genelinde tek ikonla temsil edilir. Örn. silme her yerde `trash`, düzenleme `pencil` | M |
| UX-007 | **Dil:** Türkçe varsayılan dildir | M |
| UX-008 | **İngilizce:** İngilizce seçildiğinde **tüm** arayüz metinleri çevrilir: menüler, butonlar, boş durumlar, hata mesajları, toast'lar, varsayılan kategori adları (kullanıcı adını değiştirmediyse) [Karar: Q-24], tarih ve sayı biçimleri [Q-22]. Kullanıcının girdiği içerik çevrilmez | M |
| UX-009 | **Dark mode:** V1'de yok. Renk kullanımı tema değişimine uygun token yapısıyla yapılır [Karar: DESIGN §2.1] | M |
| UX-010 | **Silme onayı:** Her silmede zorunlu. Kayıt adı ve sonucu yazılır. "Vazgeç" (Tertiary) ve "Sil" (Destructive) [Karar: #7, Ç-5] | M |
| UX-011 | **Geri bildirim:** Başarılı işlemlerde toast (4 sn). Tamamla ve ödendi işaretle için 5 sn "Geri al" [Karar: D-18] | M |
| UX-012 | **Form doğrulama:** Blur ve gönderimde doğrulanır. Alan altında mesaj, üstte özet, ilk hatalı alana odak [Karar: DESIGN §9.4] | M |
| UX-013 | **Boş durumlar:** Pages'taki "Birikimler – Boş" kalıbıyla (başlık + açıklama + aksiyon) [Karar: RESPONSIVE §8.2.6] | M |
| UX-014 | **Para biçimi:** "+42.000,00 ₺" / "−17.150,00 ₺". Gelir `status.success`, gider `status.danger` rengi | M |
| UX-015 | **Erişilebilirlik:** WCAG 2.2 AA kontrast, klavye ile tam kullanım, görünür odak halkası, en az 44 px dokunma alanı [DESIGN §9] | M |
| UX-016 | **Yükleniyor durumları:** Listelerde skeleton, butonlarda spinner [DESIGN §9.3] | S |

---

## 14. V1 Dışı Konular

| Konu | Not |
|---|---|
| iOS uygulaması | İleride Expo ile [D-28a] |
| Android uygulaması | İleride Expo ile [D-28a] |
| Banka entegrasyonu, otomatik hesap hareketi çekme | Tüm veriler elle girilir |
| Gerçek para transferi veya ödeme alma | "Hemen öde" kaldırıldı [D-5] |
| Abonelik ve ücretli üyelik sistemi | Uygulamadaki "Abonelik" sekmesi bununla ilgili değildir (§6) |
| Monetizasyon | |
| Dark mode | |
| Face ID / biyometrik uygulama kilidi | PIN kilidi de V1'de yok [D-4] |
| Sosyal giriş (Google, Apple) | [D-1] |
| Anlık (push) bildirim | V1.1 [D-3] |
| PDF rapor, XLSX dışa aktarma | V1.1 [D-11, D-17] |
| Çevrimdışı veri girişi | V1 bağlantı gerektirir [D-7] |
| Altın/döviz için güncel TL karşılığı | [D-6] |
| TRY dışında para birimi | |
| Paylaşılan / aile hesapları | |

---

## 15. Güvenlik ve Teknik Gereksinimler (NFR)

| ID | Gereksinim | Öncelik |
|---|---|---|
| NFR-SEC-001 | Kimlik doğrulama Supabase Auth ile yapılır. Oturum olmadan uygulama verisine erişilemez | M |
| NFR-SEC-002 | Kullanıcı verileri birbirinden tamamen izoledir (§12.4) | M |
| NFR-SEC-003 | Tüm girdiler hem istemcide hem sunucu/veritabanı tarafında doğrulanır. İstemci doğrulaması tek başına yeterli sayılmaz | M |
| NFR-SEC-004 | Hata mesajları kullanıcıya anlaşılır gösterilir. Teknik ayrıntı ve kişisel veri loglarda/hata izleme sisteminde yer almaz | M |
| NFR-SEC-005 | Veriler AB bölgesinde barındırılır [Karar: D-21]. **AB bölgesi seçimi tek başına KVKK uyumu sağlamaz** (TECH_STACK §13.7). KVKK aydınlatma metni, açık rıza ve diğer hukuki metinler **henüz hukuki onay almadı**; hukuk uzmanı onayı yayın engelidir (LB-01, §1.8) | M |
| NFR-SEC-006 | Geliştirme ve test ortamlarında **gerçek kullanıcı verisi kullanılmaz.** Staging ve production kesin olarak ayrıdır; production verisi başka ortama kopyalanmaz (TECH_STACK §13.2, §13.6) | M |
| NFR-RT-001 | **Gerçek zamanlı güncelleme:** İşlemler, ödemeler, görevler/randevular ve birikimler, aynı kullanıcının başka cihaz veya sekmede yaptığı değişikliklerle sayfa yenilemeden güncellenir [Karar: TECH_STACK §4.5] | S |
| NFR-RT-002 | Kategoriler, ayarlar ve raporlar gerçek zamanlı değildir. Ekran yeniden açıldığında güncellenir | – |
| NFR-ARCH-001 | İş kuralları (bakiye, ödendi işaretleme, birikim aktarımı, tekrar üretimi, rapor hesapları) istemciden bağımsız olarak backend'de tanımlanır. Gelecekteki mobil istemci aynı kuralları yeniden yazmadan kullanabilir [Karar: TECH_STACK §4.1, §10] | M |
| NFR-ARCH-002 | Veri modeli değişiklikleri geriye uyumlu yapılır | M |
| NFR-PERF-001 | Kritik ekranlar mobil, yavaş 4G koşulunda 2 sn'nin altında kullanılabilir olur. Ölçüm ve doğrulama: AC-07 (§1.6) | M |
| NFR-PWA-001 | Uygulama ana ekrana eklenebilir. Tema rengi `#0F766E`, arka plan `#F8FAFC` [Karar: #14] | M |
| NFR-I18N-001 | Tüm arayüz metinleri çeviri anahtarlarıyla yönetilir. TR ve EN eksiksiz olmadan yayın yapılmaz | M |

---

## 16. Kararlar ve Varsayımlar

### 16.1 Bu PRD'nin dayandığı kesin kararlar
- **RESPONSIVE.md §7:** 14 karar (#1–#14).
- **TECH_STACK.md §12:** Karar Kaydı (D-1–D-30).
- **DESIGN.md §11.1:** Ç-1–Ç-13.
- **Bu PRD'nin kapsam tanımı:** V1 modülleri, TR + EN dil desteği (TECH_STACK D-31), V1 dışı liste.
- **§16.3:** Ürün kararları Q-1–Q-24 (+ Q-11b).

### 16.2 Varsayımlar
| # | Varsayım |
|---|---|
| V-1 | Hedef kullanıcı Türkiye'deki bireysel kullanıcıdır, TRY kullanır, verisini elle girer |
| V-2 | ~~"Etkinlik" randevu ile aynıdır~~ → Q-5 ile karara dönüştü |
| V-3 | "Birikim hedefi" = hedefi olan bir birikim hesabıdır (bir hesap, bir hedef) |
| V-4 | "Haritada aç" dış harita uygulamasını/sitesini açar, uygulama içi harita yoktur |
| V-5 | Toplam Bakiye birikim hesaplarını içermez (Figma'daki örnek rakamlara dayanır) |
| V-6 | Bekleyen ödemeler ve gelecek tarihli işlemler bakiyeyi etkilemez |
| V-7 | Raporlar yalnızca gerçekleşmiş işlemlerden hesaplanır, aktarımlar gelir/gider değildir |
| V-8 | Kimlik doğrulama hızı sınırı ve kilit davranışı sağlayıcının varsayılanlarıyla yeterlidir |

### 16.3 Ürün kararları (eski açık sorular)

Tüm sorular kapsam sahibiyle tek tek değerlendirildi. Q-11 dışında önerilen seçenek kabul edildi.

| # | Soru | Karar |
|---|---|---|
| Q-1 | Yaklaşan Ödemeler kaç günü kapsar? | Gecikmiş (en üstte) + önümüzdeki 7 gün |
| Q-2 | Ana Sayfa'da hangi birikim hedefi gösterilir? | Kullanıcının "Ana Sayfa'da göster" seçimi; yoksa tamamlanmaya en yakın aktif hedef. Seçim kontrolü [Eksik tasarım] |
| Q-3 | Haftalık özet | Ana Sayfa'da Bugünün Akışı'nın altında kompakt kart: tamamlanan/toplam görev, haftanın geliri-gideri-neti, bu haftaki ödemeler. Should Have, [Eksik tasarım] |
| Q-4 | Randevular tamamlanabilir mi? | Evet, görevle aynı |
| Q-5 | "Etkinlik" ayrı bir tür mü? | Hayır, randevu ile aynı. Takvimde üç tür kalır |
| Q-6 | Tüm gün kayıtlarda hatırlatma | Gün başında sabit saat (varsayılan 09:00): o gün / 1 gün önce / 1 hafta önce |
| Q-7 | Tekrarlayan kaydı düzenleme/silme kapsamı | "Yalnızca bu" / "Bu ve sonrakiler". Geçmiş örnekler değişmez |
| Q-8 | Tek seferlik ileri tarihli ödeme | V1'de var. Abonelik formunda "Tekrarlama yok" seçeneği. FR-FIN-004 Must Have'e yükseldi |
| Q-9 | Header araması | Global arama: işlem, görev, randevu, ödeme, birikim; türe göre gruplu. Should Have, [Eksik tasarım] |
| Q-10 | Hesap yönetimi | Profil → "Hesaplarım": liste + ekle / düzenle / arşivle. [Eksik tasarım] |
| Q-11 | İşlemde kategori zorunlu mu? | **Evet, zorunlu** (önerinin aksine). Figma'daki Kategori Seçimi'ne "*" eklenmeli. "Kategorisiz" grubu yok |
| Q-11b | Kategori silinince bağlı işlemler | ~~Silme onayında taşıma~~ → **Revize edildi:** Kullanılmış kategori arşivlenir, geçmiş kayıtlarda korunur, yeni kayıtlarda sunulmaz. Kullanılmamış kategori silinir (BR-CAT-002…008) |
| Q-12 | Tekrar sıklığı seçenekleri | Günlük, Haftalık, Aylık, Yıllık (+ "Tekrarlama yok", Q-8) |
| Q-13 | Ödendi ile oluşan gider silinirse | Ödeme Bekliyor'a döner, onayda belirtilir |
| Q-14 | Hesap bakiyesi negatife düşebilir mi? | Evet, uyarıyla |
| Q-15 | Bakiyeli birikim hesabı kapatılırken | Aktarılacak hesap sorulur (varsayılan Ana Hesap); "aktarmadan kapat" seçilebilir |
| Q-16 | Ödendi işaretlerken tutar/tarih değişir mi? | Evet, isteğe bağlı "Tutarı düzenle". [Eksik tasarım] |
| Q-17 | Tekrarlayan gelir/gider | Tarihi gelince otomatik gerçekleşir |
| Q-18 | Adet/gram birikime ekleme | Miktar zorunlu, TL isteğe bağlı. TL girilirse kaynak hesaptan düşülür |
| Q-19 | Tamamlanan görev Bugünün Akışı'nda | Tamamlandı görünümüyle kalır |
| Q-20 | Gecikmiş görevler | Bugünün Akışı'nın en üstünde "Gecikmiş" grubu |
| Q-21 | Saat dilimi | Cihazdan otomatik, ayar yok |
| Q-22 | İngilizce'de para ve tarih biçimi | Dile göre biçim: EN "₺24,850.00", "Thursday, May 16". Para birimi TRY |
| Q-23 | Kategori ikon seçimi | 40–60 ikonluk küratörlü Lucide seti. Liste DESIGN.md'ye eklenecek |
| Q-24 | Varsayılan kategori adlarının çevirisi | Evet, kullanıcı adını değiştirmediyse |

**Bu kararlarla doğan tasarım işleri** (RESPONSIVE §8'e eklenmeli, bkz. §18 U-3):
- Kategori Seçimi'ne "*" (Q-11)
- Kategori arşivleme onayı ve "Arşivlenenler" bölümü (BR-CAT-002, BR-CAT-005)
- "Tekrarlama yok" seçeneği (Q-8)
- Hesaplarım ekranı (Q-10)
- Global arama sonuçları (Q-9)
- Haftalık özet kartı (Q-3)
- "Ana Sayfa'da göster" kontrolü (Q-2)
- "Tutarı düzenle" sheet/popover'ı (Q-16)
- Bugünün Akışı'nda "Gecikmiş" grubu ve tamamlandı görünümü (Q-19, Q-20)
- Birikim kapatmada aktarım seçimi (Q-15)

---

## 17. Tasarım Bekleyen Gereksinimler (özet)

> Aşağıdaki "✖ yeni" satırların tamamı RESPONSIVE.md §8.1'e (#21–#41) eklendi. Tasarım işlerinin güncel takibi ve sınıflandırması **§19**'dadır.

Pages/Components'ta karşılığı olmayan veya eksik olan gereksinimler:

| Gereksinim | ID | RESPONSIVE §8'de var mı? |
|---|---|---|
| Auth ekranları, hesap silme | FR-AUTH-001…007 | ✔ §8.2.8 |
| Görev / Randevu formu | FR-CAL-005/006 | ✔ §8.2.1 |
| Günlük görünüm | FR-CAL-003 | ✔ §8.2.2 |
| Silme onayı | UX-010 | ✔ §8.2.3 |
| Bildirimler paneli | FR-NTF-001/002 | ✔ §8.2.9 |
| Hatırlatma Ayarları | FR-SET-006 | ✔ §8.2.5 |
| Hesap menüsü | FR-SET-014 | ✔ §8.2.4 |
| **Haftalık özet** | FR-DSH-011 | ✖ **yeni** |
| **Yaklaşan etkinlikler satırı** | FR-DSH-010 | ✖ **yeni** |
| **Tekrarlayan görevler** | FR-CAL-012 | ✖ **yeni** |
| **Hesap yönetimi** | FR-FIN-021 | ✖ **yeni** |
| **Hesaplar arası aktarım** | FR-FIN-020 | ✖ **yeni** |
| **Tek seferlik ödeme** | FR-FIN-004 | ✖ **yeni** |
| **Tekrarlayan ödemeyi duraklatma** | FR-FIN-019 | ✖ **yeni** |
| **Para ekle / çek akışı** | FR-SAV-005/006 | ✖ **yeni** (buton var) |
| **Birikim hedef tarihi** | FR-SAV-010 | ✖ **yeni** |
| **Geçmiş dönemle karşılaştırma** | FR-REP-006 | ✖ **yeni** |
| **Profil düzenleme** | FR-SET-002 | ✖ **yeni** |
| **Dil seçici** | FR-SET-003 | ✖ **yeni** |
| Fiş ve konum giriş alanları | FR-FIN-013/014 | ✖ **yeni** |
| Bütçe uyarısı | FR-REP-009 | ✔ §8.2.10 |

---

## 18. Diğer Dokümanlarla Uyumluluk

| # | Konu | Durum | Gerekli işlem |
|---|---|---|---|
| U-1 | **Dil:** V1'de TR + EN | ✅ **Çözüldü** | TECH_STACK D-31 (D-20'nin revizyonu), §1.2 ve sürüm planı güncellendi |
| U-2 | **Mobil platform:** İleride Expo ile iOS + Android | ✅ **Çözüldü** | TECH_STACK D-28a. PRD §1.5 ve §14 güncellendi |
| U-3 | Bu PRD'deki yeni gereksinimler ve §16.3 kararlarından doğan tasarım işleri | ✅ **Çözüldü** | RESPONSIVE Sürüm 6: §8.1 #21–#41, sunum kuralları §8.2.11 |
| U-4 | Task / Appointment kavramsal olarak ayrı, TECH_STACK'te tek tablo | Uyumlu | Bilinçli fark, belgelendi (DM-008) |
| U-5 | SavingsGoal (PRD) ↔ savings_accounts (TECH_STACK) ↔ "Birikim Hesabı" (Figma) | Uyumlu | Adlandırma farkı, belgelendi (DM-010) |
| U-6 | Notification varlığı | ✅ **Çözüldü** | TECH_STACK Sürüm 2.3: `notifications` tablosu (çeviri anahtarlı başlık) |
| U-7 | Hesap yönetimi, aktarım, hedef tarihi ve §16.3 kararlarının veri karşılıkları | ✅ **Çözüldü** | TECH_STACK Sürüm 2.3, §5.2 / §5.4 / §5.6 ve §4.1 RPC listesi: `archived_at`, `counter_account_id`, `target_date`, `show_on_dashboard`, `paid_amount_minor`, kategori NOT NULL, tek seferlik ödeme, birikim miktarı + isteğe bağlı TL tutarı, `language`, `delete_category`, `close_savings_account`, `transfer_between_accounts` |
| U-8 | Bakiye, ödendi işaretleme, birikim aktarımı, tekrar ve rapor kuralları | Uyumlu | BR bölümü TECH_STACK §4–5 ile tutarlı |
| U-9 | Görsel ve responsive kurallar (UX-001…016) | Uyumlu | DESIGN ve RESPONSIVE referans alındı |
| U-10 | V1 dışı liste | Uyumlu | TECH_STACK sürüm planıyla aynı |
| U-11 | Dile bağlı para/tarih biçimi (Q-22) DESIGN, RESPONSIVE ve TECH_STACK'te yalnızca `tr-TR` geçiyordu | ✅ **Çözüldü** | DESIGN §1.3, §3.2 · RESPONSIVE §9.5 · TECH_STACK §3.4 |
| U-12 | Tüm gün hatırlatma saati (Q-6) Hatırlatma Ayarları içeriğinde yoktu | ✅ **Çözüldü** | RESPONSIVE §8.2.5 · TECH_STACK D-25 · PRD FR-SET-006 |
| U-13 | TECH_STACK'te hukuki altyapı "hazır" olarak ifade ediliyordu | ✅ **Çözüldü** | TECH_STACK §6.6 ve R5: metinler onaysız, yayın engeli (LB-01) |
| U-14 | Kabul kriterlerinin (AC-02, AC-04, AC-07) CI/test karşılığı | ✅ **Çözüldü** | TECH_STACK §9.2 adım 7–8 |
| U-15 | V1 kapsamının tek kaynağı | ✅ **Çözüldü** | TECH_STACK §12.1 PRD'ye referans veriyor |

---

## 19. Tasarım İşleri Takibi

> **Durum:** Aşağıdaki işlerin **hiçbiri tamamlanmadı.** Figma'da değişiklik yapılmadı.
> - **TD-01…TD-41:** RESPONSIVE.md §8.1'deki eksik öğeler (aynı numaralarla)
> - **TD-F1…TD-F9:** DESIGN.md §11.1'deki Figma güncellemeleri (TD-F8'e kadar) ve DESIGN §9.2.1 chip renkleri (TD-F9)
>
> Bir iş, ancak Figma'da tasarlanıp ürün sahibince onaylandığında "tamamlandı" sayılır.

### 19.1 Sınıflar

| Sınıf | Anlamı |
|---|---|
| **A – Figma önce** | Geliştirmeye başlanmadan Figma'da tasarlanmalı. Kurallar dokümanlarda var, ancak yerleşim yeni ve karmaşık; tasarım olmadan yapılırsa yeniden iş riski yüksek |
| **B – Sistemle geliştir** | Mevcut tasarım sistemi (DESIGN.md) ve RESPONSIVE.md önerileriyle geliştirme sırasında uygulanabilir. Figma daha sonra koda göre güncellenir veya paralel tasarlanır. Tasarım gelince küçük görsel düzeltmeler beklenir |
| **C – Sonraya bırakılabilir** | Should/Could öncelikli. V1 kabulünü engellemez, V1.x iyileştirmesine kalabilir |

### 19.2 Geliştirmeyi engelleyenler ve geçici geliştirme kuralı
- **Mobil (390 px) geliştirmeyi engelleyen bir tasarım işi yoktur.** Mobil ekranların tamamı ya Pages'ta var ya da B sınıfıdır.
- **A sınıfı işler** (tablet ve masaüstü yerleşimi):

| İş | Kapsam |
|---|---|
| **TD-11** Rail ve Sidebar navigasyon varyantları | Tablet ve üstü AppShell. Her ekranı etkiler |
| **TD-14** Tablet / laptop / desktop referans frame'leri | Ana Sayfa grid'i, Takvim aylık (yan ajanda) ve haftalık (7 gün ızgara), İşlemler master-detail |

**[Karar – ürün sahibi onayı] Geçici geliştirme izni:** Tablet ve masaüstü geliştirmesi, TD-11 ve TD-14 tamamlanmayı beklemeden **RESPONSIVE.md kurallarıyla** başlar. Bu nedenle A sınıfı işler artık geliştirmeyi **engellemez.** Kurallar:

1. **Uydurma tasarım yapılmaz.** Yalnızca RESPONSIVE.md'de yazılı yerleşimler (grid sütunları, nav genişlikleri, drawer/panel ölçüleri, breakpoint davranışları), DESIGN.md token'ları ve mevcut Pages/Components bileşenleri kullanılır.
2. **Dokümanda karşılığı olmayan bir detayla karşılaşılırsa** (örn. sidebar'da bir öğenin tam ikon/metin hizası) kendiliğinden karar verilmez:
   - Mevcut mobil bileşenin en yakın kullanımı aynen uygulanır (ör. `Nav Bar Buttons` görünümü).
   - Kod içinde ve §19.2.1'deki listede "tasarım bekliyor" olarak işaretlenir.
3. **Mobil davranış referanstır.** Tablet ve masaüstünde yeni bir görsel öğe, renk, gölge veya etkileşim eklenmez.
4. **Tasarım geldiğinde** uygulama TD-11 / TD-14 tasarımıyla karşılaştırılır, farklar düzeltilir.
5. **Yayın öncesi (LB-03):** Ya TD-11 / TD-14 Figma'da tasarlanıp onaylanır ya da ürün sahibi RESPONSIVE.md kurallarıyla yapılmış uygulamayı açıkça onaylar.

#### 19.2.1 Geçici uygulama sırasında "tasarım bekliyor" olarak işaretlenen detaylar
Geliştirme sırasında doldurulur. Başlangıçta boştur.

| # | Ekran / bileşen | Detay | Uygulanan geçici çözüm | Tarih |
|---|---|---|---|---|
| – | – | – | – | – |

### 19.3 RESPONSIVE.md §8.1 eksik öğeleri

| TD | Öğe | PRD | Sınıf | Engeller mi |
|---|---|---|---|---|
| TD-01 | Görev / Randevu Ekle formu | FR-CAL-005/006 | B | Hayır (Yeni İşlem kalıbı) |
| TD-02 | Takvim – Günlük görünüm | FR-CAL-003 | B | Hayır |
| TD-03 | Silme onay diyaloğu | UX-010 | B | Hayır |
| TD-04 | Hesap menüsü | FR-SET-014 | B | Hayır |
| TD-05 | Hatırlatma Ayarları ekranı | FR-SET-006 | B | Hayır |
| TD-06 | Boş durumlar | UX-013 | B | Hayır |
| TD-07 | Başarı bildirimi ve form doğrulama | UX-011/012 | B | Hayır |
| TD-08 | Seçicilerin açık halleri (sheet/popover, tarih, saat) | FR-* | B | Hayır |
| TD-09 | Input / Textarea / Switch component'leri | – | B | Hayır |
| TD-10 | Hover / Focus / Disabled durumları | UX-015 | B | Hayır |
| TD-11 | Rail ve Sidebar nav varyantları | UX-002 | **A** | Hayır (geçici izin, §19.2). Yayın öncesi LB-03 |
| TD-12 | Drawer / Modal / Bottom sheet / Popover / Toast kabukları | UX-002 | B | Hayır |
| TD-13 | Kaydedilmemiş değişiklik uyarısı | §5.3 | B | Hayır |
| TD-14 | Tablet ve masaüstü referans frame'leri | UX-002 | **A** | Hayır (geçici izin, §19.2). Yayın öncesi LB-03 |
| TD-15 | Auth ekranları | FR-AUTH-001…004 | B | Hayır |
| TD-16 | Hesap silme akışı | FR-AUTH-007 | B | Hayır |
| TD-17 | Bildirimler paneli | FR-NTF-001/002 | B | Hayır |
| TD-18 | Çevrimdışı bandı | D-7 | B | Hayır |
| TD-19 | Bütçe limiti uyarısı | FR-REP-009 (S) | C | Hayır |
| TD-20 | "Hemen öde"nin kaldırılması (Pages güncellemesi) | FR-FIN-017 | B | Hayır (kod dokümana göre yapılır) |
| TD-21 | Hesaplarım ekranı | FR-FIN-021 | B | Hayır |
| TD-22 | Dil seçici | FR-SET-003 | B | Hayır |
| TD-23 | Kategori Seçimi'nde "*" | Q-11 | B | Hayır |
| TD-24 | "Tekrarlama yok" seçeneği | FR-FIN-004 | B | Hayır |
| TD-25 | Birikime para ekle / çek akışı | FR-SAV-005/006 | B | Hayır |
| TD-26 | Haftalık özet kartı | FR-DSH-011 (S) | C | Hayır |
| TD-27 | "Gecikmiş" grubu ve tamamlandı görünümü | Q-19/20 | B | Hayır |
| TD-28 | Global arama sonuçları | FR-FIN-011 (S) | C | Hayır |
| TD-29 | "Tutarı düzenle" | Q-16 | B | Hayır |
| TD-30 | Kategori arşivleme onayı ve "Arşivlenenler" bölümü | BR-CAT-002/005 | B | Hayır |
| TD-31 | Birikim kapatmada aktarım seçimi | Q-15 | B | Hayır |
| TD-32 | Hesaplar arası aktarım formu | FR-FIN-020 (S) | B | Hayır |
| TD-33 | Tekrarlayan ödemeyi duraklatma | FR-FIN-019 (S) | B | Hayır |
| TD-34 | Görev Ekle'de tekrar alanları | FR-CAL-012 (S) | B | Hayır |
| TD-35 | Birikim hedef tarihi ve Saklama Kurumu alanları | FR-SAV-009/010 (S) | B | Hayır |
| TD-36 | Geçmiş dönemle karşılaştırma | FR-REP-006 (S) | C | Hayır |
| TD-37 | Profil düzenleme | FR-SET-002 (S) | C | Hayır |
| TD-38 | Fiş/belge ve konum giriş alanları | FR-FIN-013 (S) / 014 (C) | C | Hayır |
| TD-39 | "Ana Sayfa'da göster" kontrolü | FR-DSH-009 (S) | C | Hayır |
| TD-40 | Negatif bakiye uyarısı | Q-14 | B | Hayır |
| TD-41 | "Sıradaki" etkinlik satırı | FR-DSH-010 (S) | C | Hayır |

**Özet:** A = 2 · B = 31 · C = 8

### 19.4 DESIGN.md §11.1 Figma güncellemeleri
Hepsi **B** sınıfıdır. Kod, dokümanlardaki kesinleşmiş değeri kullanır; Figma sonradan bu değere çekilir. Geliştirmeyi engellemez, ama Figma ile kod arasında bilinen fark olarak takip edilir.

| TD | Güncelleme | Kaynak | Sınıf |
|---|---|---|---|
| TD-F1 | Select alanları 45 → 46 px | Ç-2 | B |
| TD-F2 | Ödeme kartında "Hemen öde" kaldırılır, "Ödendi olarak işaretle" Secondary olur | Ç-4, D-5 | B |
| TD-F3 | Hover varyantları gölgesiz (zemin / çerçeve) | Ç-6 | B |
| TD-F4 | `#2563EB` info renk değişkeni | Ç-7 | B |
| TD-F5 | Chip-Kategori 24 → 32 px | Ç-9 | B |
| TD-F6 | Form alt barında "İptal" Tertiary, ikonsuz | Ç-10 | B |
| TD-F7 | `Label/XS` text style'ı (Bold 10/15), nav etiketlerine bağlanır | Ç-11 | B |
| TD-F8 | Button/Default satır yüksekliği 20 → 21 px | Ç-12 | B |
| TD-F9 | Chip metin renkleri: Görev `#4338CA`, Ödeme `#BE123C`, Turuncu `#92400E`; beyaz zeminde uyarı metni `#B45309` | DESIGN §9.2.1 | B |
