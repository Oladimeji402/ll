-- Admin's product form manages a real per-image gallery ({id, tone, alt})
-- and free-form tags, neither of which the original catalog migration
-- carried (it only had a single placeholder tone + a tile count). Add
-- both and backfill existing rows so the storefront's tone/image_count
-- fallback still renders correctly for products that predate this.

alter table public.products add column images jsonb not null default '[]'::jsonb;
alter table public.products add column tags text[] not null default '{}';

update public.products p
set images = sub.imgs
from (
  select p2.id, jsonb_agg(jsonb_build_object('id', gen_random_uuid()::text, 'tone', p2.tone, 'alt', p2.title)) as imgs
  from public.products p2, generate_series(1, p2.image_count)
  group by p2.id
) sub
where p.id = sub.id and p.images = '[]'::jsonb;
