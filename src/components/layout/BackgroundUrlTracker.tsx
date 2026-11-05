"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { isSheetRoute } from "@/config/navigation";
import { setBackgroundUrl } from "@/lib/sheetRoutes";

// Sheet olmayan son adresi kaydeder (src/lib/sheetRoutes.ts). useSearchParams okuduğu için kendi Suspense sınırında.
export function BackgroundUrlTracker() {
  const pathname = usePathname();
  const search = useSearchParams().toString();
  useEffect(() => {
    if (!isSheetRoute(pathname)) setBackgroundUrl(search ? `${pathname}?${search}` : pathname);
  }, [pathname, search]);
  return null;
}
