import "server-only";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { getSupabasePublicEnv } from "@/lib/env";

/**
 * Sunucu (Server Component, Server Action, Route Handler) için Supabase istemcisi.
 * Kullanıcının oturum cookie'leriyle çalışır; sorgular o kullanıcının yetkisiyle yapılır ve RLS uygulanır.
 * Servis anahtarı (service_role) burada KULLANILMAZ (TECH_STACK §6.4).
 */
export async function createSupabaseServerClient() {
  const { url, anonKey } = getSupabasePublicEnv();
  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Server Component içinden cookie yazılamaz. Oturum yenilemesi auth aşamasında
          // eklenecek proxy (src/proxy.ts) üzerinden yapılacağı için burada yok sayılır.
        }
      },
    },
  });
}
