"use server";

import { getLocale } from "next-intl/server";
import { revalidatePath } from "next/cache";
import { redirect, RedirectType } from "next/navigation";
import { returnPath } from "@/lib/returnPath";
import { setFlash } from "@/lib/flash";
import { getAccountMap } from "@/features/accounts/server";
import { getCategoryMap } from "@/features/categories/server";
import { createRecurringPayment, revertPaymentForDeletedTransaction } from "@/features/payments/server";
import { isLocale } from "@/i18n/config";
import { localDateTimeToIso, toMonthKey, type DateKey } from "@/lib/dates";
import { parseMoneyInput } from "@/lib/money";
import type { Frequency, ReminderOffset } from "@/lib/recurrence";
import type { TransactionInput, TransactionType } from "./domain/types";
import { transactionFormSchema, type TransactionFormErrorKey, type TransactionFormField, type TransactionFormState, type TransactionFormType } from "./schemas";
import { recurringRuleRepository, transactionRepository } from "./server";

// İşlem oluşturma, düzenleme ve silme; Abonelik sekmesi tekrarlayan ödeme oluşturur. Şimdilik yerel örnek veri deposuna yazar.
// [Auth aşaması] Her aksiyonda oturum ve sahiplik kontrolü eklenecek (TECH_STACK §6.3, Next "Data Security").

type FormValues = {
  type: TransactionFormType;
  title: string;
  amountMinor: bigint;
  categoryId: string;
  accountId: string;
  date: DateKey;
  time: string;
  note: string | null;
  repeat: boolean;
  frequency: Frequency;
  reminder: ReminderOffset;
};

type ParseResult = { ok: true; values: FormValues } | { ok: false; state: TransactionFormState };

/**
 * Kategori formun türüyle uyumlu olmalı (PRD Q-11); arşivli kategori yeni seçimde kullanılamaz (BR-CAT-002).
 * Düzenlenen kaydın mevcut kategorisi korunabilir: arşivli olsa da, ödemeden oluşan giderin Abonelik kategorisi olsa da.
 */
function categoryAllowed(category: { type: string; archived: boolean; id: string } | undefined, type: TransactionFormType, keepCategoryId?: string) {
  if (!category) return false;
  if (category.id === keepCategoryId) return category.type === type || (type === "expense" && category.type === "subscription");
  return category.type === type && !category.archived;
}

async function parseForm(formData: FormData, keepCategoryId?: string): Promise<ParseResult> {
  const parsed = transactionFormSchema.safeParse({
    type: formData.get("type"),
    amount: formData.get("amount") ?? "",
    title: formData.get("title") ?? "",
    categoryId: formData.get("categoryId") ?? "",
    accountId: formData.get("accountId") ?? "",
    date: formData.get("date") ?? "",
    time: formData.get("time") ?? "",
    note: formData.get("note") ?? "",
    repeat: formData.get("repeat") ?? "false",
    frequency: formData.get("frequency") ?? "",
    reminder: formData.get("reminder") ?? "",
  });

  const errors: Partial<Record<TransactionFormField, TransactionFormErrorKey>> = {};
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as TransactionFormField;
      // "type" ve "repeat" yalnızca form dışı bir istekle bozulabilir; alan hatası değil genel hata gösterilir.
      if (field !== "type" && field !== "repeat") errors[field] ??= issue.message as TransactionFormErrorKey;
    }
    return { ok: false, state: { errors, formError: "summary" } };
  }

  const data = parsed.data;
  const locale = await getLocale();
  const amountMinor = parseMoneyInput(data.amount, isLocale(locale) ? locale : "tr");
  if (amountMinor === null) errors.amount = "amount";

  if (!categoryAllowed((await getCategoryMap()).get(data.categoryId), data.type, keepCategoryId)) errors.categoryId = "category";
  if (!(await getAccountMap()).has(data.accountId)) errors.accountId = "account";

  if (amountMinor === null || Object.keys(errors).length > 0) return { ok: false, state: { errors, formError: "summary" } };

  return { ok: true, values: { ...data, amountMinor, note: data.note || null } };
}

