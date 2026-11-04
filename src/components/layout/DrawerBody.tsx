import type { ReactNode } from "react";

// Drawer içerik alanı: mobilde sayfa boşlukları (16), tablet+ drawer'da 24. Alt boşluk ActionFooter'dan gelir.
export function DrawerBody({ children }: { children: ReactNode }) {
  return <div className="flex flex-1 flex-col gap-(--layout-section-gap) px-16 pt-16 tablet:px-24 tablet:pt-24">{children}</div>;
}
