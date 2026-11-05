"use client";

import { useActionState, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ActionFooter } from "@/components/layout/ActionFooter";
import { Button, ButtonLink } from "@/components/ui/Button";
import { DatePicker } from "@/components/ui/DatePicker";
import { Icon } from "@/components/ui/Icon";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { amountBoxClass, amountCardClass, amountChipClass, amountInputClass } from "@/components/ui/field";
import { isLocale } from "@/i18n/config";
import { cn } from "@/lib/cn";
import { formatMoneyInput, formatMoneyTyping, parseMoneyInput } from "@/lib/money";
import { moveSavingsAction } from "../actions";
import type { SavingsUnit } from "../domain/types";
import type { MovementDirection } from "../routes";
import type { MovementFormField, MovementFormState } from "../schemas";

// Para ekle / Çek (PRD FR-SAV-005/006): segmented "Ekle / Çek" + tutar kartı + tarih.
// Hesap ayrıca sorulmaz (ürün sahibi kararı 2026-11-05): TL birikimde para, birikimin bağlı olduğu hesaptan aktarılır
// (ekleme) veya o hesaba döner (çekme). Bağlı hesap formda salt okunur kartla gösterilir. Adet / gram birimde
// hesaplara dokunulmaz (BR-SAV-004). Ekleme bağlı hesabı eksiye düşürecekse uyarı gösterilir ama izin verilir (Q-14);
// birikim bakiyesinden fazla çekme engellenir.

type LinkedAccount = { name: string; balance: string; balanceMinor: string };

type MovementFormProps = {
  accountId: string;
  unit: SavingsUnit;
  balanceLabel: string;
  initialDirection: MovementDirection;
  /** Birikimin bağlı olduğu hesap; yoksa (eski kayıt) aktarım hesaplara yansımaz. */
  linkedAccount: LinkedAccount | null;
  today: string;
  cancelHref: string;
};

export function MovementForm({ accountId, unit, balanceLabel, initialDirection, linkedAccount, today, cancelHref }: MovementFormProps) {
  const t = useTranslations("savings.move");
  const tUnit = useTranslations("savings.unit");
  const rawLocale = useLocale();
  const locale = isLocale(rawLocale) ? rawLocale : "tr";
  const [state, formAction, pending] = useActionState<MovementFormState, FormData>(moveSavingsAction.bind(null, accountId), {});
  const [direction, setDirection] = useState(initialDirection);
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(today);
  const [errors, setErrors] = useState(state.errors ?? {});
  const [lastState, setLastState] = useState(state);
  if (state !== lastState) {
    setLastState(state);
    setErrors(state.errors ?? {});
  }

  const clear = (field: MovementFormField) =>
    setErrors((current) => {
      if (!(field in current)) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  const errorText = (field: MovementFormField) => (errors[field] ? t(`errors.${errors[field]}`) : undefined);
  const money = unit === "TRY";

  // Q-14: ekleme bağlı hesabı eksiye düşürecekse uyarı (engellemez).
  const minor = parseMoneyInput(amount, locale);
  const negative = money && direction === "in" && minor !== null && linkedAccount !== null && BigInt(linkedAccount.balanceMinor) - minor < BigInt(0);

  return (
    <form action={formAction} noValidate className="flex flex-1 flex-col gap-(--layout-section-gap)">
      <input type="hidden" name="direction" value={direction} />

      {state.formError && (
        <p role="alert" className="rounded-lg bg-status-danger-subtle p-16 text-body text-text-on-danger">
          {t(`errors.${state.formError}`)}
        </p>
      )}

      <div className="flex flex-col gap-8">
        <p className="text-body-strong text-text-primary">{t("direction")}</p>
        <SegmentedControl
          label={t("direction")}
          fullWidth
          value={direction}
          onChange={setDirection}
          options={[
            { value: "in", label: t("in") },
            { value: "out", label: t("out") },
          ]}
        />
      </div>

      <div className={amountCardClass}>
        <span className={cn(amountChipClass, direction === "in" ? "bg-category-green text-category-fg-green" : "bg-category-red text-category-fg-red")}>
          <span aria-hidden className={cn("size-6 rounded-full", direction === "in" ? "bg-status-success" : "bg-status-danger")} />
          {direction === "in" ? t("inChip") : t("outChip")}
        </span>
        <label htmlFor="amount" className="sr-only">
          {t("title")}
        </label>
        <label htmlFor="amount" className={cn(amountBoxClass(Boolean(errors.amount)), direction === "in" ? "text-text-success" : "text-text-danger")}>
          <span aria-hidden>{direction === "in" ? "+" : "−"}</span>
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
            aria-describedby={errors.amount ? "amount-error" : "amount-balance"}
            className={amountInputClass}
          />
          <span aria-hidden>{money ? "₺" : tUnit(unit)}</span>
        </label>
        <p id="amount-balance" className="text-caption-strong text-text-secondary">
          {t("balance", { amount: balanceLabel })}
        </p>
        {errors.amount && (
          <p id="amount-error" className="text-caption text-text-danger">
            {errorText("amount")}
          </p>
        )}
      </div>

      {money && linkedAccount ? (
        <div className="flex flex-col gap-8">
          <p className="text-body-strong text-text-primary">{direction === "in" ? t("sourceAccount") : t("targetAccount")}</p>
          {/* Salt okunur: aktarım birikimin bağlı hesabıyla yapılır; hesap birikim düzenlenerek değiştirilir. */}
          <div className="flex items-center gap-12 rounded-lg bg-surface-card p-12 shadow-elev-1" aria-describedby={negative ? "negative-warning" : undefined}>
            <span aria-hidden className="inline-flex size-36 shrink-0 items-center justify-center rounded-sm bg-category-blue text-category-fg-blue">
              <Icon icon="paymentMethod" />
            </span>
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-body-strong text-text-primary">{linkedAccount.name}</span>
              <span className="text-caption text-text-secondary">{t("accountBalance", { amount: linkedAccount.balance })}</span>
            </span>
          </div>
          <p className="text-caption text-text-secondary">{direction === "in" ? t("fromAccountHint", { account: linkedAccount.name }) : t("toAccountHint", { account: linkedAccount.name })}</p>
          {negative && (
            <p id="negative-warning" role="status" className="text-caption text-text-warning">
              {t("negativeWarning")}
            </p>
          )}
        </div>
      ) : (
        <p className="rounded-lg bg-status-info-subtle p-16 text-body text-text-primary">{money ? t("noLinkedAccount") : t("unitHint")}</p>
      )}

      <div className="flex flex-col gap-4">
        <p id="date-label" className="text-body-strong text-text-primary">
          {t("date")}
        </p>
        <DatePicker id="date" name="date" value={date} onChange={setDate} labelledBy="date-label" title={t("chooseDate")} invalid={errors.date ? true : undefined} />
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
