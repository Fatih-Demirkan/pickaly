"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { Icon } from "@/components/ui/Icon";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { quickContributeAction } from "../actions";

// Kayıtlı Birikimler kartındaki "+" (ürün sahibi isteği 2026-11-07): düzenli katkı miktarını tek dokunuşla ekler ve
// bildirim gösterir. Görünüm DESIGN_SYSTEM_PICKALY §5.1 outline ikon butonu (36 px daire, beyaz, border-subtle, 20 px ikon);
// dokunma alanı 44 px. Kartı kaplayan bağlantının üstünde kalır (relative z-1).

type Props = { savingsId: string; name: string; amountLabel: string };

export function QuickContributeButton({ savingsId, name, amountLabel }: Props) {
  const t = useTranslations("savings.quickAdd");
  const toast = useToast();
  const [pending, startTransition] = useTransition();

  function add() {
    startTransition(async () => {
      const result = await quickContributeAction(savingsId);
      toast(result.ok ? { message: t("done", { amount: amountLabel, name }) } : { message: t("failed"), tone: "error" });
    });
  }

  return (
    <button
      type="button"
      onClick={add}
      disabled={pending}
      aria-label={t("label", { amount: amountLabel, name })}
      title={t("label", { amount: amountLabel, name })}
      className="touch-target relative z-1 inline-flex size-36 shrink-0 items-center justify-center rounded-full border border-border-subtle bg-surface-card text-text-primary transition-colors hover:border-border-strong hover:bg-action-tertiary-hover disabled:cursor-wait"
    >
      {pending ? <Spinner className="size-16" /> : <Icon icon="add" />}
    </button>
  );
}
