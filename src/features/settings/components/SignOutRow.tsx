"use client";

import { useFormStatus } from "react-dom";
import { signOutAction } from "@/features/auth/actions";
import { cn } from "@/lib/cn";
import { interactiveRowClass, rowClass, SettingsRowContent } from "./SettingsRow";

// "Çıkış Yap — Oturumu bu cihazda sonlandır" (FR-AUTH-006): yalnızca bu cihazdaki oturum kapatılır, Giriş'e dönülür.
// [Varsayım] Onay penceresi gösterilmez: işlem veri kaybı yaratmaz ve hemen geri girilebilir.

function SubmitRow({ title, hint }: { title: string; hint: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} aria-busy={pending || undefined} data-settings-row className={cn(rowClass, interactiveRowClass, "disabled:cursor-wait")}>
      <SettingsRowContent icon="logout" title={title} hint={hint} danger />
    </button>
  );
}

export function SignOutRow({ title, hint }: { title: string; hint: string }) {
  return (
    <form action={signOutAction}>
      <SubmitRow title={title} hint={hint} />
    </form>
  );
}
