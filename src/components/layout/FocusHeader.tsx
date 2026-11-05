import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

// Odak ekranı başlığı (DESIGN_SYSTEM_PICKALY §5.6): 56 px, canvas zemin, alt çizgi yok; title-sm başlık.
// Mobilde solda geri (36 px outline daire); tablet+ drawer'da aynı adrese giden kapat (×) butonu sağdadır.

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
  /** Bottom sheet içinde: zemin sheet ile aynı (beyaz), başlığın boş kısmı sheet'i sürükleyerek kapatır. */
  inSheet?: boolean;
};

// Görünürlük (inline-flex / hidden) her bağlantıda ayrı verilir: sınıflar birleştirilmediği için aynı listede iki display
// değeri çakışır.
const iconLinkClass =
  "touch-target size-36 shrink-0 items-center justify-center rounded-full border border-border-subtle bg-surface-card text-text-primary transition-colors hover:border-border-strong hover:bg-action-tertiary-hover";

export function FocusHeader({ title, titleId, back, backIcon = "back", trailing, inSheet }: FocusHeaderProps) {
  return (
    <div
      data-sheet-drag={inSheet || undefined}
      className={cn(
        "sticky top-0 z-(--z-sticky) flex h-56 shrink-0 items-center gap-12 px-16 tablet:px-24",
        inSheet ? "touch-none bg-surface-card" : "bg-surface-page",
      )}
    >
      {back && (
        <Link href={back.href} scroll={false} aria-label={back.label} className={`${iconLinkClass} inline-flex tablet:hidden`}>
          <Icon icon={backIcon} />
        </Link>
      )}
      <h2 id={titleId} className="min-w-0 flex-1 truncate text-title-sm text-text-primary">
        {title}
      </h2>
      {trailing}
      {back && (
        <Link href={back.href} scroll={false} aria-label={back.label} className={`${iconLinkClass} hidden tablet:inline-flex`}>
          <Icon icon="close" />
        </Link>
      )}
    </div>
  );
}
