import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { ShellFrame } from "./ShellFrame";

type AppShellProps = {
  /**
   * Ana navigasyon (AppNavigation). Breakpoint'e göre (RESPONSIVE.md §2, TECH_STACK §8.4):
   *   mobil  (< 768)  → altta sabit pill nav; içerik altta --layout-bottom-nav-offset kadar boşluk bırakır
   *   tablet (≥ 768)  → 80 px rail; laptop (≥ 1024) → 240 px sidebar; desktop (≥ 1440) → 264 px
   * Yan boşluk --layout-nav-width token'ından gelir.
   * Odak ekranlarında (config/navigation isFocusRoute) mobil alt nav gizlenir; alt boşluk ekranın kendi
   * aksiyon barından gelir.
   */
  navigation?: ReactNode;
  /** Üst bar (mobilde Header; tablet+ aksiyonlar). */
  topBar?: ReactNode;
  children: ReactNode;
};

/** Uygulama iskeleti. Server Component'tir; etkileşimli parçalar kendi istemci bileşenlerinde kalır. */
export function AppShell({ navigation, topBar, children }: AppShellProps) {
  const hasNavigation = Boolean(navigation);

  return (
    // relative + isolate: Ana Sayfa üst barının renk geçişi (TopBarLead) içeriğin ARKASINDA, sayfa zemininin önünde çizilir.
    <ShellFrame className="group/shell relative isolate min-h-dvh bg-surface-page text-text-primary">
      {navigation}
      <div
        className={cn(
          hasNavigation &&
            "pb-[calc(var(--layout-bottom-nav-offset)+env(safe-area-inset-bottom))] group-data-[focus]/shell:pb-0 tablet:ps-(--layout-nav-width)",
          // ≥1280: İşlem Detayı sağa sabit panel olarak açıkken içerik panel genişliği kadar daralır (master-detail).
          "detail:[html[data-docked-drawer]_&]:pe-(--layout-drawer-width-detail)",
        )}
      >
        {topBar}
        <main id="main-content" tabIndex={-1} className="outline-none">
          {children}
        </main>
      </div>
    </ShellFrame>
  );
}
