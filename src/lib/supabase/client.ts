import { createBrowserClient } from "@supabase/ssr";
import { getSupabasePublicEnv } from "@/lib/env";

/**
 * Tarayıcı (Client Component) için Supabase istemcisi.
 * Yalnızca herkese açık (publishable/anon) anahtarı kullanır; tüm erişim RLS ile korunur (TECH_STACK §6).
 */
export function createSupabaseBrowserClient() {
  const { url, anonKey } = getSupabasePublicEnv();
  return createBrowserClient(url, anonKey);
}
