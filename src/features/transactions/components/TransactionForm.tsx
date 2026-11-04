"use client";

import { useActionState, useLayoutEffect, useRef, useState, type ChangeEvent, type ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ActionFooter } from "@/components/layout/ActionFooter";
import { Button, ButtonLink } from "@/components/ui/Button";
import { ChipSelect } from "@/components/ui/ChipSelect";
import { DatePicker } from "@/components/ui/DatePicker";
import { Icon } from "@/components/ui/Icon";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { SelectPicker } from "@/components/ui/SelectPicker";
import { Switch } from "@/components/ui/Switch";
import { TimePicker } from "@/components/ui/TimePicker";
import type { Category } from "@/features/categories";
import { isLocale } from "@/i18n/config";
import { cn } from "@/lib/cn";
import {
  caretAfterAmountCharacters,
  countAmountCharacters,
  formatMoneyInput,
  formatMoneyShort,
  formatMoneyTyping,
  majorToMinor,
  parseMoneyInput,
} from "@/lib/money";
import { FREQUENCIES, REMINDER_OFFSETS, type Frequency, type ReminderOffset } from "@/lib/recurrence";
import { createTransaction, updateTransaction } from "../actions";
import { NOTE_MAX_LENGTH, TITLE_MAX_LENGTH } from "../domain/limits";
import type { TransactionFormField, TransactionFormState, TransactionFormType } from "../schemas";
import { AccountPicker, type AccountOption } from "@/features/accounts/components/AccountPicker";

// Pages → Yeni İşlem / Gelir (121:3180), / Gider (121:3549) ve / Abonelik (121:3649), RESPONSIVE §3.3.3, DESIGN §8.2.
//   İşlem Türü: segmented Gelir / Gider / Abonelik  ·  Tutar kartı  ·  Başlık*  ·  Kategori Seçimi
//   İşlem Yapılan Hesap  ·  İşlem Zamanı ve Tekrarı (Tarih / Saat + Tekrar Eden İşlem kartı)  ·  Not (x/200)
//   alt bar İptal (Tertiary) + Kaydet (Primary)
// Tutar kartı: padding 16, aralık 12, radius-2xl, gradyan beyaz → Category/Green (gider: Category/Red), shadow-floating;
//   "Gelir Girişi" chip'i, tutar pill'i (padding 4/16, tam yuvarlak, beyaz, border-default, shadow-floating, Data/Large),
//   ayırıcı çizgi ve hızlı tutar çipleri (32 px, padding 4/8, tam yuvarlak, beyaz + border-default, Label/Small, aralık 6).
// Abonelik tutar kartı: gradyan beyaz → Category/Blue (yukarıdan aşağı), "Abonelik / Tekrarlayan İşlem" chip'i (Category/Blue,
//   nokta Chart/Balance), işaretsiz tutar (text-primary), altında "Fatura, Ödeme veya Abonelik ekleyin"; hızlı tutar yok.
// Tekrar Eden İşlem kartı: radius-lg, border-default, padding 12, aralık 12; 40 px Category/Slate kutuda repeat ikonu,
//   Label/Default başlık + Body/Small açıklama, sağda switch; açıkken ayırıcı + Tekrarlama Sıklığı / Hatırlatma Bildirimi.
//   Gelir/Gider'de varsayılan kapalı, Abonelik'te açık (Pages).
// [Varsayım] Abonelik'te anahtar kapalıyken kayıt tek seferlik ödemedir (PRD Q-8 "Tekrarlama yok" bu şekilde karşılanır).
// [Varsayım] Varsayılan sıklık Aylık, varsayılan hatırlatma "1 saat önce" (Pages'ta görünen değer).
// [Ertelendi] Düzenlemede tekrar kartı gösterilmez: kural düzenleme ("Yalnızca bu / Bu ve sonrakiler", Q-7) sonraki dilim.
// Input 46 px, padding 12/16, radius-md, surface-card, border-default, Body/Default [Ç-2].
// Hesap, tarih ve saat özel seçicilerle seçilir (RESPONSIVE §4.5.1); tarayıcının native seçicileri kullanılmaz.
// [Varsayım] Hızlı tutar çipleri mevcut tutarın üstüne ekler.
// Tutar yazılırken binlik ayırıcıyla biçimlenir ("1.234.567,89"); alandan çıkınca kuruş iki haneye tamamlanır.
// Tutar pill'i Pages'ta 222 px; büyük tutarlarda içeriğe göre genişler (field-sizing).

