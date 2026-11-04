// Ödeme Detayı adresi: /islemler/odemeler/[id]. İşlemler'den açılınca liste yanında drawer'da, diğer
// ekranlardan (Ana Sayfa "Yaklaşan Ödemeler") açılınca İşlemler listesi arkada çizilir (RESPONSIVE §3.3.2).
//   ?kaynak=anasayfa → kapatınca Ana Sayfa'ya, ?kaynak=takvim → Takvim'e dönülür.

export type PaymentOrigin = "home" | "calendar" | "transactions";

export function parsePaymentOrigin(value: unknown): PaymentOrigin {
  return value === "anasayfa" ? "home" : value === "takvim" ? "calendar" : "transactions";
}

export function paymentHref(id: string, origin: PaymentOrigin = "transactions") {
  const source = { home: "?kaynak=anasayfa", calendar: "?kaynak=takvim", transactions: "" }[origin];
  return `/islemler/odemeler/${encodeURIComponent(id)}${source}`;
}

export function paymentCloseHref(origin: PaymentOrigin) {
  return { home: "/", calendar: "/takvim", transactions: "/islemler" }[origin];
}
