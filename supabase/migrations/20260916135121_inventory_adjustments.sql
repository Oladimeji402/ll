-- Stock-adjustment audit trail. "Available" stock itself is just
-- products.quantity (the single source of truth already used by the
-- storefront) — this table only records the history of changes to it.
-- There's no separate "reserved" concept yet: nothing reserves stock at
-- order time, so the admin UI's reserved column reads 0 until that
-- exists.

create table public.inventory_adjustments (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  change integer not null check (change <> 0),
  reason text not null check (reason in ('restock', 'sale', 'return', 'damage', 'correction')),
  note text not null default '',
  resulting_quantity integer not null,
  actor_id uuid references public.staff_members (id) on delete set null,
  actor_name text not null default '',
  created_at timestamptz not null default now()
);

create index inventory_adjustments_product_id_idx on public.inventory_adjustments (product_id);

alter table public.inventory_adjustments enable row level security;

create policy "Staff manage inventory adjustments"
  on public.inventory_adjustments for all
  using (public.is_staff())
  with check (public.is_staff());
