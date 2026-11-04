"use client";

import { useId, useRef, useState } from "react";
import { OptionList, type Option } from "./OptionList";
import { PickerField } from "./PickerField";
import { PickerPanel } from "./PickerPanel";

// Tek seçimli liste seçici (RESPONSIVE §4.5.1 [Karar #6]): Select alanı + mobilde bottom sheet, tablet+ popover.
// Kullanıldığı yerler: Yeni İşlem → Tekrarlama Sıklığı, Hatırlatma Bildirimi. Native <select> kullanılmaz.

type SelectPickerProps<T extends string> = {
  id: string;
  name: string;
  options: readonly Option<T>[];
  value: T;
  onChange: (value: T) => void;
  labelledBy: string;
  title: string;
  align?: "start" | "end" | "stretch";
  invalid?: boolean;
  describedBy?: string;
};

export function SelectPicker<T extends string>({ id, name, options, value, onChange, labelledBy, title, align = "stretch", invalid, describedBy }: SelectPickerProps<T>) {
  const titleId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);

  return (
    <div ref={containerRef} className="relative">
      <input type="hidden" name={name} value={value} />
      <PickerField
        ref={triggerRef}
        id={id}
        value={options.find((option) => option.value === value)?.label ?? ""}
        open={open}
        invalid={invalid}
        aria-haspopup="dialog"
        aria-labelledby={`${labelledBy} ${id}`}
        aria-describedby={describedBy}
        onClick={() => setOpen((current) => !current)}
      />
      <PickerPanel
        open={open}
        onClose={() => setOpen(false)}
        title={title}
        titleId={titleId}
        containerRef={containerRef}
        triggerRef={triggerRef}
        align={align}
        widthClass={align === "stretch" ? undefined : "w-[240px]"}
      >
        <OptionList
          options={options}
          value={value}
          labelledBy={titleId}
          autoFocus
          onSelect={(next) => {
            onChange(next);
            setOpen(false);
            triggerRef.current?.focus({ preventScroll: true });
          }}
        />
      </PickerPanel>
    </div>
  );
}
