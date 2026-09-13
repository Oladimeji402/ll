import { useInventoryStore } from "../store/inventory-store";
import { useProductsStore } from "../store/products-store";
import { inventoryStatus } from "../types/inventory";
import { generateId } from "../utils/id";
import { CURRENT_STAFF } from "../utils/current-user";
import { simulateLatency } from "../utils/async";
import { matchesSearch, sortBy, paginate } from "../utils/list-query";
import { logActivity } from "./activity-service";
import { pushNotification } from "./notification-service";

const SEARCH_FIELDS = ["productTitle", "sku"];

export function filterInventory(items, { search, view = "all" } = {}) {
  return items.filter((item) => {
    if (view !== "all" && inventoryStatus(item) !== view) return false;
    return matchesSearch(item, search, SEARCH_FIELDS);
  });
}

export async function listInventory({
  search = "",
  view = "all",
  sort = { field: "available", direction: "asc" },
  page = 1,
  pageSize = 10,
} = {}) {
  await simulateLatency();
  const all = useInventoryStore.getState().items;
  const filtered = filterInventory(all, { search, view });
  const sorted = sortBy(filtered, sort);
  return paginate(sorted, { page, pageSize });
}

export function getInventoryCounts() {
  const all = useInventoryStore.getState().items;
  return {
    all: all.length,
    "in-stock": all.filter((i) => inventoryStatus(i) === "in-stock").length,
    "low-stock": all.filter((i) => inventoryStatus(i) === "low-stock").length,
    "out-of-stock": all.filter((i) => inventoryStatus(i) === "out-of-stock").length,
  };
}

export async function getInventoryItem(id) {
  await simulateLatency(200);
  return useInventoryStore.getState().items.find((i) => i.id === id) ?? null;
}

export async function adjustStock(id, { direction, quantity, reason, note }) {
  await simulateLatency(400);
  const item = useInventoryStore.getState().items.find((i) => i.id === id);
  if (!item) throw new Error("Inventory item not found");

  const change = direction === "decrease" ? -Math.abs(quantity) : Math.abs(quantity);
  const nextAvailable = Math.max(0, item.available + change);
  const entry = {
    id: generateId("inv-hist"),
    date: new Date().toISOString(),
    change,
    reason,
    note: note || "",
    resultingQty: nextAvailable,
    actor: CURRENT_STAFF.name,
  };
  const updated = {
    ...item,
    available: nextAvailable,
    total: nextAvailable + item.reserved,
    history: [...item.history, entry],
  };
  useInventoryStore.getState()._upsert(updated);

  const product = useProductsStore.getState().items.find((p) => p.id === item.productId);
  if (product) {
    useProductsStore.getState()._upsert({ ...product, quantity: nextAvailable, updatedAt: new Date().toISOString() });
  }

  logActivity({
    action: "adjusted inventory for",
    resourceType: "inventory",
    resourceId: id,
    resourceLabel: item.productTitle,
    details: `${direction === "decrease" ? "Removed" : "Added"} ${quantity} unit(s) — ${reason}`,
  });

  const status = inventoryStatus(updated);
  if (status !== "in-stock") {
    pushNotification({
      type: status === "out-of-stock" ? "out-of-stock" : "low-stock",
      title: status === "out-of-stock" ? "Product out of stock" : "Low stock warning",
      body: `${item.productTitle} (${item.sku}) has ${nextAvailable} unit(s) left.`,
      href: "/admin/inventory",
    });
  }

  return updated;
}
