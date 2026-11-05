"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { breakpoints } from "@/styles/tokens";

// Odak ekranlarının sunumu (RESPONSIVE §2.4, §3.3).
//   < 768  : tam ekran (Pages'taki tam sayfa görünüm). Alt nav ve Header ShellFrame ile gizlenir.
//   ≥ 768  : sağ drawer — detay 480 px, form 560 px; arkada liste görünür, karartma tıklanınca kapanır.
//   modal  : ≥ 768'de ortada, en fazla 520 px (Paylaşılabilir Rapor, RESPONSIVE §2.4 / §3.5.2); mobilde tam ekran.
//   docked : ≥1280'de karartmasız, sağa sabitlenmiş panel (İşlemler master-detail [7/12 | 5/12]).
//            Liste, AppShell'de panel genişliği kadar sağ boşluk alır.
// Modal hâlinde: odak panele taşınır ve içinde tutulur, Esc kapatır, arka plan kaydırılmaz.
// Kapatma her zaman bir adrese gider (closeHref): URL tek doğruluk kaynağıdır, geri tuşu da çalışır.
// Açık drawer'lar <html> üzerinde işaretlenir (data-docked-drawer, data-slot-drawer): AppShell ve liste bu
// işaretlere göre daralır; doğrudan açılan sayfanın drawer'ı, üstüne intercept edilen drawer gelince gizlenir.
// İşaret efektle konur: Next, kapanan rotayı gizli <Activity> içinde DOM'da tutar ama efektlerini kaldırır.
// [Eksik] Drawer Figma'da tasarlanmadı; ölçüler RESPONSIVE §2.4 ve token'lardan.

type DrawerProps = {
  closeHref: string;
  closeLabel: string;
  /** Başlık öğesinin id'si (aria-labelledby). */
  labelledBy: string;
  size: "detail" | "form" | "modal";
  docked?: boolean;
  children: ReactNode;
};

const markers = new Map<string, number>();

/** <html> üzerindeki sayaçlı işaret: aynı anda birden fazla drawer açık olabilir. */
function holdMarker(name: string) {
  const count = (markers.get(name) ?? 0) + 1;
  markers.set(name, count);
  document.documentElement.setAttribute(name, "");
  return () => {
    const next = (markers.get(name) ?? 1) - 1;
    markers.set(name, next);
    if (next === 0) document.documentElement.removeAttribute(name);
  };
}

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function Drawer({ closeHref, closeLabel, labelledBy, size, docked, children }: DrawerProps) {
  const router = useRouter();
  const panelRef = useRef<HTMLDivElement>(null);
  const [modal, setModal] = useState(true);

  useEffect(() => {
    const releases: Array<() => void> = [];
    if (docked) releases.push(holdMarker("data-docked-drawer"));
    if (panelRef.current?.closest('[data-drawer-host="slot"]')) releases.push(holdMarker("data-slot-drawer"));
    return () => releases.forEach((release) => release());
  }, [docked]);

  useEffect(() => {
    if (!docked) return;
    const query = window.matchMedia(`(min-width: ${breakpoints.detail}px)`);
    const update = () => setModal(!query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, [docked]);

  useEffect(() => {
    if (!modal) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    panelRef.current?.focus({ preventScroll: true });
    const root = document.documentElement;
    const overflow = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = overflow;
      previous?.focus({ preventScroll: true });
    };
  }, [modal]);

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    // İç içe yerel <dialog> (silme onayı) kendi Esc ve odak davranışını yönetir.
    if (!modal || (event.target instanceof Element && event.target.closest("dialog"))) return;

    if (event.key === "Escape") {
      event.preventDefault();
      router.push(closeHref, { scroll: false });
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

  return (
    <div data-drawer>
      <Link
        href={closeHref}
        scroll={false}
        aria-label={closeLabel}
        tabIndex={-1}
        className={cn("fixed inset-0 z-(--z-drawer) hidden animate-fade-in bg-text-primary/40 tablet:block", docked && "detail:hidden")}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal={modal || undefined}
        aria-labelledby={labelledBy}
        tabIndex={-1}
        onKeyDown={onKeyDown}
        className={cn(
          "fixed inset-0 z-(--z-drawer) flex flex-col overflow-y-auto overscroll-contain bg-surface-page outline-none",
          // Yandan kayarak açılır. ≥1280 sabit panelde satırdan satıra geçişte panel her seferinde yeniden kaymasın
          // diye yalnızca içerik solarak gelir.
          size === "modal" ? "animate-pop-enter" : "animate-drawer-enter",
          docked && "detail:animate-fade-in",
          size === "modal"
            ? "tablet:m-auto tablet:h-fit tablet:max-h-[calc(100dvh-48px)] tablet:w-[calc(100%-48px)] tablet:max-w-(--layout-modal-max-width) tablet:rounded-xl tablet:shadow-elev-3"
            : "tablet:start-auto tablet:max-w-full tablet:border-s tablet:border-border-subtle tablet:shadow-elev-3",
          size === "detail" && "tablet:w-(--layout-drawer-width-detail)",
          size === "form" && "tablet:w-(--layout-drawer-width-form)",
          docked && "detail:shadow-none",
        )}
      >
        {children}
      </div>
    </div>
  );
}
