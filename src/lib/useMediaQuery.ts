"use client";

import { useSyncExternalStore } from "react";
import { breakpoints, type Breakpoint } from "@/styles/tokens";

// Breakpoint'e bağlı davranış (ör. seçicinin bottom sheet / popover olması) için. Görünüm farkları CSS ile
// çözülür; bu hook yalnızca DOM yapısı veya etkileşim değiştiğinde kullanılır. Sunucuda false döner.

// Sorgu başına tek abone fonksiyonu: useSyncExternalStore her render'da yeniden abone olmasın.
const subscribers = new Map<string, (onChange: () => void) => () => void>();

function subscribe(query: string) {
  let subscriber = subscribers.get(query);
  if (!subscriber) {
    subscriber = (onChange) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    };
    subscribers.set(query, subscriber);
  }
  return subscriber;
}

export function useMinWidth(breakpoint: Breakpoint): boolean {
  const query = `(min-width: ${breakpoints[breakpoint]}px)`;
  return useSyncExternalStore(
    subscribe(query),
    () => window.matchMedia(query).matches,
    () => false,
  );
}
