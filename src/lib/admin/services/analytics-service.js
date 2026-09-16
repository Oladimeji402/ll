import { createClient } from "@/lib/supabase/client";
import { inventoryStatus } from "../types/inventory";
import { resolveRange, previousPeriod, eachDay, percentChange } from "../utils/date-range";

async function fetchOrdersForAnalytics() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("id, customer_id, total, payment_status, created_at, order_items(product_id, quantity, price)");
  if (error) throw error;
  return data.map((row) => ({
    id: row.id,
    customerId: row.customer_id,
    total: Number(row.total),
    paymentStatus: row.payment_status,
    createdAt: row.created_at,
    items: (row.order_items ?? []).map((item) => ({
      productId: item.product_id,
      quantity: item.quantity,
      price: Number(item.price),
    })),
  }));
}

async function fetchCustomersForAnalytics() {
  const supabase = createClient();
  const { data, error } = await supabase.from("customers").select("id, created_at");
  if (error) throw error;
  return data.map((row) => ({ id: row.id, createdAt: row.created_at }));
}

async function fetchProductsForAnalytics() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("products")
    .select("id, title, images, quantity, low_stock_threshold, sku, tone, product_collections(collection_id)");
  if (error) throw error;
  return data.map((row) => ({
    id: row.id,
    title: row.title,
    images: row.images,
    quantity: row.quantity,
    lowStockThreshold: row.low_stock_threshold,
    sku: row.sku,
    tone: row.tone,
    collectionIds: (row.product_collections ?? []).map((pc) => pc.collection_id),
  }));
}

async function fetchCollectionsForAnalytics() {
  const supabase = createClient();
  const { data, error } = await supabase.from("collections").select("id, title");
  if (error) throw error;
  return data;
}

function ordersInRange(orders, { start, end }) {
  return orders.filter((o) => {
    const created = new Date(o.createdAt);
    return created >= start && created <= end && o.paymentStatus !== "failed";
  });
}

function revenueOf(orders) {
  return orders.reduce((sum, o) => sum + o.total, 0);
}

export async function getDashboardMetrics(rangeKey = "last30", custom) {
  const range = resolveRange(rangeKey, custom);
  const prevRange = previousPeriod(range);
  const allOrders = await fetchOrdersForAnalytics();
  const current = ordersInRange(allOrders, range);
  const previous = ordersInRange(allOrders, prevRange);

  const currentRevenue = revenueOf(current);
  const previousRevenue = revenueOf(previous);
  const currentAov = current.length ? currentRevenue / current.length : 0;
  const previousAov = previous.length ? previousRevenue / previous.length : 0;

  const customers = await fetchCustomersForAnalytics();
  const currentCustomerIds = new Set(current.map((o) => o.customerId));
  const previousCustomerIds = new Set(previous.map((o) => o.customerId));
  const newCustomersInRange = customers.filter((c) => {
    const created = new Date(c.createdAt);
    return created >= range.start && created <= range.end;
  }).length;
  const newCustomersPrev = customers.filter((c) => {
    const created = new Date(c.createdAt);
    return created >= prevRange.start && created <= prevRange.end;
  }).length;

  const conversionRate = current.length ? Math.min(100, (current.length / (current.length + 40)) * 100) : 0;
  const conversionRatePrev = previous.length ? Math.min(100, (previous.length / (previous.length + 40)) * 100) : 0;

  return {
    revenue: { value: currentRevenue, previous: previousRevenue, change: percentChange(currentRevenue, previousRevenue) },
    orders: { value: current.length, previous: previous.length, change: percentChange(current.length, previous.length) },
    aov: { value: currentAov, previous: previousAov, change: percentChange(currentAov, previousAov) },
    customers: {
      value: currentCustomerIds.size,
      previous: previousCustomerIds.size,
      change: percentChange(currentCustomerIds.size, previousCustomerIds.size),
    },
    conversionRate: { value: conversionRate, previous: conversionRatePrev, change: percentChange(conversionRate, conversionRatePrev) },
    newCustomers: { value: newCustomersInRange, previous: newCustomersPrev, change: percentChange(newCustomersInRange, newCustomersPrev) },
  };
}

