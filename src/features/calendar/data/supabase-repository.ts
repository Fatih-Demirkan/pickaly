import "server-only";
import type { ReminderOffset } from "@/lib/recurrence";
import { clampDate, db, fromBigInt, toBigIntOrNull, unwrap } from "@/lib/supabase/data";
import type { CalendarItem, CalendarItemInput } from "../domain/types";
import type { CalendarRepository } from "./repository";

// Takvim kayıtları (görev / randevu) — Supabase (tablo: calendar_items).

type ItemRow = {
  id: string;
  kind: CalendarItem["kind"];
  title: string;
  description: string | null;
  priority: CalendarItem["priority"];
  category_id: string | null;
  date: string;
  time: string | null;
  duration_minutes: number | null;
  reminder: ReminderOffset;
  location_name: string | null;
  location_address: string | null;
  note: string | null;
  planned_expense_minor: number | null;
  status: CalendarItem["status"];
  completed_at: string | null;
};

const COLUMNS =
  "id, kind, title, description, priority, category_id, date, time, duration_minutes, reminder, location_name, location_address, note, planned_expense_minor, status, completed_at";

function toItem(row: ItemRow): CalendarItem {
  return {
    id: row.id,
    kind: row.kind,
    title: row.title,
    description: row.description,
    priority: row.priority,
    categoryId: row.category_id,
    date: row.date,
    time: row.time,
    durationMinutes: row.duration_minutes,
    reminder: row.reminder,
    locationName: row.location_name,
    locationAddress: row.location_address,
    note: row.note,
    plannedExpenseMinor: toBigIntOrNull(row.planned_expense_minor),
    status: row.status,
    completedAt: row.completed_at ? new Date(row.completed_at).toISOString() : null,
  };
}

function inputRow(input: CalendarItemInput) {
  return {
    kind: input.kind,
    title: input.title,
    description: input.description,
    priority: input.priority,
    category_id: input.categoryId,
    date: input.date,
    time: input.time,
    duration_minutes: input.durationMinutes,
    reminder: input.reminder,
    location_name: input.locationName,
    location_address: input.locationAddress,
    note: input.note,
    planned_expense_minor: fromBigInt(input.plannedExpenseMinor),
  };
}

export const supabaseCalendarRepository: CalendarRepository = {
  async listBetween(from, to) {
    const rows = unwrap(await (await db()).from("calendar_items").select(COLUMNS).gte("date", clampDate(from)).lte("date", to));
    return (rows as ItemRow[]).map(toItem);
  },
  async listOverdue(before) {
    const rows = unwrap(await (await db()).from("calendar_items").select(COLUMNS).eq("status", "open").lt("date", before));
    return (rows as ItemRow[]).map(toItem);
  },
  async get(id) {
    const row = unwrap(await (await db()).from("calendar_items").select(COLUMNS).eq("id", id).maybeSingle());
    return row ? toItem(row as ItemRow) : null;
  },
  async create(input) {
    const row = unwrap(await (await db()).from("calendar_items").insert(inputRow(input)).select(COLUMNS).single());
    return toItem(row as ItemRow);
  },
  async update(id, input) {
    const row = unwrap(await (await db()).from("calendar_items").update(inputRow(input)).eq("id", id).select(COLUMNS).maybeSingle());
    return row ? toItem(row as ItemRow) : null;
  },
  async setStatus(id, status, completedAt) {
    const row = unwrap(await (await db()).from("calendar_items").update({ status, completed_at: completedAt }).eq("id", id).select(COLUMNS).maybeSingle());
    return row ? toItem(row as ItemRow) : null;
  },
  async remove(id) {
    const rows = unwrap(await (await db()).from("calendar_items").delete().eq("id", id).select("id"));
    return (rows as unknown[]).length > 0;
  },
};
