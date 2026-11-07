-- Alacak kalemleri (ürün sahibi isteği, 2026-11-07): bir üst başlık altında birden çok alacak
-- (örn. "Babamın faturaları" → Doğalgaz 1.200 ₺, Elektrik 594 ₺). Yalnızca ekleme yapar; mevcut kayıtlar boş liste alır.
-- Biçim: [{ "id": text, "label": text, "amountMinor": text }]. Kalem varsa amount_minor kalemlerin toplamıdır (uygulama
-- tarafında hesaplanır).

alter table public.loans
  add column if not exists items jsonb not null default '[]'::jsonb;

alter table public.loans
  add constraint loans_items_array check (jsonb_typeof(items) = 'array' and jsonb_array_length(items) <= 20);
