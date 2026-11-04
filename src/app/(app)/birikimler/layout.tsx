// Birikimler alanı: liste / detay (children) + Yeni Birikim, Hesabı Düzenle ve Para ekle / Çek için @drawer slot'u.
// Birikim Hesabı Detayı tam sayfadır (RESPONSIVE §3.4.3); formlar drawer'da açılır (§3.4.4). Sarmalayıcılar
// globals.css'teki "üst üste drawer" kuralı içindir.
export default function SavingsLayout({ children, drawer }: LayoutProps<"/birikimler">) {
  return (
    <>
      <div data-drawer-host="page">{children}</div>
      <div data-drawer-host="slot">{drawer}</div>
    </>
  );
}
