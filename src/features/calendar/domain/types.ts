import type { DateKey } from "@/lib/dates";
import type { ReminderOffset } from "@/lib/recurrence";

// Takvim kaydı: görev veya randevu (TECH_STACK §5.2 calendar_items, PRD §5, DM-007).
// Ayrı Görevler ekranı yoktur; görevler Takvim'de yönetilir (RESPONSIVE Karar #1). "Etkinlik" = randevu (PRD Q-5).

export type CalendarItemKind = "task" | "appointment";

/** Düşük / Normal / Yüksek; varsayılan Normal. Arayüzde yalnızca Yüksek etiketlenir (D-15). */
export type Priority = "low" | "normal" | "high";

export type CalendarItemStatus = "open" | "done";

export type CalendarItem = {
  id: string;
  kind: CalendarItemKind;
  title: string;
  description: string | null;
  priority: Priority;
  categoryId: string | null;
  /** Yerel gün. */
  date: DateKey;
  /** Yerel saat "HH:mm"; null = tüm gün (PRD §5.2). */
  time: string | null;
  durationMinutes: number | null;
  reminder: ReminderOffset;
  locationName: string | null;
  locationAddress: string | null;
  note: string | null;
  /** Bilgi amaçlı planlanan harcama, kuruş. Bakiyeyi etkilemez, işlem oluşturmaz (BR-TSK-003). */
  plannedExpenseMinor: bigint | null;
  /** Alt görevler ("Çoklu seçim", 2026-11-05). Boş = alt görev listesi yok. İlerleme barı bunlardan hesaplanır. */
  subtasks: Subtask[];
  status: CalendarItemStatus;
  /** ISO anlık zaman. */
  completedAt: string | null;
};

export type CalendarItemInput = Omit<CalendarItem, "id" | "status" | "completedAt">;

/** Alt görev (alışveriş listesi gibi işaretlenebilir satır). */
export type Subtask = { id: string; title: string; done: boolean };

export const SUBTASK_MAX_COUNT = 30;
export const SUBTASK_TITLE_MAX_LENGTH = 80;

/** Tamamlanan / toplam alt görev; liste yoksa null. */
export function subtaskProgress(subtasks: readonly Subtask[]): { done: number; total: number; percent: number } | null {
  if (subtasks.length === 0) return null;
  const done = subtasks.filter((subtask) => subtask.done).length;
  return { done, total: subtasks.length, percent: Math.round((done / subtasks.length) * 100) };
}

export const PRIORITIES: readonly Priority[] = ["low", "normal", "high"];
export const CALENDAR_ITEM_KINDS: readonly CalendarItemKind[] = ["task", "appointment"];

/** [Varsayım] Süre seçenekleri (dakika). Pages'ta "45 dk", "60 dk" ve "1 saat" görünüyor. */
export const DURATION_OPTIONS = [15, 30, 45, 60, 90, 120, 180] as const;
