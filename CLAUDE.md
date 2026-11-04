# Pickaly – Claude çalışma kuralları

@AGENTS.md

## UI geliştirmeden önce (zorunlu)

Bir ekran, component, stil, CSS, token, ikon veya görsel düzen işine başlamadan önce:

1. **[DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) baştan sona okunur.** Bu adım atlanmaz; önceki bir oturumda okunmuş olması yeterli sayılmaz.
2. Ardından **[DESIGN_SYSTEM_PICKALY.md](DESIGN_SYSTEM_PICKALY.md)** okunur: Part A'nın Pickaly ekranlarına uyarlaması, erişilebilirlik ayarları ve eksik component tanımları. Sürüm 1.0 ürün sahibince onaylandı (2026-11-04); §8'deki K-1…K-7 kararları geçerlidir.
3. İş, bu iki dokümandaki renk, tipografi, boşluk, radius, gölge ve component kurallarına göre yapılır.
4. Responsive davranış için [RESPONSIVE.md](RESPONSIVE.md), teknik uygulama için [TECH_STACK.md](TECH_STACK.md) okunur.

## Doküman sorumlulukları

| Doküman | Sorumluluk |
|---|---|
| `DESIGN_SYSTEM.md` | Güncel görsel tasarım sistemi ve UI kuralları. **Görsel kararlarda öncelikli ve tek geçerli kaynak** |
| `DESIGN_SYSTEM_PICKALY.md` | `DESIGN_SYSTEM.md` Part A'nın Pickaly uyarlaması: semantic token eşlemesi, kontrast ayarları, kategori ve grafik renkleri, Part A'da olmayan componentler. Part A ile çelişmez; yalnızca [Uyarlama] işaretli yerlerde gerekçeli olarak ayrılır |
| `RESPONSIVE.md` | Responsive davranışlar, breakpoint'ler, ekran boyutları ve yerleşimler |
| `TECH_STACK.md` | Teknik mimari ve teknoloji tercihleri |
| `PRD.md` | Ürün gereksinimleri ve iş kuralları |
| `DESIGN.md` | **Eski** tasarım dokümantasyonu. Silinmez ve değiştirilmez. Yalnızca `DESIGN_SYSTEM.md` ile çelişmeyen ve orada karşılığı olmayan konularda başvurulur |

## Çelişki kuralı

- Renk, font, tipografi ölçeği, boşluk, radius, gölge ve component görünümünde `DESIGN.md`, `tokens/*.json`, mevcut kod veya Figma ile `DESIGN_SYSTEM.md` çelişirse **`DESIGN_SYSTEM.md` esas alınır**.
- Bu kural PRD UX-001 ("DESIGN.md ana referanstır") ve TECH_STACK §8.1 ("Kaynak Figma'dır") ifadelerinin görsel tasarımla ilgili kısmının yerine geçer. O dokümanlar şimdilik güncellenmedi.
- Sorumluluk alanları korunur: breakpoint ve yerleşimde `RESPONSIVE.md`, mimari ve uygulama yönteminde `TECH_STACK.md`, iş kurallarında `PRD.md` geçerlidir.
- Ekran içeriği, akışlar ve hangi ekranların var olduğu yine Figma **Pages** / **Components** sekmeleri ve `PRD.md`'den gelir. Figma'daki görsel değerlerin (renk, font vb.) yerini `DESIGN_SYSTEM.md` alır. Figma **AI Pages** kapsam dışıdır.

## DESIGN_SYSTEM.md uygulama notları

- **Part A (FinPilot App Design System)** Pickaly'ye uygulanan sistemdir. **Part B (Behance host-page)** yalnızca referanstır ve uygulanmaz. [Karar: ürün sahibi onayı, 2026-11-04]
- `≈`, "suggested" ve "inferred" ile işaretli değerler kesin değildir. Kullanılırken [Varsayım] olarak not edilir.
- AI ile ilgili componentler (AI Insight card, AI chat screen, sparkle vurguları) V1 kapsamında değildir. Ürün sahibi açıkça istemedikçe uygulanmaz.
- `DESIGN_SYSTEM.md`'deki "Implementation export" örnekleri (Tailwind v3 `tailwind.config.js`, Google Fonts `@import`, `--fp-*` adları) doğrudan kopyalanmaz. Değerler TECH_STACK §8 yapısıyla uygulanır: Tailwind v4 `@theme`, `next/font` ile `latin-ext` alt kümesi, semantic token'lar, bileşenlerde sabit HEX yok.
- Erişilebilirlik (PRD UX-015, WCAG 2.2 AA) geçerliliğini korur. Bir `DESIGN_SYSTEM.md` değeri kontrast şartını karşılamıyorsa sessizce değiştirilmez; durum bildirilir ve ürün sahibine sorulur.
- `DESIGN_SYSTEM.md`'de olmayan bir değer veya component gerekirse önce `DESIGN_SYSTEM_PICKALY.md`'ye, sonra `DESIGN.md`'ye bakılır; oradaki değer yeni sistemle uyumsuzsa veya hiç yoksa [Eksik] olarak işaretlenir ve sorulur. **Tasarım uydurulmaz.**
- `DESIGN_SYSTEM.md` ürün sahibine aittir; Claude bu dosyayı yeniden oluşturmaz, üzerine yazmaz veya değiştirmez.
