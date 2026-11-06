/**
 * Kişi adını gösterim için biçimler: her kelimenin (ve tireyle ayrılmış her parçanın) ilk harfi büyük, kalanı küçük.
 * Kullanıcı adını küçük ya da büyük harfle girse de arayüzde "Fatih Demirkan" görünür (ürün sahibi isteği 2026-11-06).
 * Büyük/küçük harf dönüşümü dilin kurallarıyla yapılır (tr: "ışıl" → "Işıl", "irem" → "İrem"). Kayıtlı değer değişmez.
 */
export function formatPersonName(name: string, locale: string): string {
  const capitalize = (part: string) => (part ? part.charAt(0).toLocaleUpperCase(locale) + part.slice(1).toLocaleLowerCase(locale) : part);
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.split("-").map(capitalize).join("-"))
    .join(" ");
}
