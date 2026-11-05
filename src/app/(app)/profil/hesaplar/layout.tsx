// Hesaplarım alanı: liste (children) + Hesap Ekle / Düzenle / Para Aktar için @drawer slot'u.
// Sarmalayıcılar globals.css'teki "üst üste drawer" kuralı içindir.
export default function AccountsLayout({ children, drawer }: LayoutProps<"/profil/hesaplar">) {
  return (
    <>
      <div data-drawer-host="page">{children}</div>
      <div data-drawer-host="slot">{drawer}</div>
    </>
  );
}
