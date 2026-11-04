"use client";

import { useId, useRef, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { useToast } from "@/components/ui/Toast";
import { archiveCategoryAction, deleteCategoryAction } from "../actions";

// Kategori satırındaki çöp kutusu (Pages → Kategori Yönetimi) ve onayı (RESPONSIVE §8.2.3, §8.2.11):
//   kullanılmış kategori → arşivleme onayı: bağlı kayıt ve tekrarlayan kayıt sayısı + "Arşivle" (Secondary; işlem geri
//     alınabilir olduğu için Destructive kullanılmaz) (BR-CAT-002, BR-CAT-007)
//   kullanılmamış kategori → standart silme onayı, "Sil" Destructive (BR-CAT-004)
//   türün son aktif kategorisi → yalnızca bilgi ve "Tamam" (BR-CAT-003)
// Onay, ConfirmDialog ile aynı yerel <dialog> kalıbıdır.

type CategoryRemoveButtonProps = {
  categoryId: string;
  mode: "archive" | "delete" | "blocked";
  labels: { trigger: string; title: string; body: string; note?: string; confirm: string; cancel: string; done: string; failed: string };
};

export function CategoryRemoveButton({ categoryId, mode, labels }: CategoryRemoveButtonProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const bodyId = useId();
  const toast = useToast();
  const [pending, startTransition] = useTransition();

  function confirm() {
    startTransition(async () => {
      const result = mode === "archive" ? await archiveCategoryAction(categoryId) : await deleteCategoryAction(categoryId);
      dialogRef.current?.close();
      toast(result.ok ? { message: labels.done } : { message: labels.failed, tone: "error" });
    });
  }

  return (
    <>
      <button
        type="button"
        aria-label={labels.trigger}
        onClick={() => dialogRef.current?.showModal()}
        className="touch-target relative inline-flex size-32 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-action-tertiary-hover hover:text-text-primary"
      >
        <Icon icon="delete" />
      </button>
      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        aria-describedby={bodyId}
        className="m-auto w-[calc(100%-32px)] max-w-(--layout-modal-confirm-width) rounded-xl bg-surface-card p-24 text-text-primary shadow-elev-3 backdrop:bg-text-primary/40 open:animate-pop-enter open:backdrop:animate-fade-in"
      >
        <div className="flex flex-col gap-24">
          <div className="flex flex-col gap-8">
            <h2 id={titleId} className="text-title-md">
              {labels.title}
            </h2>
            <p id={bodyId} className="text-body text-text-secondary">
              {labels.body}
            </p>
            {labels.note && <p className="text-body text-text-secondary">{labels.note}</p>}
          </div>
          <div className="flex flex-col-reverse gap-12 tablet:flex-row tablet:justify-end">
            <Button variant="tertiary" onClick={() => dialogRef.current?.close()}>
              {mode === "blocked" ? labels.confirm : labels.cancel}
            </Button>
            {mode !== "blocked" && (
              <Button variant={mode === "archive" ? "secondary" : "destructive"} loading={pending} onClick={confirm}>
                {labels.confirm}
              </Button>
            )}
          </div>
        </div>
      </dialog>
    </>
  );
}
