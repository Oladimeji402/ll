import { useProductsStore } from "../store/products-store";
import { useOrdersStore } from "../store/orders-store";
import { useCustomersStore } from "../store/customers-store";
import { useCollectionsStore } from "../store/collections-store";

/**
 * Powers the ⌘K command palette. Pure/sync (no simulated latency) so the
 * palette feels instant while typing.
 */
export function globalSearch(term) {
  const needle = term.trim().toLowerCase();
  if (!needle) return { products: [], orders: [], customers: [], collections: [] };

  const products = useProductsStore
    .getState()
    .items.filter((p) => p.title.toLowerCase().includes(needle) || p.sku.toLowerCase().includes(needle))
    .slice(0, 5)
    .map((p) => ({ id: p.id, label: p.title, meta: p.sku, href: `/admin/products/${p.id}` }));

  const orders = useOrdersStore
    .getState()
    .items.filter(
      (o) =>
        o.orderNumber.toLowerCase().includes(needle) || o.customerName.toLowerCase().includes(needle),
    )
    .slice(0, 5)
    .map((o) => ({ id: o.id, label: o.orderNumber, meta: o.customerName, href: `/admin/orders/${o.id}` }));

  const customers = useCustomersStore
    .getState()
    .items.filter((c) => c.name.toLowerCase().includes(needle) || c.email.toLowerCase().includes(needle))
    .slice(0, 5)
    .map((c) => ({ id: c.id, label: c.name, meta: c.email, href: `/admin/customers/${c.id}` }));

  const collections = useCollectionsStore
    .getState()
    .items.filter((c) => c.title.toLowerCase().includes(needle))
    .slice(0, 5)
    .map((c) => ({ id: c.id, label: c.title, meta: `${c.productIds.length} products`, href: `/admin/collections/${c.id}` }));

  return { products, orders, customers, collections };
}
