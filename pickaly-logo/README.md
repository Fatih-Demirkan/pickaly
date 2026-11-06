# Pickaly logo kiti

| Klasör | İçerik |
|---|---|
| `masters/` | Ana SVG dosyaları: sembol, küçük boyut sembolü, yazı, yatay ve dikey logolar. Her biri renkli, `-dark`, `-white`, `-black` ve `-red` versiyonlarında. Ayrıca uygulama ikonu: kırmızı zeminde beyaz ve krem zeminde renkli. |
| `png/` | Şeffaf zeminli yüksek çözünürlüklü PNG'ler: logolar 2400 px'e, ikonlar 1024 px'e kadar. |
| `web/` | Web ikon seti: `favicon.ico`, `favicon.svg`, 16/32/48 px PNG'ler, `apple-touch-icon.png`, 192 ve 512 px ikonlar, maskable ikon, `site.webmanifest` ve `head-snippet.html`. |
| `board/` | Sunum panosu (`pickaly-board.html`) ve `slides/` içinde her slaytın PNG'si. Mockup'lar: uygulama ikonu, web sitesi, tarayıcı sekmesi, sosyal profil, kart, sticker. |
| `src/` | `build.js`: tüm geometrinin kaynağı (`node src/build.js` ile yeniden üretilir). `board-spec.json`: pano içeriği. |
| `KULLANIM-KILAVUZU.md` | Boşluk alanı, en küçük boyutlar, renk kodları, onaylı zeminler, yapılmaması gerekenler. |

## Web sitesine eklemek
`web/` içindeki dosyaları sitenin kök dizinine kopyala ve `head-snippet.html` içeriğini sayfanın `<head>` bölümüne yapıştır.

## Test sonuçları
- `svg_audit` denetiminde 27 ana dosyanın 16'sı 100/100, 11'i 99/100 aldı.
- Dosyalarda canlı yazı, gömülü görsel, filtre, kontur ya da dönüşüm komutu yok; tüm şekiller dolu path olarak çizildi.
- Tüm açılar 0°, 45° ve 90° gibi temiz açılara oturtuldu.
- 16, 24, 32 ve 64 px boyutlarında, koyu zeminde, tek renkte ve beyaz versiyonda görsel olarak kontrol edildi.

## Açık konular
- **Marka tescili:** Tescil araştırması yapılmadı; profesyonel bir araştırma öneririm (TÜRKPATENT, EUIPO, ters görsel arama).
- **Baskı dosyaları:** PDF/EPS üretilmedi. Gerekirse bu SVG'ler Illustrator veya Inkscape ile kolayca dönüştürülebilir.
- **Pantone/CMYK:** Değerler yaklaşık; matbaa provasıyla doğrulanmalı.
