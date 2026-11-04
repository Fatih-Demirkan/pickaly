import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

// Pages → odak ekranlarının alt aksiyon barı ("İşlemi sil" + "Düzenle", "İptal" + "Kaydet").
// Mobil: ekranın altında sabit, butonlar eşit genişlikte; içerik altında aynı yükseklikte boşluk bırakılır.
// Tablet+ (drawer): drawer'ın altına yapışık, sağa hizalı. DrawerBody'nin yatay boşluğunu (24) taşar.
// stacked: butonlar her boyutta alt alta, tam genişlik (Pages → Paylaşılabilir Rapor; uzun etiketler 520 px modala yan
// yana sığmaz).
// [Varsayım] Bar iç boşluğu ölçülmedi: 12 / 16 + güvenli alan (mobil), 16 / 24 (drawer).

export function ActionFooter({ children, stacked }: { children: ReactNode; stacked?: boolean }) {
  return (
    <>
      <div aria-hidden className={cn(stacked ? "h-[calc(132px+env(safe-area-inset-bottom))]" : "h-[calc(72px+env(safe-area-inset-bottom))]", "tablet:hidden")} />
      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-(--z-sticky) mt-auto flex border-t border-border-default bg-surface-card px-16 pt-12 pb-[calc(12px+env(safe-area-inset-bottom))] tablet:sticky tablet:-mx-24 tablet:px-24 tablet:py-16 tablet:*:flex-none",
          stacked ? "flex-col gap-8" : "gap-12 *:flex-1 tablet:justify-end",
        )}
      >
        {children}
      </div>
    </>
  );
}
