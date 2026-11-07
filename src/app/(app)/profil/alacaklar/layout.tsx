// Alacaklarım alanı: liste (children) + Borç Ver / Alacak Detayı / Düzenle için @drawer slot'u.
// Sarmalayıcılar globals.css'teki "üst üste drawer" kuralı içindir.
export default function LoansLayout({ children, drawer }: LayoutProps<"/profil/alacaklar">) {
  return (
    <>
      <div data-drawer-host="page">{children}</div>
      <div data-drawer-host="slot">{drawer}</div>
    </>
  );
}
