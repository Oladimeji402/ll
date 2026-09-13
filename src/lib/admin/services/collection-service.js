import { slugify } from "@/lib/utils";
import { useCollectionsStore } from "../store/collections-store";
import { useProductsStore } from "../store/products-store";
import { generateId } from "../utils/id";
import { simulateLatency } from "../utils/async";
import { matchesSearch, sortBy } from "../utils/list-query";
import { logActivity } from "./activity-service";

export async function listCollections({ search = "", sort = { field: "position", direction: "asc" } } = {}) {
  await simulateLatency(250);
  const all = useCollectionsStore.getState().items;
  const filtered = all.filter((c) => matchesSearch(c, search, ["title", "slug"]));
  return sortBy(filtered, sort);
}

export async function getCollection(id) {
  await simulateLatency(250);
  return useCollectionsStore.getState().items.find((c) => c.id === id) ?? null;
}

export function getCollectionSync(id) {
  return useCollectionsStore.getState().items.find((c) => c.id === id) ?? null;
}

export function getCollectionProducts(id) {
  const collection = getCollectionSync(id);
  if (!collection) return [];
  const products = useProductsStore.getState().items;
  return collection.productIds
    .map((productId) => products.find((p) => p.id === productId))
    .filter(Boolean);
}

export async function createCollection(input) {
  await simulateLatency(450);
  const now = new Date().toISOString();
  const id = slugify(input.title) || generateId("coll");
  const position = useCollectionsStore.getState().items.length;
  const collection = { id, ...input, productIds: [], position, createdAt: now, updatedAt: now };
  useCollectionsStore.getState()._upsert(collection);
  logActivity({ action: "created collection", resourceType: "collection", resourceId: id, resourceLabel: collection.title });
  return collection;
}

export async function updateCollection(id, patch) {
  await simulateLatency(400);
  const existing = getCollectionSync(id);
  if (!existing) throw new Error("Collection not found");
  const updated = { ...existing, ...patch, updatedAt: new Date().toISOString() };
  useCollectionsStore.getState()._upsert(updated);
  logActivity({ action: "updated collection", resourceType: "collection", resourceId: id, resourceLabel: updated.title });
  return updated;
}

export async function deleteCollection(id) {
  await simulateLatency(400);
  const collection = getCollectionSync(id);
  useCollectionsStore.getState()._remove(id);
  if (collection) {
    const products = useProductsStore
      .getState()
      .items.map((p) =>
        p.collectionIds.includes(id)
          ? { ...p, collectionIds: p.collectionIds.filter((cid) => cid !== id) }
          : p,
      );
    useProductsStore.getState()._upsertMany(products);
    logActivity({ action: "deleted collection", resourceType: "collection", resourceId: id, resourceLabel: collection.title });
  }
}

export async function reorderCollectionProducts(id, orderedProductIds) {
  await simulateLatency(300);
  return updateCollection(id, { productIds: orderedProductIds });
}

export async function addProductToCollection(collectionId, productId) {
  await simulateLatency(300);
  const collection = getCollectionSync(collectionId);
  if (!collection || collection.productIds.includes(productId)) return collection;
  const updatedCollection = await updateCollection(collectionId, {
    productIds: [...collection.productIds, productId],
  });
  const product = useProductsStore.getState().items.find((p) => p.id === productId);
  if (product && !product.collectionIds.includes(collectionId)) {
    useProductsStore.getState()._upsert({ ...product, collectionIds: [...product.collectionIds, collectionId] });
  }
  return updatedCollection;
}

export async function removeProductFromCollection(collectionId, productId) {
  await simulateLatency(300);
  const collection = getCollectionSync(collectionId);
  if (!collection) return null;
  const updatedCollection = await updateCollection(collectionId, {
    productIds: collection.productIds.filter((id) => id !== productId),
  });
  const product = useProductsStore.getState().items.find((p) => p.id === productId);
  if (product) {
    useProductsStore.getState()._upsert({
      ...product,
      collectionIds: product.collectionIds.filter((id) => id !== collectionId),
    });
  }
  return updatedCollection;
}
