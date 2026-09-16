import { createClient } from "@/lib/supabase/client";
import { inventoryStatus } from "../types/inventory";
import { matchesSearch, sortBy, paginate } from "../utils/list-query";
import { logActivity } from "./activity-service";
import { pushNotification } from "./notification-service";

const SEARCH_FIELDS = ["productTitle", "sku"];

// One inventory row per product — "available" is just products.quantity,
// the same column the storefront reads. There's no reserved-stock concept
// yet (nothing holds stock at order time), so it's always 0 for now.
function mapProductToInventoryItem(row, history = []) {
  const available = row.quantity;
  return {
    id: row.id,
    productId: row.id,
    productTitle: row.title,
    sku: row.sku,
    tone: row.tone,
    available,
    reserved: 0,
    total: available,
    lowStockThreshold: row.low_stock_threshold,
    history: history.map((h) => ({
      id: h.id,
      date: h.created_at,
      change: h.change,
      reason: h.reason,
      note: h.note,
      resultingQty: h.resulting_quantity,
      actor: h.actor_name,
    })),
  };
}

async function fetchAllInventory() {
  const supabase = createClient();
  const { data, error } = await supabase.from("products").select("*");
  if (error) throw error;
  return data.map((row) => mapProductToInventoryItem(row));
}

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
  const all = await fetchAllInventory();
  const filtered = filterInventory(all, { search, view });
  const sorted = sortBy(filtered, sort);
  return paginate(sorted, { page, pageSize });
}

export async function getInventoryCounts() {
  const all = await fetchAllInventory();
  return {
    all: all.length,
    "in-stock": all.filter((i) => inventoryStatus(i) === "in-stock").length,
    "low-stock": all.filter((i) => inventoryStatus(i) === "low-stock").length,
    "out-of-stock": all.filter((i) => inventoryStatus(i) === "out-of-stock").length,
  };
}

export async function getInventoryItem(id) {
  const supabase = createClient();
  const [{ data: row, error: productError }, { data: history, error: historyError }] = await Promise.all([
    supabase.from("products").select("*").eq("id", id).maybeSingle(),
    supabase
      .from("inventory_adjustments")
      .select("*")
      .eq("product_id", id)
      .order("created_at", { ascending: true }),
  ]);

  if (productError) throw productError;
  if (historyError) throw historyError;
  return row ? mapProductToInventoryItem(row, history ?? []) : null;
}

export async function adjustStock(id, { direction, quantity, reason, note }) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: staff } = user
    ? await supabase.from("staff_members").select("name").eq("id", user.id).maybeSingle()
    : { data: null };

  const item = await getInventoryItem(id);
  if (!item) throw new Error("Inventory item not found");

  const change = direction === "decrease" ? -Math.abs(quantity) : Math.abs(quantity);
  const nextAvailable = Math.max(0, item.available + change);

  const { error: updateError } = await supabase
    .from("products")
    .update({ quantity: nextAvailable })
    .eq("id", id);
  if (updateError) throw updateError;

  const { error: historyError } = await supabase.from("inventory_adjustments").insert({
    product_id: id,
    change,
    reason,
    note: note || "",
    resulting_quantity: nextAvailable,
    actor_id: user?.id ?? null,
    actor_name: staff?.name ?? "",
  });
  if (historyError) throw historyError;

  logActivity({
    action: "adjusted inventory for",
    resourceType: "inventory",
    resourceId: id,
    resourceLabel: item.productTitle,
    details: `${direction === "decrease" ? "Removed" : "Added"} ${quantity} unit(s) — ${reason}`,
  });

  const updated = await getInventoryItem(id);
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
