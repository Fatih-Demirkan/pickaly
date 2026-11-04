import type { ReactNode } from "react";

// Ana bölümler arasında geçişte (Ana Sayfa ↔ Takvim ↔ İşlemler …) içerik hafifçe solarak gelir.
// template her bölüm değişiminde yeniden çizilir; aynı bölüm içinde drawer açılıp kapanırken (ör. İşlem Detayı)
// liste yeniden solmaz. Yalnızca opaklık kullanılır: transform, içerideki fixed drawer'ların konumunu bozar.
export default function AppTemplate({ children }: { children: ReactNode }) {
  return <div className="animate-page-enter">{children}</div>;
}
