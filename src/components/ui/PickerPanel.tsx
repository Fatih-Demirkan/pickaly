"use client";

import { useEffect, useLayoutEffect, useRef, useState, type FocusEvent, type KeyboardEvent, type ReactNode, type RefObject } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/cn";
import { useMinWidth } from "@/lib/useMediaQuery";
import { IconButton } from "./IconButton";

// Seçici kabuğu (RESPONSIVE §4.5.1 [Karar #6]):
//   < 768 : bottom sheet — altta, üst köşeler radius-2xl, karartmalı, başlık Heading/H4, alt güvenli alan payı.
//   ≥ 768 : alanın altına bağlı popover (yer yoksa üstüne açılır) — radius-lg, border-default, shadow-elev-3.
// Kapatma: Esc, dışarı tıklama, karartma, seçim. Kapanınca odak tetikleyiciye döner.
// [Eksik] Açık hâller Pages'ta tasarlanmadı; ölçüler RESPONSIVE §4.5.1 ve DESIGN token'larından.

type PickerPanelProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  titleId: string;
  /** Tetikleyiciyi ve paneli saran, position: relative kap. Dışarı tıklama bu kaba göre ölçülür. */
  containerRef: RefObject<HTMLElement | null>;
  /** Kapanınca odaklanacak tetikleyici. */
  triggerRef: RefObject<HTMLElement | null>;
  /** Popover hizası ve genişliği. stretch: alan genişliğinde. */
  align?: "stretch" | "start" | "end";
  /** align start/end iken popover genişliği (ör. "w-[358px]"). */
  widthClass?: string;
  children: ReactNode;
};

export function PickerPanel({ open, onClose, title, titleId, containerRef, triggerRef, align = "stretch", widthClass, children }: PickerPanelProps) {
  const t = useTranslations("picker");
  const isPopover = useMinWidth("tablet");
  const panelRef = useRef<HTMLDivElement>(null);
  const [placement, setPlacement] = useState<"below" | "above">("below");

  function close() {
    onClose();
    triggerRef.current?.focus({ preventScroll: true });
  }

  // Popover alanın altına sığmıyorsa ve üstte daha çok yer varsa üste açılır.
  useLayoutEffect(() => {
    if (!open || !isPopover || !containerRef.current || !panelRef.current) return;
    const anchor = containerRef.current.getBoundingClientRect();
    const height = panelRef.current.offsetHeight;
    const below = window.innerHeight - anchor.bottom;
    setPlacement(below < height + 16 && anchor.top > below ? "above" : "below");
  }, [open, isPopover, containerRef]);

  useEffect(() => {
    if (!open || !isPopover) return;
    function onPointerDown(event: PointerEvent) {
      if (containerRef.current && event.target instanceof Node && !containerRef.current.contains(event.target)) onClose();
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open, isPopover, containerRef, onClose]);

  if (!open) return null;

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      // Üstteki drawer'ın da kapanmaması için olay burada durdurulur.
      event.stopPropagation();
      event.preventDefault();
      close();
    }
  }

  function onBlur(event: FocusEvent<HTMLDivElement>) {
    // Klavyeyle seçicinin dışına çıkılırsa (Tab) panel kapanır.
    if (event.relatedTarget instanceof Node && containerRef.current && !containerRef.current.contains(event.relatedTarget)) onClose();
  }

  if (!isPopover) {
    return (
      <div className="fixed inset-0 z-(--z-modal)" onKeyDown={onKeyDown}>
        <button type="button" aria-label={t("close")} tabIndex={-1} onClick={close} className="absolute inset-0 animate-fade-in bg-text-primary/40" />
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className="absolute inset-x-0 bottom-0 flex max-h-[85dvh] animate-sheet-enter flex-col rounded-t-xl bg-surface-card pb-[calc(16px+env(safe-area-inset-bottom))] shadow-elev-3"
        >
          <div className="flex h-56 shrink-0 items-center justify-between gap-8 border-b border-border-subtle ps-16 pe-8">
            <h2 id={titleId} className="text-title-sm text-text-primary">
              {title}
            </h2>
            <IconButton icon="close" label={t("close")} onClick={close} />
          </div>
          <div className="overflow-y-auto overscroll-contain px-16 pt-8">{children}</div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-labelledby={titleId}
      onKeyDown={onKeyDown}
      onBlur={onBlur}
      className={cn(
        "absolute z-(--z-modal) animate-pop-enter rounded-lg bg-surface-card shadow-elev-1 p-8 shadow-elev-3",
        placement === "below" ? "top-full mt-8" : "bottom-full mb-8",
        align === "stretch" && "inset-x-0",
        align === "start" && "start-0",
        align === "end" && "end-0",
        align !== "stretch" && widthClass,
      )}
    >
      <h2 id={titleId} className="sr-only">
        {title}
      </h2>
      {children}
    </div>
  );
}
