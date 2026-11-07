-- Birikim hesabı kapatılınca banka bakiyesi bozulmasın (QA denetimi 2026-11-07, P0-1).
--
-- Sorun: savings_movements → savings_accounts yabancı anahtarı "on delete cascade" idi. Birikim hesabı kapatılıp
-- silinince tüm hareketleri de siliniyordu. Banka hesabı bakiyeleri bu hareketlerden hesaplandığı için (birikime
-- aktarım hesabı azaltır, çekme artırır) geçmiş aktarımların etkisi kayboluyor; "aktarmadan kapat" seçildiğinde
-- banka bakiyesi birikim bakiyesi kadar şişiyordu.
--
-- Çözüm: Birikim hesabı yine kalıcı silinir (PRD §7.3, Q-15). Banka hesabına yansımış hareketler (bank_account_id dolu)
-- ise silinmez; yalnızca birikim hesabıyla bağı kalkar (account_id = null). Banka etkisi olmayan hareketleri uygulama
-- hesabı silmeden önce kendisi siler. Kullanıcı hesabı silinirse hareketler user_id üzerinden yine silinir.
-- Yalnızca kısıt değiştirir; mevcut satırlar değişmez. Önceden kapatılmış hesapların silinmiş hareketleri geri gelmez.

alter table public.savings_movements alter column account_id drop not null;

-- İlk şemada adsız tanımlanan (user_id, account_id) → savings_accounts kısıtı bulunup kaldırılır.
do $$
declare
  constraint_name text;
begin
  select con.conname into constraint_name
  from pg_constraint con
  where con.conrelid = 'public.savings_movements'::regclass
    and con.contype = 'f'
    and con.confrelid = 'public.savings_accounts'::regclass;
  if constraint_name is not null then
    execute format('alter table public.savings_movements drop constraint %I', constraint_name);
  end if;
end
$$;

-- Silmede yalnızca account_id boşaltılır; user_id korunur (PostgreSQL 15+ sütun listeli SET NULL).
alter table public.savings_movements
  add constraint savings_movements_account_fk foreign key (user_id, account_id)
  references public.savings_accounts (user_id, id) on delete set null (account_id);
