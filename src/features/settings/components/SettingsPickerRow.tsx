"use client";

import { useId, useRef, useState } from "react";
import { OptionList, type Option } from "@/components/ui/OptionList";
import { PickerPanel } from "@/components/ui/PickerPanel";
import type { AppIconName } from "@/config/icons";
import { cn } from "@/lib/cn";
import { interactiveRowClass, rowClass, SettingsRowContent, SettingsValue } from "./SettingsRow";

// Değer seçimli ayar satırı (RESPONSIVE §3.6.1 [Karar #6]): mobilde bottom sheet, tablet+ satıra bağlı popover.
// Seçici kabuğu ve liste, form alanlarındaki SelectPicker ile aynıdır.

type SettingsPickerRowProps<T extends string> = {
  icon: AppIconName;
  title: string;
  hint: string;
  /** Satırın sağındaki güncel değer; dışa aktarma gibi değersiz satırlarda verilmez. */
  valueLabel?: string;
  pickerTitle: string;
  options: readonly Option<T>[];
  value: T;
  onSelect: (value: T) => void;
  pending?: boolean;
};

export function SettingsPickerRow<T extends string>({ icon, title, hint, valueLabel, pickerTitle, options, value, onSelect, pending }: SettingsPickerRowProps<T>) {
  const titleId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-busy={pending || undefined}
        disabled={pending}
        onClick={() => setOpen((current) => !current)}
        data-settings-row
        className={cn(rowClass, interactiveRowClass, "disabled:cursor-wait")}
      >
        <SettingsRowContent icon={icon} title={title} hint={hint} trailing={valueLabel ? <SettingsValue>{valueLabel}</SettingsValue> : undefined} />
      </button>
      <PickerPanel open={open} onClose={() => setOpen(false)} title={pickerTitle} titleId={titleId} containerRef={containerRef} triggerRef={triggerRef} align="end" widthClass="w-[240px]">
        <OptionList
          options={options}
          value={value}
          labelledBy={titleId}
          autoFocus
          onSelect={(next) => {
            setOpen(false);
            triggerRef.current?.focus({ preventScroll: true });
            onSelect(next);
          }}
        />
      </PickerPanel>
    </div>
  );
}
