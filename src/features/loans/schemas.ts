import { z } from "zod";
import { isDateKey } from "@/lib/dates";
import { LOAN_NOTE_MAX_LENGTH, LOAN_PERSON_MAX_LENGTH, LOAN_PURPOSE_MAX_LENGTH } from "./domain/types";

// Alacak Ekle / Düzenle formunun doğrulama kuralları. Asıl doğrulama sunucudadır (TECH_STACK §6.3).
// Hata mesajları çeviri anahtarıdır (loans.form.errors).

export const loanFormSchema = z.object({
  person: z.string().trim().min(1, "person").max(LOAN_PERSON_MAX_LENGTH, "personLength"),
  purpose: z.string().trim().max(LOAN_PURPOSE_MAX_LENGTH, "purposeLength"),
  /** Tek tutarlı alacakta zorunlu; kalemli alacakta toplam sunucuda hesaplanır. */
  amount: z.string().trim(),
  fromAccount: z.enum(["true", "false"]),
  accountId: z.string(),
  lentOn: z.string().refine(isDateKey, "date"),
  dueOn: z.string().refine(isDateKey, "date"),
  note: z.string().trim().max(LOAN_NOTE_MAX_LENGTH, "note"),
  /** Kalemler JSON olarak: [{ id, label, amount }] (amount metin, yerel biçimde). Çoklu kalem kapalıysa boş liste. */
  items: z.string(),
});

export type LoanFormField = keyof z.infer<typeof loanFormSchema>;
export type LoanFormErrorKey = "person" | "personLength" | "purposeLength" | "amount" | "account" | "date" | "dueBeforeLent" | "note" | "items" | "itemLabel" | "itemAmount";

export type LoanFormState = {
  errors?: Partial<Record<LoanFormField, LoanFormErrorKey>>;
  formError?: "summary" | "notFound";
};
