import { createClient } from "@/lib/supabase/client";

/**
 * Powers the ⌘K command palette. The palette debounces keystrokes before
 * calling this, so a real round trip per query is fine.
 */
export async function globalSearch(term) {
  const needle = term.trim();
  if (!needle) return { products: [], orders: [], customers: [], collections: [] };

  const supabase = createClient();
  const pattern = `%${needle}%`;

  const [productsRes, ordersRes, customersRes, collectionsRes] = await Promise.all([
    supabase.from("products").select("id, title, sku").or(`title.ilike.${pattern},sku.ilike.${pattern}`).limit(5),
    supabase
      .from("orders")
      .select("id, order_number, customer_name")
      .or(`order_number.ilike.${pattern},customer_name.ilike.${pattern}`)
      .limit(5),
    supabase.from("customers").select("id, name, email").or(`name.ilike.${pattern},email.ilike.${pattern}`).limit(5),
    supabase.from("collections").select("id, title, product_collections(product_id)").ilike("title", pattern).limit(5),
  ]);

  if (productsRes.error) throw productsRes.error;
  if (ordersRes.error) throw ordersRes.error;
  if (customersRes.error) throw customersRes.error;
  if (collectionsRes.error) throw collectionsRes.error;

  return {
    products: productsRes.data.map((p) => ({ id: p.id, label: p.title, meta: p.sku, href: `/admin/products/${p.id}` })),
    orders: ordersRes.data.map((o) => ({
      id: o.id,
      label: o.order_number,
      meta: o.customer_name,
      href: `/admin/orders/${o.id}`,
    })),
    customers: customersRes.data.map((c) => ({ id: c.id, label: c.name, meta: c.email, href: `/admin/customers/${c.id}` })),
    collections: collectionsRes.data.map((c) => ({
      id: c.id,
      label: c.title,
      meta: `${(c.product_collections ?? []).length} products`,
      href: `/admin/collections/${c.id}`,
    })),
  };
}