function transactionInput(values: FormValues & { type: TransactionType }): TransactionInput {
  return {
    type: values.type,
    title: values.title,
    amountMinor: values.amountMinor,
    categoryId: values.categoryId,
    accountId: values.accountId,
    occurredAt: localDateTimeToIso(values.date, values.time),
    note: values.note,
  };
}

function monthHref(occurredAt: string) {
  return `/islemler?ay=${toMonthKey(new Date(occurredAt))}`;
}

export async function createTransaction(_previous: TransactionFormState, formData: FormData): Promise<TransactionFormState> {
  const result = await parseForm(formData);
  if (!result.ok) return result.state;
  const { values } = result;

  if (values.type === "subscription") {
    // Abonelik: tekrarlayan (veya anahtar kapalıyken tek seferlik) ödeme; kayıttan sonra toast + Ana Sayfa.
    await createRecurringPayment({
      title: values.title,
      amountMinor: values.amountMinor,
      categoryId: values.categoryId,
      accountId: values.accountId,
      frequency: values.repeat ? values.frequency : null,
      startDate: values.date,
      dueTime: values.time,
      reminder: values.reminder,
      note: values.note,
    });
    revalidatePath("/", "layout");
    await setFlash("subscriptionCreated");
    // Geçmişte sheet adresi kalmaz: geri tuşu formu yeniden açmaz.
    redirect(returnPath(formData), RedirectType.replace);
  }

  const input = transactionInput({ ...values, type: values.type });
  // Tekrar Eden İşlem: kaydedilen işlem kuralın ilk örneğidir; sonrakiler tarihi gelince oluşur (BR-REC-003).
  const rule = values.repeat
    ? await recurringRuleRepository.create({
        template: { type: input.type, title: input.title, amountMinor: input.amountMinor, categoryId: input.categoryId, accountId: input.accountId, note: input.note },
        frequency: values.frequency,
        startDate: values.date,
        time: values.time,
        reminder: values.reminder,
        active: true,
        generatedThrough: values.date,
      })
    : null;
  await transactionRepository.create(input, rule ? { source: "recurring", recurringRuleId: rule.id } : undefined);
  revalidatePath("/", "layout");
  await setFlash("transactionCreated");
  redirect(returnPath(formData), RedirectType.replace);
}

export async function updateTransaction(id: string, _previous: TransactionFormState, formData: FormData): Promise<TransactionFormState> {
  const existing = await transactionRepository.get(id);
  if (!existing) return { formError: "notFound" };
  const result = await parseForm(formData, existing.categoryId);
  if (!result.ok) return result.state;
  const { values } = result;
  // Düzenleme yalnızca bu işlemi değiştirir; tür Gelir / Gider arasında kalır (tekrar kuralı düzenleme [Ertelendi], Q-7).
  if (values.type === "subscription") return { formError: "summary" };

  const updated = await transactionRepository.update(id, transactionInput({ ...values, type: values.type }));
  if (!updated) return { formError: "notFound" };
  revalidatePath("/", "layout");
  await setFlash("transactionUpdated");
  redirect(`/islemler/${encodeURIComponent(id)}`);
}

export async function deleteTransaction(id: string): Promise<void> {
  const existing = await transactionRepository.get(id);
  if (existing) {
    await transactionRepository.remove(id);
    // Ödemeden oluşan gider silinirse ödeme Bekliyor'a döner (PRD Q-13).
    if (existing.paymentId) await revertPaymentForDeletedTransaction(existing.paymentId);
  }
  revalidatePath("/", "layout");
  if (existing) await setFlash("transactionDeleted");
  redirect(existing ? monthHref(existing.occurredAt) : "/islemler");
}
