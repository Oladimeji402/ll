-- Generic key/value store for singleton config sections — shipping,
-- each settings tab (store/checkout/notifications/email/seo/preferences),
-- and homepage content all have the exact same shape: one named blob,
-- edited by merging a patch into it. One table serves all of them
-- instead of a bespoke table per section.

create table public.store_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.store_settings enable row level security;

create policy "Staff manage store settings"
  on public.store_settings for all
  using (public.is_staff())
  with check (public.is_staff());
