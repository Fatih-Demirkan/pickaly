import { z } from "zod";
import { isDateKey, isTimeValue } from "@/lib/dates";
import { FREQUENCIES, REMINDER_OFFSETS } from "@/lib/recurrence";
import { INSTITUTION_MAX_LENGTH, NAME_MAX_LENGTH, NOTE_MAX_LENGTH } from "./domain/limits";

// Yeni Birikim Hesabı / Hesabı Düzenle ve Para ekle / Çek formlarının doğrulama kuralları (PRD §7.2).
// Asıl doğrulama sunucudadır (TECH_STACK §6.3). Hata mesajları çeviri anahtarıdır.

export const savingsFormSchema = z.object({
  name: z.string().trim().min(1, "name").max(NAME_MAX_LENGTH, "nameLength"),
  kind: z.enum(["gold", "deposit", "fund", "currency", "cash"]),
  unit: z.enum(["TRY", "piece", "gram"]),
  amount: z.string().trim(),
  target: z.string().trim(),
  institution: z.string().trim().max(INSTITUTION_MAX_LENGTH, "institution"),
  sourceAccountId: z.string(),
  date: z.string().refine(isDateKey, "date"),
  time: z.string().refine(isTimeValue, "time"),
  repeat: z.enum(["true", "false"]).transform((value) => value === "true"),
  frequency: z.enum(FREQUENCIES, "frequency"),
  reminder: z.enum(REMINDER_OFFSETS, "reminder"),
  note: z.string().trim().max(NOTE_MAX_LENGTH, "note"),
});

export type SavingsFormField = keyof z.infer<typeof savingsFormSchema>;
export type SavingsFormErrorKey =
  | "name"
  | "nameLength"
  | "amount"
  | "repeatAmount"
  | "target"
  | "institution"
  | "account"
  | "date"
  | "time"
  | "frequency"
  | "reminder"
  | "note";

export type SavingsFormState = {
  errors?: Partial<Record<SavingsFormField, SavingsFormErrorKey>>;
  formError?: "summary" | "notFound";
};

export const movementFormSchema = z.object({
  direction: z.enum(["in", "out"]),
  amount: z.string().trim().min(1, "amount"),
  transfer: z.string().trim(),
  bankAccountId: z.string(),
  date: z.string().refine(isDateKey, "date"),
});

export type MovementFormField = keyof z.infer<typeof movementFormSchema>;
export type MovementFormErrorKey = "amount" | "insufficient" | "transfer" | "account" | "date";

export type MovementFormState = {
  errors?: Partial<Record<MovementFormField, MovementFormErrorKey>>;
  formError?: "summary" | "notFound";
};
