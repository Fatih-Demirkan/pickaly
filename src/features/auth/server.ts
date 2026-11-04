import "server-only";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// Oturumdaki kullanıcıya sunucu tarafı erişim. Supabase tanımlı değilse oturum yoktur (yerel örnek veri modu).

export type SessionUser = { id: string; email: string; name: string };

export async function getSessionUser(): Promise<SessionUser | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const metadataName = typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name.trim() : "";
  return { id: user.id, email: user.email ?? "", name: metadataName || (user.email?.split("@")[0] ?? "") };
}
