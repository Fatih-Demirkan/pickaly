import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

// Odak ekranlarının alt aksiyon barı ("İşlemi sil" + "Düzenle", "İptal" + "Kaydet"). DESIGN_SYSTEM_PICKALY §5.6.
// Mobil: yüzen beyaz pill (padding 6, elev-2), güvenli alanın 16 px üstünde, kenarlardan 16; butonlar eşit genişlikte LG pill.
//        İçerik altında aynı yükseklikte boşluk bırakılır.
// Tablet+ (drawer): drawer'ın altına yapışık düz bar (beyaz + üstte border-subtle), sağa hizalı.
//        DrawerBody'nin yatay boşluğunu (24) taşar.
// stacked: butonlar her boyutta alt alta, tam genişlik (Paylaşılabilir Rapor; uzun etiketler yan yana sığmaz).
//        Mobilde kap pill değil radius-xl olur.

export function ActionFooter({ children, stacked }: { children: ReactNode; stacked?: boolean }) {
  return (
    <>
      {/* Boşluk: bar (44 + 12 iç) + alt 16 + üst 16. stacked: iki buton + 8 aralık. */}
      <div aria-hidden className={cn(stacked ? "h-[calc(140px+env(safe-area-inset-bottom))]" : "h-[calc(88px+env(safe-area-inset-bottom))]", "tablet:hidden")} />
      <div
        className={cn(
          "fixed inset-x-16 bottom-[calc(16px+env(safe-area-inset-bottom))] z-(--z-sticky) mt-auto flex bg-surface-card p-6 shadow-elev-2",
          stacked ? "flex-col gap-8 rounded-xl" : "gap-8 rounded-full *:flex-1",
          "tablet:sticky tablet:inset-x-auto tablet:bottom-0 tablet:-mx-24 tablet:rounded-none tablet:border-t tablet:border-border-subtle tablet:px-24 tablet:py-16 tablet:shadow-none tablet:*:flex-none",
          !stacked && "tablet:justify-end tablet:gap-12",
        )}
      >
        {children}
      </div>
    </>
  );
}
