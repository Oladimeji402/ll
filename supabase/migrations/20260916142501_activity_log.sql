-- Real audit trail — every service already calls logActivity() after a
-- write; this is what finally gives those calls somewhere real to land.
-- resource_id is text (not a uuid FK) since it's polymorphic across
-- resource_type and sometimes a comma-joined list (bulk actions).

create table public.activity_log (
  id uuid primary key default gen_random_uuid(),
  actor text not null default '',
  action text not null,
  resource_type text not null,
  resource_id text not null default '',
  resource_label text not null default '',
  details text not null default '',
  created_at timestamptz not null default now()
);

create index activity_log_resource_id_idx on public.activity_log (resource_id);
create index activity_log_created_at_idx on public.activity_log (created_at desc);

alter table public.activity_log enable row level security;

create policy "Staff manage activity log"
  on public.activity_log for all
  using (public.is_staff())
  with check (public.is_staff());
