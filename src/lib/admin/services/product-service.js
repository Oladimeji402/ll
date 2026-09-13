import { useProductsStore } from "../store/products-store";
import { useCollectionsStore } from "../store/collections-store";
import { useOrdersStore } from "../store/orders-store";
import { generateId, generateSku } from "../utils/id";
import { simulateLatency } from "../utils/async";
import { matchesSearch, sortBy, paginate } from "../utils/list-query";
import { logActivity } from "./activity-service";
import { pushNotification } from "./notification-service";

const SEARCH_FIELDS = ["title", "sku", "category"];

export function filterProducts(products, { search, status, category, collectionId } = {}) {
  return products.filter((product) => {
    if (status && status !== "all" && product.status !== status) return false;
    if (category && category !== "all" && product.category !== category) return false;
    if (collectionId && !product.collectionIds.includes(collectionId)) return false;
    return matchesSearch(product, search, SEARCH_FIELDS);
  });
}

export async function listProducts({
  search = "",
  status = "all",
  category = "all",
  collectionId = null,
  sort = { field: "updatedAt", direction: "desc" },
  page = 1,
  pageSize = 10,
} = {}) {
  await simulateLatency();
  const all = useProductsStore.getState().items;
  const filtered = filterProducts(all, { search, status, category, collectionId });
  const sorted = sortBy(filtered, sort);
  return paginate(sorted, { page, pageSize });
}

export async function getProduct(id) {
  await simulateLatency(250);
  return useProductsStore.getState().items.find((p) => p.id === id) ?? null;
}

export function getProductSync(id) {
  return useProductsStore.getState().items.find((p) => p.id === id) ?? null;
}

function syncCollectionMembership(product) {
  const collections = useCollectionsStore.getState().items.map((collection) => {
    const has = collection.productIds.includes(product.id);
    const should = product.collectionIds.includes(collection.id);
    if (has === should) return collection;
    return {
      ...collection,
      productIds: should
        ? [...collection.productIds, product.id]
        : collection.productIds.filter((id) => id !== product.id),
    };
  });
  useCollectionsStore.getState()._setAll(collections);
}

export async function createProduct(input) {
  await simulateLatency(500);
  const now = new Date().toISOString();
  const id = generateId("prod");
  const sku = input.sku?.trim() || generateSku(input.title, Math.floor(Math.random() * 9000) + 1000);

  const variants =
    input.sizes.length && input.colors.length
      ? input.sizes.flatMap((size) =>
          input.colors.map((color) => ({
            id: generateId("var"),
            size,
            color,
            sku: `${sku}-${size}${color[0]}`,
            quantity: Math.round(input.quantity / (input.sizes.length * input.colors.length)),
          })),
        )
      : [];

  const product = {
    id,
    ...input,
    sku,
    variants,
    tags: input.tags?.length ? input.tags : [input.category].filter(Boolean),
    unitsSold: 0,
    revenue: 0,
    createdAt: now,
    updatedAt: now,
  };

  useProductsStore.getState()._upsert(product);
  syncCollectionMembership(product);
  logActivity({ action: "created product", resourceType: "product", resourceId: id, resourceLabel: product.title });
  return product;
}

export async function updateProduct(id, patch) {
  await simulateLatency(450);
  const existing = getProductSync(id);
  if (!existing) throw new Error("Product not found");
  const updated = { ...existing, ...patch, updatedAt: new Date().toISOString() };
  useProductsStore.getState()._upsert(updated);
  syncCollectionMembership(updated);
  logActivity({ action: "updated", resourceType: "product", resourceId: id, resourceLabel: updated.title });

  if (patch.quantity != null && patch.quantity <= updated.lowStockThreshold) {
    pushNotification({
      type: patch.quantity === 0 ? "out-of-stock" : "low-stock",
      title: patch.quantity === 0 ? "Product out of stock" : "Low stock warning",
      body: `${updated.title} has ${patch.quantity} unit(s) left.`,
      href: "/admin/inventory",
    });
  }
  return updated;
}

export async function deleteProduct(id) {
  await simulateLatency(400);
  const product = getProductSync(id);
  useProductsStore.getState()._remove(id);
  if (product) {
    const collections = useCollectionsStore
      .getState()
      .items.map((c) => ({ ...c, productIds: c.productIds.filter((pid) => pid !== id) }));
    useCollectionsStore.getState()._setAll(collections);
    logActivity({ action: "deleted product", resourceType: "product", resourceId: id, resourceLabel: product.title });
  }
}

export async function bulkUpdateStatus(ids, status) {
  await simulateLatency(400);
  const now = new Date().toISOString();
  const updated = useProductsStore
    .getState()
    .items.filter((p) => ids.includes(p.id))
    .map((p) => ({ ...p, status, updatedAt: now }));
  useProductsStore.getState()._upsertMany(updated);
  logActivity({
    action: `bulk-updated ${ids.length} product(s) to`,
    resourceType: "product",
    resourceId: ids.join(","),
    resourceLabel: status,
    details: `Changed status of ${ids.length} product(s) to "${status}"`,
  });
  return updated;
}

export async function bulkArchive(ids) {
  return bulkUpdateStatus(ids, "archived");
}

export function getProductPerformance(id) {
  const product = getProductSync(id);
  if (!product) return null;
  const orders = useOrdersStore
    .getState()
    .items.filter((order) => order.items.some((item) => item.productId === id))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return { unitsSold: product.unitsSold, revenue: product.revenue, recentOrders: orders.slice(0, 8) };
}

export function getCategories() {
  return Array.from(new Set(useProductsStore.getState().items.map((p) => p.category)));
}
