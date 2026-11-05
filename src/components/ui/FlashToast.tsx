"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useToast } from "./Toast";

// Sunucu aksiyonunun bıraktığı tek seferlik bildirim çerezini (src/lib/flash.ts) okuyup toast gösterir.
// Her sayfa değişiminde kontrol edilir; gösterilen çerez hemen silinir, böylece yenilemede tekrar çıkmaz.

const COOKIE = "pk_flash";

type FlashMessageKey = Parameters<ReturnType<typeof useTranslations<"flash">>>[0];

function readFlash(): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE}=([^;]+)`));
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

export function FlashToast() {
  const t = useTranslations("flash");
  const toast = useToast();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const key = readFlash();
    if (!key) return;
    document.cookie = `${COOKIE}=; path=/; max-age=0; samesite=lax`;
    // Bilinmeyen anahtar (eski sürümden kalmış çerez) sessizce yok sayılır.
    if (t.has(key as FlashMessageKey)) toast({ message: t(key as FlashMessageKey) });
  }, [pathname, searchParams, t, toast]);

  return null;
}
