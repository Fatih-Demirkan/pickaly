"use client";

import { createContext, useContext, useEffect, useLayoutEffect, useRef, type KeyboardEvent, type MouseEvent, type PointerEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useBackgroundUrl } from "@/lib/sheetRoutes";

// Bottom sheet sunumu (ürün sahibi isteği 2026-11-05: Yeni İşlem). DESIGN_SYSTEM_PICKALY §5.8 "Yeni İşlem sheet'i":
//   zemin uygulama canvas'ı (surface-page; beyaz kartlar ve alanlar ekranlardaki gibi ayrışır, ürün sahibi kararı
//   2026-11-05), üst köşeler radius-xl, elev-3, 36×4 tutamak (neutral.100 = surface-muted), arka plan black %40.
//   [Varsayım: ölçü] Sheet ekranın altından header'ın altına (--layout-topbar-height) kadar uzanır; tablet+ ortada,
//   form drawer genişliğinde (560). İçerik sheet'in içinde kayar; arkadaki sayfanın kaydırma konumu korunur.
// Açılış: alttan kayarak (sheet-enter 280 ms). Kapanış: aşağı kayarak (200 ms), sonra adres değişir.
// Kapatma: "İptal" (closeHref'e giden her bağlantı), tutamağı / başlığı aşağı sürükleme, karartma, Esc.
//   Sürükleme: sheet yüksekliğinin %25'i veya hızlı bir aşağı fırlatma kapatır; aksi hâlde yerine döner.
// intercepted: sheet uygulama içinden (bulunulan ekranın üstünde) açıldı → kapanınca geri gidilir (önceki ekran,
//   kaydırma konumuyla). Doğrudan adresle açıldıysa closeHref'e gidilir.
// Odak panele taşınır ve içinde tutulur; kapanınca önceki öğeye döner. "Hareketi azalt" tercihinde animasyon yok.

type SheetProps = {
  closeHref: string;
  /** Başlık öğesinin id'si (aria-labelledby). */
  labelledBy: string;
  intercepted?: boolean;
  children: ReactNode;
};

const SheetContext = createContext<{ intercepted: boolean } | null>(null);

/** Sheet içindeki formun kayıttan sonra döneceği adres: sheet bulunulan ekranın üstünde açıldıysa o ekran. */
export function useSheetReturnTo(): string | null {
  const sheet = useContext(SheetContext);
  const background = useBackgroundUrl();
  return sheet?.intercepted ? background : null;
}

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
const EXIT_MS = 200;
const EXIT_EASE = "cubic-bezier(0.4, 0, 1, 1)";
const SETTLE = "transform 220ms cubic-bezier(0.22, 1, 0.36, 1)";
/** Kapatma eşikleri: sheet yüksekliğine oran ve aşağı hız (px/ms). */
const CLOSE_RATIO = 0.25;
const CLOSE_VELOCITY = 0.5;

type DragState = { pointerId: number; startY: number; lastY: number; lastTime: number; velocity: number; offset: number };

function reducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function Sheet({ closeHref, labelledBy, intercepted = false, children }: SheetProps) {
  const router = useRouter();
  const panelRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const drag = useRef<DragState | null>(null);
  const closing = useRef(false);

  // Next kapanan rotayı gizli <Activity> içinde tutar; yeniden görünürse efektler tekrar çalışır. Kapanış ve
  // sürükleme stilleri boyanmadan önce sıfırlanır, açılış animasyonu baştan oynar.
  useLayoutEffect(() => {
    closing.current = false;
    drag.current = null;
    panelRef.current?.removeAttribute("style");
    backdropRef.current?.removeAttribute("style");
  }, []);

  // Açılış: odak, arka planın kaydırılmaması.
  useEffect(() => {
    const panel = panelRef.current;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    panel?.focus({ preventScroll: true });
    const root = document.documentElement;
    const overflow = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = overflow;
      previous?.focus({ preventScroll: true });
    };
  }, []);

  function navigateAway() {
    if (intercepted) router.back();
    else router.push(closeHref, { scroll: false });
  }

  function close() {
    if (closing.current) return;
    closing.current = true;
    const panel = panelRef.current;
    const backdrop = backdropRef.current;
    if (!panel || reducedMotion()) {
      navigateAway();
      return;
    }
    panel.style.transition = `transform ${EXIT_MS}ms ${EXIT_EASE}`;
    panel.style.transform = "translateY(100%)";
    if (backdrop) {
      backdrop.style.transition = `opacity ${EXIT_MS}ms ease-out`;
      backdrop.style.opacity = "0";
    }
    window.setTimeout(navigateAway, EXIT_MS);
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    // İç içe yerel <dialog> kendi Esc ve odak davranışını yönetir.
    if (event.target instanceof Element && event.target.closest("dialog")) return;
    if (event.key === "Escape") {
      event.preventDefault();
      close();
      return;
    }
    if (event.key !== "Tab" || !panelRef.current) return;
    const focusable = [...panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((element) => element.getClientRects().length > 0);
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (!first || !last) return;
    if (event.shiftKey && (document.activeElement === first || document.activeElement === panelRef.current)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  // "İptal" bağlantıları (closeHref) sayfaya gitmek yerine sheet'i kapatır: kapanış animasyonu ve geri dönüş.
  function onClickCapture(event: MouseEvent<HTMLDivElement>) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const anchor = event.target instanceof Element ? event.target.closest("a[href]") : null;
    if (!(anchor instanceof HTMLAnchorElement)) return;
    const target = new URL(anchor.href, window.location.href);
    const closeUrl = new URL(closeHref, window.location.href);
    if (target.origin !== closeUrl.origin || target.pathname !== closeUrl.pathname || target.search !== closeUrl.search) return;
    event.preventDefault();
    close();
  }

  // Sürükleme: tutamak ([data-sheet-handle]) veya başlığın ([data-sheet-drag]) etkileşimsiz kısmından başlar.
  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (closing.current || (event.pointerType === "mouse" && event.button !== 0)) return;
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return;
    const onHandle = target.closest("[data-sheet-handle]");
    const onHeader = target.closest("[data-sheet-drag]") && !target.closest("a, button, input, select, textarea, label");
    if (!onHandle && !onHeader) return;
    drag.current = { pointerId: event.pointerId, startY: event.clientY, lastY: event.clientY, lastTime: event.timeStamp, velocity: 0, offset: 0 };
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // İşaretçi artık etkin değilse (ör. anında bırakıldıysa) yakalama olmadan devam edilir.
    }
    const panel = panelRef.current;
    if (panel) {
      panel.style.transition = "none";
      panel.style.animation = "none";
    }
    if (backdropRef.current) backdropRef.current.style.transition = "none";
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    const state = drag.current;
    const panel = panelRef.current;
    if (!state || state.pointerId !== event.pointerId || !panel) return;
    const delta = event.clientY - state.startY;
    // Yukarı çekişte hafif direnç; aşağıda parmağı birebir izler.
    const offset = delta < 0 ? -Math.min(24, Math.sqrt(-delta) * 2) : delta;
    const elapsed = event.timeStamp - state.lastTime;
    if (elapsed > 0) state.velocity = (event.clientY - state.lastY) / elapsed;
    state.lastY = event.clientY;
    state.lastTime = event.timeStamp;
    state.offset = offset;
    panel.style.transform = `translateY(${offset}px)`;
    if (backdropRef.current) backdropRef.current.style.opacity = String(Math.max(0, 1 - Math.max(0, offset) / panel.offsetHeight));
  }

  function onPointerEnd(event: PointerEvent<HTMLDivElement>) {
    const state = drag.current;
    const panel = panelRef.current;
    if (!state || state.pointerId !== event.pointerId || !panel) return;
    drag.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    const dismiss = event.type === "pointerup" && (state.offset > panel.offsetHeight * CLOSE_RATIO || (state.offset > 16 && state.velocity > CLOSE_VELOCITY));
    if (dismiss) {
      close();
      return;
    }
    panel.style.transition = SETTLE;
    panel.style.transform = "";
    if (backdropRef.current) {
      backdropRef.current.style.transition = "opacity 220ms ease-out";
      backdropRef.current.style.opacity = "";
    }
  }

  return (
    <SheetContext.Provider value={{ intercepted }}>
      <div data-sheet>
        <div ref={backdropRef} aria-hidden onClick={close} className="fixed inset-0 z-(--z-drawer) animate-fade-in bg-text-primary/40" />
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={labelledBy}
          tabIndex={-1}
          onKeyDown={onKeyDown}
          onClickCapture={onClickCapture}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerEnd}
          onPointerCancel={onPointerEnd}
          className="fixed inset-x-0 top-(--layout-topbar-height) bottom-0 z-(--z-drawer) mx-auto flex w-full animate-sheet-enter flex-col overflow-hidden rounded-t-xl bg-surface-page shadow-elev-3 outline-none will-change-transform tablet:max-w-(--layout-drawer-width-form)"
        >
          {/* Tutamak: dokunma alanı tam genişlik × 24; görsel 36 × 4. Sürükleme bir kısayoldur; "İptal" her zaman var
              (WCAG 2.5.7), bu yüzden tutamak ekran okuyucudan gizlenir. */}
          <div data-sheet-handle aria-hidden className="flex h-24 shrink-0 cursor-grab touch-none items-center justify-center active:cursor-grabbing">
            <span className="h-4 w-36 rounded-full bg-surface-muted" />
          </div>
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain">{children}</div>
        </div>
      </div>
    </SheetContext.Provider>
  );
}
