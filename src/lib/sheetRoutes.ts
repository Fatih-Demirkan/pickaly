import { useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { isSheetRoute } from "@/config/navigation";

// Sheet rotaları (config/navigation isSheetRoute) için istemci yardımcıları. Yalnızca istemci bileşenlerinden kullanılır.
// Kabuk (header, nav, odak işareti) adres çubuğundaki sheet rotasına değil, arkadaki ekrana göre çizilir.

/**
 * Arkadaki ekranın yolu: sheet açıkken bir önceki (sheet olmayan) yol, değilse geçerli yol.
 * Sheet adresi doğrudan açıldıysa (önceki yol yok) adresin kendisi döner.
 */
export function useShellPathname(): string {
  const pathname = usePathname();
  const sheet = isSheetRoute(pathname);
  const [background, setBackground] = useState(pathname);
  // Render sırasında türetilen durum (React "storing information from previous renders" kalıbı).
  if (!sheet && background !== pathname) setBackground(pathname);
  return sheet ? background : pathname;
}

// Arkadaki ekranın tam adresi (yol + sorgu). Kayıttan sonra kullanıcı aynı ekrana döner.
let backgroundUrl: string | null = null;
const listeners = new Set<() => void>();

export function setBackgroundUrl(url: string) {
  if (url === backgroundUrl) return;
  backgroundUrl = url;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useBackgroundUrl(): string | null {
  return useSyncExternalStore(
    subscribe,
    () => backgroundUrl,
    () => null,
  );
}
