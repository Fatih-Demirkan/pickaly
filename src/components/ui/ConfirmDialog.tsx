"use client";

import { useId, useRef, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import type { AppIconName } from "@/config/icons";
import { Button, type ButtonVariant } from "./Button";

// Silme onayı (RESPONSIVE §4.5.2, DESIGN §8.10): yerel <dialog> — odak tuzağı, Esc ile kapanma ve
// arka planın etkisizleşmesi tarayıcıdan gelir. Butonlar: Vazgeç (Tertiary) + Sil (Destructive).
// [Eksik] Modal Figma'da tasarlanmadı; genişlik --layout-modal-confirm-width, radius-2xl, shadow-overlay.

type ConfirmDialogProps = {
  trigger: { label: string; icon?: AppIconName; variant?: ButtonVariant; className?: string };
  title: string;
  body: ReactNode;
  cancelLabel: string;
  confirmLabel: string;
  /** Onaylanınca çalışan sunucu aksiyonu. */
  action: () => Promise<void>;
};

function ConfirmButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="destructive" loading={pending}>
      {label}
    </Button>
  );
}

export function ConfirmDialog({ trigger, title, body, cancelLabel, confirmLabel, action }: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const bodyId = useId();

  return (
    <>
      <Button variant={trigger.variant ?? "tertiary"} leadingIcon={trigger.icon} className={trigger.className} onClick={() => dialogRef.current?.showModal()}>
        {trigger.label}
      </Button>
      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        aria-describedby={bodyId}
        className="m-auto w-[calc(100%-32px)] max-w-(--layout-modal-confirm-width) rounded-2xl border border-border-default bg-surface-card p-24 text-text-primary shadow-overlay backdrop:bg-text-primary/40 open:animate-pop-enter open:backdrop:animate-fade-in"
      >
        <form action={action} className="flex flex-col gap-24">
          <div className="flex flex-col gap-8">
            <h2 id={titleId} className="text-heading-h4">
              {title}
            </h2>
            <p id={bodyId} className="text-body-md text-text-secondary">
              {body}
            </p>
          </div>
          <div className="flex flex-col-reverse gap-12 tablet:flex-row tablet:justify-end">
            <Button variant="tertiary" onClick={() => dialogRef.current?.close()}>
              {cancelLabel}
            </Button>
            <ConfirmButton label={confirmLabel} />
          </div>
        </form>
      </dialog>
    </>
  );
}
