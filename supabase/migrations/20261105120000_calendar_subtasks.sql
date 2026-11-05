-- Görev alt görevleri ("Çoklu seçim", ürün sahibi isteği 2026-11-05).
-- Alt görevler görevle birlikte saklanır: [{ "id": "…", "title": "…", "done": false }]. Boş dizi = alt görev yok.
-- Yalnızca ekleme yapar; mevcut kayıtlar boş listeyle devam eder.

alter table public.calendar_items add column if not exists subtasks jsonb not null default '[]'::jsonb;

alter table public.calendar_items
  add constraint calendar_items_subtasks_array check (jsonb_typeof(subtasks) = 'array');
