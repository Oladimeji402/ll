import { createClient } from "@/lib/supabase/client";
import { matchesSearch, sortBy, paginate } from "../utils/list-query";
import { logActivity } from "./activity-service";
import { pushNotification } from "./notification-service";

export const ORDER_VIEWS = {
  all: () => true,
  unfulfilled: (o) => o.fulfillmentStatus === "unfulfilled",
  unpaid: (o) => o.paymentStatus === "pending" || o.paymentStatus === "failed",
  processing: (o) => o.fulfillmentStatus === "processing",
  shipped: (o) => o.fulfillmentStatus === "shipped",
  delivered: (o) => o.fulfillmentStatus === "delivered",
  cancelled: (o) => o.fulfillmentStatus === "cancelled",
  returned: (o) => o.fulfillmentStatus === "returned",
};

const SEARCH_FIELDS = ["orderNumber", "customerName", "email"];

function mapOrderRow(row) {
  return {
    id: row.id,
    orderNumber: row.order_number,
    customerId: row.customer_id,
    customerName: row.customer_name,
    email: row.email,
    items: (row.order_items ?? []).map((item) => ({
      id: item.id,
      productId: item.product_id,
      title: item.title,
      variant: item.variant,
      sku: item.sku,
      tone: item.tone,
      quantity: item.quantity,
      price: Number(item.price),
    })),
    subtotal: Number(row.subtotal),
    shippingCost: Number(row.shipping_cost),
    discount: Number(row.discount),
    tax: Number(row.tax),
    total: Number(row.total),
    paymentMethod: row.payment_method,
    paymentStatus: row.payment_status,
    fulfillmentStatus: row.fulfillment_status,
    trackingNumber: row.tracking_number,
    shippingAddress: row.shipping_address ?? {},
    timeline: (row.order_timeline_events ?? [])
      .map((e) => ({ id: e.id, label: e.label, timestamp: e.created_at, note: e.note }))
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const ORDER_SELECT = "*, order_items(*), order_timeline_events(*)";

async function fetchAllOrders() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("orders")
    .select(ORDER_SELECT)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data.map(mapOrderRow);
}

export function filterOrders(orders, { search, view = "all" } = {}) {
  const predicate = ORDER_VIEWS[view] ?? ORDER_VIEWS.all;
  return orders.filter((order) => predicate(order) && matchesSearch(order, search, SEARCH_FIELDS));
}

export async function listOrders({
  search = "",
  view = "all",
  sort = { field: "createdAt", direction: "desc" },
  page = 1,
  pageSize = 10,
} = {}) {
  const all = await fetchAllOrders();
  const filtered = filterOrders(all, { search, view });
  const sorted = sortBy(filtered, sort);
  return paginate(sorted, { page, pageSize });
}

export async function getOrderCounts() {
  const all = await fetchAllOrders();
  return Object.fromEntries(
    Object.entries(ORDER_VIEWS).map(([key, predicate]) => [key, all.filter(predicate).length]),
  );
}

export async function getOrder(id) {
  const supabase = createClient();
  const { data, error } = await supabase.from("orders").select(ORDER_SELECT).eq("id", id).maybeSingle();
  if (error) throw error;
  return data ? mapOrderRow(data) : null;
}

async function addTimelineEvent(supabase, orderId, label, note) {
  const { error } = await supabase.from("order_timeline_events").insert({ order_id: orderId, label, note });
  if (error) throw error;
}

async function touchOrder(supabase, id, patch) {
  const { error } = await supabase
    .from("orders")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function updateFulfillmentStatus(id, status, note) {
  const supabase = createClient();
  const order = await getOrder(id);
  if (!order) throw new Error("Order not found");

  const labelMap = {
    processing: "Processing",
    shipped: "Shipped",
    delivered: "Delivered",
    cancelled: "Order cancelled",
    returned: "Return received",
  };
  await touchOrder(supabase, id, { fulfillment_status: status });
  await addTimelineEvent(supabase, id, labelMap[status] ?? status, note);

  logActivity({
    action: "updated fulfillment status for",
    resourceType: "order",
    resourceId: id,
    resourceLabel: order.orderNumber,
    details: `Marked order ${order.orderNumber} as ${status}`,
  });
  return getOrder(id);
}

export async function addTrackingNumber(id, trackingNumber) {
  const supabase = createClient();
  const order = await getOrder(id);
  if (!order) throw new Error("Order not found");

  const patch = { tracking_number: trackingNumber };
  if (order.fulfillmentStatus === "unfulfilled" || order.fulfillmentStatus === "processing") {
    patch.fulfillment_status = "shipped";
  }
  await touchOrder(supabase, id, patch);
  if (patch.fulfillment_status) {
    await addTimelineEvent(supabase, id, "Shipped", `Tracking ${trackingNumber} added`);
  }

  logActivity({ action: "added tracking to", resourceType: "order", resourceId: id, resourceLabel: order.orderNumber });
  return getOrder(id);
}

export async function cancelOrder(id, reason) {
  const supabase = createClient();
  const order = await getOrder(id);
  if (!order) throw new Error("Order not found");

  await touchOrder(supabase, id, { fulfillment_status: "cancelled" });
  await addTimelineEvent(supabase, id, "Order cancelled", reason);

  logActivity({ action: "cancelled order", resourceType: "order", resourceId: id, resourceLabel: order.orderNumber });
  return getOrder(id);
}

export async function refundOrder(id, amount) {
  const supabase = createClient();
  const order = await getOrder(id);
  if (!order) throw new Error("Order not found");

  await touchOrder(supabase, id, { payment_status: "refunded" });
  await addTimelineEvent(supabase, id, "Refund issued", `Refunded ₦${amount.toLocaleString("en-NG")}`);

  logActivity({ action: "refunded order", resourceType: "order", resourceId: id, resourceLabel: order.orderNumber });
  return getOrder(id);
}

export async function bulkUpdateFulfillment(ids, status) {
  for (const id of ids) {
    await updateFulfillmentStatus(id, status, "Bulk update");
  }
  return ids;
}

export function createOrderNotification(order) {
  return pushNotification({
    type: "new-order",
    title: "New order received",
    body: `${order.customerName} placed order ${order.orderNumber}.`,
    href: `/admin/orders/${order.id}`,
  });
}
