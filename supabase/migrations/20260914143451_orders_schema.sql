-- Orders. No payment gateway is wired up yet, so every order is created
-- with payment_status = 'pending' — see create_order() below.

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  customer_id uuid not null references public.customers (id) on delete restrict,
  customer_name text not null default '',
  email text not null,
  subtotal numeric(12, 2) not null,
  shipping_cost numeric(12, 2) not null default 0,
  discount numeric(12, 2) not null default 0,
  tax numeric(12, 2) not null default 0,
  total numeric(12, 2) not null,
  payment_method text not null default 'unassigned',
  payment_status text not null default 'pending' check (payment_status in ('paid', 'pending', 'failed', 'refunded')),
  fulfillment_status text not null default 'unfulfilled'
    check (fulfillment_status in ('unfulfilled', 'processing', 'shipped', 'delivered', 'cancelled', 'returned')),
  tracking_number text,
  shipping_address jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  title text not null,
  variant text not null default '',
  sku text not null default '',
  tone smallint not null default 0,
  quantity integer not null check (quantity > 0),
  price numeric(12, 2) not null
);

create table public.order_timeline_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  label text not null,
  note text,
  created_at timestamptz not null default now()
);

create index orders_customer_id_idx on public.orders (customer_id);
create index order_items_order_id_idx on public.order_items (order_id);
create index order_timeline_events_order_id_idx on public.order_timeline_events (order_id);

alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_timeline_events enable row level security;

create policy "Customers view own orders"
  on public.orders for select
  using (customer_id = auth.uid());

-- Required for create_order() below, which is SECURITY INVOKER and so
-- relies on RLS (not elevated privilege) to authorize its own inserts.
create policy "Customers create own orders"
  on public.orders for insert
  with check (customer_id = auth.uid());

create policy "Staff manage orders"
  on public.orders for all
  using (public.is_staff())
  with check (public.is_staff());

create policy "Customers view own order items"
  on public.order_items for select
  using (exists (select 1 from public.orders o where o.id = order_id and o.customer_id = auth.uid()));

create policy "Customers create own order items"
  on public.order_items for insert
  with check (exists (select 1 from public.orders o where o.id = order_id and o.customer_id = auth.uid()));

create policy "Staff manage order items"
  on public.order_items for all
  using (public.is_staff())
  with check (public.is_staff());

create policy "Customers view own order timeline"
  on public.order_timeline_events for select
  using (exists (select 1 from public.orders o where o.id = order_id and o.customer_id = auth.uid()));

create policy "Customers create own order timeline events"
  on public.order_timeline_events for insert
  with check (exists (select 1 from public.orders o where o.id = order_id and o.customer_id = auth.uid()));

create policy "Staff manage order timeline events"
  on public.order_timeline_events for all
  using (public.is_staff())
  with check (public.is_staff());

-- Places an order for the calling customer from a cart snapshot. Runs as
-- SECURITY INVOKER (the caller's own role) so the RLS policies above are
-- what actually authorize each insert — this function is a convenience
-- wrapper for an atomic multi-table write, not a privilege escalation.
create function public.create_order(p_items jsonb, p_shipping_address jsonb, p_shipping_cost numeric default 0)
returns table (order_id uuid, order_number text)
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_customer_id uuid := auth.uid();
  v_customer_name text;
  v_email text;
  v_order_id uuid;
  v_order_number text;
  v_subtotal numeric := 0;
  v_quantity integer;
  v_item jsonb;
  v_product record;
begin
  if v_customer_id is null then
    raise exception 'Must be signed in to place an order';
  end if;

  select name, email into v_customer_name, v_email from public.customers where id = v_customer_id;
  if not found then
    raise exception 'Customer profile not found';
  end if;

  if jsonb_array_length(p_items) = 0 then
    raise exception 'Cannot place an order with no items';
  end if;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_quantity := (v_item ->> 'quantity')::integer;
    if v_quantity is null or v_quantity < 1 then
      raise exception 'Invalid quantity for item';
    end if;

    select price into v_product
    from public.products where id = (v_item ->> 'productId')::uuid and status = 'active';

    if not found then
      raise exception 'Product not found or unavailable';
    end if;

    v_subtotal := v_subtotal + (v_product.price * v_quantity);
  end loop;

  v_order_number := 'LLC-' || to_char(now(), 'YYMMDD') || '-' || upper(substr(md5(random()::text), 1, 5));

  insert into public.orders (order_number, customer_id, customer_name, email, subtotal, shipping_cost, total, shipping_address)
  values (v_order_number, v_customer_id, coalesce(v_customer_name, ''), v_email, v_subtotal, p_shipping_cost, v_subtotal + p_shipping_cost, p_shipping_address)
  returning id into v_order_id;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    select price, title, sku, tone into v_product
    from public.products where id = (v_item ->> 'productId')::uuid;

    insert into public.order_items (order_id, product_id, title, variant, sku, tone, quantity, price)
    values (
      v_order_id,
      (v_item ->> 'productId')::uuid,
      v_product.title,
      coalesce(v_item ->> 'size', ''),
      v_product.sku,
      v_product.tone,
      (v_item ->> 'quantity')::integer,
      v_product.price
    );
  end loop;

  insert into public.order_timeline_events (order_id, label) values (v_order_id, 'Order placed');

  return query select v_order_id, v_order_number;
end;
$$;
