-- Lets the admin's drag-to-reorder on a collection's product list actually
-- persist, instead of resetting to insertion order on next load.
alter table public.product_collections add column position integer not null default 0;
