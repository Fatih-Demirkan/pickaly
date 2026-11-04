// Aylık Finans Raporu (children) + Paylaşılabilir Rapor modalı için @drawer slot'u (RESPONSIVE §3.5.2).
// Sarmalayıcılar globals.css'teki "üst üste drawer" kuralı içindir.
export default function ReportLayout({ children, drawer }: LayoutProps<"/raporlar/[donem]">) {
  return (
    <>
      <div data-drawer-host="page">{children}</div>
      <div data-drawer-host="slot">{drawer}</div>
    </>
  );
}
