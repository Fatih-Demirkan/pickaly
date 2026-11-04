# Supabase istemcileri

| Dosya | Nerede kullanılır | Not |
|---|---|---|
| `client.ts` | Client Component | `createSupabaseBrowserClient()` |
| `server.ts` | Server Component, Server Action, Route Handler | `createSupabaseServerClient()`; `server-only` ile istemciye girmesi engellenir |
| `data.ts` | Feature'ların `data/supabase-*.ts` dosyaları | İstek başına tek istemci (`db()`), hata açma (`unwrap`), kuruş ↔ bigint dönüşümü |

Oturum yenileme ve yönlendirme: `src/proxy.ts`. Şema: `supabase/migrations/`.

## Migration akışı
- Yeni migration: `supabase/migrations/<zaman damgası>_<ad>.sql`.
- Staging'e uygulama (CLI giriş yapılmış ve `supabase link` ile staging'e bağlı olmalı):
  `npx supabase@3.0.0 db push --remote --dry-run` → kontrol → `npx supabase@3.0.0 db push --remote`
- **Production'a CLI ile uygulanmaz.** Production ayrı bir onay ve akışla kurulur (TECH_STACK §9.3).

## Kurallar
- Yalnızca herkese açık anahtar (`NEXT_PUBLIC_SUPABASE_ANON_KEY`) kullanılır. Güvenlik RLS'e dayanır (TECH_STACK §6).
- `SUPABASE_SERVICE_ROLE_KEY` bu uygulamada **hiç** kullanılmaz; yalnızca Supabase Edge Functions secrets'ta durur (TECH_STACK §13.3).
- Ortam değişkenleri yalnızca `src/lib/env.ts` üzerinden okunur.
- Staging ve production ayrı Supabase projeleridir; hangi projeye bağlanılacağını ortam değişkenleri belirler (TECH_STACK §13.2).

## Henüz yapılmayanlar
- Veritabanı tipleri (`src/types/database.ts`, `supabase gen types` ile üretilecek). Şimdilik her repository kendi satır tipini tanımlar.
- **Dikkat:** Supabase projelerinde GitHub entegrasyonu bağlı görünüyor. "Deploy to production" açık olan bir projeye
  `supabase/` klasörü `main`'e girdiği anda migration'lar otomatik uygulanır. `pickaly-prod` için bu ayar kapalı olmalı.
