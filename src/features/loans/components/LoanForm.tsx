"use client";

import { useActionState, useState, type ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ActionFooter } from "@/components/layout/ActionFooter";
import { Button, ButtonLink } from "@/components/ui/Button";
import { DatePicker } from "@/components/ui/DatePicker";
import { Icon } from "@/components/ui/Icon";
import { Switch } from "@/components/ui/Switch";
import { amountBoxClass, amountCardClass, amountChipClass, amountInputClass, inputClass, textareaClass } from "@/components/ui/field";
import { AccountPicker, type AccountOption } from "@/features/accounts/components/AccountPicker";
import { isLocale } from "@/i18n/config";
import { cn } from "@/lib/cn";
import { formatMoneyInput, formatMoneyTyping, parseMoneyInput } from "@/lib/money";
import { saveLoan } from "../actions";
import { LOAN_NOTE_MAX_LENGTH, LOAN_PERSON_MAX_LENGTH, LOAN_PURPOSE_MAX_LENGTH } from "../domain/types";
import type { LoanFormField, LoanFormState } from "../schemas";

// Borç Ver / Alacağı Düzenle (ürün sahibi isteği 2026-11-07). Yeni İşlem formunun dili ve bileşenleri
// (DESIGN_SYSTEM_PICKALY §5.7; yeni görsel öğe yok):
//   Tutar kartı ("Borç Verildi" çipi, teal) · Kime* · Ne için · "Hesabımdan çıktı" kartı (Tekrar Eden İşlem kartı kalıbı:
//   açıkken hesap seçici; kapalıyken yalnızca alacak kaydı, bakiye değişmez) · Verildiği tarih / Geri alınacak tarih ·
//   Not (x/200) · alt bar İptal + Kaydet.

export type LoanFormValues = {
  person: string;
  purpose: string;
  amount: string;
  fromAccount: boolean;
  accountId: string;
  lentOn: string;
  dueOn: string;
  note: string;
};

type LoanFormProps = {
  loanId?: string;
  initialValues: LoanFormValues;
  accounts: AccountOption[];
  cancelHref: string;
};