export async function getSalesSeries(rangeKey = "last30", custom, metric = "revenue") {
  const range = resolveRange(rangeKey, custom);
  const prevRange = previousPeriod(range);
  const allOrders = await fetchOrdersForAnalytics();
  const current = ordersInRange(allOrders, range);
  const previous = ordersInRange(allOrders, prevRange);

  const days = eachDay(range);
  const prevDays = eachDay(prevRange);

  const bucket = (orders, day) =>
    orders.filter((o) => new Date(o.createdAt).toDateString() === day.toDateString());

  const series = days.map((day, idx) => {
    const dayOrders = bucket(current, day);
    const prevDay = prevDays[idx];
    const prevDayOrders = prevDay ? bucket(previous, prevDay) : [];
    return {
      date: day.toISOString(),
      label: day.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      value: metric === "orders" ? dayOrders.length : revenueOf(dayOrders),
      previousValue: metric === "orders" ? prevDayOrders.length : revenueOf(prevDayOrders),
    };
  });

  return series;
}

export async function getTopProducts(rangeKey = "last30", custom, limit = 6) {
  const range = resolveRange(rangeKey, custom);
  const allOrders = await fetchOrdersForAnalytics();
  const orders = ordersInRange(allOrders, range);
  const products = await fetchProductsForAnalytics();

  const tally = new Map();
  orders.forEach((order) => {
    order.items.forEach((item) => {
      const existing = tally.get(item.productId) ?? { unitsSold: 0, revenue: 0 };
      existing.unitsSold += item.quantity;
      existing.revenue += item.quantity * item.price;
      tally.set(item.productId, existing);
    });
  });

  return Array.from(tally.entries())
    .map(([productId, stats]) => {
      const product = products.find((p) => p.id === productId);
      return product ? { product, ...stats } : null;
    })
    .filter(Boolean)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);
}

export async function getTopCollections(rangeKey = "last30", custom, limit = 5) {
  const topProducts = await getTopProducts(rangeKey, custom, 100);
  const collections = await fetchCollectionsForAnalytics();
  const tally = new Map();

  topProducts.forEach(({ product, revenue, unitsSold }) => {
    product.collectionIds.forEach((collectionId) => {
      const existing = tally.get(collectionId) ?? { revenue: 0, unitsSold: 0 };
      existing.revenue += revenue;
      existing.unitsSold += unitsSold;
      tally.set(collectionId, existing);
    });
  });

  return Array.from(tally.entries())
    .map(([collectionId, stats]) => {
      const collection = collections.find((c) => c.id === collectionId);
      return collection ? { collection, ...stats } : null;
    })
    .filter(Boolean)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);
}

export async function getCustomerAnalytics(rangeKey = "last30", custom) {
  const range = resolveRange(rangeKey, custom);
  const allOrders = await fetchOrdersForAnalytics();
  const orders = ordersInRange(allOrders, range);
  const customers = await fetchCustomersForAnalytics();

  const customerOrderCounts = new Map();
  orders.forEach((o) => {
    customerOrderCounts.set(o.customerId, (customerOrderCounts.get(o.customerId) ?? 0) + 1);
  });

  let newCount = 0;
  let returningCount = 0;
  customerOrderCounts.forEach((count, customerId) => {
    const customer = customers.find((c) => c.id === customerId);
    const isNew = customer && new Date(customer.createdAt) >= range.start;
    if (isNew) newCount += 1;
    else returningCount += 1;
  });

  const repeatPurchaseRate = customerOrderCounts.size
    ? (Array.from(customerOrderCounts.values()).filter((c) => c > 1).length / customerOrderCounts.size) * 100
    : 0;

  return { newCount, returningCount, repeatPurchaseRate };
}

export async function getInventoryAttention(limit = 6) {
  const products = await fetchProductsForAnalytics();
  const items = products.map((p) => ({
    id: p.id,
    productTitle: p.title,
    available: p.quantity,
    lowStockThreshold: p.lowStockThreshold,
  }));
  const attention = items.filter((i) => inventoryStatus(i) !== "in-stock");
  return {
    lowStock: attention.filter((i) => inventoryStatus(i) === "low-stock").slice(0, limit),
    outOfStock: attention.filter((i) => inventoryStatus(i) === "out-of-stock").slice(0, limit),
  };
}
