"use client";

import { useId, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { OptionList } from "./OptionList";
import { PickerField } from "./PickerField";
import { PickerPanel } from "./PickerPanel";

// Özel saat seçici (RESPONSIVE §4.5.1 [Karar #6]): saat ve dakika listesi, satırlar 48 px.
// Saat seçilince panel açık kalır; dakika seçilince kapanır. Değer "HH:mm" (24 saat).
// Dakika adımı 15 (ürün sahibi kararı 2026-11-05): 00 · 15 · 30 · 45. Eski bir kayıt bu adımların dışında bir dakika
// taşıyorsa (ör. 15:42) o dakika listeye eklenir ki değer kaybolmasın ve seçili görünsün.

type TimePickerProps = {
  id: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  labelledBy: string;
  title: string;
  invalid?: boolean;
  describedBy?: string;
};

const pad = (value: number) => String(value).padStart(2, "0");
const hours = Array.from({ length: 24 }, (_, hour) => ({ value: pad(hour), label: pad(hour) }));
const MINUTE_STEP = 15;
const stepMinutes = Array.from({ length: 60 / MINUTE_STEP }, (_, index) => pad(index * MINUTE_STEP));

function minuteOptions(current: string) {
  const values = stepMinutes.includes(current) || !/^\d{2}$/.test(current) ? stepMinutes : [...stepMinutes, current].sort();
  return values.map((value) => ({ value, label: value }));
}

export function TimePicker({ id, name, value, onChange, labelledBy, title, invalid, describedBy }: TimePickerProps) {
  const t = useTranslations("picker");
  const titleId = useId();
  const hourLabelId = useId();
  const minuteLabelId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [hour = "00", minute = "00"] = value.split(":");

  function close() {
    setOpen(false);
    triggerRef.current?.focus({ preventScroll: true });
  }

  return (
    <div ref={containerRef} className="relative">
      <input type="hidden" name={name} value={value} />
      <PickerField
        ref={triggerRef}
        id={id}
        icon="time"
        value={value}
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
        align="end"
        widthClass="w-[240px]"
      >
        <div className="grid grid-cols-2 gap-8">
          <div className="flex min-w-0 flex-col gap-4">
            <p id={hourLabelId} className="px-12 pt-4 text-caption-strong text-text-secondary">
              {t("hour")}
            </p>
            <OptionList options={hours} value={hour} labelledBy={hourLabelId} autoFocus onSelect={(next) => onChange(`${next}:${minute}`)} className="max-h-[240px] overflow-y-auto [scrollbar-width:thin]" />
          </div>
          <div className="flex min-w-0 flex-col gap-4">
            <p id={minuteLabelId} className="px-12 pt-4 text-caption-strong text-text-secondary">
              {t("minute")}
            </p>
            <OptionList
              options={minuteOptions(minute)}
              value={minute}
              labelledBy={minuteLabelId}
              onSelect={(next) => {
                onChange(`${hour}:${next}`);
                close();
              }}
              className="max-h-[240px] overflow-y-auto [scrollbar-width:thin]"
            />
          </div>
        </div>
      </PickerPanel>
    </div>
  );
}
