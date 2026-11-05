"use client";

import { useActionState, useState, type ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ActionFooter } from "@/components/layout/ActionFooter";
import { Button, ButtonLink } from "@/components/ui/Button";
import { ChipSelect, chipSelectClasses } from "@/components/ui/ChipSelect";
import { DatePicker } from "@/components/ui/DatePicker";
import { Icon } from "@/components/ui/Icon";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { SelectPicker } from "@/components/ui/SelectPicker";
import { Switch } from "@/components/ui/Switch";
import { TimePicker } from "@/components/ui/TimePicker";
import { amountBoxClass, amountCardClass, amountChipClass, amountInputClass, fieldBoxClass, inputClass, textareaClass } from "@/components/ui/field";
import { AccountPicker, type AccountOption } from "@/features/accounts/components/AccountPicker";
import { isLocale } from "@/i18n/config";
import { cn } from "@/lib/cn";
import { formatMoneyInput, formatMoneyShort, formatMoneyTyping, majorToMinor, parseMoneyInput } from "@/lib/money";
import { FREQUENCIES, REMINDER_OFFSETS, type Frequency, type ReminderOffset } from "@/lib/recurrence";
import { createSavingsAccount, updateSavingsAccount } from "../actions";
import { INSTITUTION_MAX_LENGTH, NAME_MAX_LENGTH, NOTE_MAX_LENGTH } from "../domain/limits";
import { SAVINGS_KINDS, unitForKind, type SavingsKind, type SavingsUnit } from "../domain/types";
import type { SavingsFormField, SavingsFormState } from "../schemas";

// Pages → Yeni Birikim Hesabı Ekle (129:6153, PRD FR-SAV-001/007), RESPONSIVE §3.4.4 (Yeni İşlem ile aynı drawer).
//   Tutar kartı: gradyan beyaz → Category/Blue; "Başlangıç / Mevcut Bakiye" çipi (Görev, noktalı), tutar pill'i
//     (Data/Large), "Ana hesabınızdan anında aktarılacaktır"; ayırıcı + hızlı tutar çipleri (+1.000 / +2.500 / +10.000 ₺)
//   Başlık* · Hesap Türü çipleri (receipt-text ikonlu, seçili check) · Hedef Tutar (₺ ikonlu input) · İşlem Yapılan
//   Hesap · İşlem Zamanı ve Tekrarı (Tarih / Saat + Tekrar Eden İşlem kartı) · Not (x/200) · bilgi notu
//   alt bar İptal (Tertiary, RESPONSIVE Ç-10) + Kaydet.
// [Varsayım] Altın / Kıymetli türünde Birim (Adet / Gram) segmented control ile seçilir; adet/gram hesabında tutar
//   birim cinsindendir ve hesaplara dokunulmaz (BR-SAV-004).
// [Varsayım] "Saklama Kurumu" detayda görünüyor ama formda yok (PRD FR-SAV-009); isteğe bağlı input olarak eklendi.
// [Varsayım] Tekrar Eden İşlem açıkken formdaki tutar her dönem aktarılır ("Aynı birikim periyodik eklensin").
//   Düzenlemede tutar kartı "Düzenli Katkı Tutarı"dır; tür ve birim değiştirilemez.
// [Eksik] Hedef tarihi (FR-SAV-010) tasarlanmadı.

export type SavingsFormValues = {
  name: string;
  kind: SavingsKind;
  unit: SavingsUnit;
  amount: string;
  target: string;
  institution: string;
  sourceAccountId: string;
  date: string;
  time: string;
  repeat: boolean;
  frequency: Frequency;
  reminder: ReminderOffset;
  note: string;
};

type SavingsFormProps = {
  mode: "create" | "edit";
  accountId?: string;
  initialValues: SavingsFormValues;
  accounts: AccountOption[];
  cancelHref: string;
};

const QUICK_AMOUNTS = [1000, 2500, 10000].map(majorToMinor); // Pages: "+ 1.000 ₺", "+ 2.500 ₺", "+ 10.000 ₺"


