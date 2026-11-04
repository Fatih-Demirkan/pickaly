"use server";

import { getLocale } from "next-intl/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCategoryMap } from "@/features/categories/server";
import { isLocale } from "@/i18n/config";
import { isTimeValue } from "@/lib/dates";
import { parseMoneyInput } from "@/lib/money";
import type { CalendarItemInput } from "./domain/types";
import { calendarHref, itemHref } from "./routes";
import { calendarItemFormSchema, type CalendarItemFormErrorKey, type CalendarItemFormField, type CalendarItemFormState } from "./schemas";
import { calendarRepository } from "./server";

// Görev / randevu oluşturma, düzenleme, tamamlama ve silme. Şimdilik yerel örnek veri deposuna yazar.
// [Auth aşaması] Her aksiyonda oturum ve sahiplik kontrolü eklenecek (TECH_STACK §6.3).

type ParseResult = { ok: true; input: CalendarItemInput } | { ok: false; state: CalendarItemFormState };

async function parseForm(formData: FormData, keepCategoryId?: string | null): Promise<ParseResult> {
  const field = (name: string) => formData.get(name) ?? "";
  const parsed = calendarItemFormSchema.safeParse({
    kind: formData.get("kind"),
    title: field("title"),
    description: field("description"),
    priority: formData.get("priority"),
    categoryId: field("categoryId"),
    date: field("date"),
    allDay: formData.get("allDay") ?? "false",
    time: field("time"),
    duration: field("duration"),
    reminder: formData.get("reminder"),
    locationName: field("locationName"),
    locationAddress: field("locationAddress"),
    note: field("note"),
    plannedExpense: field("plannedExpense"),
  });

  const errors: Partial<Record<CalendarItemFormField, CalendarItemFormErrorKey>> = {};
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const name = issue.path[0] as CalendarItemFormField;
      // Tür, öncelik ve "tüm gün" yalnızca form dışı bir istekle bozulabilir; genel hata gösterilir.
      if (name !== "kind" && name !== "priority" && name !== "allDay") errors[name] ??= issue.message as CalendarItemFormErrorKey;
    }
    return { ok: false, state: { errors, formError: "summary" } };
  }

  const data = parsed.data;
  if (!data.allDay && !isTimeValue(data.time)) errors.time = "time";

  // Kategori isteğe bağlıdır; seçildiyse aktif bir Görev / Takvim kategorisi olmalı (düzenlenen kaydın mevcut kategorisi korunabilir).
  if (data.categoryId) {
    const category = (await getCategoryMap()).get(data.categoryId);
    if (!category || category.type !== "calendar" || (category.archived && category.id !== keepCategoryId)) errors.categoryId = "category";
  }

  let plannedExpenseMinor: bigint | null = null;
  if (data.plannedExpense) {
    const locale = await getLocale();
    plannedExpenseMinor = parseMoneyInput(data.plannedExpense, isLocale(locale) ? locale : "tr");
    if (plannedExpenseMinor === null) errors.plannedExpense = "plannedExpense";
  }

  const duration = data.duration ? Number(data.duration) : null;
  if (duration !== null && duration <= 0) errors.duration = "duration";

  if (Object.keys(errors).length > 0) return { ok: false, state: { errors, formError: "summary" } };

  return {
    ok: true,
    input: {
      kind: data.kind,
      title: data.title,
      description: data.description || null,
      priority: data.priority,
      categoryId: data.categoryId || null,
      date: data.date,
      time: data.allDay ? null : data.time,
      durationMinutes: data.allDay ? null : duration,
      reminder: data.reminder,
      locationName: data.locationName || null,
      locationAddress: data.locationAddress || null,
      note: data.note || null,
      plannedExpenseMinor,
    },
  };
}

function revalidateCalendar() {
  // Takvim ve Ana Sayfa (Bugünün Akışı, "Bugün: n Görev") birlikte değişir.
  revalidatePath("/", "layout");
}

export async function createCalendarItem(_previous: CalendarItemFormState, formData: FormData): Promise<CalendarItemFormState> {
  const result = await parseForm(formData);
  if (!result.ok) return result.state;
  const created = await calendarRepository.create(result.input);
  revalidateCalendar();
  // Kayıt ilgili günde görünür (RESPONSIVE §8.2.1).
  redirect(calendarHref({ day: created.date }));
}

export async function updateCalendarItem(id: string, _previous: CalendarItemFormState, formData: FormData): Promise<CalendarItemFormState> {
  const existing = await calendarRepository.get(id);
  if (!existing) return { formError: "notFound" };
  const result = await parseForm(formData, existing.categoryId);
  if (!result.ok) return result.state;
  await calendarRepository.update(id, result.input);
  revalidateCalendar();
  redirect(itemHref(id, { day: result.input.date }));
}

/** "Görevi tamamla" / listede ✓ (FR-CAL-009). Tamamlanan kayıt yeniden açılabilir; 5 sn "Geri al" (D-18). */
export async function setCalendarItemDoneAction(id: string, done: boolean): Promise<{ ok: boolean }> {
  const updated = await calendarRepository.setStatus(id, done ? "done" : "open", done ? new Date().toISOString() : null);
  revalidateCalendar();
  return { ok: updated !== null };
}

/** "Kaydı kalıcı olarak sil" → onay → kalıcı silme (FR-CAL-010, Karar #7, D-10). */
export async function deleteCalendarItemAction(id: string): Promise<void> {
  const existing = await calendarRepository.get(id);
  if (existing) await calendarRepository.remove(id);
  revalidateCalendar();
  redirect(calendarHref({ day: existing?.date }));
}
