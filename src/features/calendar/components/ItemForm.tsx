"use client";

import { useActionState, useState, type ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ActionFooter } from "@/components/layout/ActionFooter";
import { Button, ButtonLink } from "@/components/ui/Button";
import { useSheetReturnTo } from "@/components/ui/Sheet";
import { ChipSelect } from "@/components/ui/ChipSelect";
import { DatePicker } from "@/components/ui/DatePicker";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { SelectPicker } from "@/components/ui/SelectPicker";
import { Switch } from "@/components/ui/Switch";
import { TimePicker } from "@/components/ui/TimePicker";
import { fieldBoxClass, inputClass, textareaClass } from "@/components/ui/field";
import type { Category } from "@/features/categories";
import { isLocale } from "@/i18n/config";
import { cn } from "@/lib/cn";
import { formatMoneyInput, formatMoneyTyping, parseMoneyInput } from "@/lib/money";
import { REMINDER_OFFSETS, type ReminderOffset } from "@/lib/recurrence";
import { createCalendarItem, updateCalendarItem } from "../actions";
import type { Subtask } from "../domain/types";
import { SubtaskEditor } from "./SubtaskEditor";
import { DESCRIPTION_MAX_LENGTH, LOCATION_MAX_LENGTH, NOTE_MAX_LENGTH, TITLE_MAX_LENGTH } from "../domain/limits";
import { DURATION_OPTIONS, type CalendarItemKind, type Priority } from "../domain/types";
import type { CalendarItemFormField, CalendarItemFormState } from "../schemas";

// Görev Ekle / Düzenle [Karar #2, RESPONSIVE §8.2.1] · [Eksik] Pages'ta form tasarlanmadı; tamamı varsayımdır.
// Yeni İşlem formunun tasarım dili ve bileşenleri kullanılır (RESPONSIVE §8.5: yeni görsel öğe eklenmez):
//   Tür (Görev / Randevu, D-14) ve Öncelik (Düşük / Normal / Yüksek, varsayılan Normal, D-15) segmented control ·
//   Başlık* · Açıklama · Kategori Seçimi çipleri (Görev / Takvim kategorileri, isteğe bağlı; seçili çipe tekrar dokununca
//   kaldırılır) · Tarih* / Saat + "Tüm gün" anahtarı (Tekrar Eden İşlem kartı kalıbı) · Süre / Hatırlatma seçicileri ·
//   Konum adı + adres · Not (x/200) · İlişkili harcama (bilgi amaçlı, BR-TSK-003) · alt bar İptal (Tertiary) + Kaydet.
// [Ertelendi] Tekrar (FR-CAL-012) ve kaydedilmemiş değişiklik onayı (D-19).

export type ItemFormValues = {
  kind: CalendarItemKind;
  title: string;
  description: string;
  priority: Priority;
  categoryId: string;
  date: string;
  allDay: boolean;
  time: string;
  duration: string;
  reminder: ReminderOffset;
  locationName: string;
  locationAddress: string;
  note: string;
  plannedExpense: string;
  /** "Çoklu seçim": alt görev listesi açık mı (yalnızca Görev). */
  multi: boolean;
  subtasks: Subtask[];
};

type ItemFormProps = {
  mode: "create" | "edit";
  itemId?: string;
  initialValues: ItemFormValues;
  categories: Category[];
  cancelHref: string;
  /** Formun en üstünde gösterilecek alan (Yeni İşlem sheet'inde Gelir · Gider · Ödeme · Görev seçimi). */
  leading?: ReactNode;
};


function Label({ htmlFor, id, required, children }: { htmlFor?: string; id?: string; required?: boolean; children: ReactNode }) {
  const t = useTranslations("calendar.form");
  const Tag = htmlFor ? "label" : "p";
  return (
    <Tag htmlFor={htmlFor} id={id} className="text-body-strong text-text-primary">
      {children}
      {required && (
        <>
          <span aria-hidden className="text-text-danger">
            {" "}*
          </span>
          <span className="sr-only"> ({t("required")})</span>
        </>
      )}
    </Tag>
  );
}

function ErrorText({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="text-caption text-text-danger">
      {message}
    </p>
  );
}

