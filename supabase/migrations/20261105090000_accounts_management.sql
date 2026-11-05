-- Hesap yönetimi, hesaplar arası aktarım ve birikimin bağlı hesabı (ürün sahibi isteği, 2026-11-05).
-- Yalnızca ekleme yapar; mevcut veri silinmez veya değiştirilmez.

-- 1) Hesap arşivleme: işlemi olan hesap silinmez, arşivlenir (listelerde gizlenir, geçmiş kayıtlar korunur).
alter table public.accounts add column if not exists archived_at timestamptz;

-- 2) Birikim hesabının bağlı olduğu banka hesabı. "Saklama Kurumu" metni yerine geçer; para ekle / çek ve düzenli katkı
--    bu hesaptan yapılır. Eski "institution" sütunu veri kaybı olmasın diye kalır, uygulama artık kullanmaz.
alter table public.savings_accounts add column if not exists account_id uuid;
alter table public.savings_accounts
  add constraint savings_accounts_account_fk foreign key (user_id, account_id) references public.accounts (user_id, id);

-- Var olan birikimler: düzenli katkının kaynak hesabı ya da ilk TL hareketinin hesabı bağlı hesap olur.
update public.savings_accounts s
set account_id = coalesce(
  nullif(s.contribution ->> 'sourceAccountId', '')::uuid,
  (select m.bank_account_id from public.savings_movements m
   where m.account_id = s.id and m.bank_account_id is not null order by m.occurred_at limit 1)
)
where s.account_id is null;

-- 3) Hesaplar arası para aktarımı. Gelir / gider sayılmaz; yalnızca iki hesabın bakiyesini değiştirir.
create table if not exists public.account_transfers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  from_account_id uuid not null,
  to_account_id uuid not null,
  amount_minor bigint not null check (amount_minor > 0),
  occurred_at timestamptz not null,
  note text check (note is null or char_length(note) <= 200),
  created_at timestamptz not null default now(),
  check (from_account_id <> to_account_id),
  foreign key (user_id, from_account_id) references public.accounts (user_id, id),
  foreign key (user_id, to_account_id) references public.accounts (user_id, id)
);

create index if not exists account_transfers_user_idx on public.account_transfers (user_id, occurred_at desc);

alter table public.account_transfers enable row level security;
revoke all on table public.account_transfers from anon;
grant select, insert, update, delete on table public.account_transfers to authenticated;
create policy "own rows" on public.account_transfers
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
