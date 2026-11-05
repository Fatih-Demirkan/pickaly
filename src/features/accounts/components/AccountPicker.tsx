"use client";

import { useId, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Icon } from "@/components/ui/Icon";
import { OptionList } from "@/components/ui/OptionList";
import { PickerPanel } from "@/components/ui/PickerPanel";
import { cn } from "@/lib/cn";

// Pages → Yeni İşlem "İşlem Yapılan Hesap" kartı: ikon kutusu + "Ana Hesap" + "Bakiye 24.850,00 ₺" + "Değiştir ⇅".
// Kart, hesap seçicisini açar (RESPONSIVE §4.5.1): satırda hesap adı + bakiye, seçili satır check ile.

export type AccountOption = { id: string; name: string; balance: string };

type AccountPickerProps = {
  id: string;
  name: string;
  accounts: AccountOption[];
  value: string;
  onChange: (value: string) => void;
  labelledBy: string;
  invalid?: boolean;
  describedBy?: string;
};

export function AccountPicker({ id, name, accounts, value, onChange, labelledBy, invalid, describedBy }: AccountPickerProps) {
  const t = useTranslations("transactions.form");
  const titleId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const account = accounts.find((item) => item.id === value);

  return (
    <div ref={containerRef} className="relative">
      <input type="hidden" name={name} value={value} />
      <button
        ref={triggerRef}
        id={id}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        data-invalid={invalid || undefined}
        aria-labelledby={`${labelledBy} ${id}`}
        aria-describedby={describedBy}
        onClick={() => setOpen((current) => !current)}
        className={cn(
          // Kart görünümü (beyaz + elev-1); odak ve hata durumları için şeffaf çerçeve renklenir.
          "flex w-full items-center gap-12 rounded-lg border border-transparent bg-surface-card p-12 text-start shadow-elev-1 transition-colors hover:bg-action-tertiary-hover",
          open && "border-border-focus",
          // Hata metni aria-describedby ile okunur; aria-invalid buton rolünde geçerli değildir.
          "data-invalid:border-border-error",
        )}
      >
        {/* [Varsayım] Pages'ta ikon #6366F1; kutu zemini ölçülmedi → Category/Blue + on-task. */}
        <span aria-hidden className="inline-flex size-36 shrink-0 items-center justify-center rounded-sm bg-category-blue text-category-fg-blue">
          <Icon icon="paymentMethod" />
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-body-strong text-text-primary">{account?.name}</span>
          <span className="text-caption text-text-secondary">
            {t("balance")} {account?.balance}
          </span>
        </span>
        <span aria-hidden className="flex items-center gap-4 text-caption-strong text-text-secondary">
          {t("change")}
          <Icon icon="switch" size="sm" />
        </span>
      </button>
      <PickerPanel open={open} onClose={() => setOpen(false)} title={t("chooseAccount")} titleId={titleId} containerRef={containerRef} triggerRef={triggerRef}>
        <OptionList
          options={accounts.map((item) => ({ value: item.id, label: item.name, description: item.balance }))}
          value={value}
          labelledBy={titleId}
          autoFocus
          onSelect={(next) => {
            onChange(next);
            setOpen(false);
            triggerRef.current?.focus({ preventScroll: true });
          }}
        />
      </PickerPanel>
    </div>
  );
}
