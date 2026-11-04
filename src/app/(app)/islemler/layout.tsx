// İşlemler alanı: liste (children) + odak ekranları için @drawer slot'u.
// Listeden açılan detay ve formlar intercept edilir (@drawer/(.)…): liste yerinde kalır, kaydırma konumu korunur.
// Adres doğrudan açılırsa (yenileme, paylaşılan bağlantı) ilgili sayfa listeyi ve aynı drawer'ı birlikte çizer.
// Sarmalayıcılar globals.css'teki "üst üste drawer" kuralı içindir.
export default function TransactionsLayout({ children, drawer }: LayoutProps<"/islemler">) {
  return (
    <>
      <div data-drawer-host="page">{children}</div>
      <div data-drawer-host="slot">{drawer}</div>
    </>
  );
}
