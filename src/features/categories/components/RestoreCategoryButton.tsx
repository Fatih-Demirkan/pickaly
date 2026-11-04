"use client";

import { useTransition } from "react";
import { useToast } from "@/components/ui/Toast";
import { restoreCategoryAction } from "../actions";

// "Arşivlenenler" satırındaki "Geri al" (BR-CAT-005, RESPONSIVE §8.2.11). Aynı adlı aktif kategori varsa uyarı verilir.

type RestoreCategoryButtonProps = { categoryId: string; labels: { restore: string; restoreLabel: string; restored: string; conflict: string; failed: string } };

export function RestoreCategoryButton({ categoryId, labels }: RestoreCategoryButtonProps) {
  const toast = useToast();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      aria-label={labels.restoreLabel}
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const result = await restoreCategoryAction(categoryId);
          if (result.ok) toast({ message: labels.restored });
          else toast({ message: result.reason === "conflict" ? labels.conflict : labels.failed, tone: "error" });
        })
      }
      className="touch-target shrink-0 text-caption-strong text-text-brand hover:underline disabled:cursor-wait"
    >
      {labels.restore}
    </button>
  );
}
