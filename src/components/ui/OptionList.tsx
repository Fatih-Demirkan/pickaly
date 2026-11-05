"use client";

import { useEffect, useRef, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "./Icon";

// Seçici liste satırı (RESPONSIVE §4.5.1, DESIGN §8.2 [Ç-13]): 48 px, radius-md;
// seçili: surface-selected (Neutral/100, ürün sahibi kararı) zemin + brand metin + check ikonu.
// Klavye: ↑ ↓ Home End ile gezinme, Enter / Boşluk ile seçme (WAI-ARIA listbox).

export type Option<T extends string> = {
  value: T;
  label: string;
  /** Sağda ikincil bilgi (ör. hesap bakiyesi). */
  description?: string;
  leading?: ReactNode;
};

type OptionListProps<T extends string> = {
  options: readonly Option<T>[];
  value: T;
  onSelect: (value: T) => void;
  labelledBy: string;
  /** Açılınca seçili satıra odaklan ve görünür alana kaydır. */
  autoFocus?: boolean;
  className?: string;
};

/** Yalnızca listenin kendi kaydırmasını ayarlar; scrollIntoView gibi drawer'ı ve sayfayı kaydırmaz. */
function scrollWithin(list: HTMLElement, item: HTMLElement, mode: "center" | "nearest") {
  const top = item.offsetTop;
  const bottom = top + item.offsetHeight;
  if (mode === "center") list.scrollTop = top - (list.clientHeight - item.offsetHeight) / 2;
  else if (top < list.scrollTop) list.scrollTop = top;
  else if (bottom > list.scrollTop + list.clientHeight) list.scrollTop = bottom - list.clientHeight;
}

export function OptionList<T extends string>({ options, value, onSelect, labelledBy, autoFocus, className }: OptionListProps<T>) {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const list = listRef.current;
    const selected = list?.querySelector<HTMLElement>('[aria-selected="true"]');
    if (!list || !selected) return;
    scrollWithin(list, selected, "center");
    if (autoFocus) selected.focus({ preventScroll: true });
  }, [autoFocus]);

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const items = [...(listRef.current?.querySelectorAll<HTMLElement>('[role="option"]') ?? [])];
    const index = items.indexOf(document.activeElement as HTMLElement);
    const move = (next: number) => {
      event.preventDefault();
      const target = items[Math.max(0, Math.min(items.length - 1, next))];
      if (!target || !listRef.current) return;
      target.focus({ preventScroll: true });
      scrollWithin(listRef.current, target, "nearest");
    };
    if (event.key === "ArrowDown") move(index + 1);
    else if (event.key === "ArrowUp") move(index - 1);
    else if (event.key === "Home") move(0);
    else if (event.key === "End") move(items.length - 1);
  }

  return (
    <div ref={listRef} role="listbox" aria-labelledby={labelledBy} onKeyDown={onKeyDown} className={cn("relative flex flex-col gap-2", className)}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <div
            key={option.value}
            role="option"
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onSelect(option.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onSelect(option.value);
              }
            }}
            className={cn(
              "flex h-48 shrink-0 cursor-pointer items-center gap-12 rounded-md px-12 text-body transition-colors outline-none",
              "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-border-focus",
              selected ? "bg-surface-selected text-text-brand" : "text-text-primary hover:bg-surface-page",
            )}
          >
            {option.leading}
            <span className={cn("min-w-0 flex-1 truncate", selected && "text-body-strong")}>{option.label}</span>
            {option.description && <span className="shrink-0 text-caption text-text-secondary">{option.description}</span>}
            {selected && (
              <span className="shrink-0 text-brand-primary">
                <Icon icon="confirm" size="sm" />
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
