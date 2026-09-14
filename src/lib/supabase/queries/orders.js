import { createClient } from "@/lib/supabase/server";

function mapOrder(row) {
  return {
    id: row.id,
    orderNumber: row.order_number,
    subtotal: Number(row.subtotal),
    shippingCost: Number(row.shipping_cost),
    discount: Number(row.discount),
    tax: Number(row.tax),
    total: Number(row.total),
    paymentStatus: row.payment_status,
    fulfillmentStatus: row.fulfillment_status,
    trackingNumber: row.tracking_number,
    shippingAddress: row.shipping_address,
    createdAt: row.created_at,
  };
}

function mapItem(row) {
  return {
    id: row.id,
    productId: row.product_id,
    title: row.title,
    variant: row.variant,
    sku: row.sku,
    tone: row.tone,
    quantity: row.quantity,
    price: Number(row.price),
  };
}

export async function getMyOrders() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("customer_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data.map(mapOrder);
}

export async function getMyOrderByNumber(orderNumber) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: orderRow, error } = await supabase
    .from("orders")
    .select("*")
    .eq("customer_id", user.id)
    .eq("order_number", orderNumber)
    .maybeSingle();

  if (error) throw error;
  if (!orderRow) return null;

  const { data: itemRows, error: itemsError } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", orderRow.id);

  if (itemsError) throw itemsError;

  const { data: timelineRows, error: timelineError } = await supabase
    .from("order_timeline_events")
    .select("*")
    .eq("order_id", orderRow.id)
    .order("created_at", { ascending: true });

  if (timelineError) throw timelineError;

  return {
    ...mapOrder(orderRow),
    items: itemRows.map(mapItem),
    timeline: timelineRows.map((row) => ({ id: row.id, label: row.label, note: row.note, createdAt: row.created_at })),
  };
}
