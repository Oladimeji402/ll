-- Real notifications table backing the bell dropdown and /admin/notifications
-- page. Single shared inbox (one admin account today), same shape as the
-- mock store it replaces.

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  title text not null,
  body text not null default '',
  href text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index notifications_created_at_idx on public.notifications (created_at desc);

alter table public.notifications enable row level security;

create policy "Staff manage notifications"
  on public.notifications for all
  using (public.is_staff())
  with check (public.is_staff());
