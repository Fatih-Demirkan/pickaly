"use client";

import { cn } from "@/lib/cn";

// Pages → "Label - Custom Active State Toggle Switch" (Yeni İşlem "Tekrar Eden İşlem"):
//   zemin 44×24 tam yuvarlak · düğme 20, kenardan 2 px
//   kapalı: Neutral/200 zemin + Neutral/400 düğme · açık: Chart/Income zemin + beyaz düğme
// Etiket ve açıklama dışarıdadır; `aria-labelledby` / `aria-describedby` ile bağlanır (WAI-ARIA switch).

type SwitchProps = {
  id?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  labelledBy: string;
  describedBy?: string;
};

export function Switch({ id, checked, onChange, labelledBy, describedBy }: SwitchProps) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      onClick={() => onChange(!checked)}
      className={cn(
        "touch-target relative inline-flex h-24 w-44 shrink-0 items-center rounded-full transition-colors",
        checked ? "bg-control-track-on" : "bg-control-track-off",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "absolute top-2 size-20 rounded-full transition-[inset-inline-start,background-color] motion-reduce:transition-none",
          checked ? "start-22 bg-control-thumb-on" : "start-2 bg-control-thumb-off",
        )}
      />
    </button>
  );
}
