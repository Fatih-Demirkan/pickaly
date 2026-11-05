"use client";

import { useActionState, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ActionFooter } from "@/components/layout/ActionFooter";
import { Button, ButtonLink } from "@/components/ui/Button";
import { fieldBoxClass, inputClass } from "@/components/ui/field";
import { isLocale } from "@/i18n/config";
import { formatMoneyInput, formatMoneyTyping, parseMoneyInput } from "@/lib/money";
import { saveAccount } from "../actions";
import { ACCOUNT_DETAIL_MAX_LENGTH, ACCOUNT_NAME_MAX_LENGTH } from "../domain/types";
import type { AccountFormField, AccountFormState } from "../schemas";

// Hesap Ekle / Düzenle (ürün sahibi isteği 2026-11-05): Ad (zorunlu) · Açıklama (isteğe bağlı, ör. "Banka Kartı ••4821") ·
// Açılış Bakiyesi (boş = 0 ₺). Form alanları DESIGN_SYSTEM_PICKALY §5.7 (field.ts).

export type AccountFormValues = { name: string; detail: string; openingBalance: string };

type AccountFormProps = { accountId?: string; initialValues: AccountFormValues; cancelHref: string };

export function AccountForm({ accountId, initialValues, cancelHref }: AccountFormProps) {
  const t = useTranslations("accounts.form");
  const rawLocale = useLocale();
  const locale = isLocale(rawLocale) ? rawLocale : "tr";
  const [state, formAction, pending] = useActionState<AccountFormState, FormData>(saveAccount.bind(null, accountId ?? null), {});
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState(state.errors ?? {});
  const [lastState, setLastState] = useState(state);
  if (state !== lastState) {
    setLastState(state);
    setErrors(state.errors ?? {});
  }

  const set = (field: AccountFormField, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      if (!(field in current)) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  };
  const errorText = (field: AccountFormField) => (errors[field] ? t(`errors.${errors[field]}`, { max: field === "name" ? ACCOUNT_NAME_MAX_LENGTH : ACCOUNT_DETAIL_MAX_LENGTH }) : undefined);
  const describedBy = (field: AccountFormField, hint?: string) => (errors[field] ? `${field}-error` : hint);

  return (
    <form action={formAction} noValidate className="flex flex-1 flex-col gap-(--layout-section-gap)">
      {state.formError && (
        <p role="alert" className="rounded-lg bg-status-danger-subtle p-16 text-body text-text-on-danger">
          {t(`errors.${state.formError}`)}
        </p>
      )}

      <div className="flex flex-col gap-8">
        <label htmlFor="name" className="text-body-strong text-text-primary">
          {t("name")} <span aria-hidden className="text-text-danger">*</span>
          <span className="sr-only"> ({t("required")})</span>
        </label>
        <input
          id="name"
          name="name"
          maxLength={ACCOUNT_NAME_MAX_LENGTH}
          placeholder={t("namePlaceholder")}
          value={values.name}
          onChange={(event) => set("name", event.target.value)}
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={describedBy("name")}
          className={inputClass}
        />
        {errors.name && (
          <p id="name-error" className="text-caption text-text-danger">
            {errorText("name")}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-8">
        <label htmlFor="detail" className="text-body-strong text-text-primary">
          {t("detail")}
        </label>
        <input
          id="detail"
          name="detail"
          maxLength={ACCOUNT_DETAIL_MAX_LENGTH}
          placeholder={t("detailPlaceholder")}
          value={values.detail}
          onChange={(event) => set("detail", event.target.value)}
          aria-invalid={errors.detail ? true : undefined}
          aria-describedby={describedBy("detail")}
          className={inputClass}
        />
        {errors.detail && (
          <p id="detail-error" className="text-caption text-text-danger">
            {errorText("detail")}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-8">
        <label htmlFor="openingBalance" className="text-body-strong text-text-primary">
          {t("openingBalance")}
        </label>
        <label htmlFor="openingBalance" className={fieldBoxClass(Boolean(errors.openingBalance))}>
          <input
            id="openingBalance"
            name="openingBalance"
            inputMode="decimal"
            autoComplete="off"
            placeholder="0"
            value={values.openingBalance}
            onChange={(event) => set("openingBalance", formatMoneyTyping(event.target.value, locale))}
            onBlur={() => {
              const minor = parseMoneyInput(values.openingBalance, locale);
              if (minor !== null) set("openingBalance", formatMoneyInput(minor, locale));
            }}
            aria-invalid={errors.openingBalance ? true : undefined}
            aria-describedby={describedBy("openingBalance", "openingBalance-hint")}
            className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-text-secondary"
          />
          <span aria-hidden className="text-text-secondary">
            ₺
          </span>
        </label>
        <p id="openingBalance-hint" className="text-caption text-text-secondary">
          {t("openingBalanceHint")}
        </p>
        {errors.openingBalance && (
          <p id="openingBalance-error" className="text-caption text-text-danger">
            {errorText("openingBalance")}
          </p>
        )}
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
