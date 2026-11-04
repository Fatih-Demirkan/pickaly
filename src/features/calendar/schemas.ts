import { z } from "zod";
import { isDateKey } from "@/lib/dates";
import { REMINDER_OFFSETS } from "@/lib/recurrence";
import { DESCRIPTION_MAX_LENGTH, LOCATION_MAX_LENGTH, NOTE_MAX_LENGTH, TITLE_MAX_LENGTH } from "./domain/limits";

// Görev Ekle / Düzenle formunun doğrulama kuralları (PRD §5.2). Asıl doğrulama sunucudadır (TECH_STACK §6.3).
// Hata mesajları çeviri anahtarıdır.

export const calendarItemFormSchema = z.object({
  kind: z.enum(["task", "appointment"]),
  title: z.string().trim().min(1, "title").max(TITLE_MAX_LENGTH, "titleLength"),
  description: z.string().trim().max(DESCRIPTION_MAX_LENGTH, "description"),
  priority: z.enum(["low", "normal", "high"]),
  categoryId: z.string(),
  date: z.string().refine(isDateKey, "date"),
  allDay: z.enum(["true", "false"]).transform((value) => value === "true"),
  time: z.string(),
  duration: z.string().regex(/^\d{0,4}$/, "duration"),
  reminder: z.enum(REMINDER_OFFSETS, "reminder"),
  locationName: z.string().trim().max(LOCATION_MAX_LENGTH, "location"),
  locationAddress: z.string().trim().max(LOCATION_MAX_LENGTH, "location"),
  note: z.string().trim().max(NOTE_MAX_LENGTH, "note"),
  plannedExpense: z.string().trim(),
});

export type CalendarItemFormField = keyof z.infer<typeof calendarItemFormSchema>;
export type CalendarItemFormErrorKey =
  | "title"
  | "titleLength"
  | "description"
  | "category"
  | "date"
  | "time"
  | "duration"
  | "reminder"
  | "location"
  | "note"
  | "plannedExpense";

export type CalendarItemFormState = {
  errors?: Partial<Record<CalendarItemFormField, CalendarItemFormErrorKey>>;
  formError?: "summary" | "notFound";
};
