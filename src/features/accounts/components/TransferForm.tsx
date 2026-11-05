"use client";

import { useActionState, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ActionFooter } from "@/components/layout/ActionFooter";
import { Button, ButtonLink } from "@/components/ui/Button";
import { DatePicker } from "@/components/ui/DatePicker";
import { TimePicker } from "@/components/ui/TimePicker";
import { amountBoxClass, amountCardClass, amountChipClass, amountInputClass, textareaClass } from "@/components/ui/field";
import { isLocale } from "@/i18n/config";
import { cn } from "@/lib/cn";
import { formatMoneyInput, formatMoneyTyping, parseMoneyInput } from "@/lib/money";
import { createTransferAction } from "../actions";
import { TRANSFER_NOTE_MAX_LENGTH } from "../domain/types";
import type { TransferFormField, TransferFormState } from "../schemas";
import { AccountPicker, type AccountOption } from "./AccountPicker";

// Hesaplar Arası Para Aktar (ürün sahibi isteği 2026-11-05). Gelir / gider sayılmaz.
//   Tutar kartı (DESIGN_SYSTEM_PICKALY §5.7) · Gönderen Hesap · Alıcı Hesap (AccountPicker) · Tarih + Saat · Not.
//   Gönderen hesap eksiye düşecekse uyarı gösterilir ama izin verilir (birikim aktarımıyla aynı kural, PRD Q-14).

type TransferFormProps = {
  accounts: (AccountOption & { balanceMinor: string })[];
  today: string;
  defaultTime: string;
  cancelHref: string;
};

export function TransferForm({ accounts, today, defaultTime, cancelHref }: TransferFormProps) {
  const t = useTranslations("accounts.transfer");
  const rawLocale = useLocale();
  const locale = isLocale(rawLocale) ? rawLocale : "tr";
  const [state, formAction, pending] = useActionState<TransferFormState, FormData>(createTransferAction, {});
  const [fromAccountId, setFrom] = useState(accounts[0]?.id ?? "");
  const [toAccountId, setTo] = useState(accounts[1]?.id ?? "");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(today);
  const [time, setTime] = useState(defaultTime);
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState(state.errors ?? {});
  const [lastState, setLastState] = useState(state);
  if (state !== lastState) {
    setLastState(state);
    setErrors(state.errors ?? {});
  }

  const clear = (field: TransferFormField) =>
    setErrors((current) => {
      if (!(field in current)) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  const errorText = (field: TransferFormField) => (errors[field] ? t(`errors.${errors[field]}`, { max: TRANSFER_NOTE_MAX_LENGTH }) : undefined);
  const minor = parseMoneyInput(amount, locale);
  const source = accounts.find((account) => account.id === fromAccountId);
  const negative = minor !== null && source !== undefined && BigInt(source.balanceMinor) - minor < BigInt(0);

  return (
    <form action={formAction} noValidate className="flex flex-1 flex-col gap-(--layout-section-gap)">
      {state.formError && (
        <p role="alert" className="rounded-lg bg-status-danger-subtle p-16 text-body text-text-on-danger">
          {t(`errors.${state.formError}`)}
        </p>
      )}

      <div className={amountCardClass}>
        <span className={cn(amountChipClass, "bg-category-slate text-category-fg-slate")}>{t("chip")}</span>
        <label htmlFor="amount" className="sr-only">
          {t("amount")}
        </label>
        <label htmlFor="amount" className={cn(amountBoxClass(Boolean(errors.amount)), "text-text-primary")}>
          <input
            id="amount"
            name="amount"
            inputMode="decimal"
            autoComplete="off"
            placeholder="0"
            value={amount}
            onChange={(event) => {
              setAmount(formatMoneyTyping(event.target.value, locale));
              clear("amount");
            }}
            onBlur={() => {
              if (minor !== null) setAmount(formatMoneyInput(minor, locale));
            }}
            aria-invalid={errors.amount ? true : undefined}
            aria-describedby={errors.amount ? "amount-error" : undefined}
            className={amountInputClass}
          />
          <span aria-hidden>₺</span>
        </label>
        {errors.amount && (
          <p id="amount-error" className="text-caption text-text-danger">
            {errorText("amount")}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-8">
        <p id="fromAccountId-label" className="text-body-strong text-text-primary">
          {t("from")}
        </p>
        <AccountPicker
          id="fromAccountId"
          name="fromAccountId"
          accounts={accounts}
          value={fromAccountId}
          onChange={(next) => {
            setFrom(next);
            clear("fromAccountId");
          }}
          labelledBy="fromAccountId-label"
          invalid={errors.fromAccountId ? true : undefined}
          describedBy={errors.fromAccountId ? "fromAccountId-error" : negative ? "negative-warning" : undefined}
        />
        {negative && (
          <p id="negative-warning" role="status" className="text-caption text-text-warning">
            {t("negativeWarning")}
          </p>
        )}
        {errors.fromAccountId && (
          <p id="fromAccountId-error" className="text-caption text-text-danger">
            {errorText("fromAccountId")}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-8">
        <p id="toAccountId-label" className="text-body-strong text-text-primary">
          {t("to")}
        </p>
        <AccountPicker
          id="toAccountId"
          name="toAccountId"
          accounts={accounts}
          value={toAccountId}
          onChange={(next) => {
            setTo(next);
            clear("toAccountId");
          }}
          labelledBy="toAccountId-label"
          invalid={errors.toAccountId ? true : undefined}
          describedBy={errors.toAccountId ? "toAccountId-error" : undefined}
        />
        {errors.toAccountId && (
          <p id="toAccountId-error" className="text-caption text-text-danger">
            {errorText("toAccountId")}
          </p>
        )}
      </div>

      <fieldset className="flex flex-col gap-8">
        <legend className="mb-8 text-body-strong text-text-primary">{t("when")}</legend>
        <div className="grid grid-cols-2 gap-12">
          <div className="flex min-w-0 flex-col gap-4">
            <p id="date-label" className="text-caption text-text-secondary">
              {t("date")}
            </p>
            <DatePicker id="date" name="date" value={date} onChange={setDate} labelledBy="date-label" title={t("chooseDate")} invalid={errors.date ? true : undefined} />
          </div>
          <div className="flex min-w-0 flex-col gap-4">
            <p id="time-label" className="text-caption text-text-secondary">
              {t("time")}
            </p>
            <TimePicker id="time" name="time" value={time} onChange={setTime} labelledBy="time-label" title={t("chooseTime")} invalid={errors.time ? true : undefined} />
          </div>
        </div>
      </fieldset>

      <div className="flex flex-col gap-8">
        <div className="flex items-baseline justify-between gap-8">
          <label htmlFor="note" className="text-body-strong text-text-primary">
            {t("note")}
          </label>
          <span className="text-caption text-text-secondary" aria-live="polite">
            {note.length}/{TRANSFER_NOTE_MAX_LENGTH}
          </span>
        </div>
        <textarea
          id="note"
          name="note"
          rows={3}
          maxLength={TRANSFER_NOTE_MAX_LENGTH}
          placeholder={t("notePlaceholder")}
          value={note}
          onChange={(event) => {
            setNote(event.target.value);
            clear("note");
          }}
          aria-invalid={errors.note ? true : undefined}
          className={textareaClass}
        />
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
