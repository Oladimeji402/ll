-- The profile page upserts (insert-or-update) so it self-heals for an
-- authenticated user who doesn't have a customers row yet.
create policy "Customers insert own profile"
  on public.customers for insert
  with check (id = auth.uid());
