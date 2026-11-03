# Supabase istemcileri

| Dosya | Nerede kullanılır | Not |
|---|---|---|
| `client.ts` | Client Component | `createSupabaseBrowserClient()` |
| `server.ts` | Server Component, Server Action, Route Handler | `createSupabaseServerClient()`; `server-only` ile istemciye girmesi engellenir |

## Kurallar
- Yalnızca herkese açık anahtar (`NEXT_PUBLIC_SUPABASE_ANON_KEY`) kullanılır. Güvenlik RLS'e dayanır (TECH_STACK §6).
- `SUPABASE_SERVICE_ROLE_KEY` bu uygulamada **hiç** kullanılmaz; yalnızca Supabase Edge Functions secrets'ta durur (TECH_STACK §13.3).
- Ortam değişkenleri yalnızca `src/lib/env.ts` üzerinden okunur.
- Staging ve production ayrı Supabase projeleridir; hangi projeye bağlanılacağını ortam değişkenleri belirler (TECH_STACK §13.2).

## Henüz yapılmayanlar (auth aşaması)
- `src/proxy.ts` ile oturum yenileme (Next.js 16'da `middleware.ts` yerine `proxy.ts`).
- Veritabanı tipleri (`src/types/database.ts`, `supabase gen types` ile üretilecek).
- `supabase/` klasörü ve migration'lar. **Dikkat:** Staging projesinde GitHub entegrasyonunun "Deploy to production" ayarı açık; `supabase/` klasörü `main`'e girdiği anda staging'e otomatik uygulanır. Bu ayar S-8'den önce gözden geçirilecek.
