"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { Button, type ButtonSize, type ButtonVariant } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { markLoanRepaidAction, reopenLoanAction } from "../actions";

// "Geri alındı" (alacağı kapat): bugün kapanır, tutar hesaba eklenir; 5 sn "Geri al" bildirimi (ödeme kalıbı, BR-PAY-004).
// "Yeniden aç": kapatılmış alacağı açık duruma döndürür (yanlışlıkla kapatma).

type Props = { loanId: string; variant?: ButtonVariant; size?: ButtonSize; fullWidth?: boolean; className?: string };

export function MarkRepaidButton({ loanId, variant = "primary", size = "lg", fullWidth, className }: Props) {
  const t = useTranslations("loans");
  const toast = useToast();
  const [pending, startTransition] = useTransition();

  async function undo() {
    const result = await reopenLoanAction(loanId);
    toast(result.ok ? { message: t("toast.reopened") } : { message: t("toast.failed"), tone: "error" });
  }

  function markRepaid() {
    startTransition(async () => {
      const result = await markLoanRepaidAction(loanId);
      if (!result.ok) {
        toast({ message: t("toast.failed"), tone: "error" });
        return;
      }
      toast({ message: t("toast.repaid"), action: { label: t("toast.undo"), onAction: () => void undo() } });
    });
  }

  return (
    <Button variant={variant} size={size} fullWidth={fullWidth} leadingIcon={variant === "primary" ? "confirm" : undefined} loading={pending} onClick={markRepaid} className={className}>
      {t("markRepaid")}
    </Button>
  );
}

export function ReopenLoanButton({ loanId, fullWidth }: { loanId: string; fullWidth?: boolean }) {
  const t = useTranslations("loans");
  const toast = useToast();
  const [pending, startTransition] = useTransition();

  function reopen() {
    startTransition(async () => {
      const result = await reopenLoanAction(loanId);
      toast(result.ok ? { message: t("toast.reopened") } : { message: t("toast.failed"), tone: "error" });
    });
  }

  return (
    <Button variant="secondary" fullWidth={fullWidth} loading={pending} onClick={reopen}>
      {t("reopen")}
    </Button>
  );
}
