"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

// Liste satırı bağlantısı. Seçili satır adresten okunur (/islemler/<id>…): detay drawer'da açılırken
// liste yeniden çizilmeden işaretlenir. Görünüm aria-current ile verilir (aria-[current]:…).

type TransactionRowLinkProps = {
  id: string;
  href: string;
  className?: string;
  children: ReactNode;
};

export function TransactionRowLink({ id, href, className, children }: TransactionRowLinkProps) {
  const pathname = usePathname();
  const selected = pathname.startsWith(`/islemler/${encodeURIComponent(id)}`);

  return (
    <Link href={href} scroll={false} aria-current={selected ? "true" : undefined} className={className}>
      {children}
    </Link>
  );
}
