-- Admin-managed discount codes. Staff-only for now — nothing at checkout
-- applies or redeems a code yet, so there's no public read path to grant.

create table public.discounts (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  type text not null check (type in ('percentage', 'fixed')),
  value numeric(12, 2) not null,
  min_order_amount numeric(12, 2) not null default 0,
  usage_limit integer,
  usage_count integer not null default 0,
  start_date date not null,
  end_date date,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.discount_products (
  discount_id uuid not null references public.discounts (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  primary key (discount_id, product_id)
);

create table public.discount_collections (
  discount_id uuid not null references public.discounts (id) on delete cascade,
  collection_id uuid not null references public.collections (id) on delete cascade,
  primary key (discount_id, collection_id)
);

alter table public.discounts enable row level security;
alter table public.discount_products enable row level security;
alter table public.discount_collections enable row level security;

create policy "Staff manage discounts"
  on public.discounts for all
  using (public.is_staff())
  with check (public.is_staff());

create policy "Staff manage discount products"
  on public.discount_products for all
  using (public.is_staff())
  with check (public.is_staff());

create policy "Staff manage discount collections"
  on public.discount_collections for all
  using (public.is_staff())
  with check (public.is_staff());