function Label({ htmlFor, id, required, children }: { htmlFor?: string; id?: string; required?: boolean; children: ReactNode }) {
  const t = useTranslations("savings.form");
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

const limits: Partial<Record<SavingsFormField, number>> = { name: NAME_MAX_LENGTH, institution: INSTITUTION_MAX_LENGTH, note: NOTE_MAX_LENGTH };

export function SavingsForm({ mode, accountId, initialValues, accounts, cancelHref }: SavingsFormProps) {
  const t = useTranslations("savings");
  const tRecurrence = useTranslations("recurrence");
  const rawLocale = useLocale();
  const locale = isLocale(rawLocale) ? rawLocale : "tr";
  const create = mode === "create";

  const action = !create && accountId ? updateSavingsAccount.bind(null, accountId) : createSavingsAccount;
  const [state, formAction, pending] = useActionState<SavingsFormState, FormData>(action, {});
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState(state.errors ?? {});
  const [lastState, setLastState] = useState(state);
  if (state !== lastState) {
    setLastState(state);
    setErrors(state.errors ?? {});
  }

  const set = <K extends keyof SavingsFormValues>(key: K, value: SavingsFormValues[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      if (!(key in current)) return current;
      const next = { ...current };
      delete next[key as SavingsFormField];
      return next;
    });
  };
  const errorText = (field: SavingsFormField) => {
    const key = errors[field];
    return key ? t(`form.errors.${key}`, { max: limits[field] ?? NAME_MAX_LENGTH }) : undefined;
  };
  const invalid = (field: SavingsFormField) => (errors[field] ? true : undefined);
  const describedBy = (field: SavingsFormField) => (errors[field] ? `${field}-error` : undefined);

  const unit = unitForKind(values.kind, values.unit);
  const money = unit === "TRY";
  const sourceName = accounts.find((account) => account.id === values.sourceAccountId)?.name ?? "";
  const unitSuffix = money ? "₺" : t(`unit.${unit}`);

  function complete(field: "amount" | "target") {
    const minor = parseMoneyInput(values[field], locale);
    if (minor !== null) set(field, formatMoneyInput(minor, locale));
  }
  function addQuickAmount(minor: bigint) {
    const current = parseMoneyInput(values.amount, locale) ?? BigInt(0);
    set("amount", formatMoneyInput(current + minor, locale));
  }

  const hint = !money ? t("form.unitHint") : create ? t("form.transferHint", { account: sourceName }) : t("form.contributionHint", { account: sourceName });

  return (
    <form action={formAction} noValidate className="flex flex-1 flex-col gap-(--layout-section-gap)">
      <input type="hidden" name="kind" value={values.kind} />
      <input type="hidden" name="unit" value={unit} />
      <input type="hidden" name="repeat" value={String(values.repeat)} />
      {!values.repeat && (
        <>
          <input type="hidden" name="frequency" value={values.frequency} />
          <input type="hidden" name="reminder" value={values.reminder} />
        </>
      )}
      {!create && (
        <>
          <input type="hidden" name="date" value={values.date} />
          <input type="hidden" name="time" value={values.time} />
        </>
      )}

      {state.formError && (
        <p role="alert" className="rounded-lg bg-status-danger-subtle p-16 text-body text-text-on-danger">
          {t(`form.errors.${state.formError}`)}
        </p>
      )}

      {/* Tutar kartı */}
      <div className={amountCardClass}>
        <span className={cn(amountChipClass, "bg-category-blue text-category-fg-blue")}>
          <span aria-hidden className="size-6 rounded-full bg-category-fg-blue" />
          {create ? t("form.initialChip") : t("form.contributionChip")}
        </span>
        <label htmlFor="amount" className="sr-only">
          {t("form.amount")}
        </label>
        <label
          htmlFor="amount"
          className={cn(amountBoxClass(Boolean(invalid("amount"))), "text-text-primary")}
        >
          <input
            id="amount"
            name="amount"
            inputMode="decimal"
            autoComplete="off"
            placeholder={locale === "tr" ? "0,00" : "0.00"}
            value={values.amount}
            onChange={(event) => set("amount", formatMoneyTyping(event.target.value, locale))}
            onBlur={() => complete("amount")}
            aria-invalid={invalid("amount")}
            aria-describedby={describedBy("amount") ?? "amount-hint"}
            className={amountInputClass}
          />
          <span aria-hidden>{unitSuffix}</span>
        </label>
        <p id="amount-hint" className="text-center text-caption text-text-secondary">
          {hint}
        </p>
        <ErrorText id="amount-error" message={errorText("amount")} />
        {money && (
          <>
            <div className="w-full border-t border-border-subtle" />
            <div role="group" aria-label={t("form.quickAmounts")} className="flex flex-wrap justify-center gap-6">
              {QUICK_AMOUNTS.map((minor) => (
                <button
                  key={minor.toString()}
                  type="button"
                  onClick={() => addQuickAmount(minor)}
                  aria-label={t("form.addAmount", { amount: formatMoneyShort(minor, locale) })}
                  className={chipSelectClasses(false)}
                >
                  + {formatMoneyShort(minor, locale)}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="flex flex-col gap-8">
        <Label htmlFor="name" required>
          {t("form.name")}
        </Label>
        <input
          id="name"
          name="name"
          maxLength={NAME_MAX_LENGTH}
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
        <Label id="kind-label">{t("form.kind")}</Label>
        <div role="group" aria-labelledby="kind-label" className="flex flex-wrap gap-6">
          {SAVINGS_KINDS.map((kind) => {
            const selected = values.kind === kind;
            return (
              <ChipSelect key={kind} selected={selected} aria-pressed={selected} disabled={!create && !selected} onClick={() => set("kind", kind)}>
                {/* Seçili çipin check ikonunu ChipSelect çizer; seçili değilken Pages'taki receipt-text ikonu. */}
                {!selected && <Icon icon="receipt" size="xs" />}
                {t(`kind.${kind}`)}
              </ChipSelect>
            );
          })}
        </div>
        {values.kind === "gold" && (
          <SegmentedControl
            label={t("unit.label")}
            value={unit}
            disabled={!create}
            onChange={(next) => set("unit", next)}
            options={[
              { value: "piece", label: t("unit.piece") },
              { value: "gram", label: t("unit.gram") },
            ]}
          />
        )}
      </div>

      <div className="flex flex-col gap-8">
        <Label htmlFor="target">{t("form.target")}</Label>
        <label
          htmlFor="target"
          className={fieldBoxClass(Boolean(invalid("target")))}
        >
          <input
            id="target"
            name="target"
            inputMode="decimal"
            autoComplete="off"
            placeholder={t("form.targetPlaceholder")}
            value={values.target}
            onChange={(event) => set("target", formatMoneyTyping(event.target.value, locale))}
            onBlur={() => complete("target")}
            aria-invalid={invalid("target")}
            aria-describedby={describedBy("target")}
            className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-text-secondary"
          />
          <span aria-hidden className="text-text-secondary">
            {money ? <Icon icon="currency" size="sm" /> : unitSuffix}
          </span>
        </label>
        <ErrorText id="target-error" message={errorText("target")} />
      </div>

      <div className="flex flex-col gap-8">
        <Label htmlFor="institution">{t("form.institution")}</Label>
        <input
          id="institution"
          name="institution"
          maxLength={INSTITUTION_MAX_LENGTH}
          placeholder={t("form.institutionPlaceholder")}
          value={values.institution}
          onChange={(event) => set("institution", event.target.value)}
          aria-invalid={invalid("institution")}
          aria-describedby={describedBy("institution")}
          className={inputClass}
        />
        <ErrorText id="institution-error" message={errorText("institution")} />
      </div>

      {money && (
        <div className="flex flex-col gap-8">
          <Label id="sourceAccountId-label">{t("form.account")}</Label>
          <AccountPicker
            id="sourceAccountId"
            name="sourceAccountId"
            accounts={accounts}
            value={values.sourceAccountId}
            onChange={(next) => set("sourceAccountId", next)}
            labelledBy="sourceAccountId-label"
            invalid={invalid("sourceAccountId")}
            describedBy={describedBy("sourceAccountId")}
          />
          <ErrorText id="sourceAccountId-error" message={errorText("sourceAccountId")} />
        </div>
      )}

      <fieldset className="flex flex-col gap-8">
        <legend className="mb-8 text-body-strong text-text-primary">{t("form.when")}</legend>
        {create && (
          <div className="grid grid-cols-2 gap-12">
            <div className="flex min-w-0 flex-col gap-4">
              <p id="date-label" className="text-caption text-text-secondary">
                {t("form.date")}
              </p>
              <DatePicker id="date" name="date" value={values.date} onChange={(next) => set("date", next)} labelledBy="date-label" title={t("form.chooseDate")} invalid={invalid("date")} describedBy={describedBy("date")} />
              <ErrorText id="date-error" message={errorText("date")} />
            </div>
            <div className="flex min-w-0 flex-col gap-4">
              <p id="time-label" className="text-caption text-text-secondary">
                {t("form.time")}
              </p>
              <TimePicker id="time" name="time" value={values.time} onChange={(next) => set("time", next)} labelledBy="time-label" title={t("form.chooseTime")} invalid={invalid("time")} describedBy={describedBy("time")} />
              <ErrorText id="time-error" message={errorText("time")} />
            </div>
          </div>
        )}
        <div className="flex flex-col gap-12 rounded-lg bg-surface-card shadow-elev-1 p-12">
          <div className="flex items-center justify-between gap-12">
            <div className="flex min-w-0 items-center gap-12">
              <span aria-hidden className="inline-flex size-40 shrink-0 items-center justify-center rounded-md bg-category-slate text-category-fg-slate">
                <Icon icon="repeat" />
              </span>
              <div className="flex min-w-0 flex-col gap-2">
                <p id="repeat-label" className="text-body-strong text-text-primary">
                  {t("form.repeatTitle")}
                </p>
                <p id="repeat-hint" className="text-caption text-text-secondary">
                  {t("form.repeatHint")}
                </p>
              </div>
            </div>
            <Switch id="repeat" checked={values.repeat} onChange={(next) => set("repeat", next)} labelledBy="repeat-label" describedBy="repeat-hint" />
          </div>
          {values.repeat && (
            <>
              <div className="border-t border-border-default" />
              <div className="grid grid-cols-2 gap-8">
                <div className="flex min-w-0 flex-col gap-4">
                  <p id="frequency-label" className="text-caption-strong text-text-secondary">
                    {t("form.frequency")}
                  </p>
                  <SelectPicker
                    id="frequency"
                    name="frequency"
                    options={FREQUENCIES.map((value) => ({ value, label: tRecurrence(`frequency.${value}`) }))}
                    value={values.frequency}
                    onChange={(next) => set("frequency", next)}
                    labelledBy="frequency-label"
                    title={t("form.chooseFrequency")}
                    align="start"
                    invalid={invalid("frequency")}
                    describedBy={describedBy("frequency")}
                  />
                </div>
                <div className="flex min-w-0 flex-col gap-4">
                  <p id="reminder-label" className="text-caption-strong text-text-secondary">
                    {t("form.reminder")}
                  </p>
                  <SelectPicker
                    id="reminder"
                    name="reminder"
                    options={REMINDER_OFFSETS.map((value) => ({ value, label: tRecurrence(`reminder.${value}`) }))}
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
            </>
          )}
        </div>
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

      <p className="flex gap-8 rounded-md bg-category-blue p-12 text-body text-text-primary">
        <span className="mt-2 shrink-0 text-text-on-task">
          <Icon icon="info" />
        </span>
        {t("detail.info")}
      </p>

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
