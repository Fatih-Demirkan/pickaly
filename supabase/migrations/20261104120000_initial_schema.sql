-- Pickaly — ilk şema (TECH_STACK §5, PRD DM-*). Uygulamanın bugünkü veri modeliyle birebir.
--
-- Güvenlik (TECH_STACK §6):
--   * Her tabloda user_id (varsayılan auth.uid()) ve RLS: kullanıcı yalnızca kendi satırlarını görür ve değiştirir.
--   * Tablolar arası bağlar (user_id, id) bileşik yabancı anahtarlarla kurulur: bir kayıt başka kullanıcının
--     kategorisine / hesabına bağlanamaz.
--   * anon rolünün tablolara erişimi yoktur; yalnızca oturum açmış kullanıcı (authenticated).
--
-- Bu migration'da OLMAYANLAR (sonraki migration'lar): reminders, notifications, transaction_attachments,
-- push_subscriptions, hesap arşivleme, hesaplar arası transfer, pg_cron ile tekrar üretimi. Tekrarlayan
-- kayıtlar şimdilik uygulama okurken üretilir; aynı kaydın iki kez oluşmasını benzersizlik kuralları engeller.

-- ---------------------------------------------------------------------------------------------------------------
-- Kullanıcı tercihleri (FR-SET-005, FR-SET-006)
-- ---------------------------------------------------------------------------------------------------------------
create table public.user_settings (
  user_id uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  week_start smallint not null default 1 check (week_start in (0, 1)),
  reminders_enabled boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------------------------------------------
-- Hesaplar (DM-003). Bakiye saklanmaz; açılış bakiyesi + işlemler + birikim aktarımlarından hesaplanır.
-- ---------------------------------------------------------------------------------------------------------------
create table public.accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 60),
  detail text,
  opening_balance_minor bigint not null default 0,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  unique (user_id, id)
);

-- ---------------------------------------------------------------------------------------------------------------
-- Kategoriler (DM-003, BR-CAT). Kullanılmış kategori silinmez, arşivlenir (uygulama kuralı).
-- ---------------------------------------------------------------------------------------------------------------
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  type text not null check (type in ('income', 'expense', 'subscription', 'calendar')),
  name text not null check (char_length(name) between 1 and 40),
  icon text,
  color text not null,
  archived boolean not null default false,
  monthly_budget_minor bigint check (monthly_budget_minor is null or monthly_budget_minor > 0),
  note text check (note is null or char_length(note) <= 200),
  position integer not null default 0,
  created_at timestamptz not null default now(),
  unique (user_id, id)
);

-- Ad, tür içinde aktif kategoriler arasında benzersiz (BR-DUP-003).
create unique index categories_active_name_unique on public.categories (user_id, type, lower(name)) where not archived;

-- ---------------------------------------------------------------------------------------------------------------
-- Tekrar Eden İşlem kuralları (FR-FIN-005, BR-REC-003)
-- ---------------------------------------------------------------------------------------------------------------
create table public.recurring_rules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  -- İşlem şablonu: { type, title, amountMinor (metin), categoryId, accountId, note }
  template jsonb not null,
  frequency text not null check (frequency in ('daily', 'weekly', 'monthly', 'yearly')),
  start_date date not null,
  time text not null,
  reminder text not null default 'none',
  active boolean not null default true,
  generated_through date not null,
  created_at timestamptz not null default now(),
  unique (user_id, id)
);

