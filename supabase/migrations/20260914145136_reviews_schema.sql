-- Product reviews. Submitting one doesn't require an account (matches the
-- existing "Write a Review" modal, which only ever asked for name/email) —
-- so anon can insert, gated by sane CHECK constraints rather than RLS.
--
-- Reviewer email is collected but never exposed publicly: the base table
-- stays staff-only for reads, and public traffic reads through the
-- reviews_public view below, which omits it entirely.

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  author_name text not null check (length(trim(author_name)) > 0),
  author_email text not null check (author_email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  body text not null check (length(trim(body)) > 0 and length(body) <= 2000),
  status text not null default 'published' check (status in ('pending', 'published', 'rejected')),
  created_at timestamptz not null default now()
);

create index reviews_product_id_idx on public.reviews (product_id);

alter table public.reviews enable row level security;

create policy "Anyone can submit a review"
  on public.reviews for insert
  with check (true);

create policy "Staff manage reviews"
  on public.reviews for all
  using (public.is_staff())
  with check (public.is_staff());

create view public.reviews_public
with (security_invoker = false) as
select id, product_id, rating, author_name, body, created_at
from public.reviews
where status = 'published';
