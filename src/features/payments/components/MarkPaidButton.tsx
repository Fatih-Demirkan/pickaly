"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { Button, type ButtonSize, type ButtonVariant } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { markPaymentPaidAction, undoPaymentPaidAction } from "../actions";

// "Ödendi olarak işaretle" (PRD FR-FIN-016, BR-PAY-002): gider işlemi oluşur, 5 sn "Geri al" bildirimi gösterilir
// (BR-PAY-004, RESPONSIVE §8.2.7). Ödeme Detayı alt barında Primary; Ana Sayfa kartında Tertiary SM (Pages).

type MarkPaidButtonProps = {
  paymentId: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
};

export function MarkPaidButton({ paymentId, variant = "primary", size = "lg", fullWidth, className }: MarkPaidButtonProps) {
  const t = useTranslations("payments");
  const toast = useToast();
  const [pending, startTransition] = useTransition();

  // Ödendi olunca bu buton ekrandan kalkar (Ödeme Detayı / Yaklaşan Ödemeler); geri alma bileşen durumuna bağlı değildir.
  async function undo() {
    const result = await undoPaymentPaidAction(paymentId);
    toast(result.ok ? { message: t("toast.undone") } : { message: t("toast.failed"), tone: "error" });
  }

  function markPaid() {
    startTransition(async () => {
      const result = await markPaymentPaidAction(paymentId);
      if (!result.ok) {
        toast({ message: t("toast.failed"), tone: "error" });
        return;
      }
      toast({ message: t("toast.paid"), action: { label: t("toast.undo"), onAction: () => void undo() } });
    });
  }

  return (
    <Button
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      leadingIcon={variant === "primary" ? "confirm" : undefined}
      loading={pending}
      onClick={markPaid}
      className={className}
    >
      {t("detail.markPaid")}
    </Button>
  );
}
