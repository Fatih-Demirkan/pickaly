// Takvim alanı: takvim (children) + Kayıt Detayı ve Görev Ekle / Düzenle için @drawer slot'u (İşlemler ile aynı yapı).
// Takvimden açılan detay ve formlar intercept edilir: takvim yerinde kalır. Doğrudan adresle açılışta ilgili sayfa
// takvimi ve aynı drawer'ı birlikte çizer. Sarmalayıcılar globals.css'teki "üst üste drawer" kuralı içindir.
export default function CalendarLayout({ children, drawer }: LayoutProps<"/takvim">) {
  return (
    <>
      <div data-drawer-host="page">{children}</div>
      <div data-drawer-host="slot">{drawer}</div>
    </>
  );
}
