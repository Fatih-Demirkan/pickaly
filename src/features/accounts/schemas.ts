import { z } from "zod";
import { isDateKey, isTimeValue } from "@/lib/dates";
import { ACCOUNT_DETAIL_MAX_LENGTH, ACCOUNT_NAME_MAX_LENGTH, TRANSFER_NOTE_MAX_LENGTH } from "./domain/types";

// Hesap Ekle / Düzenle ve Para Aktar formlarının doğrulama kuralları. Asıl doğrulama sunucudadır (TECH_STACK §6.3).
// Hata mesajları çeviri anahtarıdır (accounts.form.errors / accounts.transfer.errors).

export const accountFormSchema = z.object({
  name: z.string().trim().min(1, "name").max(ACCOUNT_NAME_MAX_LENGTH, "nameLength"),
  detail: z.string().trim().max(ACCOUNT_DETAIL_MAX_LENGTH, "detailLength"),
  balance: z.string().trim(),
});

export type AccountFormField = keyof z.infer<typeof accountFormSchema>;
export type AccountFormErrorKey = "name" | "nameLength" | "duplicate" | "detailLength" | "balance";

export type AccountFormState = {
  errors?: Partial<Record<AccountFormField, AccountFormErrorKey>>;
  formError?: "summary" | "notFound";
};

export const transferFormSchema = z.object({
  fromAccountId: z.string().min(1, "account"),
  toAccountId: z.string().min(1, "account"),
  amount: z.string().trim().min(1, "amount"),
  date: z.string().refine(isDateKey, "date"),
  time: z.string().refine(isTimeValue, "time"),
  note: z.string().trim().max(TRANSFER_NOTE_MAX_LENGTH, "note"),
});

export type TransferFormField = keyof z.infer<typeof transferFormSchema>;
export type TransferFormErrorKey = "account" | "sameAccount" | "amount" | "date" | "time" | "note";

export type TransferFormState = {
  errors?: Partial<Record<TransferFormField, TransferFormErrorKey>>;
  formError?: "summary";
};
