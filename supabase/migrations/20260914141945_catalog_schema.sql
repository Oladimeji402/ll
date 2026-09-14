-- Product catalog: collections (nav-driven listing pages), products, and
-- the many-to-many between them. Public storefront traffic (anon) can only
-- read published rows; staff (see auth_schema migration) can manage all of
-- it. This replaces the static placeholder data in src/data/.

create table public.collections (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null default '',
  tone smallint not null default 0,
  status text not null default 'visible' check (status in ('visible', 'hidden')),
  seo_title text not null default '',
  seo_description text not null default '',
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null default '',
  price numeric(12, 2) not null,
  compare_at_price numeric(12, 2),
  category text not null default '',
  sizes text[] not null default '{}',
  colors text[] not null default '{}',
  sku text not null default '',
  quantity integer not null default 0,
  low_stock_threshold integer not null default 5,
  status text not null default 'draft' check (status in ('draft', 'active', 'archived')),
  tone smallint not null default 0,
  image_count smallint not null default 4,
  seo_title text not null default '',
  seo_description text not null default '',
  units_sold integer not null default 0,
  revenue numeric(12, 2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.product_collections (
  product_id uuid not null references public.products (id) on delete cascade,
  collection_id uuid not null references public.collections (id) on delete cascade,
  primary key (product_id, collection_id)
);

create index products_status_idx on public.products (status);
create index collections_status_idx on public.collections (status);

alter table public.collections enable row level security;
alter table public.products enable row level security;
alter table public.product_collections enable row level security;

create policy "Public reads visible collections"
  on public.collections for select
  using (status = 'visible');

create policy "Staff manage collections"
  on public.collections for all
  using (public.is_staff())
  with check (public.is_staff());

create policy "Public reads active products"
  on public.products for select
  using (status = 'active');

create policy "Staff manage products"
  on public.products for all
  using (public.is_staff())
  with check (public.is_staff());

create policy "Public reads product-collection links"
  on public.product_collections for select
  using (true);

create policy "Staff manage product-collection links"
  on public.product_collections for all
  using (public.is_staff())
  with check (public.is_staff());

-- Seed: collections (matches the storefront nav) and a starter product
-- catalog, ported from the static placeholder data so the storefront isn't
-- empty at launch.

insert into public.collections (slug, title, description, tone, status, position) values
  ('new-arrivals', 'New Arrivals', 'Explore our new arrivals collection — celebrated for exceptional craftsmanship and timeless style.', 0, 'visible', 0),
  ('the-signature-edit', 'The Signature Edit', 'Explore our the signature edit collection — celebrated for exceptional craftsmanship and timeless style.', 1, 'visible', 1),
  ('best-sellers', 'Best Sellers', 'Explore our best sellers collection — celebrated for exceptional craftsmanship and timeless style.', 2, 'visible', 2),
  ('co-ord-sets', 'Co-ord Sets', 'Explore our co-ord sets collection — celebrated for exceptional craftsmanship and timeless style.', 3, 'visible', 3),
  ('dresses', 'Dresses', 'Explore our dresses collection — celebrated for exceptional craftsmanship and timeless style.', 4, 'visible', 4),
  ('outerwear', 'Outerwear', 'Explore our outerwear collection — celebrated for exceptional craftsmanship and timeless style.', 0, 'visible', 5),
  ('accessories', 'Accessories', 'Explore our accessories collection — celebrated for exceptional craftsmanship and timeless style.', 1, 'visible', 6),
  ('sale', 'Sale', 'Explore our sale collection — celebrated for exceptional craftsmanship and timeless style.', 2, 'visible', 7);

insert into public.products (slug, title, description, price, compare_at_price, category, sizes, colors, sku, quantity, status, tone, image_count) values
  ('look-01', 'Look 01', 'Placeholder product description — replace with real copy covering fabric, fit, and styling notes once this product is finalized.', 80000, null, 'Dresses', array['S','M','L'], array['Black'], 'LLC-LOOK-01', 40, 'active', 0, 4),
  ('look-02', 'Look 02', 'Placeholder product description — replace with real copy covering fabric, fit, and styling notes once this product is finalized.', 55000, null, 'Outerwear', array['S','M','L'], array['Black'], 'LLC-LOOK-02', 40, 'active', 1, 4),
  ('look-03', 'Look 03', 'Placeholder product description — replace with real copy covering fabric, fit, and styling notes once this product is finalized.', 90000, 110000, 'Co-ord Sets', array['S','M','L'], array['Black'], 'LLC-LOOK-03', 40, 'active', 2, 4),
  ('look-04', 'Look 04', 'Placeholder product description — replace with real copy covering fabric, fit, and styling notes once this product is finalized.', 65000, null, 'Accessories', array['S','M','L'], array['Black'], 'LLC-LOOK-04', 40, 'active', 3, 4),
  ('piece-01', 'Piece 01', 'Placeholder product description — replace with real copy covering fabric, fit, and styling notes once this product is finalized.', 80000, null, 'Dresses', array['S','M','L'], array['Black'], 'LLC-PIECE-01', 40, 'active', 0, 4),
  ('piece-02', 'Piece 02', 'Placeholder product description — replace with real copy covering fabric, fit, and styling notes once this product is finalized.', 55000, null, 'Outerwear', array['S','M','L'], array['Black'], 'LLC-PIECE-02', 40, 'active', 1, 4),
  ('piece-03', 'Piece 03', 'Placeholder product description — replace with real copy covering fabric, fit, and styling notes once this product is finalized.', 90000, 110000, 'Co-ord Sets', array['S','M','L'], array['Black'], 'LLC-PIECE-03', 40, 'active', 2, 4),
  ('piece-04', 'Piece 04', 'Placeholder product description — replace with real copy covering fabric, fit, and styling notes once this product is finalized.', 65000, null, 'Accessories', array['S','M','L'], array['Black'], 'LLC-PIECE-04', 40, 'active', 3, 4),
  ('piece-05', 'Piece 05', 'Placeholder product description — replace with real copy covering fabric, fit, and styling notes once this product is finalized.', 100000, null, 'Dresses', array['S','M','L'], array['Black'], 'LLC-PIECE-05', 40, 'active', 4, 4),
  ('piece-06', 'Piece 06', 'Placeholder product description — replace with real copy covering fabric, fit, and styling notes once this product is finalized.', 75000, 95000, 'Outerwear', array['S','M','L'], array['Black'], 'LLC-PIECE-06', 40, 'active', 0, 4),
  ('piece-07', 'Piece 07', 'Placeholder product description — replace with real copy covering fabric, fit, and styling notes once this product is finalized.', 50000, null, 'Co-ord Sets', array['S','M','L'], array['Black'], 'LLC-PIECE-07', 40, 'active', 1, 4),
  ('piece-08', 'Piece 08', 'Placeholder product description — replace with real copy covering fabric, fit, and styling notes once this product is finalized.', 85000, null, 'Accessories', array['S','M','L'], array['Black'], 'LLC-PIECE-08', 40, 'active', 2, 4),
  ('style-09', 'Style 09', 'Placeholder product description — replace with real copy covering fabric, fit, and styling notes once this product is finalized.', 60000, 80000, 'Dresses', array['S','M','L'], array['Black'], 'LLC-STYLE-09', 40, 'active', 3, 4),
  ('style-10', 'Style 10', 'Placeholder product description — replace with real copy covering fabric, fit, and styling notes once this product is finalized.', 95000, null, 'Outerwear', array['S','M','L'], array['Black'], 'LLC-STYLE-10', 40, 'active', 4, 4),
  ('style-11', 'Style 11', 'Placeholder product description — replace with real copy covering fabric, fit, and styling notes once this product is finalized.', 70000, null, 'Co-ord Sets', array['S','M','L'], array['Black'], 'LLC-STYLE-11', 40, 'active', 0, 4),
  ('style-12', 'Style 12', 'Placeholder product description — replace with real copy covering fabric, fit, and styling notes once this product is finalized.', 45000, 65000, 'Accessories', array['S','M','L'], array['Black'], 'LLC-STYLE-12', 40, 'active', 1, 4);

insert into public.product_collections (product_id, collection_id)
select p.id, c.id from public.products p, public.collections c where c.slug = 'new-arrivals';

insert into public.product_collections (product_id, collection_id)
select p.id, c.id from public.products p, public.collections c
where c.slug = 'sale' and p.compare_at_price is not null;

insert into public.product_collections (product_id, collection_id) select p.id, c.id from public.products p, public.collections c where p.slug = 'look-01' and c.slug = 'the-signature-edit';
insert into public.product_collections (product_id, collection_id) select p.id, c.id from public.products p, public.collections c where p.slug = 'look-02' and c.slug = 'best-sellers';
insert into public.product_collections (product_id, collection_id) select p.id, c.id from public.products p, public.collections c where p.slug = 'look-03' and c.slug = 'co-ord-sets';
insert into public.product_collections (product_id, collection_id) select p.id, c.id from public.products p, public.collections c where p.slug = 'look-04' and c.slug = 'dresses';
insert into public.product_collections (product_id, collection_id) select p.id, c.id from public.products p, public.collections c where p.slug = 'piece-01' and c.slug = 'outerwear';
insert into public.product_collections (product_id, collection_id) select p.id, c.id from public.products p, public.collections c where p.slug = 'piece-02' and c.slug = 'accessories';
insert into public.product_collections (product_id, collection_id) select p.id, c.id from public.products p, public.collections c where p.slug = 'piece-03' and c.slug = 'the-signature-edit';
insert into public.product_collections (product_id, collection_id) select p.id, c.id from public.products p, public.collections c where p.slug = 'piece-04' and c.slug = 'best-sellers';
insert into public.product_collections (product_id, collection_id) select p.id, c.id from public.products p, public.collections c where p.slug = 'piece-05' and c.slug = 'co-ord-sets';
insert into public.product_collections (product_id, collection_id) select p.id, c.id from public.products p, public.collections c where p.slug = 'piece-06' and c.slug = 'dresses';
insert into public.product_collections (product_id, collection_id) select p.id, c.id from public.products p, public.collections c where p.slug = 'piece-07' and c.slug = 'outerwear';
insert into public.product_collections (product_id, collection_id) select p.id, c.id from public.products p, public.collections c where p.slug = 'piece-08' and c.slug = 'accessories';
insert into public.product_collections (product_id, collection_id) select p.id, c.id from public.products p, public.collections c where p.slug = 'style-09' and c.slug = 'the-signature-edit';
insert into public.product_collections (product_id, collection_id) select p.id, c.id from public.products p, public.collections c where p.slug = 'style-10' and c.slug = 'best-sellers';
insert into public.product_collections (product_id, collection_id) select p.id, c.id from public.products p, public.collections c where p.slug = 'style-11' and c.slug = 'co-ord-sets';
insert into public.product_collections (product_id, collection_id) select p.id, c.id from public.products p, public.collections c where p.slug = 'style-12' and c.slug = 'dresses';
