"use client";

import { useActionState, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ActionFooter } from "@/components/layout/ActionFooter";
import { Button, ButtonLink } from "@/components/ui/Button";
import { fieldBoxClass, inputClass } from "@/components/ui/field";
import { Icon } from "@/components/ui/Icon";
import { Switch } from "@/components/ui/Switch";
import { isLocale } from "@/i18n/config";
import { formatMoneyInput, formatMoneyTyping, parseMoneyInput } from "@/lib/money";
import { saveAccount } from "../actions";
import { ACCOUNT_DETAIL_MAX_LENGTH, ACCOUNT_NAME_MAX_LENGTH } from "../domain/types";
import type { AccountFormField, AccountFormState } from "../schemas";

// Hesap Ekle / Düzenle (ürün sahibi isteği 2026-11-05): Ad (zorunlu) · Açıklama (isteğe bağlı, ör. "Banka Kartı ••4821") ·
// Güncel Bakiye (boş = 0 ₺; başında "-" ile eksi bakiye). Düzenlemede hesabın şu anki bakiyesiyle dolu gelir; kullanıcı
// doğrudan düzeltir, fark açılış bakiyesine yansır (gelir / gider kayıtları değişmez). Form alanları DESIGN_SYSTEM_PICKALY §5.7.
// "Toplam bakiyeye dahil et" (ürün sahibi isteği 2026-11-07): Switch kartı (Borç Ver "Hesabımdan çıktı" kalıbı: 40 px ikon
//   karosu + body-strong etiket + caption açıklama + Switch). Varsayılan açık; kapalıyken bakiye korunur, Ana Sayfa
//   toplamına eklenmez ve toplamın altında ayrı gösterilir.

export type AccountFormValues = { name: string; detail: string; balance: string; includeInTotal: boolean };
type TextField = Exclude<AccountFormField, "includeInTotal">;

/** Tutar yazımı; başta "-" varsa korunur (eksi bakiye). */
function formatSignedTyping(raw: string, locale: "tr" | "en") {
  const negative = raw.trim().startsWith("-");
  const formatted = formatMoneyTyping(raw.replace(/-/g, ""), locale);
  return negative ? `-${formatted}` : formatted;
}

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

  const set = (field: TextField, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      if (!(field in current)) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  };
  const errorText = (field: TextField) => (errors[field] ? t(`errors.${errors[field]}`, { max: field === "name" ? ACCOUNT_NAME_MAX_LENGTH : ACCOUNT_DETAIL_MAX_LENGTH }) : undefined);
  const describedBy = (field: AccountFormField, hint?: string) => (errors[field] ? `${field}-error` : hint);

  return (
    <form action={formAction} noValidate className="flex flex-1 flex-col gap-(--layout-section-gap)">
      <input type="hidden" name="includeInTotal" value={String(values.includeInTotal)} />
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
        <label htmlFor="balance" className="text-body-strong text-text-primary">
          {t("balance")}
        </label>
        <label htmlFor="balance" className={fieldBoxClass(Boolean(errors.balance))}>
          <input
            id="balance"
            name="balance"
            inputMode="decimal"
            autoComplete="off"
            placeholder="0"
            value={values.balance}
            onChange={(event) => set("balance", formatSignedTyping(event.target.value, locale))}
            onBlur={() => {
              const negative = values.balance.trim().startsWith("-");
              const minor = parseMoneyInput(values.balance.replace(/-/g, ""), locale);
              if (minor !== null) set("balance", `${negative ? "-" : ""}${formatMoneyInput(minor, locale)}`);
            }}
            aria-invalid={errors.balance ? true : undefined}
            aria-describedby={describedBy("balance", "balance-hint")}
            className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-text-secondary"
          />
          <span aria-hidden className="text-text-secondary">
            ₺
          </span>
        </label>
        <p id="balance-hint" className="text-caption text-text-secondary">
          {t(accountId ? "balanceEditHint" : "balanceHint")}
        </p>
        {errors.balance && (
          <p id="balance-error" className="text-caption text-text-danger">
            {errorText("balance")}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between gap-12 rounded-lg bg-surface-card p-12 shadow-elev-1">
        <div className="flex min-w-0 items-center gap-12">
          <span aria-hidden className="inline-flex size-40 shrink-0 items-center justify-center rounded-md bg-category-blue text-category-fg-blue">
            <Icon icon="totalBalance" />
          </span>
          <div className="flex min-w-0 flex-col gap-2">
            <p id="includeInTotal-label" className="text-body-strong text-text-primary">
              {t("includeInTotal")}
            </p>
            <p id="includeInTotal-hint" className="text-caption text-text-secondary">
              {values.includeInTotal ? t("includeInTotalHintOn") : t("includeInTotalHintOff")}
            </p>
          </div>
        </div>
        <Switch
          id="includeInTotal"
          checked={values.includeInTotal}
          onChange={(next) => setValues((current) => ({ ...current, includeInTotal: next }))}
          labelledBy="includeInTotal-label"
          describedBy="includeInTotal-hint"
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
