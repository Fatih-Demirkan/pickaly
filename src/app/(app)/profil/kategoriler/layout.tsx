// Kategori Yönetimi alanı: liste (children) + Kategori Ekle / Düzenle için @drawer slot'u (RESPONSIVE §3.6.2).
// Sarmalayıcılar globals.css'teki "üst üste drawer" kuralı içindir.
export default function CategoriesLayout({ children, drawer }: LayoutProps<"/profil/kategoriler">) {
  return (
    <>
      <div data-drawer-host="page">{children}</div>
      <div data-drawer-host="slot">{drawer}</div>
    </>
  );
}
