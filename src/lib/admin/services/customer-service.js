import { createClient } from "@/lib/supabase/client";
import { matchesSearch, sortBy, paginate } from "../utils/list-query";
import { logActivity } from "./activity-service";

const SEARCH_FIELDS = ["name", "email", "phone"];

function toneFromString(value = "") {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) hash = (hash * 31 + value.charCodeAt(i)) % 5;
  return hash;
}

// ordersCount/totalSpent/etc. are computed live from real orders rather
// than trusted from the customers table's own denormalized columns —
// nothing currently keeps those in sync on write, so they'd just drift.
function enrichCustomer(row, orders) {
  const paid = orders.filter((o) => o.payment_status !== "failed");
  const ordersCount = paid.length;
  const totalSpent = paid.reduce((sum, o) => sum + Number(o.total), 0);
  const lastOrderAt = paid.reduce((latest, o) => (!latest || o.created_at > latest ? o.created_at : latest), null);
  const averageOrderValue = ordersCount ? Math.round(totalSpent / ordersCount) : 0;

  const daysSinceCreated = (Date.now() - new Date(row.created_at).getTime()) / 86400000;
  const daysSinceOrder = lastOrderAt ? (Date.now() - new Date(lastOrderAt).getTime()) / 86400000 : Infinity;

  let segment;
  if (ordersCount === 0 && daysSinceCreated < 30) segment = "new";
  else if (ordersCount >= 5 || totalSpent >= 600000) segment = "high-value";
  else if (daysSinceOrder > 75) segment = "inactive";
  else segment = "returning";

  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    tone: toneFromString(row.email),
    address: row.address ?? {},
    ordersCount,
    totalSpent,
    averageOrderValue,
    lastOrderAt,
    segment,
    createdAt: row.created_at,
    notes: row.notes ?? "",
  };
}

async function fetchAllCustomers() {
  const supabase = createClient();
  const [{ data: customers, error: customersError }, { data: orders, error: ordersError }] = await Promise.all([
    supabase.from("customers").select("*"),
    supabase.from("orders").select("customer_id, total, payment_status, created_at"),
  ]);

  if (customersError) throw customersError;
  if (ordersError) throw ordersError;

  const ordersByCustomer = new Map();
  for (const order of orders) {
    const list = ordersByCustomer.get(order.customer_id) ?? [];
    list.push(order);
    ordersByCustomer.set(order.customer_id, list);
  }

  return customers.map((row) => enrichCustomer(row, ordersByCustomer.get(row.id) ?? []));
}

export function filterCustomers(customers, { search, segment = "all" } = {}) {
  return customers.filter((customer) => {
    if (segment !== "all" && customer.segment !== segment) return false;
    return matchesSearch(customer, search, SEARCH_FIELDS);
  });
}

export async function listCustomers({
  search = "",
  segment = "all",
  sort = { field: "totalSpent", direction: "desc" },
  page = 1,
  pageSize = 10,
} = {}) {
  const all = await fetchAllCustomers();
  const filtered = filterCustomers(all, { search, segment });
  const sorted = sortBy(filtered, sort);
  return paginate(sorted, { page, pageSize });
}

export async function getCustomer(id) {
  const supabase = createClient();
  const [{ data: row, error: customerError }, { data: orders, error: ordersError }] = await Promise.all([
    supabase.from("customers").select("*").eq("id", id).maybeSingle(),
    supabase.from("orders").select("customer_id, total, payment_status, created_at").eq("customer_id", id),
  ]);

  if (customerError) throw customerError;
  if (ordersError) throw ordersError;
  return row ? enrichCustomer(row, orders ?? []) : null;
}

export async function getCustomerOrders(id) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("id, order_number, total, fulfillment_status, created_at")
    .eq("customer_id", id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data.map((row) => ({
    id: row.id,
    orderNumber: row.order_number,
    total: Number(row.total),
    fulfillmentStatus: row.fulfillment_status,
    createdAt: row.created_at,
  }));
}

export async function addCustomerNote(id, note) {
  const supabase = createClient();
  const { error } = await supabase.from("customers").update({ notes: note }).eq("id", id);
  if (error) throw error;

  const updated = await getCustomer(id);
  logActivity({ action: "added a note to", resourceType: "customer", resourceId: id, resourceLabel: updated.name });
  return updated;
}