export type TransactionFormValues = {
  type: TransactionFormType;
  amount: string;
  title: string;
  categoryId: string;
  accountId: string;
  date: string;
  time: string;
  note: string;
  repeat: boolean;
  frequency: Frequency;
  reminder: ReminderOffset;
};


type TransactionFormProps = {
  mode: "create" | "edit";
  transactionId?: string;
  initialValues: TransactionFormValues;
  categories: Category[];
  accounts: AccountOption[];
  cancelHref: string;
};

const QUICK_AMOUNTS = [500, 1000, 2500].map(majorToMinor); // Pages: "+ 500 ₺", "+ 1.000 ₺", "+ 2.500 ₺"

const inputClass =
  "h-46 w-full rounded-md border bg-surface-card px-16 text-body-md text-text-primary placeholder:text-text-tertiary transition-colors hover:border-border-strong aria-invalid:border-border-error";

function FieldLabel({ htmlFor, id, required, children }: { htmlFor?: string; id?: string; required?: boolean; children: ReactNode }) {
  const t = useTranslations("transactions.form");
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

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="text-body-sm text-text-danger">
      {message}
    </p>
  );
}

export function TransactionForm({ mode, transactionId, initialValues, categories, accounts, cancelHref }: TransactionFormProps) {
  const t = useTranslations("transactions.form");
  const tType = useTranslations("transactions.type");
  const rawLocale = useLocale();
  const locale = isLocale(rawLocale) ? rawLocale : "tr";

  const action = mode === "edit" && transactionId ? updateTransaction.bind(null, transactionId) : createTransaction;
  const [state, formAction, pending] = useActionState<TransactionFormState, FormData>(action, {});
  const [values, setValues] = useState(initialValues);
  // Sunucudan gelen alan hataları; kullanıcı alanı düzeltmeye başlayınca o alanın hatası kalkar.
  const [errors, setErrors] = useState(state.errors ?? {});
  const [lastState, setLastState] = useState(state);
  if (state !== lastState) {
    setLastState(state);
    setErrors(state.errors ?? {});
  }

  const set = <K extends keyof TransactionFormValues>(key: K, value: TransactionFormValues[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      if (!(key in current)) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  };
  const tRecurrence = useTranslations("recurrence");
  const income = values.type === "income";
  const subscription = values.type === "subscription";
  const create = mode === "create";
  // Düzenlenen kaydın kategorisi türü farklı olsa da (ödemeden oluşan gider → Abonelik kategorisi) seçenekte kalır.
  const typeCategories = categories.filter(
    (category) => category.type === values.type || (category.id === initialValues.categoryId && values.type === initialValues.type),
  );
  const frequencyOptions = FREQUENCIES.map((value) => ({ value, label: tRecurrence(`frequency.${value}`) }));
  const reminderOptions = REMINDER_OFFSETS.map((value) => ({ value, label: tRecurrence(`reminder.${value}`) }));

  const errorText = (field: TransactionFormField) => {
    const key = errors[field];
    return key ? t(`errors.${key}`, { max: key === "note" ? NOTE_MAX_LENGTH : TITLE_MAX_LENGTH }) : undefined;
  };
  const invalid = (field: TransactionFormField) => (errors[field] ? true : undefined);
  const describedBy = (field: TransactionFormField) => (errors[field] ? `${field}-error` : undefined);

  function changeType(type: TransactionFormType) {
    setValues((current) => {
      const keepCategory = categories.some((category) => category.id === current.categoryId && category.type === type);
      // Pages: Gelir/Gider'de Tekrar Eden İşlem kapalı, Abonelik'te açık gelir.
      return { ...current, type, categoryId: keepCategory ? current.categoryId : "", repeat: type === "subscription" };
    });
  }

  const amountRef = useRef<HTMLInputElement>(null);
  const pendingCaret = useRef<number | null>(null);

  // Biçimleme metnin uzunluğunu değiştirdiği için imleç, aynı sayıda rakamın sonrasına geri konur.
  useLayoutEffect(() => {
    const input = amountRef.current;
    if (input && pendingCaret.current !== null && document.activeElement === input) {
      input.setSelectionRange(pendingCaret.current, pendingCaret.current);
    }
    pendingCaret.current = null;
  }, [values.amount]);

  function changeAmount(event: ChangeEvent<HTMLInputElement>) {
    const raw = event.target.value;
    const before = countAmountCharacters(raw.slice(0, event.target.selectionStart ?? raw.length), locale);
    const formatted = formatMoneyTyping(raw, locale);
    pendingCaret.current = caretAfterAmountCharacters(formatted, before, locale);
    set("amount", formatted);
  }

  function completeAmount() {
    const minor = parseMoneyInput(values.amount, locale);
    if (minor !== null) set("amount", formatMoneyInput(minor, locale));
  }

  function addQuickAmount(minor: bigint) {
    const current = parseMoneyInput(values.amount, locale) ?? BigInt(0);
    set("amount", formatMoneyInput(current + minor, locale));
  }

  return (
    <form action={formAction} noValidate className="flex flex-1 flex-col gap-(--layout-section-gap)">
      <input type="hidden" name="type" value={values.type} />
      <input type="hidden" name="categoryId" value={values.categoryId} />
      <input type="hidden" name="repeat" value={String(create && values.repeat)} />

      {state.formError && (
        <p role="alert" className="rounded-md bg-status-danger-subtle p-12 text-body-md text-text-danger">
          {t(`errors.${state.formError}`)}
        </p>
      )}

      <div className="flex flex-col gap-8">
        <FieldLabel id="type-label" required>
          {t("type")}
        </FieldLabel>
        <SegmentedControl
          label={t("type")}
          fullWidth
          value={values.type}
          onChange={changeType}
          options={[
            { value: "income", label: tType("income") },
            { value: "expense", label: tType("expense") },
            // Kayıt oluştuktan sonra işlem tekrarlayan ödemeye dönüştürülemez.
            { value: "subscription", label: t("subscription"), disabled: !create },
          ]}
        />
      </div>

      {/* Tutar kartı */}
      <div
        className={cn(
          "flex flex-col items-center gap-12 rounded-2xl border border-border-default from-surface-card p-16 shadow-floating",
          subscription ? "bg-linear-to-b to-category-blue" : cn("bg-linear-to-r", income ? "to-category-green" : "to-category-red"),
        )}
      >
        <span
          className={cn(
            "inline-flex h-24 items-center gap-4 rounded-full px-8 text-label-sm",
            subscription ? "bg-category-blue text-text-on-task" : income ? "bg-category-green text-text-success" : "bg-category-red text-text-danger",
          )}
        >
          <span aria-hidden className={cn("size-6 rounded-full", subscription ? "bg-chart-balance" : income ? "bg-status-success" : "bg-status-danger")} />
          {subscription ? t("subscriptionEntry") : income ? t("incomeEntry") : t("expenseEntry")}
        </span>
        <label htmlFor="amount" className="sr-only">
          {t("amount")} ({t("required")})
        </label>
        {/* Pill'in tamamı input'a bağlı: işaret ve sembolün üstüne tıklamak da alana odaklar. */}
        <label
          htmlFor="amount"
          className={cn(
            "flex h-54 max-w-full min-w-222 cursor-text items-center justify-center gap-4 rounded-full border border-border-default bg-surface-card px-16 py-4 text-data-lg shadow-floating focus-within:outline-2 focus-within:outline-border-focus",
            subscription ? "text-text-primary" : income ? "text-text-success" : "text-text-danger",
            invalid("amount") && "border-border-error",
          )}
        >
          {!subscription && <span aria-hidden>{income ? "+" : "−"}</span>}
          <input
            ref={amountRef}
            id="amount"
            name="amount"
            inputMode="decimal"
            autoComplete="off"
            placeholder={locale === "tr" ? "0,00" : "0.00"}
            value={values.amount}
            onChange={changeAmount}
            onBlur={completeAmount}
            aria-invalid={invalid("amount")}
            aria-describedby={describedBy("amount")}
            className="min-w-[4ch] bg-transparent text-center outline-none field-sizing-content placeholder:text-text-tertiary"
          />
          <span aria-hidden>₺</span>
        </label>
        <FieldError id="amount-error" message={errorText("amount")} />
        {subscription ? (
          <p className="text-label-sm text-text-secondary">{t("subscriptionHint")}</p>
        ) : (
          <>
            <div className="w-full border-t border-border-default" />
            <div role="group" aria-label={t("quickAmounts")} className="flex flex-wrap justify-center gap-6">
              {QUICK_AMOUNTS.map((minor) => (
                <button
                  key={minor.toString()}
                  type="button"
                  onClick={() => addQuickAmount(minor)}
                  aria-label={t("addAmount", { amount: formatMoneyShort(minor, locale) })}
                  className="touch-target inline-flex h-32 items-center rounded-full border border-border-default bg-surface-card px-8 py-4 text-label-sm text-text-secondary transition-colors hover:border-border-strong"
                >
                  {income ? "+" : "−"} {formatMoneyShort(minor, locale)}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="flex flex-col gap-8">
        <FieldLabel htmlFor="title" required>
          {t("title")}
        </FieldLabel>
        <input
          id="title"
          name="title"
          maxLength={TITLE_MAX_LENGTH}
          placeholder={t("titlePlaceholder")}
          value={values.title}
          onChange={(event) => set("title", event.target.value)}
          aria-invalid={invalid("title")}
          aria-describedby={describedBy("title")}
          className={cn(inputClass, "border-border-default")}
        />
        <FieldError id="title-error" message={errorText("title")} />
      </div>

      <div className="flex flex-col gap-8">
        <FieldLabel id="category-label" required>
          {t("category")}
        </FieldLabel>
        <div role="group" aria-labelledby="category-label" aria-describedby={describedBy("categoryId")} className="flex flex-wrap gap-8">
          {typeCategories.map((category) => (
            <ChipSelect key={category.id} selected={values.categoryId === category.id} onClick={() => set("categoryId", category.id)}>
              {category.name}
            </ChipSelect>
          ))}
        </div>
        <FieldError id="categoryId-error" message={errorText("categoryId")} />
      </div>

      <div className="flex flex-col gap-8">
        <FieldLabel id="accountId-label" required>
          {t("account")}
        </FieldLabel>
        <AccountPicker
          id="accountId"
          name="accountId"
          accounts={accounts}
          value={values.accountId}
          onChange={(next) => set("accountId", next)}
          labelledBy="accountId-label"
          invalid={invalid("accountId")}
          describedBy={describedBy("accountId")}
        />
        <FieldError id="accountId-error" message={errorText("accountId")} />
      </div>

      <fieldset className="flex flex-col gap-8">
        <legend className="mb-8 text-label-md text-text-primary">{create ? t("whenRepeat") : t("when")}</legend>
        <div className="grid grid-cols-2 gap-12">
          <div className="flex flex-col gap-4">
            <p id="date-label" className="text-body-sm text-text-secondary">
              {t("date")}
            </p>
            <DatePicker
              id="date"
              name="date"
              value={values.date}
              onChange={(next) => set("date", next)}
              labelledBy="date-label"
              title={t("chooseDate")}
              invalid={invalid("date")}
              describedBy={describedBy("date")}
            />
            <FieldError id="date-error" message={errorText("date")} />
          </div>
          <div className="flex flex-col gap-4">
            <p id="time-label" className="text-body-sm text-text-secondary">
              {t("time")}
            </p>
            <TimePicker
              id="time"
              name="time"
              value={values.time}
              onChange={(next) => set("time", next)}
              labelledBy="time-label"
              title={t("chooseTime")}
              invalid={invalid("time")}
              describedBy={describedBy("time")}
            />
            <FieldError id="time-error" message={errorText("time")} />
          </div>
        </div>

        {create && (
          <div className="flex flex-col gap-12 rounded-lg border border-border-default bg-surface-card p-12">
            <div className="flex items-center justify-between gap-12">
              <div className="flex min-w-0 items-center gap-12">
                <span aria-hidden className="inline-flex size-40 shrink-0 items-center justify-center rounded-md bg-category-slate text-text-secondary">
                  <Icon icon="repeat" />
                </span>
                <div className="flex min-w-0 flex-col gap-2">
                  <p id="repeat-label" className="text-label-md text-text-primary">
                    {t("repeatTitle")}
                  </p>
                  <p id="repeat-hint" className="text-body-sm text-text-secondary">
                    {income ? t("repeatHintIncome") : t("repeatHintExpense")}
                  </p>
                </div>
              </div>
              <Switch id="repeat" checked={values.repeat} onChange={(next) => set("repeat", next)} labelledBy="repeat-label" describedBy="repeat-hint" />
            </div>
            {values.repeat ? (
              <>
                <div className="border-t border-border-default" />
                <div className="grid grid-cols-2 gap-8">
                  <div className="flex min-w-0 flex-col gap-4">
                    <p id="frequency-label" className="text-label-sm text-text-secondary">
                      {t("frequency")}
                    </p>
                    <SelectPicker
                      id="frequency"
                      name="frequency"
                      options={frequencyOptions}
                      value={values.frequency}
                      onChange={(next) => set("frequency", next)}
                      labelledBy="frequency-label"
                      title={t("chooseFrequency")}
                      align="start"
                      invalid={invalid("frequency")}
                      describedBy={describedBy("frequency")}
                    />
                    <FieldError id="frequency-error" message={errorText("frequency")} />
                  </div>
                  <div className="flex min-w-0 flex-col gap-4">
                    <p id="reminder-label" className="text-label-sm text-text-secondary">
                      {t("reminder")}
                    </p>
                    <SelectPicker
                      id="reminder"
                      name="reminder"
                      options={reminderOptions}
                      value={values.reminder}
                      onChange={(next) => set("reminder", next)}
                      labelledBy="reminder-label"
                      title={t("chooseReminder")}
                      align="end"
                      invalid={invalid("reminder")}
                      describedBy={describedBy("reminder")}
                    />
                    <FieldError id="reminder-error" message={errorText("reminder")} />
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Kapalıyken de değerler gönderilir (doğrulama şeması her zaman bekler); kayıtta kullanılmaz. */}
                <input type="hidden" name="frequency" value={values.frequency} />
                <input type="hidden" name="reminder" value={values.reminder} />
                {subscription && <p className="text-body-sm text-text-secondary">{t("oneTimeHint")}</p>}
              </>
            )}
          </div>
        )}
        {!create && (
          <>
            <input type="hidden" name="frequency" value={values.frequency} />
            <input type="hidden" name="reminder" value={values.reminder} />
          </>
        )}
      </fieldset>

      <div className="flex flex-col gap-8">
        <div className="flex items-baseline justify-between gap-8">
          <FieldLabel htmlFor="note">{t("note")}</FieldLabel>
          <span className="text-body-sm text-text-secondary" aria-live="polite">
            {t("noteCount", { count: values.note.length, max: NOTE_MAX_LENGTH })}
          </span>
        </div>
        <textarea
          id="note"
          name="note"
          rows={3}
          maxLength={NOTE_MAX_LENGTH}
          placeholder={t("notePlaceholder")}
          value={values.note}
          onChange={(event) => set("note", event.target.value)}
          aria-invalid={invalid("note")}
          aria-describedby={describedBy("note")}
          className={cn(inputClass, "h-auto resize-y border-border-default py-12")}
        />
        <FieldError id="note-error" message={errorText("note")} />
      </div>

      <ActionFooter>
        <ButtonLink href={cancelHref} scroll={false} variant="tertiary">
          {t("cancel")}
        </ButtonLink>
        <Button type="submit" loading={pending}>
          {t("save")}
        </Button>
      </ActionFooter>
    </form>
  );
}
