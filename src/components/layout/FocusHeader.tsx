import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";

// Pages → odak ekranı başlığı (Detay-Nav Bar): "← İşlem Detayı", "Yeni İşlem  × İptal".
// Drawer'ın en üstünde sabit durur: surface-card + alt çizgi. Mobilde solda geri oku; tablet+ drawer'da
// aynı adrese giden kapat (×) butonu sağdadır.
// [Varsayım] Yükseklik ve başlık stili ölçülmedi: Header ile aynı 64 px, Heading/H4.

type FocusHeaderProps = {
  title: string;
  /** Başlık öğesinin id'si; drawer bu id ile adlandırılır. */
  titleId: string;
  /** Verilirse mobilde geri oku, tablet+ kapat (×) olarak gösterilir. */
  back?: { href: string; label: string };
  /** Mobildeki geri öğesinin ikonu; Pages → Paylaşılabilir Rapor "×". */
  backIcon?: "back" | "close";
  /** Sağdaki aksiyon (ör. "× İptal"). */
  trailing?: ReactNode;
};

// Görünürlük (inline-flex / hidden) her bağlantıda ayrı verilir: sınıflar birleştirilmediği için aynı listede iki display
// değeri çakışır.
const iconLinkClass = "touch-target size-40 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-action-tertiary-hover";

export function FocusHeader({ title, titleId, back, backIcon = "back", trailing }: FocusHeaderProps) {
  return (
    <div className="sticky top-0 z-(--z-sticky) flex h-(--layout-topbar-height) shrink-0 items-center gap-8 border-b border-border-default bg-surface-card px-16 tablet:px-24">
      {back && (
        <Link href={back.href} scroll={false} aria-label={back.label} className={`${iconLinkClass} -ms-8 inline-flex text-text-primary tablet:hidden`}>
          <Icon icon={backIcon} />
        </Link>
      )}
      <h2 id={titleId} className="min-w-0 flex-1 truncate text-heading-h4 text-text-primary">
        {title}
      </h2>
      {trailing}
      {back && (
        <Link href={back.href} scroll={false} aria-label={back.label} className={`${iconLinkClass} -me-8 hidden text-text-secondary hover:text-text-primary tablet:inline-flex`}>
          <Icon icon="close" />
        </Link>
      )}
    </div>
  );
}