-- ---------------------------------------------------------------------------------------------------------------
-- Tekrarlayan ödemeler ("Abonelik") ve ödeme örnekleri (PRD §6, BR-PAY)
-- ---------------------------------------------------------------------------------------------------------------
create table public.recurring_payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title text not null,
  amount_minor bigint not null check (amount_minor > 0),
  category_id uuid not null,
  account_id uuid not null,
  frequency text check (frequency in ('daily', 'weekly', 'monthly', 'yearly')),
  start_date date not null,
  due_time text not null,
  reminder text not null default 'none',
  note text,
  contract_number text,
  deleted_at timestamptz,
  generated_through date,
  created_at timestamptz not null default now(),
  unique (user_id, id),
  foreign key (user_id, category_id) references public.categories (user_id, id),
  foreign key (user_id, account_id) references public.accounts (user_id, id)
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  recurring_payment_id uuid not null,
  due_date date not null,
  amount_minor bigint not null check (amount_minor > 0),
  status text not null default 'pending' check (status in ('pending', 'paid')),
  paid_at timestamptz,
  paid_amount_minor bigint,
  paid_account_id uuid,
  transaction_id uuid,
  created_at timestamptz not null default now(),
  unique (user_id, id),
  -- Aynı vade için tek ödeme (BR-DUP-002).
  unique (recurring_payment_id, due_date),
  foreign key (user_id, recurring_payment_id) references public.recurring_payments (user_id, id) on delete cascade,
  foreign key (user_id, paid_account_id) references public.accounts (user_id, id)
);

-- ---------------------------------------------------------------------------------------------------------------
-- İşlemler (DM-004)
-- ---------------------------------------------------------------------------------------------------------------
create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  type text not null check (type in ('income', 'expense')),
  title text not null check (char_length(title) between 1 and 80),
  amount_minor bigint not null check (amount_minor > 0),
  category_id uuid not null,
  account_id uuid not null,
  occurred_at timestamptz not null,
  note text check (note is null or char_length(note) <= 200),
  merchant_name text,
  merchant_location text,
  source text not null default 'manual' check (source in ('manual', 'recurring', 'payment')),
  recurring_rule_id uuid,
  payment_id uuid,
  created_at timestamptz not null default now(),
  unique (user_id, id),
  foreign key (user_id, category_id) references public.categories (user_id, id),
  foreign key (user_id, account_id) references public.accounts (user_id, id)
);

create index transactions_user_occurred_idx on public.transactions (user_id, occurred_at desc);
-- Bir kuralın aynı örneği iki kez işlem olmaz (BR-DUP-004).
create unique index transactions_rule_occurrence_unique on public.transactions (recurring_rule_id, occurred_at) where recurring_rule_id is not null;
-- Bir ödeme en fazla bir kez "Ödendi" işlemi üretir (BR-DUP-002).
create unique index transactions_payment_unique on public.transactions (payment_id) where payment_id is not null;

-- ---------------------------------------------------------------------------------------------------------------
-- Takvim kayıtları: görev ve randevu (DM-007)
-- ---------------------------------------------------------------------------------------------------------------
create table public.calendar_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  kind text not null check (kind in ('task', 'appointment')),
  title text not null,
  description text,
  priority text not null default 'normal' check (priority in ('low', 'normal', 'high')),
  category_id uuid,
  date date not null,
  time text,
  duration_minutes integer check (duration_minutes is null or duration_minutes > 0),
  reminder text not null default 'none',
  location_name text,
  location_address text,
  note text,
  planned_expense_minor bigint,
  status text not null default 'open' check (status in ('open', 'done')),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, id),
  foreign key (user_id, category_id) references public.categories (user_id, id)
);

create index calendar_items_user_date_idx on public.calendar_items (user_id, date);

-- ---------------------------------------------------------------------------------------------------------------
-- Birikim hesapları ve hareketleri (PRD §7, DM-008)
-- ---------------------------------------------------------------------------------------------------------------
create table public.savings_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  kind text not null check (kind in ('gold', 'deposit', 'fund', 'currency', 'cash')),
  unit text not null check (unit in ('TRY', 'piece', 'gram')),
  institution text,
  target bigint check (target is null or target > 0),
  opened_at date not null,
  note text,
  -- Düzenli Katkı: { amount (metin), frequency, startDate, time, reminder, sourceAccountId, generatedThrough }
  contribution jsonb,
  icon text not null default 'savings',
  color text not null default 'blue',
  created_at timestamptz not null default now(),
  unique (user_id, id)
);

create table public.savings_movements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  account_id uuid not null,
  direction text not null check (direction in ('in', 'out')),
  amount bigint not null check (amount > 0),
  transfer_minor bigint,
  bank_account_id uuid,
  occurred_at timestamptz not null,
  source text not null check (source in ('initial', 'manual', 'recurring', 'closing')),
  created_at timestamptz not null default now(),
  foreign key (user_id, account_id) references public.savings_accounts (user_id, id) on delete cascade,
  foreign key (user_id, bank_account_id) references public.accounts (user_id, id)
);

