"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/cn";
import { setCalendarItemDoneAction } from "../actions";

// Görev / randevu tamamlama (PRD FR-CAL-009, BR-TSK-001): tamamlanan kayıt "Tamamlandı" bölümüne geçer;
// 5 sn "Geri al" bildirimi (D-18). Tamamlanan kayıt yeniden açılabilir.
//   compact: ajanda kartındaki 32 px kare (Pages "Button-test": açık = beyaz + border-default + check,
//            tamamlandı = Category/Green + Border/Success + yeşil check)
//   footer:  Kayıt Detayı alt barındaki "Görevi tamamla" (Primary) / "Yeniden aç" (Tertiary)

type CompleteToggleProps = {
  id: string;
  title: string;
  done: boolean;
  variant?: "compact" | "footer";
  className?: string;
};

export function CompleteToggle({ id, title, done, variant = "compact", className }: CompleteToggleProps) {
  const t = useTranslations("calendar");
  const toast = useToast();
  const [pending, startTransition] = useTransition();

  // Tamamlanınca bu buton yer değiştirir (Yapılacaklar → Tamamlandı); geri alma bileşen durumuna bağlı değildir.
  async function revert(next: boolean) {
    const result = await setCalendarItemDoneAction(id, next);
    toast(result.ok ? { message: t(next ? "toast.completed" : "toast.reopened") } : { message: t("toast.failed"), tone: "error" });
  }

  function toggle() {
    startTransition(async () => {
      const next = !done;
      const result = await setCalendarItemDoneAction(id, next);
      if (!result.ok) {
        toast({ message: t("toast.failed"), tone: "error" });
        return;
      }
      toast({ message: t(next ? "toast.completed" : "toast.reopened"), action: { label: t("toast.undo"), onAction: () => void revert(!next) } });
    });
  }

  if (variant === "footer") {
    return (
      <Button variant={done ? "tertiary" : "primary"} leadingIcon={done ? undefined : "confirm"} loading={pending} onClick={toggle} className={className}>
        {done ? t("detail.reopen") : t("detail.complete")}
      </Button>
    );
  }

  return (
    <button
      type="button"
      aria-pressed={done}
      aria-label={t(done ? "card.reopen" : "card.complete", { title })}
      disabled={pending}
      onClick={toggle}
      className={cn(
        "touch-target relative inline-flex size-32 shrink-0 items-center justify-center rounded-md border transition-colors disabled:cursor-wait",
        done ? "border-border-success bg-category-green text-text-success" : "border-border-default bg-surface-card text-text-secondary hover:border-border-strong hover:text-text-primary",
        className,
      )}
    >
      <Icon icon="confirm" size="sm" />
    </button>
  );
}
