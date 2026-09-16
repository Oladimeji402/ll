import { createClient } from "@/lib/supabase/client";
import { matchesSearch, sortBy, paginate } from "../utils/list-query";

const SEARCH_FIELDS = ["reference", "orderNumber", "customerName"];

// Payments aren't a separate table — no gateway is wired up yet, so a
// "payment" is just the payment side of a real order. One row per order.
const STATUS_MAP = { paid: "successful", pending: "pending", failed: "failed", refunded: "refunded" };

function mapOrderToPayment(row) {
  return {
    id: row.id,
    reference: row.order_number,
    orderId: row.id,
    orderNumber: row.order_number,
    customerName: row.customer_name,
    amount: Number(row.total),
    method: row.payment_method === "unassigned" ? "—" : row.payment_method,
    status: STATUS_MAP[row.payment_status] ?? row.payment_status,
    date: row.created_at,
    gatewayNote: "No payment gateway connected yet.",
  };
}

async function fetchAllPayments() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("id, order_number, customer_name, total, payment_method, payment_status, created_at");
  if (error) throw error;
  return data.map(mapOrderToPayment);
}

export async function listPayments({
  search = "",
  status = "all",
  sort = { field: "date", direction: "desc" },
  page = 1,
  pageSize = 10,
} = {}) {
  const all = await fetchAllPayments();
  const filtered = all.filter((p) => {
    if (status !== "all" && p.status !== status) return false;
    return matchesSearch(p, search, SEARCH_FIELDS);
  });
  const sorted = sortBy(filtered, sort);
  return paginate(sorted, { page, pageSize });
}

export async function getPayment(id) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("id, order_number, customer_name, total, payment_method, payment_status, created_at")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? mapOrderToPayment(data) : null;
}

export async function getPaymentCounts() {
  const all = await fetchAllPayments();
  return {
    all: all.length,
    successful: all.filter((p) => p.status === "successful").length,
    pending: all.filter((p) => p.status === "pending").length,
    failed: all.filter((p) => p.status === "failed").length,
    refunded: all.filter((p) => p.status === "refunded").length,
  };
}
