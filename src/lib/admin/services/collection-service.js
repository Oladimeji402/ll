import { slugify } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { matchesSearch, sortBy } from "../utils/list-query";
import { logActivity } from "./activity-service";

function mapCollectionRow(row) {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    description: row.description,
    tone: row.tone,
    status: row.status,
    seoTitle: row.seo_title,
    seoDescription: row.seo_description,
    productIds: (row.product_collections ?? []).map((pc) => pc.product_id),
    position: row.position,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Only sets keys actually present in `input` — updateCollection's callers
// (e.g. the collection detail page's edit form) send a partial patch that
// omits fields like `tone`, and a blanket `?? default` here would silently
// reset them on every save.
function toRow(input) {
  const row = {};
  if (input.title !== undefined) row.title = input.title;
  if (input.slug !== undefined) row.slug = input.slug;
  if (input.description !== undefined) row.description = input.description;
  if (input.tone !== undefined) row.tone = input.tone;
  if (input.status !== undefined) row.status = input.status;
  if (input.seoTitle !== undefined) row.seo_title = input.seoTitle;
  if (input.seoDescription !== undefined) row.seo_description = input.seoDescription;
  return row;
}

async function fetchAllCollections() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("collections")
    .select("*, product_collections(product_id)")
    .order("position", { ascending: true });

  if (error) throw error;
  return data.map(mapCollectionRow);
}

export async function listCollections({ search = "", sort = { field: "position", direction: "asc" } } = {}) {
  const all = await fetchAllCollections();
  const filtered = all.filter((c) => matchesSearch(c, search, ["title", "slug"]));
  return sortBy(filtered, sort);
}

export async function getCollection(id) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("collections")
    .select("*, product_collections(product_id)")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data ? mapCollectionRow(data) : null;
}

export async function getCollectionProducts(id) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("product_collections")
    .select("products(id, title, slug, price, images)")
    .eq("collection_id", id)
    .order("position", { ascending: true });

  if (error) throw error;
  return (data ?? [])
    .map((row) => row.products)
    .filter(Boolean)
    .map((p) => ({ id: p.id, title: p.title, slug: p.slug, price: Number(p.price), images: p.images }));
}

export async function createCollection(input) {
  const supabase = createClient();
  const { count } = await supabase.from("collections").select("id", { count: "exact", head: true });

  const row = { ...toRow(input), slug: input.slug || slugify(input.title), position: count ?? 0 };
  const { data, error } = await supabase.from("collections").insert(row).select().single();
  if (error) throw error;

  const collection = mapCollectionRow(data);
  logActivity({ action: "created collection", resourceType: "collection", resourceId: collection.id, resourceLabel: collection.title });
  return collection;
}

export async function updateCollection(id, patch) {
  const supabase = createClient();
  const row = toRow(patch);
  const { error } = await supabase.from("collections").update(row).eq("id", id);
  if (error) throw error;

  const updated = await getCollection(id);
  logActivity({ action: "updated collection", resourceType: "collection", resourceId: id, resourceLabel: updated.title });
  return updated;
}

export async function deleteCollection(id) {
  const supabase = createClient();
  const collection = await getCollection(id);
  const { error } = await supabase.from("collections").delete().eq("id", id);
  if (error) throw error;
  if (collection) {
    logActivity({ action: "deleted collection", resourceType: "collection", resourceId: id, resourceLabel: collection.title });
  }
}

export async function reorderCollectionProducts(id, orderedProductIds) {
  const supabase = createClient();
  await Promise.all(
    orderedProductIds.map((productId, index) =>
      supabase
        .from("product_collections")
        .update({ position: index })
        .eq("collection_id", id)
        .eq("product_id", productId),
    ),
  );
  return getCollection(id);
}

export async function addProductToCollection(collectionId, productId) {
  const supabase = createClient();
  const { count } = await supabase
    .from("product_collections")
    .select("product_id", { count: "exact", head: true })
    .eq("collection_id", collectionId);

  const { error } = await supabase
    .from("product_collections")
    .upsert(
      { collection_id: collectionId, product_id: productId, position: count ?? 0 },
      { onConflict: "product_id,collection_id" },
    );
  if (error) throw error;
  return getCollection(collectionId);
}

export async function removeProductFromCollection(collectionId, productId) {
  const supabase = createClient();
  const { error } = await supabase
    .from("product_collections")
    .delete()
    .eq("collection_id", collectionId)
    .eq("product_id", productId);
  if (error) throw error;
  return getCollection(collectionId);
}
