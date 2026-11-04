"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import { intlLocale, isLocale } from "@/i18n/config";
import { cn } from "@/lib/cn";
import { addDays, formatDateLong, formatMonthLabel, shiftMonth, toDateKey, weekdayIndex, type DateKey, type MonthKey, type WeekStart } from "@/lib/dates";
import { useWeekStart } from "@/lib/weekStart";
import { Icon } from "./Icon";
import { PickerField } from "./PickerField";
import { PickerPanel } from "./PickerPanel";

// Özel tarih seçici (RESPONSIVE §4.5.1 [Karar #6]): tarayıcının native seçicisi kullanılmaz.
// Görsel dil Pages → Takvim "Monthly Calendar Matrix":
//   kart padding 8 · gün başlıkları 12 SemiBold text-secondary · hücre 44 px yükseklik, radius-md (12), aralık 4
//   gün Body/Default text-primary · hafta sonu text-secondary · ay dışı günler 12 px text-tertiary (Neutral/400)
//   bugün: Brand/Primary Subtle zemin + Brand/Primary çerçeve ve metin · seçili: Brand/Primary zemin + beyaz metin
// Klavye: ← → ±1 gün, ↑ ↓ ±1 hafta, Home/End hafta başı/sonu, PageUp/PageDown ±1 ay, Enter seç.
// [Varsayım] Hafta pazartesi başlar (TR); EN'de de aynı tutuldu.

type DatePickerProps = {
  id: string;
  name: string;
  value: DateKey;
  onChange: (value: DateKey) => void;
  labelledBy: string;
  title: string;
  invalid?: boolean;
  describedBy?: string;
};


function monthDays(month: MonthKey, weekStart: WeekStart): DateKey[] {
  const first = `${month}-01`;
  const start = addDays(first, -weekdayIndex(first, weekStart));
  const last = addDays(`${shiftMonth(month, 1)}-01`, -1);
  const end = addDays(last, 6 - weekdayIndex(last, weekStart));
  const days: DateKey[] = [];
  for (let day = start; day <= end; day = addDays(day, 1)) days.push(day);
  return days;
}

