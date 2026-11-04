"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { Icon } from "./Icon";

// Başarı bildirimi (RESPONSIVE §4.5.3, §8.2.7 [Eksik → öneri]):
//   zemin Neutral/900, metin Brand/White, radius-md, Shadow/Floating; başarı ikonu Semantic/Gelir - Tamamlandı
//   süre 4 sn; "Ödendi olarak işaretle" sonrası 5 sn "Geri al" bağlantısı (Brand/Accent) [D-18]
//   konum: mobilde alt nav'ın üstünde, tablette alt ortada, laptop ve üstünde sağ altta
// Aynı anda tek bildirim gösterilir; yenisi öncekinin yerini alır. Ekran okuyucuya role="status" ile okunur.

const DURATION_MS = 4000;
const UNDO_DURATION_MS = 5000;

type ToastAction = { label: string; onAction: () => void };
type ToastOptions = { message: string; tone?: "success" | "error"; action?: ToastAction };
type ToastState = ToastOptions & { key: number };

const ToastContext = createContext<((options: ToastOptions) => void) | null>(null);

export function useToast() {
  const show = useContext(ToastContext);
  if (!show) throw new Error("useToast, ToastProvider içinde kullanılmalı.");
  return show;
}

export function ToastProvider({ dismissLabel, children }: { dismissLabel: string; children: ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const counter = useRef(0);

  const show = useCallback((options: ToastOptions) => {
    counter.current += 1;
    setToast({ ...options, key: counter.current });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), toast.action ? UNDO_DURATION_MS : DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [toast]);

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-16 bottom-[calc(var(--layout-bottom-nav-offset)+8px+env(safe-area-inset-bottom))] z-(--z-toast) flex justify-center tablet:bottom-24 laptop:start-auto laptop:end-24 laptop:justify-end"
      >
        {toast && (
          <div
            key={toast.key}
            className="pointer-events-auto flex w-full max-w-[480px] animate-toast-enter items-center gap-12 rounded-md bg-surface-inverse py-12 ps-16 pe-8 text-body-md text-text-inverse shadow-floating tablet:w-auto tablet:min-w-[320px]"
          >
            <span aria-hidden className={toast.tone === "error" ? "text-status-danger" : "text-chart-income"}>
              <Icon icon={toast.tone === "error" ? "info" : "paid"} size="sm" />
            </span>
            <p className="min-w-0 flex-1">{toast.message}</p>
            {toast.action && (
              <button
                type="button"
                onClick={() => {
                  toast.action?.onAction();
                  setToast(null);
                }}
                className="touch-target h-32 shrink-0 rounded-sm px-8 text-label-md text-brand-accent hover:underline"
              >
                {toast.action.label}
              </button>
            )}
            <button
              type="button"
              aria-label={dismissLabel}
              onClick={() => setToast(null)}
              className="touch-target inline-flex size-32 shrink-0 items-center justify-center rounded-sm text-text-inverse-secondary hover:text-text-inverse"
            >
              <Icon icon="close" size="sm" />
            </button>
          </div>
        )}
      </div>
    </ToastContext.Provider>
  );
}
