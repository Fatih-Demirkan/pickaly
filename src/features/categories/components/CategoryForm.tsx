"use client";

import { useActionState, useState, type ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ActionFooter } from "@/components/layout/ActionFooter";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { categoryIcons, type CategoryIconName } from "@/config/icons";
import { isLocale } from "@/i18n/config";
import { cn } from "@/lib/cn";
import { formatMoneyInput, formatMoneyTyping, parseMoneyInput } from "@/lib/money";
import { saveCategory } from "../actions";
import { CATEGORY_COLORS, type CategoryColor, type CategoryType } from "../domain/types";
import { NAME_MAX_LENGTH, NOTE_MAX_LENGTH, type CategoryFormField, type CategoryFormState } from "../schemas";
import { CategoryIcon } from "./CategoryIcon";
import { categoryChipClass, categorySurfaceClass } from "./categoryStyle";

// Pages → Kategori Ekle ve Düzenle (152:1354, PRD FR-SET-008, §9.1), RESPONSIVE §3.6.2 (Yeni İşlem ile aynı drawer).
//   "Canlı Önizleme" kartı: tür çipi + kategori çipi (ikon + ad) · İşlem Türü segmented (Gelir / Gider / Abonelik)
//   Başlık* · İkon Seçimi (5 sütun, 42 px kutu, seçili 2 px odak çerçevesi) · Renk Paleti (5 sütun, 32 px daire)
//   Aylık Bütçe Limiti (₺, ipucu) · Not (x/200) · alt bar İptal (Tertiary) + Kaydet.
// [Varsayım] Görev / Takvim sekmesinden açılan formda tür sabittir ("Görev / Takvim") ve segmented gizlenir.
// [Varsayım] Düzenlemede tür değiştirilemez (bağlı kayıtların türü korunur); segmented devre dışı görünür.
// [Varsayım] Bütçe limiti yalnızca gider kategorisinde gösterilir (PRD §9.1 [Öneri]).
// [Varsayım] Pages'taki 10 ikonun dışında bir ikona sahip kategori düzenlenirken o ikon ızgaranın başına eklenir.

export type CategoryFormValues = { type: CategoryType; name: string; icon: CategoryIconName; color: CategoryColor; budget: string; note: string };

type CategoryFormProps = { categoryId?: string; initialValues: CategoryFormValues; cancelHref: string };

const PAGES_ICONS: CategoryIconName[] = ["birdhouse", "house", "car", "coffee", "briefcase-medical", "heart", "receipt-text", "wallet", "gift", "paw-print"];
const FINANCE_OPTIONS = ["income", "expense", "subscription"] as const;

const inputClass =
  "h-46 w-full rounded-md border border-border-default bg-surface-card px-16 text-body-md text-text-primary placeholder:text-text-tertiary transition-colors hover:border-border-strong aria-invalid:border-border-error";

function Label({ htmlFor, id, required, children }: { htmlFor?: string; id?: string; required?: boolean; children: ReactNode }) {
  const t = useTranslations("categories.form");
  const Tag = htmlFor ? "label" : "p";
  return (
    <Tag htmlFor={htmlFor} id={id} className="text-label-md text-text-primary">
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
    <p id={id} className="text-body-sm text-text-danger">
      {message}
    </p>
  );
}

