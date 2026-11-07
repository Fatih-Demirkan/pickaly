-- Alacaklar: borç verilen para (ürün sahibi isteği, 2026-11-07). Yalnızca ekleme yapar; mevcut veri değişmez.
-- Gelir / gider sayılmaz. Bakiye etkisi uygulamada hesaplanır (hesaplar arası aktarım gibi):
--   account_id doluysa borç verilen gün o hesaptan düşer (null: yalnızca alacak kaydı, hesaptan para çıkmadı);
--   repaid_on doluysa geri alınan tutar repaid_account_id hesabına eklenir.

create table if not exists public.loans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  person text not null check (char_length(person) between 1 and 80),
  purpose text check (purpose is null or char_length(purpose) <= 80),
  amount_minor bigint not null check (amount_minor > 0),
  account_id uuid,
  lent_on date not null,
  due_on date not null,
  note text check (note is null or char_length(note) <= 200),
  repaid_on date,
  repaid_account_id uuid,
  created_at timestamptz not null default now(),
  check (due_on >= lent_on),
  check ((repaid_on is null) = (repaid_account_id is null)),
  foreign key (user_id, account_id) references public.accounts (user_id, id),
  foreign key (user_id, repaid_account_id) references public.accounts (user_id, id)
);

create index if not exists loans_user_due_idx on public.loans (user_id, due_on);

alter table public.loans enable row level security;
revoke all on table public.loans from anon;
grant select, insert, update, delete on table public.loans to authenticated;
create policy "own rows" on public.loans
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