export function DatePicker({ id, name, value, onChange, labelledBy, title, invalid, describedBy }: DatePickerProps) {
  const t = useTranslations("picker");
  const rawLocale = useLocale();
  const locale = isLocale(rawLocale) ? rawLocale : "tr";
  const weekStart = useWeekStart();
  const titleId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const gridRef = useRef<HTMLTableElement>(null);
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState<DateKey>(value);
  // Odak, ilgili gün çizildikten sonra taşınır (ay değişince yeni hücre henüz DOM'da değildir).
  const shouldFocus = useRef(false);

  const month = focused.slice(0, 7);
  const today = toDateKey(new Date());
  const weekdays = Array.from({ length: 7 }, (_, index) =>
    new Intl.DateTimeFormat(intlLocale[locale], { weekday: "short", timeZone: "UTC" }).format(new Date(Date.UTC(2024, 0, weekStart + index))), // 1 Ocak 2024 Pazartesi
  );

  useEffect(() => {
    if (!open || !shouldFocus.current) return;
    gridRef.current?.querySelector<HTMLElement>(`[data-date="${focused}"]`)?.focus({ preventScroll: true });
    shouldFocus.current = false;
  }, [open, focused]);

  function openPicker() {
    setFocused(value);
    shouldFocus.current = true;
    setOpen(true);
  }

  function select(date: DateKey) {
    onChange(date);
    setOpen(false);
    triggerRef.current?.focus({ preventScroll: true });
  }

  function moveFocus(date: DateKey) {
    setFocused(date);
    shouldFocus.current = true;
  }

  function onGridKeyDown(event: KeyboardEvent<HTMLTableElement>) {
    const moves: Record<string, () => DateKey> = {
      ArrowLeft: () => addDays(focused, -1),
      ArrowRight: () => addDays(focused, 1),
      ArrowUp: () => addDays(focused, -7),
      ArrowDown: () => addDays(focused, 7),
      Home: () => addDays(focused, -weekdayIndex(focused, weekStart)),
      End: () => addDays(focused, 6 - weekdayIndex(focused, weekStart)),
      PageUp: () => `${shiftMonth(month, -1)}-${focused.slice(8)}`,
      PageDown: () => `${shiftMonth(month, 1)}-${focused.slice(8)}`,
    };
    const move = moves[event.key];
    if (!move) return;
    event.preventDefault();
    let next = move();
    // 31 Ocak → PageDown: Şubat'ın son gününe düşer.
    while (Number.isNaN(new Date(`${next}T00:00:00Z`).getTime()) || new Date(`${next}T00:00:00Z`).toISOString().slice(0, 10) !== next) {
      next = `${next.slice(0, 8)}${String(Number(next.slice(8)) - 1).padStart(2, "0")}`;
    }
    moveFocus(next);
  }

  const days = monthDays(month, weekStart);
  const weeks = Array.from({ length: days.length / 7 }, (_, index) => days.slice(index * 7, index * 7 + 7));
  const arrowClass =
    "touch-target inline-flex size-32 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-action-tertiary-hover hover:text-text-primary";

  return (
    <div ref={containerRef} className="relative">
      <input type="hidden" name={name} value={value} />
      <PickerField
        ref={triggerRef}
        id={id}
        icon="calendar"
        value={formatDateLong(value, locale)}
        open={open}
        invalid={invalid}
        aria-haspopup="dialog"
        aria-labelledby={`${labelledBy} ${id}`}
        aria-describedby={describedBy}
        onClick={() => (open ? setOpen(false) : openPicker())}
      />
      <PickerPanel
        open={open}
        onClose={() => setOpen(false)}
        title={title}
        titleId={titleId}
        containerRef={containerRef}
        triggerRef={triggerRef}
        align="start"
        widthClass="w-[358px] max-w-[calc(100vw-32px)]"
      >
        <div className="flex flex-col gap-4">
          <div className="flex h-40 items-center justify-between px-4">
            <button type="button" aria-label={t("previousMonth")} className={arrowClass} onClick={() => moveFocus(`${shiftMonth(month, -1)}-01`)}>
              <Icon icon="previous" size="sm" />
            </button>
            <p aria-live="polite" className="text-body-lg text-text-primary">
              {formatMonthLabel(month, locale)}
            </p>
            <button type="button" aria-label={t("nextMonth")} className={arrowClass} onClick={() => moveFocus(`${shiftMonth(month, 1)}-01`)}>
              <Icon icon="next" size="sm" />
            </button>
          </div>
          <table ref={gridRef} role="grid" aria-labelledby={titleId} onKeyDown={onGridKeyDown} className="w-full table-fixed border-separate border-spacing-4">
            <thead>
              <tr>
                {weekdays.map((weekday) => (
                  <th key={weekday} scope="col" className="pb-4 text-label-sm text-text-secondary">
                    {weekday}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {weeks.map((week) => (
                <tr key={week[0]}>
                  {week.map((day) => {
                    const inMonth = day.startsWith(month);
                    const selected = day === value;
                    const isToday = day === today;
                    const weekend = [0, 6].includes(new Date(`${day}T00:00:00Z`).getUTCDay());
                    return (
                      <td key={day} aria-selected={selected} className="p-0">
                        <button
                          type="button"
                          data-date={day}
                          tabIndex={day === focused ? 0 : -1}
                          aria-current={isToday ? "date" : undefined}
                          aria-label={formatDateLong(day, locale)}
                          onClick={() => select(day)}
                          className={cn(
                            "flex h-44 w-full items-center justify-center rounded-md border transition-colors",
                            selected
                              ? "border-brand-primary bg-brand-primary text-body-md text-text-inverse"
                              : isToday
                                ? "border-brand-primary bg-brand-primary-subtle text-body-md text-text-brand"
                                : "border-transparent hover:bg-surface-page",
                            !selected && !isToday && (inMonth ? cn("text-body-md", weekend ? "text-text-secondary" : "text-text-primary") : "text-body-sm text-text-tertiary"),
                          )}
                        >
                          {Number(day.slice(8))}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PickerPanel>
    </div>
  );
}
