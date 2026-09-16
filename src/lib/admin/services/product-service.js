import { createClient } from "@/lib/supabase/client";
import { matchesSearch, sortBy, paginate } from "../utils/list-query";
import { logActivity } from "./activity-service";
import { pushNotification } from "./notification-service";

const SEARCH_FIELDS = ["title", "sku", "category"];

function mapProductRow(row) {
  const collectionIds = (row.product_collections ?? []).map((pc) => pc.collection_id);
  const variants =
    row.sizes.length && row.colors.length
      ? row.sizes.flatMap((size) =>
          row.colors.map((color) => ({
            id: `${size}-${color}`,
            size,
            color,
            sku: `${row.sku}-${size}${color[0]}`,
            quantity: Math.round(row.quantity / (row.sizes.length * row.colors.length)),
          })),
        )
      : [];

  return {
    id: row.id,
    title: row.title,
    description: row.description,
    slug: row.slug,
    price: Number(row.price),
    compareAtPrice: row.compare_at_price == null ? null : Number(row.compare_at_price),
    category: row.category,
    collectionIds,
    tags: row.tags,
    sizes: row.sizes,
    colors: row.colors,
    sku: row.sku,
    quantity: row.quantity,
    lowStockThreshold: row.low_stock_threshold,
    status: row.status,
    seoTitle: row.seo_title,
    seoDescription: row.seo_description,
    images: row.images,
    variants,
    unitsSold: row.units_sold,
    revenue: Number(row.revenue),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toRow(input) {
  return {
    title: input.title,
    description: input.description ?? "",
    slug: input.slug,
    price: input.price,
    compare_at_price: input.compareAtPrice ?? null,
    category: input.category,
    tags: input.tags?.length ? input.tags : [input.category].filter(Boolean),
    sizes: input.sizes ?? [],
    colors: input.colors ?? [],
    sku: input.sku,
    quantity: input.quantity ?? 0,
    low_stock_threshold: input.lowStockThreshold ?? 5,
    status: input.status ?? "draft",
    seo_title: input.seoTitle ?? "",
    seo_description: input.seoDescription ?? "",
    images: input.images ?? [],
  };
}

async function fetchAllProducts() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, product_collections(collection_id)")
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return data.map(mapProductRow);
}

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
  const all = await fetchAllProducts();
  const filtered = filterProducts(all, { search, status, category, collectionId });
  const sorted = sortBy(filtered, sort);
  return paginate(sorted, { page, pageSize });
}

export async function getProduct(id) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, product_collections(collection_id)")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data ? mapProductRow(data) : null;
}

async function syncCollectionMembership(supabase, productId, collectionIds) {
  const { data: existing, error: existingError } = await supabase
    .from("product_collections")
    .select("collection_id")
    .eq("product_id", productId);
  if (existingError) throw existingError;

  const current = new Set((existing ?? []).map((row) => row.collection_id));
  const next = new Set(collectionIds ?? []);

  const toAdd = [...next].filter((id) => !current.has(id));
  const toRemove = [...current].filter((id) => !next.has(id));

  if (toAdd.length) {
    const { error } = await supabase
      .from("product_collections")
      .insert(toAdd.map((collectionId) => ({ product_id: productId, collection_id: collectionId })));
    if (error) throw error;
  }
  if (toRemove.length) {
    const { error } = await supabase
      .from("product_collections")
      .delete()
      .eq("product_id", productId)
      .in("collection_id", toRemove);
    if (error) throw error;
  }
}

export async function createProduct(input) {
  const supabase = createClient();
  const row = toRow(input);

  const { data, error } = await supabase.from("products").insert(row).select().single();
  if (error) throw error;

  if (input.collectionIds?.length) {
    await syncCollectionMembership(supabase, data.id, input.collectionIds);
  }

  const product = mapProductRow({ ...data, product_collections: (input.collectionIds ?? []).map((id) => ({ collection_id: id })) });
  logActivity({ action: "created product", resourceType: "product", resourceId: product.id, resourceLabel: product.title });
  return product;
}

export async function updateProduct(id, patch) {
  const supabase = createClient();
  const row = toRow(patch);

  const { data, error } = await supabase.from("products").update(row).eq("id", id).select().single();
  if (error) throw error;

  if (patch.collectionIds) {
    await syncCollectionMembership(supabase, id, patch.collectionIds);
  }

  const updated = await getProduct(id);
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
  const supabase = createClient();
  const product = await getProduct(id);
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;
  if (product) {
    logActivity({ action: "deleted product", resourceType: "product", resourceId: id, resourceLabel: product.title });
  }
}

export async function bulkUpdateStatus(ids, status) {
  const supabase = createClient();
  const { data, error } = await supabase.from("products").update({ status }).in("id", ids).select();
  if (error) throw error;
  logActivity({
    action: `bulk-updated ${ids.length} product(s) to`,
    resourceType: "product",
    resourceId: ids.join(","),
    resourceLabel: status,
    details: `Changed status of ${ids.length} product(s) to "${status}"`,
  });
  return data;
}

export async function bulkArchive(ids) {
  return bulkUpdateStatus(ids, "archived");
}

export async function getProductPerformance(id) {
  const product = await getProduct(id);
  if (!product) return null;
  // Real order-linked sales history isn't wired up yet — admin orders are
  // still a separate mock domain (see orders-store).
  return { unitsSold: product.unitsSold, revenue: product.revenue, recentOrders: [] };
}

export async function getCategories() {
  const supabase = createClient();
  const { data, error } = await supabase.from("products").select("category");
  if (error) throw error;
  return Array.from(new Set(data.map((row) => row.category).filter(Boolean)));
}
