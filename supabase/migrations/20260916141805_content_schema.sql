-- Navigation, banners, and a real media library (with an actual Storage
-- bucket — uploads store real bytes now, not just fake metadata).

create table public.navigation_items (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  href text not null,
  position integer not null default 0
);

create table public.banners (
  id uuid primary key default gen_random_uuid(),
  heading text not null,
  subheading text not null default '',
  cta_label text not null default '',
  cta_href text not null default '',
  tone smallint not null default 0,
  start_date date not null,
  end_date date,
  status text not null default 'draft' check (status in ('scheduled', 'active', 'expired', 'draft'))
);

create table public.media (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  storage_path text not null,
  url text not null default '',
  size_kb integer not null default 0,
  tone smallint not null default 0,
  uploaded_at timestamptz not null default now()
);

alter table public.navigation_items enable row level security;
alter table public.banners enable row level security;
alter table public.media enable row level security;

create policy "Public reads navigation" on public.navigation_items for select using (true);
create policy "Staff manage navigation" on public.navigation_items for all using (public.is_staff()) with check (public.is_staff());

create policy "Public reads active banners" on public.banners for select using (status = 'active');
create policy "Staff manage banners" on public.banners for all using (public.is_staff()) with check (public.is_staff());

create policy "Staff manage media" on public.media for all using (public.is_staff()) with check (public.is_staff());

insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

create policy "Public read media bucket"
  on storage.objects for select
  using (bucket_id = 'media');

create policy "Staff manage media bucket"
  on storage.objects for all
  using (bucket_id = 'media' and public.is_staff())
  with check (bucket_id = 'media' and public.is_staff());
