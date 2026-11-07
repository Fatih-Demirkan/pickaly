"use server";

import { getLocale } from "next-intl/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { listAccounts } from "@/features/accounts/server";
import { isLocale } from "@/i18n/config";
import { toDateKey } from "@/lib/dates";
import { setFlash } from "@/lib/flash";
import { parseMoneyInput } from "@/lib/money";
import { LOANS_PATH, loanHref } from "./routes";
import { loanFormSchema, type LoanFormErrorKey, type LoanFormField, type LoanFormState } from "./schemas";
import { createLoan, deleteLoan, getLoan, setLoanRepaid, updateLoan } from "./server";

// Alacak ekleme, düzenleme, geri alındı (kapatma), yeniden açma ve silme (ürün sahibi isteği 2026-11-07).
// Bakiye, Ana Sayfa, Takvim ve Hesaplarım birlikte değiştiği için tüm uygulama yeniden doğrulanır.

function revalidateLoans() {
  revalidatePath("/", "layout");
}

export async function saveLoan(id: string | null, _previous: LoanFormState, formData: FormData): Promise<LoanFormState> {
  const existing = id ? await getLoan(id) : null;
  if (id && !existing) return { formError: "notFound" };
  const parsed = loanFormSchema.safeParse({
    person: formData.get("person") ?? "",
    purpose: formData.get("purpose") ?? "",
    amount: formData.get("amount") ?? "",
    fromAccount: formData.get("fromAccount") ?? "false",
    accountId: formData.get("accountId") ?? "",
    lentOn: formData.get("lentOn") ?? "",
    dueOn: formData.get("dueOn") ?? "",
    note: formData.get("note") ?? "",
  });
  const errors: Partial<Record<LoanFormField, LoanFormErrorKey>> = {};
  if (!parsed.success) {
    for (const issue of parsed.error.issues) errors[issue.path[0] as LoanFormField] ??= issue.message as LoanFormErrorKey;
    return { errors, formError: "summary" };
  }
  const data = parsed.data;
  const rawLocale = await getLocale();
  const amount = parseMoneyInput(data.amount, isLocale(rawLocale) ? rawLocale : "tr");
  if (amount === null) errors.amount = "amount";
  const fromAccount = data.fromAccount === "true";
  if (fromAccount) {
    // Düzenlemede kaydın mevcut hesabı arşivlenmiş olsa da kabul edilir.
    const active = new Set((await listAccounts()).map((account) => account.id));
    if (!active.has(data.accountId) && data.accountId !== existing?.accountId) errors.accountId = "account";
  }
  if (data.dueOn < data.lentOn) errors.dueOn = "dueBeforeLent";
  if (Object.keys(errors).length > 0 || amount === null) return { errors, formError: "summary" };

  const input = {
    person: data.person,
    purpose: data.purpose || null,
    amountMinor: amount,
    accountId: fromAccount ? data.accountId : null,
    lentOn: data.lentOn,
    dueOn: data.dueOn,
    note: data.note || null,
  };
  if (id) {
    if (!(await updateLoan(id, input))) return { formError: "notFound" };
  } else {
    await createLoan(input);
  }
  revalidateLoans();
  await setFlash(id ? "loanUpdated" : "loanCreated");
  redirect(id ? loanHref(id) : LOANS_PATH);
}

/**
 * "Geri alındı": alacak bugün kapanır (vadeden önce de olabilir). Tutar, paranın çıktığı hesaba; hesaptan çıkış
 * yoksa varsayılan hesaba ("Ana Hesap") eklenir. Toast'taki "Geri al" ile kayıt yeniden açılır.
 */
export async function markLoanRepaidAction(id: string): Promise<{ ok: boolean }> {
  const loan = await getLoan(id);
  if (!loan) return { ok: false };
  if (loan.repaidOn === null) {
    const accountId = loan.accountId ?? (await listAccounts())[0]?.id;
    if (!accountId) return { ok: false };
    await setLoanRepaid(id, { on: toDateKey(new Date()), accountId });
  }
  revalidateLoans();
  return { ok: true };
}

/** Kapatılan alacağı yeniden açar (geri alma / yanlışlıkla kapatma). */
export async function reopenLoanAction(id: string): Promise<{ ok: boolean }> {
  const loan = await setLoanRepaid(id, null);
  revalidateLoans();
  return { ok: loan !== null };
}

/** "Alacağı sil" → onay → kalıcı silme. Bakiyedeki etkisi de kalkar. */
export async function deleteLoanAction(id: string): Promise<void> {
  await deleteLoan(id);
  revalidateLoans();
  await setFlash("loanDeleted");
  redirect(LOANS_PATH);
}
