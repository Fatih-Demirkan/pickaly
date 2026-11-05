"use client";

import { useActionState, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ActionFooter } from "@/components/layout/ActionFooter";
import { Button, ButtonLink } from "@/components/ui/Button";
import { DatePicker } from "@/components/ui/DatePicker";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { amountBoxClass, amountCardClass, amountChipClass, amountInputClass, fieldBoxClass } from "@/components/ui/field";
import { AccountPicker, type AccountOption } from "@/features/accounts/components/AccountPicker";
import { isLocale } from "@/i18n/config";
import { cn } from "@/lib/cn";
import { formatMoneyInput, formatMoneyTyping, parseMoneyInput } from "@/lib/money";
import { moveSavingsAction } from "../actions";
import type { SavingsUnit } from "../domain/types";
import type { MovementDirection } from "../routes";
import type { MovementFormField, MovementFormState } from "../schemas";

// Para ekle / Çek (PRD FR-SAV-005/006) · [Eksik] Pages'ta akış tasarlanmadı; RESPONSIVE §8.2.11:
//   segmented "Ekle / Çek" + tutar kartı (adet/gram birimde miktar, Q-18) + hesap seçici; tablet+ drawer 480 px.
// Ekleme kaynak hesaptan aktarımdır (gider sayılmaz), çekme ters aktarımdır (gelir sayılmaz) (BR-SAV-001/002).
// Adet/gram birimde TL karşılığı isteğe bağlıdır; girilirse hesaba yansır (BR-SAV-004).
// Kaynak hesap bakiyesi yetersizse uyarı gösterilir ama işleme izin verilir (PRD §7.3, Q-14); birikim bakiyesinden
// fazla çekme engellenir.
// [Varsayım] Mobilde bottom sheet yerine diğer formlarla aynı tam ekran sunum kullanılır.

type MovementFormProps = {
  accountId: string;
  unit: SavingsUnit;
  balanceLabel: string;
  initialDirection: MovementDirection;
  accounts: (AccountOption & { balanceMinor: string })[];
  today: string;
  cancelHref: string;
};

export function MovementForm({ accountId, unit, balanceLabel, initialDirection, accounts, today, cancelHref }: MovementFormProps) {
  const t = useTranslations("savings.move");
  const tUnit = useTranslations("savings.unit");
  const rawLocale = useLocale();
  const locale = isLocale(rawLocale) ? rawLocale : "tr";
  const [state, formAction, pending] = useActionState<MovementFormState, FormData>(moveSavingsAction.bind(null, accountId), {});
  const [direction, setDirection] = useState(initialDirection);
  const [amount, setAmount] = useState("");
  const [transfer, setTransfer] = useState("");
  const [bankAccountId, setBankAccountId] = useState(accounts[0]?.id ?? "");
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

  // Q-14: ekleme kaynak hesabı eksiye düşürecekse uyarı (engellemez).
  const transferMinor = parseMoneyInput(money ? amount : transfer, locale);
  const source = accounts.find((account) => account.id === bankAccountId);
  const negative = direction === "in" && transferMinor !== null && source !== undefined && BigInt(source.balanceMinor) - transferMinor < BigInt(0);

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

      <div
        className={amountCardClass}
      >
        <span className={cn(amountChipClass, direction === "in" ? "bg-category-green text-category-fg-green" : "bg-category-red text-category-fg-red")}>
          <span aria-hidden className={cn("size-6 rounded-full", direction === "in" ? "bg-status-success" : "bg-status-danger")} />
          {direction === "in" ? t("inChip") : t("outChip")}
        </span>
        <label htmlFor="amount" className="sr-only">
          {t("title")}
        </label>
        <label
          htmlFor="amount"
          className={cn(
            amountBoxClass(Boolean(errors.amount)),
            direction === "in" ? "text-text-success" : "text-text-danger",
          )}
        >
          <span aria-hidden>{direction === "in" ? "+" : "−"}</span>
          <input
            id="amount"
            name="amount"
            inputMode="decimal"
            autoComplete="off"
            placeholder={locale === "tr" ? "0,00" : "0.00"}
            value={amount}
            onChange={(event) => {
              setAmount(formatMoneyTyping(event.target.value, locale));
              clear("amount");
            }}
            onBlur={() => {
              const minor = parseMoneyInput(amount, locale);
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

      {!money && (
        <div className="flex flex-col gap-8">
          <label htmlFor="transfer" className="text-body-strong text-text-primary">
            {t("transfer")}
          </label>
          <label
            htmlFor="transfer"
            className={fieldBoxClass(Boolean(errors.transfer))}
          >
            <input
              id="transfer"
              name="transfer"
              inputMode="decimal"
              autoComplete="off"
              placeholder={locale === "tr" ? "0,00" : "0.00"}
              value={transfer}
              onChange={(event) => {
                setTransfer(formatMoneyTyping(event.target.value, locale));
                clear("transfer");
              }}
              aria-invalid={errors.transfer ? true : undefined}
              aria-describedby={errors.transfer ? "transfer-error" : "transfer-hint"}
              className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-text-secondary"
            />
            <span aria-hidden className="text-text-secondary">
              ₺
            </span>
          </label>
          <p id="transfer-hint" className="text-caption text-text-secondary">
            {t("transferHint")}
          </p>
          {errors.transfer && (
            <p id="transfer-error" className="text-caption text-text-danger">
              {errorText("transfer")}
            </p>
          )}
        </div>
      )}

      <div className="flex flex-col gap-8">
        <p id="bankAccountId-label" className="text-body-strong text-text-primary">
          {direction === "in" ? t("sourceAccount") : t("targetAccount")}
        </p>
        <AccountPicker
          id="bankAccountId"
          name="bankAccountId"
          accounts={accounts}
          value={bankAccountId}
          onChange={(next) => {
            setBankAccountId(next);
            clear("bankAccountId");
          }}
          labelledBy="bankAccountId-label"
          invalid={errors.bankAccountId ? true : undefined}
          describedBy={errors.bankAccountId ? "bankAccountId-error" : negative ? "negative-warning" : undefined}
        />
        {negative && (
          <p id="negative-warning" role="status" className="text-caption text-text-warning">
            {t("negativeWarning")}
          </p>
        )}
        {errors.bankAccountId && (
          <p id="bankAccountId-error" className="text-caption text-text-danger">
            {errorText("bankAccountId")}
          </p>
        )}
      </div>

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
