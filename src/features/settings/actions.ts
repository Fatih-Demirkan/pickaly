"use server";

import { revalidatePath } from "next/cache";
import { isWeekStart } from "@/lib/dates";
import { updateWeekStart } from "./server";

// Profil ve Ayarlar aksiyonları. Dil seçimi i18n/actions.ts setLocale ile yapılır.
// [Auth aşaması] Oturum kontrolü eklenecek (TECH_STACK §6.3).

/** Haftanın ilk günü (FR-SET-005): takvim ve tarih seçicilerin hafta düzenini değiştirir (BR-TIME-003). */
export async function setWeekStartAction(value: number): Promise<{ ok: boolean }> {
  if (!isWeekStart(value)) return { ok: false };
  await updateWeekStart(value);
  revalidatePath("/", "layout");
  return { ok: true };
}
