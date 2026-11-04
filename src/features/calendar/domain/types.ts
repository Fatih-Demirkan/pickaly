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
  status: CalendarItemStatus;
  /** ISO anlık zaman. */
  completedAt: string | null;
};

export type CalendarItemInput = Omit<CalendarItem, "id" | "status" | "completedAt">;

export const PRIORITIES: readonly Priority[] = ["low", "normal", "high"];
export const CALENDAR_ITEM_KINDS: readonly CalendarItemKind[] = ["task", "appointment"];

/** [Varsayım] Süre seçenekleri (dakika). Pages'ta "45 dk", "60 dk" ve "1 saat" görünüyor. */
export const DURATION_OPTIONS = [15, 30, 45, 60, 90, 120, 180] as const;
