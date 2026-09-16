-- Returns. Neither the storefront nor the admin panel currently has a
-- "request a return" entry point — the admin UI only lists/updates
-- returns that already exist — so this table stays real but empty until
-- that create-path is built. Staff-only, same as orders.

create table public.returns (
  id uuid primary key default gen_random_uuid(),
  return_number text not null unique,
  order_id uuid not null references public.orders (id) on delete cascade,
  customer_name text not null default '',
  items jsonb not null default '[]'::jsonb,
  reason text not null default '',
  status text not null default 'requested'
    check (status in ('requested', 'approved', 'processing', 'completed', 'rejected')),
  refund_amount numeric(12, 2) not null default 0,
  requested_at timestamptz not null default now(),
  resolved_at timestamptz,
  notes text not null default '',
  handled_by text not null default ''
);

create index returns_order_id_idx on public.returns (order_id);

alter table public.returns enable row level security;

create policy "Staff manage returns"
  on public.returns for all
  using (public.is_staff())
  with check (public.is_staff());
