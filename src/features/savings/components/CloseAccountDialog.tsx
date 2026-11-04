"use client";

import { useId, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

// "Birikim hesabını kapat / Sil" onayı (PRD FR-SAV-011, Q-15; RESPONSIVE §4.5.2, §8.2.11 "Birikim kapatmada aktarım"):
// silme onayı (ConfirmDialog ile aynı yerel <dialog> kalıbı) içinde, bakiyesi olan hesapta aktarılacak hesap seçimi
// (varsayılan Ana Hesap) + "aktarmadan kapat". Seçim satırları seçici liste satırı görünümündedir (48 px, seçili check).

type CloseAccountDialogProps = {
  labels: { trigger: string; title: string; body: string; transferBody?: string; noTransfer: string; cancel: string; confirm: string };
  accounts: { id: string; name: string }[];
  action: (formData: FormData) => Promise<void>;
};

function ConfirmButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="destructive" loading={pending}>
      {label}
    </Button>
  );
}

export function CloseAccountDialog({ labels, accounts, action }: CloseAccountDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const bodyId = useId();
  const [target, setTarget] = useState(accounts[0]?.id ?? "");
  const options = [...accounts.map((account) => ({ value: account.id, label: account.name })), { value: "", label: labels.noTransfer }];

  return (
    <>
      <Button variant="destructive" leadingIcon="delete" className="w-full" onClick={() => dialogRef.current?.showModal()}>
        {labels.trigger}
      </Button>
      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        aria-describedby={bodyId}
        className="m-auto w-[calc(100%-32px)] max-w-(--layout-modal-confirm-width) rounded-xl bg-surface-card p-24 text-text-primary shadow-elev-3 backdrop:bg-text-primary/40 open:animate-pop-enter open:backdrop:animate-fade-in"
      >
        <form action={action} className="flex flex-col gap-24">
          <div className="flex flex-col gap-8">
            <h2 id={titleId} className="text-title-md">
              {labels.title}
            </h2>
            <p id={bodyId} className="text-body text-text-secondary">
              {labels.body}
            </p>
          </div>
          {labels.transferBody && (
            <fieldset className="flex flex-col gap-8">
              <legend className="mb-8 text-body-strong text-text-primary">{labels.transferBody}</legend>
              <input type="hidden" name="targetAccountId" value={target} />
              <div role="radiogroup" className="flex flex-col gap-2">
                {options.map((option) => {
                  const selected = option.value === target;
                  return (
                    <button
                      key={option.value || "none"}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => setTarget(option.value)}
                      className={cn(
                        "flex h-48 items-center gap-12 rounded-md px-12 text-start text-body transition-colors",
                        selected ? "bg-surface-selected text-text-brand" : "text-text-primary hover:bg-surface-page",
                      )}
                    >
                      <span className={cn("min-w-0 flex-1 truncate", selected && "text-body-strong")}>{option.label}</span>
                      {selected && (
                        <span className="text-brand-primary">
                          <Icon icon="confirm" size="sm" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          )}
          <div className="flex flex-col-reverse gap-12 tablet:flex-row tablet:justify-end">
            <Button variant="tertiary" onClick={() => dialogRef.current?.close()}>
              {labels.cancel}
            </Button>
            <ConfirmButton label={labels.confirm} />
          </div>
        </form>
      </dialog>
    </>
  );
}