create index savings_movements_account_idx on public.savings_movements (account_id, occurred_at desc);
-- Düzenli Katkı'nın aynı dönemi iki kez oluşmaz.
create unique index savings_movements_recurring_unique on public.savings_movements (account_id, occurred_at) where source = 'recurring';

-- ---------------------------------------------------------------------------------------------------------------
-- RLS: kullanıcı yalnızca kendi satırları
-- ---------------------------------------------------------------------------------------------------------------
do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'user_settings', 'accounts', 'categories', 'recurring_rules', 'recurring_payments', 'payments',
    'transactions', 'calendar_items', 'savings_accounts', 'savings_movements'
  ] loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('revoke all on table public.%I from anon', table_name);
    execute format('grant select, insert, update, delete on table public.%I to authenticated', table_name);
    execute format(
      'create policy "own rows" on public.%I for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id)',
      table_name
    );
  end loop;
end
$$;

-- ---------------------------------------------------------------------------------------------------------------
-- Kayıt sonrası başlangıç verisi (FR-AUTH-005, D-29): tercihler, "Ana Hesap" ve varsayılan kategoriler.
-- Kategori listesi Pages → Yeni İşlem (Gelir / Gider / Abonelik) ve Takvim örneklerinden.
-- ---------------------------------------------------------------------------------------------------------------
create function public.seed_user_defaults(target_user uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.user_settings (user_id) values (target_user);

  insert into public.accounts (user_id, name, opening_balance_minor, is_default)
  values (target_user, 'Ana Hesap', 0, true);

  insert into public.categories (user_id, type, name, icon, color, position) values
    (target_user, 'expense', 'Market', 'shopping-cart', 'orange', 1),
    (target_user, 'expense', 'Yemek', null, 'orange', 2),
    (target_user, 'expense', 'Fatura', 'zap', 'orange', 3),
    (target_user, 'expense', 'Ulaşım', 'fuel', 'blue', 4),
    (target_user, 'expense', 'Hediye', null, 'pink', 5),
    (target_user, 'expense', 'Diğer', null, 'slate', 6),
    (target_user, 'income', 'Maaş', null, 'green', 7),
    (target_user, 'income', 'Freelance / Ek İş', 'notebook-pen', 'green', 8),
    (target_user, 'income', 'Yatırım Getirisi', null, 'green', 9),
    (target_user, 'income', 'Kira Geliri', 'house', 'green', 10),
    (target_user, 'income', 'Hediye', null, 'pink', 11),
    (target_user, 'income', 'Diğer', null, 'slate', 12),
    (target_user, 'subscription', 'Kira / Ev', 'house', 'green', 13),
    (target_user, 'subscription', 'Fatura', 'zap', 'orange', 14),
    (target_user, 'subscription', 'Aidat', null, 'slate', 15),
    (target_user, 'subscription', 'Abonelik', 'wifi', 'blue', 16),
    (target_user, 'subscription', 'Kredi / Borç', null, 'slate', 17),
    (target_user, 'subscription', 'Diğer', null, 'slate', 18),
    (target_user, 'calendar', 'Sağlık', 'hospital', 'green', 19),
    (target_user, 'calendar', 'İş', null, 'blue', 20),
    (target_user, 'calendar', 'Ev İhtiyaçları', 'shopping-cart', 'orange', 21);
end;
$$;

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.seed_user_defaults(new.id);
  return new;
end;
$$;

-- Bu fonksiyonlar yalnızca tetikleyiciden çalışır; API üzerinden çağrılamaz.
revoke all on function public.seed_user_defaults(uuid) from public, anon, authenticated;
revoke all on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Bu migration'dan önce kayıt olmuş (test) kullanıcılar için başlangıç verisi.
do $$
declare
  existing record;
begin
  for existing in select id from auth.users loop
    perform public.seed_user_defaults(existing.id);
  end loop;
end
$$;
