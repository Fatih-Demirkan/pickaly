"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { paymentCloseHref, type PaymentOrigin } from "./routes";
import { deleteRecurringPayment, markPaymentPaid, undoPaymentPaid } from "./server";

// Ödeme aksiyonları. Şimdilik yerel örnek veri deposuna yazar.
// [Auth aşaması] Her aksiyonda oturum ve sahiplik kontrolü eklenecek (TECH_STACK §6.3).

function revalidateFinance() {
  // Ana Sayfa (Yaklaşan Ödemeler), İşlemler listesi, bakiyeler ve Ödeme Detayı birlikte değişir.
  revalidatePath("/", "layout");
}

export async function markPaymentPaidAction(id: string): Promise<{ ok: boolean }> {
  const paid = await markPaymentPaid(id, new Date());
  revalidateFinance();
  return { ok: paid !== null };
}

export async function undoPaymentPaidAction(id: string): Promise<{ ok: boolean }> {
  const ok = await undoPaymentPaid(id);
  revalidateFinance();
  return { ok };
}

export async function deleteRecurringPaymentAction(seriesId: string, origin: PaymentOrigin): Promise<void> {
  await deleteRecurringPayment(seriesId);
  revalidateFinance();
  redirect(paymentCloseHref(origin));
}
