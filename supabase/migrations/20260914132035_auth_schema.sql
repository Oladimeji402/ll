-- Authentication schema: links Supabase Auth (auth.users) to app-level
-- customer profiles and staff accounts, with role-based RLS.

create type public.staff_role as enum ('Owner', 'Admin', 'Manager', 'Editor', 'Support');
create type public.staff_status as enum ('active', 'invited', 'suspended');
create type public.customer_segment as enum ('new', 'returning', 'high-value', 'inactive');

create table public.customers (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null default '',
  email text not null unique,
  phone text not null default '',
  address jsonb not null default '{}'::jsonb,
  orders_count integer not null default 0,
  total_spent numeric(12, 2) not null default 0,
  average_order_value numeric(12, 2) not null default 0,
  last_order_at timestamptz,
  segment public.customer_segment not null default 'new',
  notes text not null default '',
  created_at timestamptz not null default now()
);

create table public.staff_members (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null default '',
  email text not null unique,
  role public.staff_role not null default 'Support',
  status public.staff_status not null default 'invited',
  last_active_at timestamptz,
  joined_at timestamptz not null default now()
);

-- SECURITY DEFINER: RLS on staff_members would otherwise block this check
-- from within another table's policy (the querying user may not have a
-- staff_members row yet, or may not be allowed to read others' rows).
create function public.is_staff()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.staff_members
    where id = auth.uid() and status = 'active'
  );
$$;

create function public.current_staff_role()
returns public.staff_role
language sql
security definer
set search_path = public
stable
as $$
  select role from public.staff_members
  where id = auth.uid() and status = 'active';
$$;

-- New auth.users rows become customers by default. Admin-initiated staff
-- invites pass account_type/role/name via inviteUserByEmail's user metadata
-- (using the service role key, server-side only) to route into staff_members
-- instead.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.raw_user_meta_data ->> 'account_type' = 'staff' then
    insert into public.staff_members (id, name, email, role, status)
    values (
      new.id,
      coalesce(new.raw_user_meta_data ->> 'name', ''),
      new.email,
      coalesce((new.raw_user_meta_data ->> 'role')::public.staff_role, 'Support'),
      'invited'
    );
  else
    insert into public.customers (id, name, email)
    values (new.id, coalesce(new.raw_user_meta_data ->> 'name', ''), new.email);
  end if;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.customers enable row level security;
alter table public.staff_members enable row level security;

create policy "Customers view own profile"
  on public.customers for select
  using (id = auth.uid());

create policy "Customers update own profile"
  on public.customers for update
  using (id = auth.uid());

create policy "Staff view all customers"
  on public.customers for select
  using (public.is_staff());

create policy "Staff update customers"
  on public.customers for update
  using (public.is_staff());

create policy "Staff view directory"
  on public.staff_members for select
  using (public.is_staff());

create policy "Owners and admins manage staff"
  on public.staff_members for all
  using (public.current_staff_role() in ('Owner', 'Admin'))
  with check (public.current_staff_role() in ('Owner', 'Admin'));
