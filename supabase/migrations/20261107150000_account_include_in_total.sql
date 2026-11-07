-- Hesap → "Toplam bakiyeye dahil et" (ürün sahibi isteği 2026-11-07).
-- Kapalı hesabın bakiyesi korunur ama Ana Sayfa'daki toplam bakiyeye eklenmez; ayrı bakiye olarak gösterilir.
-- Varsayılan açık: mevcut hesapların davranışı değişmez.

alter table public.accounts add column if not exists include_in_total boolean not null default true;
