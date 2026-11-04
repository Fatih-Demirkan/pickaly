import "server-only";
import { isWeekStart, type WeekStart } from "@/lib/dates";
import { isSupabaseConfigured } from "@/lib/env";
import { db, unwrap } from "@/lib/supabase/data";
import type { UserProfile, UserSettings } from "./domain/types";

// Profil ve tercihlere sunucu tarafı erişim. Supabase tanımlıysa tercihler user_settings tablosundan okunur
// (kayıtta tetikleyiciyle oluşturulur); profil oturumdaki kullanıcıdan gelir (features/auth/server.ts).
// Supabase tanımlı değilse yerel örnek profil ve tercihler kullanılır.

const DEFAULT_SETTINGS: UserSettings = { weekStart: 1, remindersEnabled: true };

type Store = { profile: UserProfile; settings: UserSettings };

const globalStore = globalThis as typeof globalThis & { __pickalySettings?: Store };

function store(): Store {
  // Pages'taki örnek profil (Deniz Yılmaz) — kurgusal, örnek alan adı.
  globalStore.__pickalySettings ??= {
    profile: { name: "Deniz Yılmaz", email: "deniz.yilmaz@example.com", avatarUrl: null },
    settings: { weekStart: 1, remindersEnabled: true },
  };
  return globalStore.__pickalySettings;
}

export async function getProfile(): Promise<UserProfile> {
  return store().profile;
}

export async function getSettings(): Promise<UserSettings> {
  if (!isSupabaseConfigured()) return store().settings;
  const row = unwrap(await (await db()).from("user_settings").select("week_start, reminders_enabled").maybeSingle()) as {
    week_start: number;
    reminders_enabled: boolean;
  } | null;
  if (!row) return DEFAULT_SETTINGS;
  return { weekStart: isWeekStart(row.week_start) ? row.week_start : 1, remindersEnabled: row.reminders_enabled };
}

export async function updateWeekStart(weekStart: WeekStart): Promise<void> {
  if (!isSupabaseConfigured()) {
    store().settings = { ...store().settings, weekStart };
    return;
  }
  // Satır kayıtta oluşturulur; yine de yoksa (ör. eski hesap) eklenir.
  unwrap(await (await db()).from("user_settings").upsert({ week_start: weekStart }, { onConflict: "user_id" }));
}
