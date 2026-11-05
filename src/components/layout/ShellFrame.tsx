"use client";

import type { ReactNode } from "react";
import { isFocusRoute } from "@/config/navigation";
import { useShellPathname } from "@/lib/sheetRoutes";

// Uygulama iskeletinin dış kabı. Odak ekranlarında data-focus işareti koyar; mobil alt nav, FAB ve
// Header bu işarete göre CSS ile gizlenir (group-data-[focus]/shell). usePathname sunucuda da çalıştığı
// için ilk HTML doğru gelir, görünüm sıçraması olmaz.

export function ShellFrame({ className, children }: { className?: string; children: ReactNode }) {
  const pathname = useShellPathname(); // Sheet açıkken arkadaki ekranın yolu
  return (
    <div data-focus={isFocusRoute(pathname) || undefined} className={className}>
      {children}
    </div>
  );
}