export function CategoryForm({ categoryId, initialValues, cancelHref }: CategoryFormProps) {
  const t = useTranslations("categories");
  const rawLocale = useLocale();
  const locale = isLocale(rawLocale) ? rawLocale : "tr";
  const edit = Boolean(categoryId);

  const [state, formAction, pending] = useActionState<CategoryFormState, FormData>(saveCategory.bind(null, categoryId ?? null), {});
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState(state.errors ?? {});
  const [lastState, setLastState] = useState(state);
  if (state !== lastState) {
    setLastState(state);
    setErrors(state.errors ?? {});
  }

  const set = <K extends keyof CategoryFormValues>(key: K, value: CategoryFormValues[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      if (!(key in current)) return current;
      const next = { ...current };
      delete next[key as CategoryFormField];
      return next;
    });
  };
  const errorText = (field: CategoryFormField) => {
    const key = errors[field];
    return key ? t(`form.errors.${key}`, { max: field === "note" ? NOTE_MAX_LENGTH : NAME_MAX_LENGTH }) : undefined;
  };
  const invalid = (field: CategoryFormField) => (errors[field] ? true : undefined);
  const describedBy = (field: CategoryFormField) => (errors[field] ? `${field}-error` : undefined);

  const icons = PAGES_ICONS.includes(initialValues.icon) ? PAGES_ICONS : [initialValues.icon, ...PAGES_ICONS];
  const calendar = values.type === "calendar";
  const expense = values.type === "expense";

  function completeBudget() {
    const minor = parseMoneyInput(values.budget, locale);
    if (minor !== null) set("budget", formatMoneyInput(minor, locale));
  }

  return (
    <form action={formAction} noValidate className="flex flex-1 flex-col gap-(--layout-section-gap)">
      <input type="hidden" name="type" value={values.type} />
      <input type="hidden" name="icon" value={values.icon} />
      <input type="hidden" name="color" value={values.color} />

      {state.formError && (
        <p role="alert" className="rounded-md bg-status-danger-subtle p-12 text-body-md text-text-danger">
          {t(`form.errors.${state.formError}`)}
        </p>
      )}

      {/* Canlı Önizleme — formla birlikte kayar; tablet+ drawer içinde üstte sabit */}
      <section aria-labelledby="category-preview" className="sticky top-0 z-1 flex flex-col items-center gap-12 rounded-2xl border border-border-default bg-surface-card p-16 shadow-floating">
        <h2 id="category-preview" className="text-label-sm text-text-secondary">
          {t("form.preview")}
        </h2>
        <span className="inline-flex h-24 items-center rounded-full bg-surface-muted px-8 text-label-sm text-text-secondary">{t(`type.${values.type}`)}</span>
        <span aria-live="polite" className={cn("inline-flex h-40 max-w-full items-center gap-8 rounded-full pe-16 ps-4 text-label-md", categoryChipClass(values.color))}>
          <CategoryIcon category={values} size="sm" className="rounded-full" />
          <span className="truncate">{values.name.trim() || t("form.previewPlaceholder")}</span>
        </span>
      </section>

      {!calendar && (
        <SegmentedControl
          label={t("form.type")}
          value={values.type}
          disabled={edit}
          onChange={(next) => set("type", next)}
          options={FINANCE_OPTIONS.map((value) => ({ value, label: t(`type.${value}`) }))}
        />
      )}

      <div className="flex flex-col gap-8">
        <Label htmlFor="name" required>
          {t("form.name")}
        </Label>
        <input
          id="name"
          name="name"
          maxLength={NAME_MAX_LENGTH}
          autoComplete="off"
          placeholder={t("form.namePlaceholder")}
          value={values.name}
          onChange={(event) => set("name", event.target.value)}
          aria-invalid={invalid("name")}
          aria-describedby={describedBy("name")}
          className={inputClass}
        />
        <ErrorText id="name-error" message={errorText("name")} />
      </div>

      <div className="flex flex-col gap-8">
        <Label id="icon-label">{t("form.icon")}</Label>
        <div role="radiogroup" aria-labelledby="icon-label" className="grid grid-cols-5 gap-12">
          {icons.map((icon) => {
            const selected = values.icon === icon;
            return (
              <button
                key={icon}
                type="button"
                role="radio"
                aria-checked={selected}
                aria-label={t(`icon.${icon}`)}
                onClick={() => set("icon", icon)}
                className={cn(
                  "touch-target inline-flex h-42 items-center justify-center rounded-md text-text-primary transition-colors",
                  selected ? "border-2 border-border-focus bg-surface-selected" : "border border-border-default bg-surface-card hover:border-border-strong",
                )}
              >
                <Icon icon={categoryIcons[icon]} />
              </button>
            );
          })}
        </div>
        <ErrorText id="icon-error" message={errorText("icon")} />
      </div>

      <div className="flex flex-col gap-8">
        <Label id="color-label">{t("form.color")}</Label>
        <div role="radiogroup" aria-labelledby="color-label" className="grid grid-cols-5 justify-items-center gap-12">
          {CATEGORY_COLORS.map((color) => {
            const selected = values.color === color;
            return (
              <button
                key={color}
                type="button"
                role="radio"
                aria-checked={selected}
                aria-label={t(`color.${color}`)}
                onClick={() => set("color", color)}
                className={cn(
                  "touch-target inline-flex size-32 items-center justify-center rounded-full border border-border-default",
                  categorySurfaceClass(color),
                  selected && "outline-2 outline-offset-2 outline-border-focus",
                )}
              >
                {selected && <Icon icon="confirm" size="sm" className="text-text-primary" />}
              </button>
            );
          })}
        </div>
        <ErrorText id="color-error" message={errorText("color")} />
      </div>

      {expense && (
        <div className="flex flex-col gap-8">
          <Label htmlFor="budget">{t("form.budget")}</Label>
          <label
            htmlFor="budget"
            className={cn(
              "flex h-46 cursor-text items-center gap-8 rounded-md border bg-surface-card px-16 text-body-md text-text-primary transition-colors focus-within:outline-2 focus-within:outline-border-focus hover:border-border-strong",
              invalid("budget") ? "border-border-error" : "border-border-default",
            )}
          >
            <input
              id="budget"
              name="budget"
              inputMode="decimal"
              autoComplete="off"
              placeholder={locale === "tr" ? "0,00" : "0.00"}
              value={values.budget}
              onChange={(event) => set("budget", formatMoneyTyping(event.target.value, locale))}
              onBlur={completeBudget}
              aria-invalid={invalid("budget")}
              aria-describedby={describedBy("budget") ?? "budget-hint"}
              className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-text-tertiary"
            />
            <span aria-hidden className="text-text-secondary">
              <Icon icon="currency" size="sm" />
            </span>
          </label>
          <p id="budget-hint" className="text-body-sm text-text-secondary">
            {t("form.budgetHint")}
          </p>
          <ErrorText id="budget-error" message={errorText("budget")} />
        </div>
      )}

      <div className="flex flex-col gap-8">
        <div className="flex items-baseline justify-between gap-8">
          <Label htmlFor="note">{t("form.note")}</Label>
          <span className="text-body-sm text-text-secondary" aria-live="polite">
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
          className={cn(inputClass, "h-auto resize-y py-12")}
        />
        <ErrorText id="note-error" message={errorText("note")} />
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
