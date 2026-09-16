import { createClient } from "@/lib/supabase/client";
import { matchesSearch, sortBy, paginate } from "../utils/list-query";
import { logActivity } from "./activity-service";

const SEARCH_FIELDS = ["returnNumber", "orderNumber", "customerName"];

function mapReturnRow(row) {
  return {
    id: row.id,
    returnNumber: row.return_number,
    orderId: row.order_id,
    orderNumber: row.orders?.order_number ?? "",
    customerName: row.customer_name,
    items: row.items ?? [],
    reason: row.reason,
    status: row.status,
    refundAmount: Number(row.refund_amount),
    requestedAt: row.requested_at,
    resolvedAt: row.resolved_at,
    notes: row.notes,
    handledBy: row.handled_by,
  };
}

const RETURN_SELECT = "*, orders(order_number)";

async function fetchAllReturns() {
  const supabase = createClient();
  const { data, error } = await supabase.from("returns").select(RETURN_SELECT);
  if (error) throw error;
  return data.map(mapReturnRow);
}

export async function listReturns({
  search = "",
  status = "all",
  sort = { field: "requestedAt", direction: "desc" },
  page = 1,
  pageSize = 10,
} = {}) {
  const all = await fetchAllReturns();
  const filtered = all.filter((r) => {
    if (status !== "all" && r.status !== status) return false;
    return matchesSearch(r, search, SEARCH_FIELDS);
  });
  const sorted = sortBy(filtered, sort);
  return paginate(sorted, { page, pageSize });
}

export async function getReturn(id) {
  const supabase = createClient();
  const { data, error } = await supabase.from("returns").select(RETURN_SELECT).eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? mapReturnRow(data) : null;
}

export async function getReturnCounts() {
  const all = await fetchAllReturns();
  return {
    all: all.length,
    requested: all.filter((r) => r.status === "requested").length,
    approved: all.filter((r) => r.status === "approved").length,
    processing: all.filter((r) => r.status === "processing").length,
    completed: all.filter((r) => r.status === "completed").length,
    rejected: all.filter((r) => r.status === "rejected").length,
  };
}

export async function updateReturnStatus(id, status, note) {
  const supabase = createClient();
  const existing = await getReturn(id);
  if (!existing) throw new Error("Return not found");

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: staff } = user
    ? await supabase.from("staff_members").select("name").eq("id", user.id).maybeSingle()
    : { data: null };

  const resolved = ["completed", "rejected"].includes(status);
  const patch = {
    status,
    notes: note || existing.notes,
    handled_by: staff?.name ?? existing.handledBy,
  };
  if (resolved && !existing.resolvedAt) patch.resolved_at = new Date().toISOString();

  const { error } = await supabase.from("returns").update(patch).eq("id", id);
  if (error) throw error;

  logActivity({
    action: "updated return status for",
    resourceType: "return",
    resourceId: id,
    resourceLabel: existing.returnNumber,
    details: `Marked return ${existing.returnNumber} as ${status}`,
  });
  return getReturn(id);
}
