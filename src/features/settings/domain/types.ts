import type { WeekStart } from "@/lib/dates";

// Kullanıcı profili ve tercihleri (PRD DM-001, FR-SET-001…005; TECH_STACK §5.2 user_settings).
// Haftanın ilk günü tipi (WeekStart) takvim ve tarih seçicide de kullanıldığı için lib/dates.ts'tedir.

export const WEEK_STARTS: readonly WeekStart[] = [1, 0];

export type UserProfile = {
  name: string;
  email: string;
  /** Avatar görseli; yoksa baş harfler gösterilir. */
  avatarUrl: string | null;
};

export type UserSettings = {
  weekStart: WeekStart;
  /** Uygulama içi hatırlatmalar (FR-SET-006). Ayar ekranı tasarlanmadı; varsayılan açık. */
  remindersEnabled: boolean;
};
