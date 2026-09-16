import { createClient } from "@/lib/supabase/client";
import { matchesSearch, sortBy, paginate } from "../utils/list-query";
import { logActivity } from "./activity-service";

function computeStatus(discount) {
  if (!discount.active) return "disabled";
  const now = Date.now();
  const start = new Date(discount.startDate).getTime();
  const end = discount.endDate ? new Date(discount.endDate).getTime() : null;
  if (start > now) return "scheduled";
  if (end && end < now) return "expired";
  return "active";
}

function mapDiscountRow(row) {
  const discount = {
    id: row.id,
    code: row.code,
    type: row.type,
    value: Number(row.value),
    minOrderAmount: Number(row.min_order_amount),
    productIds: (row.discount_products ?? []).map((p) => p.product_id),
    collectionIds: (row.discount_collections ?? []).map((c) => c.collection_id),
    usageLimit: row.usage_limit,
    usageCount: row.usage_count,
    startDate: row.start_date,
    endDate: row.end_date,
    active: row.active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
  discount.status = computeStatus(discount);
  return discount;
}

// Only sets keys that are actually present in `input` — createDiscount
// passes a fully zod-validated object, but updateDiscount can receive a
// partial patch (e.g. toggleDiscountActive only sends { active }), and a
// blanket `?? default` here would silently zero out every other column.
function toRow(input) {
  const row = {};
  if (input.code !== undefined) row.code = input.code;
  if (input.type !== undefined) row.type = input.type;
  if (input.value !== undefined) row.value = input.value;
  if (input.minOrderAmount !== undefined) row.min_order_amount = input.minOrderAmount;
  if (input.usageLimit !== undefined) row.usage_limit = input.usageLimit;
  if (input.startDate !== undefined) row.start_date = input.startDate;
  if (input.endDate !== undefined) row.end_date = input.endDate;
  if (input.active !== undefined) row.active = input.active;
  return row;
}

const DISCOUNT_SELECT = "*, discount_products(product_id), discount_collections(collection_id)";

async function syncLinks(supabase, table, column, discountId, ids) {
  const { data: existing, error: existingError } = await supabase
    .from(table)
    .select(column)
    .eq("discount_id", discountId);
  if (existingError) throw existingError;

  const current = new Set((existing ?? []).map((row) => row[column]));
  const next = new Set(ids ?? []);
  const toAdd = [...next].filter((id) => !current.has(id));
  const toRemove = [...current].filter((id) => !next.has(id));

  if (toAdd.length) {
    const { error } = await supabase
      .from(table)
      .insert(toAdd.map((id) => ({ discount_id: discountId, [column]: id })));
    if (error) throw error;
  }
  if (toRemove.length) {
    const { error } = await supabase.from(table).delete().eq("discount_id", discountId).in(column, toRemove);
    if (error) throw error;
  }
}

export async function listDiscounts({
  search = "",
  status = "all",
  sort = { field: "createdAt", direction: "desc" },
  page = 1,
  pageSize = 10,
} = {}) {
  const supabase = createClient();
  const { data, error } = await supabase.from("discounts").select(DISCOUNT_SELECT);
  if (error) throw error;

  const all = data.map(mapDiscountRow);
  const filtered = all.filter((d) => {
    if (status !== "all" && d.status !== status) return false;
    return matchesSearch(d, search, ["code"]);
  });
  const sorted = sortBy(filtered, sort);
  return paginate(sorted, { page, pageSize });
}

export async function getDiscount(id) {
  const supabase = createClient();
  const { data, error } = await supabase.from("discounts").select(DISCOUNT_SELECT).eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? mapDiscountRow(data) : null;
}

export async function createDiscount(input) {
  const supabase = createClient();
  const { data, error } = await supabase.from("discounts").insert(toRow(input)).select().single();
  if (error) throw error;

  await Promise.all([
    syncLinks(supabase, "discount_products", "product_id", data.id, input.productIds),
    syncLinks(supabase, "discount_collections", "collection_id", data.id, input.collectionIds),
  ]);

  const discount = await getDiscount(data.id);
  logActivity({ action: "created discount", resourceType: "discount", resourceId: discount.id, resourceLabel: discount.code });
  return discount;
}

export async function updateDiscount(id, patch) {
  const supabase = createClient();
  const { error } = await supabase.from("discounts").update(toRow(patch)).eq("id", id);
  if (error) throw error;

  await Promise.all([
    patch.productIds !== undefined ? syncLinks(supabase, "discount_products", "product_id", id, patch.productIds) : null,
    patch.collectionIds !== undefined
      ? syncLinks(supabase, "discount_collections", "collection_id", id, patch.collectionIds)
      : null,
  ]);

  const updated = await getDiscount(id);
  logActivity({ action: "updated discount", resourceType: "discount", resourceId: id, resourceLabel: updated.code });
  return updated;
}

export async function deleteDiscount(id) {
  const supabase = createClient();
  const discount = await getDiscount(id);
  const { error } = await supabase.from("discounts").delete().eq("id", id);
  if (error) throw error;
  if (discount) {
    logActivity({ action: "deleted discount", resourceType: "discount", resourceId: id, resourceLabel: discount.code });
  }
}

export async function toggleDiscountActive(id) {
  const existing = await getDiscount(id);
  if (!existing) throw new Error("Discount not found");
  return updateDiscount(id, { active: !existing.active });
}
