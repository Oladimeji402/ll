import { useOrdersStore } from "../store/orders-store";
import { usePaymentsStore } from "../store/payments-store";
import { generateId } from "../utils/id";
import { simulateLatency } from "../utils/async";
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
  await simulateLatency();
  const all = useOrdersStore.getState().items;
  const filtered = filterOrders(all, { search, view });
  const sorted = sortBy(filtered, sort);
  return paginate(sorted, { page, pageSize });
}

export function getOrderCounts() {
  const all = useOrdersStore.getState().items;
  return Object.fromEntries(
    Object.entries(ORDER_VIEWS).map(([key, predicate]) => [key, all.filter(predicate).length]),
  );
}

export async function getOrder(id) {
  await simulateLatency(250);
  return useOrdersStore.getState().items.find((o) => o.id === id) ?? null;
}

export function getOrderSync(id) {
  return useOrdersStore.getState().items.find((o) => o.id === id) ?? null;
}

function addTimelineEvent(order, label, note) {
  return {
    ...order,
    timeline: [...order.timeline, { id: generateId("evt"), label, timestamp: new Date().toISOString(), note }],
    updatedAt: new Date().toISOString(),
  };
}

export async function updateFulfillmentStatus(id, status, note) {
  await simulateLatency(400);
  const order = getOrderSync(id);
  if (!order) throw new Error("Order not found");
  const labelMap = {
    processing: "Processing",
    shipped: "Shipped",
    delivered: "Delivered",
    cancelled: "Order cancelled",
    returned: "Return received",
  };
  let updated = { ...order, fulfillmentStatus: status };
  updated = addTimelineEvent(updated, labelMap[status] ?? status, note);
  useOrdersStore.getState()._upsert(updated);
  logActivity({
    action: "updated fulfillment status for",
    resourceType: "order",
    resourceId: id,
    resourceLabel: order.orderNumber,
    details: `Marked order ${order.orderNumber} as ${status}`,
  });
  return updated;
}

export async function addTrackingNumber(id, trackingNumber) {
  await simulateLatency(350);
  const order = getOrderSync(id);
  if (!order) throw new Error("Order not found");
  let updated = { ...order, trackingNumber };
  if (order.fulfillmentStatus === "unfulfilled" || order.fulfillmentStatus === "processing") {
    updated.fulfillmentStatus = "shipped";
    updated = addTimelineEvent(updated, "Shipped", `Tracking ${trackingNumber} added`);
  } else {
    updated.updatedAt = new Date().toISOString();
  }
  useOrdersStore.getState()._upsert(updated);
  logActivity({
    action: "added tracking to",
    resourceType: "order",
    resourceId: id,
    resourceLabel: order.orderNumber,
  });
  return updated;
}

export async function cancelOrder(id, reason) {
  await simulateLatency(400);
  const order = getOrderSync(id);
  if (!order) throw new Error("Order not found");
  let updated = { ...order, fulfillmentStatus: "cancelled" };
  updated = addTimelineEvent(updated, "Order cancelled", reason);
  useOrdersStore.getState()._upsert(updated);
  logActivity({
    action: "cancelled order",
    resourceType: "order",
    resourceId: id,
    resourceLabel: order.orderNumber,
  });
  return updated;
}

export async function refundOrder(id, amount) {
  await simulateLatency(500);
  const order = getOrderSync(id);
  if (!order) throw new Error("Order not found");
  let updated = { ...order, paymentStatus: "refunded" };
  updated = addTimelineEvent(updated, "Refund issued", `Refunded ₦${amount.toLocaleString("en-NG")}`);
  useOrdersStore.getState()._upsert(updated);

  const payment = usePaymentsStore.getState().items.find((p) => p.orderId === id);
  if (payment) {
    usePaymentsStore.getState()._upsert({ ...payment, status: "refunded" });
  }
  logActivity({
    action: "refunded order",
    resourceType: "order",
    resourceId: id,
    resourceLabel: order.orderNumber,
  });
  return updated;
}

export async function bulkUpdateFulfillment(ids, status) {
  await simulateLatency(450);
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
