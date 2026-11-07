"use client";

import { useEffect, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { inputClass } from "@/components/ui/field";
import { isLocale } from "@/i18n/config";
import { cn } from "@/lib/cn";
import { formatMoneyInput, formatMoneyTyping, parseMoneyInput } from "@/lib/money";
import { LOAN_ITEMS_MAX, LOAN_ITEM_LABEL_MAX_LENGTH } from "../domain/types";

// Borç Ver → "Çoklu kalem" açıkken kalem listesi (ürün sahibi isteği 2026-11-07; Görev formundaki "Çoklu seçim"
// kalıbı, para alanıyla): her satırda ad (input) + tutar (input, ₺) + sil (×); altında "Kalem ekle".
// Toplam tutar kartında otomatik gösterilir. [Türetme] Görünüm DESIGN_SYSTEM_PICKALY §5.7 input ve ikon butonu.

export type LoanItemDraft = { id: string; label: string; amount: string };

export const newItemDraft = (): LoanItemDraft => ({ id: crypto.randomUUID(), label: "", amount: "" });

type Props = { value: LoanItemDraft[]; onChange: (next: LoanItemDraft[]) => void; invalid?: boolean; describedBy?: string };

export function LoanItemsEditor({ value, onChange, invalid, describedBy }: Props) {
  const t = useTranslations("loans.form.items");
  const rawLocale = useLocale();
  const locale = isLocale(rawLocale) ? rawLocale : "tr";
  const labels = useRef(new Map<string, HTMLInputElement>());
  const pendingFocus = useRef<string | null>(null);
  useEffect(() => {
    if (!pendingFocus.current) return;
    labels.current.get(pendingFocus.current)?.focus();
    pendingFocus.current = null;
  });

  const patch = (id: string, change: Partial<LoanItemDraft>) => onChange(value.map((row) => (row.id === id ? { ...row, ...change } : row)));
  const add = () => {
    if (value.length >= LOAN_ITEMS_MAX) return;
    const row = newItemDraft();
    pendingFocus.current = row.id;
    onChange([...value, row]);
  };

  return (
    <div className="flex flex-col gap-8">
      <ul className="flex flex-col gap-8">
        {value.map((row, index) => (
          <li key={row.id} className="flex items-center gap-8">
            <input
              ref={(element) => {
                if (element) labels.current.set(row.id, element);
                else labels.current.delete(row.id);
              }}
              value={row.label}
              maxLength={LOAN_ITEM_LABEL_MAX_LENGTH}
              onChange={(event) => patch(row.id, { label: event.target.value })}
              placeholder={t("labelPlaceholder")}
              aria-label={t("label", { index: index + 1 })}
              aria-invalid={invalid && !row.label.trim() ? true : undefined}
              aria-describedby={describedBy}
              className={cn(inputClass, "min-w-0 flex-1")}
            />
            <input
              value={row.amount}
              inputMode="decimal"
              autoComplete="off"
              onChange={(event) => patch(row.id, { amount: formatMoneyTyping(event.target.value, locale) })}
              onBlur={() => {
                const minor = parseMoneyInput(row.amount, locale);
                if (minor !== null) patch(row.id, { amount: formatMoneyInput(minor, locale) });
              }}
              placeholder="0 ₺"
              aria-label={t("amount", { index: index + 1 })}
              aria-invalid={invalid && parseMoneyInput(row.amount, locale) === null ? true : undefined}
              aria-describedby={describedBy}
              className={cn(inputClass, "min-w-0 shrink-0 grow-0 basis-120 text-end")}
            />
            <button
              type="button"
              onClick={() => onChange(value.filter((item) => item.id !== row.id))}
              aria-label={t("remove", { index: index + 1 })}
              disabled={value.length <= 1}
              className="touch-target inline-flex size-36 shrink-0 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-action-tertiary-hover hover:text-text-primary disabled:cursor-not-allowed disabled:text-text-disabled"
            >
              <Icon icon="close" size="sm" />
            </button>
          </li>
        ))}
      </ul>
      <Button type="button" variant="text" size="sm" leadingIcon="add" onClick={add} disabled={value.length >= LOAN_ITEMS_MAX} className="self-start">
        {t("add")}
      </Button>
    </div>
  );
}
