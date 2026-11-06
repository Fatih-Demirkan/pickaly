import Image from "next/image";
import { cn } from "@/lib/cn";

// Pickaly logo sembolü (kiraz + yaprak/sap onay işareti). Kaynak: ürün sahibinin logo kiti (pickaly-logo/masters,
// 2026-11-06); dosyalar scripts/build-app-icons.mjs ile public/brand'e kopyalanır. Logo yeniden çizilmez,
// renkleri değiştirilmez (KULLANIM-KILAVUZU §4, §6): kitteki SVG olduğu gibi gösterilir.
// 32 px ve altında küçük boyut çizimi (pickaly-symbol-small: kalın sap, büyük yaprak) kullanılır (kılavuz §1).

type LogoMarkProps = {
  /** Piksel cinsinden kenar uzunluğu (kare). */
  size: number;
  className?: string;
};

/** Dekoratif logo sembolü: yanında her zaman "Pickaly" metni bulunduğu için ekran okuyucudan gizlidir. */
export function LogoMark({ size, className }: LogoMarkProps) {
  const src = size <= 32 ? "/brand/pickaly-symbol-small.svg" : "/brand/pickaly-symbol.svg";
  return <Image src={src} alt="" aria-hidden width={size} height={size} unoptimized priority className={cn("shrink-0", className)} />;
}