function Label({ htmlFor, id, required, children }: { htmlFor?: string; id?: string; required?: boolean; children: ReactNode }) {
  const t = useTranslations("loans.form");
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

export function LoanForm({ loanId, initialValues, accounts, cancelHref }: LoanFormProps) {
  const t = useTranslations("loans.form");
  const rawLocale = useLocale();
  const locale = isLocale(rawLocale) ? rawLocale : "tr";
  const [state, formAction, pending] = useActionState<LoanFormState, FormData>(saveLoan.bind(null, loanId ?? null), {});
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState(state.errors ?? {});
  const [lastState, setLastState] = useState(state);
  if (state !== lastState) {
    setLastState(state);
    setErrors(state.errors ?? {});
  }

  const set = <K extends keyof LoanFormValues>(key: K, value: LoanFormValues[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      if (!(key in current)) return current;
      const next = { ...current };
      delete next[key as LoanFormField];
      return next;
    });
  };
  const errorText = (field: LoanFormField) => {
    const key = errors[field];
    if (!key) return undefined;
    const max = field === "note" ? LOAN_NOTE_MAX_LENGTH : field === "purpose" ? LOAN_PURPOSE_MAX_LENGTH : LOAN_PERSON_MAX_LENGTH;
    return t(`errors.${key}`, { max });
  };
  const invalid = (field: LoanFormField) => (errors[field] ? true : undefined);
  const describedBy = (field: LoanFormField) => (errors[field] ? `${field}-error` : undefined);
  const errorNode = (field: LoanFormField) =>
    errors[field] ? (
      <p id={`${field}-error`} className="text-caption text-text-danger">
        {errorText(field)}
      </p>
    ) : null;
  const minor = parseMoneyInput(values.amount, locale);

  return (
    <form action={formAction} noValidate className="flex flex-1 flex-col gap-(--layout-section-gap)">
      <input type="hidden" name="fromAccount" value={String(values.fromAccount)} />
      {!values.fromAccount && <input type="hidden" name="accountId" value="" />}

      {state.formError && (
        <p role="alert" className="rounded-lg bg-status-danger-subtle p-16 text-body text-text-on-danger">
          {t(`errors.${state.formError}`)}
        </p>
      )}

      <div className={amountCardClass}>
        <span className={cn(amountChipClass, "bg-category-teal text-category-fg-teal")}>{t("chip")}</span>
        <label htmlFor="amount" className="sr-only">
          {t("amount")} ({t("required")})
        </label>
        <label htmlFor="amount" className={cn(amountBoxClass(Boolean(errors.amount)), "text-text-primary")}>
          <input
            id="amount"
            name="amount"
            inputMode="decimal"
            autoComplete="off"
            placeholder="0"
            value={values.amount}
            onChange={(event) => set("amount", formatMoneyTyping(event.target.value, locale))}
            onBlur={() => {
              if (minor !== null) set("amount", formatMoneyInput(minor, locale));
            }}
            aria-invalid={invalid("amount")}
            aria-describedby={describedBy("amount")}
            className={amountInputClass}
          />
          <span aria-hidden>₺</span>
        </label>
        {errorNode("amount")}
      </div>

      <div className="flex flex-col gap-8">
        <Label htmlFor="person" required>
          {t("person")}
        </Label>
        <input
          id="person"
          name="person"
          maxLength={LOAN_PERSON_MAX_LENGTH}
          autoComplete="off"
          placeholder={t("personPlaceholder")}
          value={values.person}
          onChange={(event) => set("person", event.target.value)}
          aria-invalid={invalid("person")}
          aria-describedby={describedBy("person")}
          className={inputClass}
        />
        {errorNode("person")}
      </div>

      <div className="flex flex-col gap-8">
        <Label htmlFor="purpose">{t("purpose")}</Label>
        <input
          id="purpose"
          name="purpose"
          maxLength={LOAN_PURPOSE_MAX_LENGTH}
          placeholder={t("purposePlaceholder")}
          value={values.purpose}
          onChange={(event) => set("purpose", event.target.value)}
          aria-invalid={invalid("purpose")}
          aria-describedby={describedBy("purpose")}
          className={inputClass}
        />
        {errorNode("purpose")}
      </div>

      <div className="flex flex-col gap-12 rounded-lg bg-surface-card p-12 shadow-elev-1">
        <div className="flex items-center justify-between gap-12">
          <div className="flex min-w-0 items-center gap-12">
            <span aria-hidden className="inline-flex size-40 shrink-0 items-center justify-center rounded-md bg-category-slate text-category-fg-slate">
              <Icon icon="paymentMethod" />
            </span>
            <div className="flex min-w-0 flex-col gap-2">
              <p id="fromAccount-label" className="text-body-strong text-text-primary">
                {t("fromAccount")}
              </p>
              <p id="fromAccount-hint" className="text-caption text-text-secondary">
                {values.fromAccount ? t("fromAccountHintOn") : t("fromAccountHintOff")}
              </p>
            </div>
          </div>
          <Switch id="fromAccount" checked={values.fromAccount} onChange={(next) => set("fromAccount", next)} labelledBy="fromAccount-label" describedBy="fromAccount-hint" />
        </div>
        {values.fromAccount && (
          <>
            <div className="border-t border-border-default" />
            <div className="flex flex-col gap-8">
              <p id="accountId-label" className="text-caption-strong text-text-secondary">
                {t("account")}
              </p>
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
              {errorNode("accountId")}
            </div>
          </>
        )}
      </div>

      <fieldset className="flex flex-col gap-8">
        <legend className="mb-8 text-body-strong text-text-primary">{t("dates")}</legend>
        <div className="grid grid-cols-2 gap-12">
          <div className="flex min-w-0 flex-col gap-4">
            <p id="lentOn-label" className="text-caption text-text-secondary">
              {t("lentOn")}
            </p>
            <DatePicker
              id="lentOn"
              name="lentOn"
              value={values.lentOn}
              onChange={(next) => set("lentOn", next)}
              labelledBy="lentOn-label"
              title={t("chooseLentOn")}
              invalid={invalid("lentOn")}
              describedBy={describedBy("lentOn")}
            />
            {errorNode("lentOn")}
          </div>
          <div className="flex min-w-0 flex-col gap-4">
            <p id="dueOn-label" className="text-caption text-text-secondary">
              {t("dueOn")}
            </p>
            <DatePicker
              id="dueOn"
              name="dueOn"
              value={values.dueOn}
              onChange={(next) => set("dueOn", next)}
              labelledBy="dueOn-label"
              title={t("chooseDueOn")}
              invalid={invalid("dueOn")}
              describedBy={describedBy("dueOn")}
            />
            {errorNode("dueOn")}
          </div>
        </div>
      </fieldset>

      <div className="flex flex-col gap-8">
        <div className="flex items-baseline justify-between gap-8">
          <Label htmlFor="note">{t("note")}</Label>
          <span className="text-caption text-text-secondary" aria-live="polite">
            {values.note.length}/{LOAN_NOTE_MAX_LENGTH}
          </span>
        </div>
        <textarea
          id="note"
          name="note"
          rows={3}
          maxLength={LOAN_NOTE_MAX_LENGTH}
          placeholder={t("notePlaceholder")}
          value={values.note}
          onChange={(event) => set("note", event.target.value)}
          aria-invalid={invalid("note")}
          aria-describedby={describedBy("note")}
          className={textareaClass}
        />
        {errorNode("note")}
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
