import "server-only";
import type { WeekStart } from "@/lib/dates";
import type { UserProfile, UserSettings } from "./domain/types";

// Profil ve tercihlere sunucu tarafı erişim. Şimdilik yerel örnek veri (gerçek kullanıcı verisi yok);
// [Auth aşaması] Profil oturumdaki kullanıcıdan, tercihler user_settings tablosundan okunur.

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
  return store().settings;
}

export async function updateWeekStart(weekStart: WeekStart): Promise<void> {
  store().settings = { ...store().settings, weekStart };
}
