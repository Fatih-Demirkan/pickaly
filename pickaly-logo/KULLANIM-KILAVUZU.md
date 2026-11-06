# Pickaly — Logo Kullanım Kılavuzu

## 1. Logo
- **Fikir:** Kirazın yaprağı ve sapı birlikte bir onay işareti çiziyor. İngilizcedeki "cherry-pick" (en iyisini seçmek) deyiminden yola çıkıyor: biten görev ile doğru harcama seçimi tek bir işarette.
- **Versiyonlar:**
  - **yatay** (ana logo): `pickaly-horizontal`
  - **dikey:** `pickaly-stacked`
  - **sadece sembol:** `pickaly-symbol`
  - **sadece yazı:** `pickaly-wordmark`
- **Küçük boyut çizimi:** `pickaly-symbol-small`. Sapı daha kalın, yaprağı daha büyük çizilmiş bir versiyon. **32 px ve altında** her zaman bunu kullan. Favicon ve uygulama ikonu bundan üretildi.
- Yazı (wordmark) özel olarak çizildi, bir fonttan yazılmadı. Logoyu asla klavyeyle yazarak yeniden oluşturma; her zaman dosyaları kullan.

## 2. Boşluk alanı
Logonun her yanında en az **1 × x** boş alan bırak. **x = kiraz meyvesinin yarıçapı**, yatay logoda bu küçük harflerin yüksekliğinin yaklaşık yarısına denk gelir. Boşluk logoyla birlikte ölçeklenir; sabit bir piksel değeri değildir.

## 3. En küçük boyut
| Versiyon | Ekran | Baskı |
|---|---|---|
| Yatay logo | 96 px genişlik | 25 mm genişlik |
| Dikey logo | 64 px genişlik | 18 mm genişlik |
| Sembol | 16 px (`-small` dosyası) | 6 mm |

## 4. Renk
| Ad | HEX | RGB | CMYK (yaklaşık) | Pantone (en yakın) |
|---|---|---|---|---|
| Kiraz Kırmızısı | `#E23A4E` | 226 58 78 | 0 74 65 11 | 1787 C |
| Yaprak Yeşili | `#1E9E6A` | 30 158 106 | 81 0 33 38 | 340 C |
| Mürekkep | `#1B1B23` | 27 27 35 | 23 23 0 86 | Black 6 C |
| Krem | `#FFF4EC` | 255 244 236 | 0 4 7 0 | — |

CMYK ve Pantone değerleri hesapla bulundu; basılı işlerden önce matbaa provasıyla doğrulanmalı.

**Renklerin görevleri:**
- **Kırmızı** meyve ve "i" noktası için.
- **Yeşil** yalnızca yaprak ve sap için. Onay işaretinin rengi olduğu için uygulamada "tamamlandı" ve "bütçe içinde" durumlarına da çok iyi uyar.
- **Mürekkep** yazı için.

**Onaylı logo ve zemin eşleşmeleri:**
- renkli logo beyaz ya da krem zeminde
- `-dark` versiyonu (renkli kiraz, beyaz yazı) mürekkep zeminde
- `-white` versiyonu kırmızı zeminde ya da fotoğrafın sakin bir bölgesinde
- `-black` versiyonu tek renk baskıda
- `-red` versiyonu tek renkli marka uygulamalarında

## 5. Tipografi (öneri)
- **Başlıklar:** Nunito ExtraBold. **Gövde metni:** Nunito Regular / SemiBold. **Yedek:** `system-ui, sans-serif`.
- Nunito, yazının yuvarlak uçlu ve tek kalınlıklı karakteriyle uyumlu. SIL Open Font License ile ücretsiz ve ticari kullanıma açık.

## 6. Yapma
- Logoyu esnetme, basma ya da döndürme.
- Paletin dışında bir renge boyama. Yaprağı kırmızı ya da meyveyi yeşil yapma.
- Gölge, kontur, gradyan veya başka efekt ekleme.
- Kiraz ile yazının yerini ya da oranını değiştirme.
- Kalabalık zeminde zemin kutusu olmadan kullanma.
- 32 px altında ana sembolü kullanma; orada `-small` versiyonunu kullan.

## 7. Dosyalar
`masters/` klasöründeki SVG'ler ana dosyalardır. Diğer tüm versiyonlar `src/build.js` ile bu geometriden üretilir.
