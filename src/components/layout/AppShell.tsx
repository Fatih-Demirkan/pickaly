import type { ReactNode } from "react";

type AppShellProps = {
  /**
   * Ana navigasyon bölgesi. Sonraki aşamada tek bir bileşen breakpoint'e göre şunları gösterecek
   * (RESPONSIVE.md §2, TECH_STACK §8.4):
   *   mobil  (< 768)  → alt "pill" nav (sabit, altta)
   *   tablet (≥ 768)  → 80 px dikey rail (solda)
   *   laptop (≥ 1024) → 240 px sidebar, desktop (≥ 1440) → 264 px
   * Genişlik --layout-nav-width token'ından gelir; navigasyon verilmezse içerik tam genişlik kalır.
   */
  navigation?: ReactNode;
  /** Üst bar (mobilde Header, tablet+ sayfa başlığı ve aksiyonlar). */
  topBar?: ReactNode;
  children: ReactNode;
};

/** Uygulama iskeleti. Server Component'tir; etkileşimli parçalar kendi istemci bileşenlerinde kalır. */
export function AppShell({ navigation, topBar, children }: AppShellProps) {
  const hasNavigation = Boolean(navigation);

  return (
    <div className="min-h-dvh bg-surface-page text-text-primary">
      {navigation}
      <div className={hasNavigation ? "tablet:ps-(--layout-nav-width)" : undefined}>
        {topBar}
        <main id="main-content" tabIndex={-1} className="outline-none">
          {children}
        </main>
      </div>
    </div>
  );
}
