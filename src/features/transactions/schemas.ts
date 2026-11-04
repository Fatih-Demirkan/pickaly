import { z } from "zod";
import { isDateKey, isTimeValue } from "@/lib/dates";
import { FREQUENCIES, REMINDER_OFFSETS } from "@/lib/recurrence";

// Yeni İşlem / Düzenle formunun doğrulama kuralları. İstemci ve sunucu aynı sınırları kullanır;
// asıl doğrulama sunucudadır (TECH_STACK §6.3). Hata mesajları çeviri anahtarıdır.

import { NOTE_MAX_LENGTH, TITLE_MAX_LENGTH } from "./domain/limits";

/** Formun sekmeleri: Gelir / Gider (işlem) ve Abonelik (tekrarlayan ödeme) — discriminated union (TECH_STACK §8). */
export const FORM_TYPES = ["income", "expense", "subscription"] as const;
export type TransactionFormType = (typeof FORM_TYPES)[number];

export const transactionFormSchema = z.object({
  type: z.enum(FORM_TYPES),
  amount: z.string().trim().min(1, "amount"),
  title: z.string().trim().min(1, "title").max(TITLE_MAX_LENGTH, "titleLength"),
  categoryId: z.string().min(1, "category"),
  accountId: z.string().min(1, "account"),
  date: z.string().refine(isDateKey, "date"),
  time: z.string().refine(isTimeValue, "time"),
  note: z.string().trim().max(NOTE_MAX_LENGTH, "note"),
  // "Tekrar Eden İşlem": açıksa sıklık zorunlu (PRD §6.2). Abonelikte kapalı = tek seferlik ödeme (Q-8).
  repeat: z.enum(["true", "false"]).transform((value) => value === "true"),
  frequency: z.enum(FREQUENCIES, "frequency"),
  reminder: z.enum(REMINDER_OFFSETS, "reminder"),
});

export type TransactionFormField = keyof z.infer<typeof transactionFormSchema>;
export type TransactionFormErrorKey =
  | "amount"
  | "title"
  | "titleLength"
  | "category"
  | "account"
  | "date"
  | "time"
  | "note"
  | "frequency"
  | "reminder";

export type TransactionFormState = {
  errors?: Partial<Record<TransactionFormField, TransactionFormErrorKey>>;
  formError?: "summary" | "notFound";
};