const limits: Partial<Record<CalendarItemFormField, number>> = {
  title: TITLE_MAX_LENGTH,
  description: DESCRIPTION_MAX_LENGTH,
  note: NOTE_MAX_LENGTH,
  locationName: LOCATION_MAX_LENGTH,
  locationAddress: LOCATION_MAX_LENGTH,
};

export function ItemForm({ mode, itemId, initialValues, categories, cancelHref, leading }: ItemFormProps) {
  const t = useTranslations("calendar");
  const tRecurrence = useTranslations("recurrence");
  const rawLocale = useLocale();
  const locale = isLocale(rawLocale) ? rawLocale : "tr";

  const action = mode === "edit" && itemId ? updateCalendarItem.bind(null, itemId) : createCalendarItem;
  const [state, formAction, pending] = useActionState<CalendarItemFormState, FormData>(action, {});
  const returnTo = useSheetReturnTo();
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState(state.errors ?? {});
  const [lastState, setLastState] = useState(state);
  if (state !== lastState) {
    setLastState(state);
    setErrors(state.errors ?? {});
  }

  const set = <K extends keyof ItemFormValues>(key: K, value: ItemFormValues[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      if (!(key in current)) return current;
      const next = { ...current };
      delete next[key as CalendarItemFormField];
      return next;
    });
  };

  const errorText = (field: CalendarItemFormField) => {
    const key = errors[field];
    return key ? t(`form.errors.${key}`, { max: limits[field] ?? TITLE_MAX_LENGTH }) : undefined;
  };
  const invalid = (field: CalendarItemFormField) => (errors[field] ? true : undefined);
  const describedBy = (field: CalendarItemFormField) => (errors[field] ? `${field}-error` : undefined);

  const durationOptions = [{ value: "", label: t("form.durationNone") }, ...DURATION_OPTIONS.map((minutes) => ({ value: String(minutes), label: t("form.durationMinutes", { count: minutes }) }))];
  const reminderOptions = REMINDER_OFFSETS.map((value) => ({ value, label: tRecurrence(`reminder.${value}`) }));

  function completeExpense() {
    const minor = parseMoneyInput(values.plannedExpense, locale);
    if (minor !== null) set("plannedExpense", formatMoneyInput(minor, locale));
  }

  return (
    <form action={formAction} noValidate className="flex flex-1 flex-col gap-(--layout-section-gap)">
      {/* Yeni İşlem sheet'i bulunulan ekranın üstünde açıldıysa kayıttan sonra o ekrana dönülür. */}
      {returnTo && <input type="hidden" name="returnTo" value={returnTo} />}
      <input type="hidden" name="kind" value={values.kind} />
      {/* Alt görevler JSON olarak gönderilir; "Çoklu seçim" kapalıysa veya randevuysa boş liste. */}
      <input type="hidden" name="subtasks" value={JSON.stringify(values.kind === "task" && values.multi ? values.subtasks : [])} />
      <input type="hidden" name="priority" value={values.priority} />
      <input type="hidden" name="categoryId" value={values.categoryId} />
      <input type="hidden" name="allDay" value={String(values.allDay)} />
      {values.allDay && (
        <>
          <input type="hidden" name="time" value="" />
          <input type="hidden" name="duration" value="" />
        </>
      )}

      {state.formError && (
        <p role="alert" className="rounded-lg bg-status-danger-subtle p-16 text-body text-text-on-danger">
          {t(`form.errors.${state.formError}`)}
        </p>
      )}

      {leading}

      <div className="flex flex-col gap-8">
        <Label id="kind-label" required>
          {t("form.kind")}
        </Label>
        <SegmentedControl
          label={t("form.kind")}
          fullWidth
          value={values.kind}
          onChange={(next) => set("kind", next)}
          options={[
            { value: "task", label: t("kind.task") },
            { value: "appointment", label: t("kind.appointment") },
          ]}
        />
      </div>

      <div className="flex flex-col gap-8">
        <Label htmlFor="title" required>
          {t("form.title")}
        </Label>
        <input
          id="title"
          name="title"
          maxLength={TITLE_MAX_LENGTH}
          placeholder={t("form.titlePlaceholder")}
          value={values.title}
          onChange={(event) => set("title", event.target.value)}
          aria-invalid={invalid("title")}
          aria-describedby={describedBy("title")}
          className={inputClass}
        />
        <ErrorText id="title-error" message={errorText("title")} />
      </div>

      <div className="flex flex-col gap-8">
        <Label htmlFor="description">{t("form.description")}</Label>
        <input
          id="description"
          name="description"
          maxLength={DESCRIPTION_MAX_LENGTH}
          placeholder={t("form.descriptionPlaceholder")}
          value={values.description}
          onChange={(event) => set("description", event.target.value)}
          aria-invalid={invalid("description")}
          aria-describedby={describedBy("description")}
          className={inputClass}
        />
        <ErrorText id="description-error" message={errorText("description")} />
      </div>

      <div className="flex flex-col gap-8">
        <Label id="priority-label">{t("form.priority")}</Label>
        <SegmentedControl
          label={t("form.priority")}
          fullWidth
          value={values.priority}
          onChange={(next) => set("priority", next)}
          options={(["low", "normal", "high"] as const).map((value) => ({ value, label: t(`form.priorities.${value}`) }))}
        />
      </div>

      {categories.length > 0 && (
        <div className="flex flex-col gap-8">
          <Label id="category-label">{t("form.category")}</Label>
          <div role="group" aria-labelledby="category-label" aria-describedby={describedBy("categoryId")} className="flex flex-wrap gap-8">
            {categories.map((category) => {
              const selected = values.categoryId === category.id;
              return (
                <ChipSelect key={category.id} selected={selected} aria-pressed={selected} onClick={() => set("categoryId", selected ? "" : category.id)}>
                  {category.name}
                </ChipSelect>
              );
            })}
          </div>
          <ErrorText id="categoryId-error" message={errorText("categoryId")} />
        </div>
      )}

      <fieldset className="flex flex-col gap-8">
        <legend className="mb-8 text-body-strong text-text-primary">{t("form.when")}</legend>
        <div className={cn("grid gap-12", values.allDay ? "grid-cols-1" : "grid-cols-2")}>
          <div className="flex min-w-0 flex-col gap-4">
            <p id="date-label" className="text-caption text-text-secondary">
              {t("form.date")}
              <span aria-hidden className="text-text-danger">
                {" "}*
              </span>
            </p>
            <DatePicker
              id="date"
              name="date"
              value={values.date}
              onChange={(next) => set("date", next)}
              labelledBy="date-label"
              title={t("form.chooseDate")}
              invalid={invalid("date")}
              describedBy={describedBy("date")}
            />
            <ErrorText id="date-error" message={errorText("date")} />
          </div>
          {!values.allDay && (
            <div className="flex min-w-0 flex-col gap-4">
              <p id="time-label" className="text-caption text-text-secondary">
                {t("form.time")}
              </p>
              <TimePicker
                id="time"
                name="time"
                value={values.time}
                onChange={(next) => set("time", next)}
                labelledBy="time-label"
                title={t("form.chooseTime")}
                invalid={invalid("time")}
                describedBy={describedBy("time")}
              />
              <ErrorText id="time-error" message={errorText("time")} />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-12 rounded-lg bg-surface-card shadow-elev-1 p-12">
          <div className="flex items-center justify-between gap-12">
            <div className="flex min-w-0 flex-col gap-2">
              <p id="allDay-label" className="text-body-strong text-text-primary">
                {t("form.allDay")}
              </p>
              <p id="allDay-hint" className="text-caption text-text-secondary">
                {t("form.allDayHint")}
              </p>
            </div>
            <Switch id="allDay" checked={values.allDay} onChange={(next) => set("allDay", next)} labelledBy="allDay-label" describedBy="allDay-hint" />
          </div>
          <div className="border-t border-border-default" />
          <div className={cn("grid gap-8", values.allDay ? "grid-cols-1" : "grid-cols-2")}>
            {!values.allDay && (
              <div className="flex min-w-0 flex-col gap-4">
                <p id="duration-label" className="text-caption-strong text-text-secondary">
                  {t("form.duration")}
                </p>
                <SelectPicker
                  id="duration"
                  name="duration"
                  options={durationOptions}
                  value={values.duration}
                  onChange={(next) => set("duration", next)}
                  labelledBy="duration-label"
                  title={t("form.chooseDuration")}
                  align="start"
                  invalid={invalid("duration")}
                  describedBy={describedBy("duration")}
                />
                <ErrorText id="duration-error" message={errorText("duration")} />
              </div>
            )}
            <div className="flex min-w-0 flex-col gap-4">
              <p id="reminder-label" className="text-caption-strong text-text-secondary">
                {t("form.reminder")}
              </p>
              <SelectPicker
                id="reminder"
                name="reminder"
                options={reminderOptions}
                value={values.reminder}
                onChange={(next) => set("reminder", next)}
                labelledBy="reminder-label"
                title={t("form.chooseReminder")}
                align="end"
                invalid={invalid("reminder")}
                describedBy={describedBy("reminder")}
              />
            </div>
          </div>
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-8">
        {/* Tek konum alanı (ürün sahibi isteği 2026-11-05): ad ve adres ayrı sorulmaz; örnek metin kişi adı içermez. */}
        <legend className="mb-8 text-body-strong text-text-primary">{t("form.location")}</legend>
        <label htmlFor="locationName" className="sr-only">
          {t("form.location")}
        </label>
        <input
          id="locationName"
          name="locationName"
          maxLength={LOCATION_MAX_LENGTH}
          placeholder={t("form.locationNamePlaceholder")}
          value={values.locationName}
          onChange={(event) => set("locationName", event.target.value)}
          aria-invalid={invalid("locationName")}
          aria-describedby={describedBy("locationName")}
          className={inputClass}
        />
        <ErrorText id="locationName-error" message={errorText("locationName")} />
      </fieldset>

      <div className="flex flex-col gap-8">
        <div className="flex items-baseline justify-between gap-8">
          <Label htmlFor="note">{t("form.note")}</Label>
          <span className="text-caption text-text-secondary" aria-live="polite">
            {t("form.noteCount", { count: values.note.length, max: NOTE_MAX_LENGTH })}
          </span>
        </div>
        <textarea
          id="note"
          name="note"
          rows={3}
          maxLength={NOTE_MAX_LENGTH}
          placeholder={t("form.notePlaceholder")}
          value={values.note}
          onChange={(event) => set("note", event.target.value)}
          aria-invalid={invalid("note")}
          aria-describedby={describedBy("note")}
          className={textareaClass}
        />
        <ErrorText id="note-error" message={errorText("note")} />
      </div>

      {values.kind === "task" && (
        <div className="flex flex-col gap-12 rounded-lg bg-surface-card p-12 shadow-elev-1">
          <div className="flex items-center justify-between gap-12">
            <div className="flex min-w-0 flex-col gap-2">
              <p id="multi-label" className="text-body-strong text-text-primary">
                {t("form.multi")}
              </p>
              <p id="multi-hint" className="text-caption text-text-secondary">
                {t("form.multiHint")}
              </p>
            </div>
            <Switch id="multi" checked={values.multi} onChange={(next) => set("multi", next)} labelledBy="multi-label" describedBy="multi-hint" />
          </div>
          {values.multi && (
            <>
              <div className="border-t border-border-subtle" />
              <SubtaskEditor value={values.subtasks} onChange={(next) => set("subtasks", next)} />
            </>
          )}
        </div>
      )}

      <div className="flex flex-col gap-8">
        <Label htmlFor="plannedExpense">{t("form.plannedExpense")}</Label>
        <label
          htmlFor="plannedExpense"
          className={fieldBoxClass(Boolean(invalid("plannedExpense")))}
        >
          <input
            id="plannedExpense"
            name="plannedExpense"
            inputMode="decimal"
            autoComplete="off"
            placeholder="0"
            value={values.plannedExpense}
            onChange={(event) => set("plannedExpense", formatMoneyTyping(event.target.value, locale))}
            onBlur={completeExpense}
            aria-invalid={invalid("plannedExpense")}
            aria-describedby={errors.plannedExpense ? "plannedExpense-error" : "plannedExpense-hint"}
            className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-text-secondary"
          />
          <span aria-hidden className="text-text-secondary">
            ₺
          </span>
        </label>
        <p id="plannedExpense-hint" className="text-caption text-text-secondary">
          {t("form.plannedExpenseHint")}
        </p>
        <ErrorText id="plannedExpense-error" message={errorText("plannedExpense")} />
      </div>

      <ActionFooter>
        <ButtonLink href={cancelHref} scroll={false} variant="tertiary">
          {t("form.cancel")}
        </ButtonLink>
        <Button type="submit" loading={pending}>
          {t("form.save")}
        </Button>
      </ActionFooter>
    </form>
  );
}
