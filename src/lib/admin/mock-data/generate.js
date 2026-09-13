import { slugify } from "@/lib/utils";
import { createRng } from "./random";
import {
  PRODUCT_CATALOG,
  SIZES,
  COLORS,
  fullName,
  emailFor,
  addressFor,
} from "./fixtures";
import {
  generateSku,
  generateOrderNumber,
  generateReturnNumber,
  generatePaymentReference,
} from "../utils/id";
import { inventoryStatus } from "../types/inventory";

const COLLECTION_DEFS = [
  { title: "New Arrivals" },
  { title: "The Signature Edit" },
  { title: "Best Sellers" },
  { title: "Co-Ord Sets" },
  { title: "Dresses" },
  { title: "Outerwear" },
  { title: "Accessories" },
  { title: "Sale" },
];

const STAFF_SEED = [
  { name: "Olubido Ridwan", role: "Owner", status: "active" },
  { name: "Chioma Bello", role: "Admin", status: "active" },
  { name: "Femi Adeyemi", role: "Admin", status: "active" },
  { name: "Ngozi Balogun", role: "Manager", status: "active" },
  { name: "Kunle Afolabi", role: "Manager", status: "active" },
  { name: "Yewande Okoye", role: "Editor", status: "active" },
  { name: "Tobi Fashola", role: "Editor", status: "invited" },
  { name: "Halima Ibrahim", role: "Support", status: "active" },
];

function iso(date) {
  return date.toISOString();
}

function buildCollections() {
  return COLLECTION_DEFS.map((def, index) => {
    const id = slugify(def.title);
    return {
      id,
      title: def.title,
      slug: id,
      description: `Explore ${def.title.toLowerCase()} — curated pieces celebrated for craftsmanship and timeless style.`,
      tone: index % 5,
      status: "visible",
      seoTitle: `${def.title} — LL Collectives`,
      seoDescription: `Shop the ${def.title} collection from LL Collectives.`,
      productIds: [],
      position: index,
      createdAt: iso(new Date(Date.now() - 300 * 86400000)),
      updatedAt: iso(new Date(Date.now() - 10 * 86400000)),
    };
  });
}

function buildStaff(rng) {
  return STAFF_SEED.map((member, index) => ({
    id: `staff-${index + 1}`,
    name: member.name,
    email: `${member.name.toLowerCase().replace(/\s+/g, ".")}@llcollectives.com`,
    role: member.role,
    status: member.status,
    tone: index % 5,
    lastActiveAt: member.status === "active" ? iso(rng.daysAgo(4)) : null,
    joinedAt: iso(rng.daysAgo(600, 60)),
  }));
}

function buildProductsAndAssignCollections(rng, collections) {
  const byTitle = new Map(collections.map((c) => [slugify(c.title), c]));
  const products = PRODUCT_CATALOG.map((entry, index) => {
    const n = index + 1;
    const title = entry.title;
    const slug = slugify(title);
    const tone = index % 5;
    const basePrice = rng.int(35, 180) * 1000;
    const onSale = rng.bool(0.3);
    const createdAt = rng.daysAgo(220, 1);
    const isNew = Date.now() - createdAt.getTime() < 21 * 86400000;
    const status = rng.bool(0.85) ? "active" : rng.bool(0.5) ? "draft" : "archived";
    const quantity = rng.bool(0.12) ? 0 : rng.int(1, 140);
    const lowStockThreshold = rng.item([5, 8, 10]);
    const colors = rng.items(COLORS, rng.int(2, 3));
    const sizes = rng.items(SIZES, rng.int(3, 5));
    const unitsSold = rng.int(0, 420);

    const variants = [];
    sizes.forEach((size) => {
      colors.forEach((color) => {
        variants.push({
          id: `${slug}-${slugify(size)}-${slugify(color)}`,
          size,
          color,
          sku: `${generateSku(title, n)}-${size}${color[0]}`,
          quantity: Math.max(0, Math.round(quantity / (sizes.length * colors.length))),
        });
      });
    });

    const collectionIds = [];
    const categoryCollection = byTitle.get(slugify(entry.category));
    if (categoryCollection) collectionIds.push(categoryCollection.id);
    if (isNew) collectionIds.push("new-arrivals");
    if (onSale) collectionIds.push("sale");

    return {
      id: `prod-${n}`,
      sku: generateSku(title, n),
      title,
      slug,
      description:
        "Cut from a fluid, weight-appropriate fabric with clean seaming and a considered finish — designed to move with you from day into evening.",
      category: entry.category,
      collectionIds,
      tags: [entry.category, onSale ? "Sale" : "Full Price"],
      sizes,
      colors,
      variants,
      price: basePrice,
      compareAtPrice: onSale ? Math.round(basePrice * 1.25 / 1000) * 1000 : null,
      quantity,
      lowStockThreshold,
      status,
      images: Array.from({ length: 4 }, (_, i) => ({
        id: `${slug}-img-${i + 1}`,
        tone: (tone + i) % 5,
        alt: `${title} — view ${i + 1}`,
      })),
      seoTitle: `${title} — LL Collectives`,
      seoDescription: `Shop the ${title}, part of the ${entry.category} edit at LL Collectives.`,
      unitsSold,
      revenue: unitsSold * basePrice,
      createdAt: iso(createdAt),
      updatedAt: iso(rng.daysAgo(20)),
    };
  });

  const bestSellers = [...products].sort((a, b) => b.unitsSold - a.unitsSold).slice(0, 8);
  bestSellers.forEach((product) => {
    if (!product.collectionIds.includes("best-sellers")) {
      product.collectionIds.push("best-sellers");
    }
  });

  collections.forEach((collection) => {
    collection.productIds = products
      .filter((product) => product.collectionIds.includes(collection.id))
      .map((product) => product.id);
  });

  return products;
}

function buildCustomers(rng, count = 36) {
  return Array.from({ length: count }, (_, i) => {
    const name = fullName(rng);
    const createdAt = rng.daysAgo(500, 1);
    return {
      id: `cust-${i + 1}`,
      name,
      email: emailFor(name, i + 1),
      phone: `+234 8${rng.int(10, 99)} ${rng.int(100, 999)} ${rng.int(1000, 9999)}`,
      tone: i % 5,
      address: addressFor(rng),
      ordersCount: 0,
      totalSpent: 0,
      averageOrderValue: 0,
      lastOrderAt: null,
      segment: "new",
      notes: "",
      createdAt: iso(createdAt),
    };
  });
}

function buildTimeline(createdAt, fulfillmentStatus, paymentStatus, rng) {
  const timeline = [
    { id: "t1", label: "Order placed", timestamp: iso(createdAt) },
  ];
  const step = (hours) => new Date(createdAt.getTime() + hours * 3600000);

  if (paymentStatus === "paid") {
    timeline.push({ id: "t2", label: "Payment confirmed", timestamp: iso(step(1)) });
  } else if (paymentStatus === "failed") {
    timeline.push({ id: "t2", label: "Payment failed", timestamp: iso(step(1)) });
    return timeline;
  }

  const order = ["processing", "shipped", "delivered"];
  const reached = order.indexOf(fulfillmentStatus);
  if (fulfillmentStatus === "cancelled") {
    timeline.push({ id: "t3", label: "Order cancelled", timestamp: iso(step(rng.int(2, 20))) });
    return timeline;
  }
  order.forEach((label, idx) => {
    if (reached >= idx) {
      const labelText = label === "processing" ? "Processing" : label === "shipped" ? "Shipped" : "Delivered";
      timeline.push({
        id: `t${idx + 3}`,
        label: labelText,
        timestamp: iso(step((idx + 1) * rng.int(6, 30))),
      });
    }
  });
  if (fulfillmentStatus === "returned") {
    timeline.push({ id: "t9", label: "Return received", timestamp: iso(step(rng.int(80, 200))) });
  }
  return timeline;
}

function buildOrders(rng, customers, products, count = 72) {
  const activeProducts = products.filter((p) => p.status !== "archived");
  const orders = [];

  for (let i = 0; i < count; i++) {
    const customer = rng.item(customers);
    const createdAt = rng.daysAgo(90, 0);
    const itemCount = rng.int(1, 4);
    const chosen = rng.items(activeProducts, itemCount);
    const items = chosen.map((product, idx) => {
      const quantity = rng.int(1, 2);
      const variant = rng.item(product.variants) ?? null;
      return {
        id: `item-${i}-${idx}`,
        productId: product.id,
        title: product.title,
        variant: variant ? `${variant.size} / ${variant.color}` : undefined,
        sku: variant?.sku ?? product.sku,
        tone: product.images[0]?.tone ?? 0,
        quantity,
        price: product.price,
      };
    });
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shippingCost = subtotal >= 150000 ? 0 : rng.item([2500, 3500, 5000]);
    const discount = rng.bool(0.2) ? Math.round(subtotal * 0.1) : 0;
    const tax = 0;
    const total = subtotal + shippingCost - discount + tax;

    const paymentStatus = rng.bool(0.82)
      ? "paid"
      : rng.bool(0.5)
        ? "pending"
        : rng.bool(0.5)
          ? "failed"
          : "refunded";

    const ageDays = (Date.now() - createdAt.getTime()) / 86400000;
    let fulfillmentStatus;
    if (paymentStatus === "failed") fulfillmentStatus = "unfulfilled";
    else if (paymentStatus === "refunded") fulfillmentStatus = rng.item(["returned", "cancelled"]);
    else if (ageDays < 1) fulfillmentStatus = "unfulfilled";
    else if (ageDays < 3) fulfillmentStatus = rng.item(["unfulfilled", "processing"]);
    else if (ageDays < 7) fulfillmentStatus = rng.item(["processing", "shipped"]);
    else fulfillmentStatus = rng.item(["shipped", "delivered", "delivered", "delivered"]);

    const timeline = buildTimeline(createdAt, fulfillmentStatus, paymentStatus, rng);

    orders.push({
      id: `order-${i + 1}`,
      orderNumber: generateOrderNumber(i + 1),
      customerId: customer.id,
      customerName: customer.name,
      email: customer.email,
      items,
      subtotal,
      shippingCost,
      discount,
      tax,
      total,
      paymentMethod: rng.item(["Card", "Bank Transfer", "Cash on Delivery"]),
      paymentStatus,
      fulfillmentStatus,
      trackingNumber: ["shipped", "delivered"].includes(fulfillmentStatus)
        ? `NG${rng.int(100000000, 999999999)}`
        : null,
      shippingAddress: customer.address,
      timeline,
      createdAt: iso(createdAt),
      updatedAt: iso(timeline[timeline.length - 1] ? new Date(timeline[timeline.length - 1].timestamp) : createdAt),
    });
  }

  return orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function enrichCustomers(customers, orders) {
  const byCustomer = new Map(customers.map((c) => [c.id, c]));
  orders.forEach((order) => {
    if (order.paymentStatus === "failed") return;
    const customer = byCustomer.get(order.customerId);
    if (!customer) return;
    customer.ordersCount += 1;
    customer.totalSpent += order.total;
    if (!customer.lastOrderAt || new Date(order.createdAt) > new Date(customer.lastOrderAt)) {
      customer.lastOrderAt = order.createdAt;
    }
  });

  customers.forEach((customer) => {
    customer.averageOrderValue = customer.ordersCount
      ? Math.round(customer.totalSpent / customer.ordersCount)
      : 0;

    const daysSinceCreated = (Date.now() - new Date(customer.createdAt).getTime()) / 86400000;
    const daysSinceOrder = customer.lastOrderAt
      ? (Date.now() - new Date(customer.lastOrderAt).getTime()) / 86400000
      : Infinity;

    if (customer.ordersCount === 0 && daysSinceCreated < 30) customer.segment = "new";
    else if (customer.ordersCount >= 5 || customer.totalSpent >= 600000) customer.segment = "high-value";
    else if (daysSinceOrder > 75) customer.segment = "inactive";
    else customer.segment = "returning";
  });

  return customers;
}

function buildInventory(rng, products, staffNames) {
  return products.map((product, index) => {
    const reserved = product.status === "archived" ? 0 : rng.int(0, 4);
    const available = product.quantity;
    const historyLength = rng.int(2, 4);
    const history = Array.from({ length: historyLength }, (_, i) => {
      const reason = rng.item(["restock", "sale", "return", "correction"]);
      const change = reason === "restock" ? rng.int(10, 60) : -rng.int(1, 10);
      return {
        id: `inv-${index}-hist-${i}`,
        date: iso(rng.daysAgo(90, i * 5)),
        change,
        reason,
        note:
          reason === "restock"
            ? "Restocked from supplier"
            : reason === "sale"
              ? "Deducted from order fulfillment"
              : reason === "return"
                ? "Returned to inventory"
                : "Manual count correction",
        resultingQty: Math.max(0, available + change),
        actor: rng.item(staffNames),
      };
    }).sort((a, b) => new Date(a.date) - new Date(b.date));

    return {
      id: `inv-${product.id}`,
      productId: product.id,
      productTitle: product.title,
      sku: product.sku,
      tone: product.images[0]?.tone ?? 0,
      available,
      reserved,
      total: available + reserved,
      lowStockThreshold: product.lowStockThreshold,
      history,
    };
  });
}

function buildPayments(orders) {
  const statusMap = { paid: "successful", pending: "pending", failed: "failed", refunded: "refunded" };
  return orders.map((order, index) => ({
    id: `pay-${index + 1}`,
    reference: generatePaymentReference(index + 1),
    orderId: order.id,
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    amount: order.total,
    method: order.paymentMethod,
    status: statusMap[order.paymentStatus],
    date: order.createdAt,
    gatewayNote:
      order.paymentStatus === "failed"
        ? "Card declined by issuing bank"
        : order.paymentStatus === "refunded"
          ? "Refunded to original payment method"
          : "Settled successfully",
  }));
}

function buildReturns(rng, orders, staffNames) {
  const eligible = orders.filter((o) => o.fulfillmentStatus === "delivered" || o.fulfillmentStatus === "returned");
  const picked = rng.items(eligible, Math.min(14, eligible.length));
  return picked.map((order, index) => {
    const requestedAt = rng.daysAgo(20, 1);
    const status = order.fulfillmentStatus === "returned"
      ? rng.item(["completed", "processing", "approved"])
      : rng.item(["requested", "approved", "processing", "completed", "rejected"]);
    const items = order.items.slice(0, rng.int(1, order.items.length)).map((item) => ({
      title: item.title,
      sku: item.sku,
      quantity: item.quantity,
    }));
    const refundAmount = items.reduce((sum, item) => {
      const orderItem = order.items.find((oi) => oi.sku === item.sku);
      return sum + (orderItem ? orderItem.price * item.quantity : 0);
    }, 0);

    return {
      id: `return-${index + 1}`,
      returnNumber: generateReturnNumber(index + 1),
      orderId: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      items,
      reason: rng.item(["Wrong size", "Changed my mind", "Item damaged", "Not as described", "Arrived late"]),
      status,
      refundAmount,
      requestedAt: iso(requestedAt),
      resolvedAt: ["completed", "rejected"].includes(status)
        ? iso(new Date(requestedAt.getTime() + rng.int(1, 5) * 86400000))
        : null,
      notes: status === "rejected" ? "Item did not meet return policy conditions." : "",
      handledBy: ["completed", "rejected", "approved"].includes(status) ? rng.item(staffNames) : null,
    };
  }).sort((a, b) => new Date(b.requestedAt) - new Date(a.requestedAt));
}

function buildDiscounts(rng, products, collections) {
  const codes = [
    { code: "WELCOME10", type: "percentage", value: 10 },
    { code: "LLVIP20", type: "percentage", value: 20 },
    { code: "FREESHIP", type: "fixed", value: 2500 },
    { code: "SIGNATURE15", type: "percentage", value: 15 },
    { code: "SALE25", type: "percentage", value: 25 },
    { code: "NEWIN5000", type: "fixed", value: 5000 },
    { code: "BFRIDAY30", type: "percentage", value: 30 },
    { code: "LOYALTY10", type: "percentage", value: 10 },
    { code: "RESTOCK", type: "fixed", value: 3000 },
    { code: "EDIT12", type: "percentage", value: 12 },
  ];

  return codes.map((entry, index) => {
    const startDate = rng.daysAgo(90, -30);
    const hasEnd = rng.bool(0.7);
    const endDate = hasEnd ? new Date(startDate.getTime() + rng.int(14, 60) * 86400000) : null;
    const now = Date.now();
    let status = "active";
    if (startDate.getTime() > now) status = "scheduled";
    else if (endDate && endDate.getTime() < now) status = "expired";
    else if (rng.bool(0.1)) status = "disabled";

    const usageLimit = rng.bool(0.6) ? rng.item([50, 100, 200, 500]) : null;
    const usageCount = usageLimit ? rng.int(0, usageLimit) : rng.int(0, 120);

    return {
      id: `disc-${index + 1}`,
      code: entry.code,
      type: entry.type,
      value: entry.value,
      minOrderAmount: rng.bool(0.4) ? rng.item([20000, 50000, 100000]) : 0,
      productIds: rng.bool(0.3) ? rng.items(products, 3).map((p) => p.id) : [],
      collectionIds: rng.bool(0.3) ? rng.items(collections, 1).map((c) => c.id) : [],
      usageLimit,
      usageCount,
      active: status !== "disabled",
      status,
      startDate: startDate.toISOString().slice(0, 10),
      endDate: endDate ? endDate.toISOString().slice(0, 10) : null,
      createdAt: iso(startDate),
      updatedAt: iso(rng.daysAgo(10)),
    };
  });
}

function buildNotifications(rng, orders, inventory, returns, payments) {
  const notifications = [];
  orders.slice(0, 6).forEach((order, i) => {
    notifications.push({
      id: `notif-order-${i}`,
      type: "new-order",
      title: "New order received",
      body: `${order.customerName} placed order ${order.orderNumber} for ${order.items.length} item(s).`,
      read: i > 2,
      createdAt: order.createdAt,
      href: `/admin/orders/${order.id}`,
    });
  });

  inventory
    .filter((item) => inventoryStatus(item) !== "in-stock")
    .slice(0, 6)
    .forEach((item, i) => {
      const isOut = inventoryStatus(item) === "out-of-stock";
      notifications.push({
        id: `notif-stock-${i}`,
        type: isOut ? "out-of-stock" : "low-stock",
        title: isOut ? "Product out of stock" : "Low stock warning",
        body: `${item.productTitle} (${item.sku}) has ${item.available} unit(s) left.`,
        read: i > 1,
        createdAt: iso(rng.daysAgo(6)),
        href: `/admin/inventory`,
      });
    });

  payments
    .filter((p) => p.status === "failed")
    .slice(0, 3)
    .forEach((payment, i) => {
      notifications.push({
        id: `notif-payment-${i}`,
        type: "payment-failed",
        title: "Payment failed",
        body: `Payment ${payment.reference} for order ${payment.orderNumber} failed.`,
        read: false,
        createdAt: payment.date,
        href: `/admin/payments/${payment.id}`,
      });
    });

  returns.slice(0, 4).forEach((ret, i) => {
    notifications.push({
      id: `notif-return-${i}`,
      type: "return-requested",
      title: "Return requested",
      body: `${ret.customerName} requested a return for ${ret.orderNumber}.`,
      read: i > 0,
      createdAt: ret.requestedAt,
      href: `/admin/returns/${ret.id}`,
    });
  });

  return notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function buildActivity(rng, staffNames, { products, orders, collections, discounts }) {
  const templates = [
    (p) => ({ action: "created product", resourceType: "product", label: p.title }),
    (p) => ({ action: "updated pricing for", resourceType: "product", label: p.title }),
    (p) => ({ action: "changed status of", resourceType: "product", label: p.title }),
  ];
  const entries = [];
  let seq = 0;

  products.slice(0, 14).forEach((p) => {
    const template = rng.item(templates);
    const detail = template(p);
    entries.push({
      id: `act-${seq++}`,
      actor: rng.item(staffNames),
      action: detail.action,
      resourceType: detail.resourceType,
      resourceId: p.id,
      resourceLabel: detail.label,
      timestamp: iso(rng.daysAgo(60, 1)),
      details: `${detail.action} "${detail.label}"`,
    });
  });

  orders.slice(0, 16).forEach((o) => {
    entries.push({
      id: `act-${seq++}`,
      actor: rng.item(staffNames),
      action: "updated fulfillment status for",
      resourceType: "order",
      resourceId: o.id,
      resourceLabel: o.orderNumber,
      timestamp: iso(new Date(o.updatedAt)),
      details: `Marked order ${o.orderNumber} as ${o.fulfillmentStatus}`,
    });
  });

  collections.slice(0, 6).forEach((c) => {
    entries.push({
      id: `act-${seq++}`,
      actor: rng.item(staffNames),
      action: "updated collection",
      resourceType: "collection",
      resourceId: c.id,
      resourceLabel: c.title,
      timestamp: iso(rng.daysAgo(45, 2)),
      details: `Updated the "${c.title}" collection`,
    });
  });

  discounts.slice(0, 6).forEach((d) => {
    entries.push({
      id: `act-${seq++}`,
      actor: rng.item(staffNames),
      action: "created discount",
      resourceType: "discount",
      resourceId: d.id,
      resourceLabel: d.code,
      timestamp: iso(new Date(d.createdAt)),
      details: `Created discount code "${d.code}"`,
    });
  });

  entries.push({
    id: `act-${seq++}`,
    actor: staffNames[0],
    action: "updated homepage content",
    resourceType: "content",
    resourceId: "homepage",
    resourceLabel: "Homepage",
    timestamp: iso(rng.daysAgo(15)),
    details: "Updated the homepage hero section",
  });

  return entries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

function buildContent(collections, products) {
  return {
    hero: {
      heading: "View New Collection",
      description:
        "It begins with a single thread. A pattern drawn from culture, a rhythm carried through fabric.",
      ctaLabel: "View New Collection",
      ctaHref: "#collection-new",
      panels: [
        { tone: 0, alt: "Model wearing a printed maxi look" },
        { tone: 1, alt: "Model wearing a co-ord set" },
        { tone: 2, alt: "Model wearing a patterned dress" },
      ],
    },
    announcementBar: { text: "FREE DELIVERY IN LAGOS", enabled: true },
    featuredCollectionIds: collections.slice(0, 3).map((c) => c.id),
    featuredProductIds: products.slice(0, 8).map((p) => p.id),
    editorialSections: [
      {
        id: "story",
        heading: "Our Story",
        body: "It begins with a single thread. A pattern drawn from culture, a rhythm carried through fabric. From motive to form, the line becomes a language.",
      },
    ],
  };
}

function buildNavigation() {
  const links = [
    "New Arrivals",
    "The Signature Edit",
    "Best Sellers",
    "Co-ord Sets",
    "Dresses",
    "Outerwear",
    "Accessories",
    "Sale",
  ];
  return links.map((label, index) => ({
    id: `nav-${index + 1}`,
    label,
    href: `/collections/${slugify(label)}`,
    order: index,
    children: [],
  }));
}

function buildBanners(rng) {
  const now = Date.now();
  const specs = [
    { heading: "The Signature Edit Is Here", offsetStart: -10, offsetEnd: 20, status: "active" },
    { heading: "Up To 25% Off Select Styles", offsetStart: -5, offsetEnd: 10, status: "active" },
    { heading: "Holiday Drop Coming Soon", offsetStart: 15, offsetEnd: 45, status: "scheduled" },
    { heading: "End Of Season Sale", offsetStart: -60, offsetEnd: -30, status: "expired" },
  ];
  return specs.map((spec, i) => ({
    id: `banner-${i + 1}`,
    tone: i % 5,
    heading: spec.heading,
    subheading: "Shop the latest arrivals before they sell out.",
    ctaLabel: "Shop Now",
    ctaHref: "/collections/new-arrivals",
    startDate: new Date(now + spec.offsetStart * 86400000).toISOString().slice(0, 10),
    endDate: new Date(now + spec.offsetEnd * 86400000).toISOString().slice(0, 10),
    status: spec.status,
  }));
}

function buildMedia(rng, products) {
  const fromProducts = products.slice(0, 16).flatMap((p, i) =>
    p.images.slice(0, 1).map((img, j) => ({
      id: `media-${p.id}-${j}`,
      name: `${p.slug}-${j + 1}.jpg`,
      tone: img.tone,
      size: rng.int(180, 900),
      uploadedAt: iso(rng.daysAgo(120, 1)),
      usedIn: [p.title],
    })),
  );
  const extra = Array.from({ length: 8 }, (_, i) => ({
    id: `media-extra-${i}`,
    name: `homepage-asset-${i + 1}.jpg`,
    tone: i % 5,
    size: rng.int(200, 1200),
    uploadedAt: iso(rng.daysAgo(200, 1)),
    usedIn: i < 3 ? ["Homepage Hero"] : [],
  }));
  return [...fromProducts, ...extra];
}

function buildShipping() {
  return {
    freeShippingThreshold: 150000,
    zones: [
      {
        id: "zone-lagos",
        name: "Lagos",
        regions: ["Lagos Island", "Lagos Mainland", "Lekki", "Ikeja"],
        methods: [
          { id: "m1", name: "Same-day Delivery", rate: 3500, estimateDays: "Same day" },
          { id: "m2", name: "Next-day Delivery", rate: 2000, estimateDays: "1 day" },
        ],
      },
      {
        id: "zone-nigeria",
        name: "Nationwide Nigeria",
        regions: ["All other states"],
        methods: [
          { id: "m3", name: "Standard Delivery", rate: 3000, estimateDays: "3–5 days" },
          { id: "m4", name: "Express Delivery", rate: 6000, estimateDays: "1–2 days" },
        ],
      },
      {
        id: "zone-intl",
        name: "International",
        regions: ["Africa", "Europe", "North America"],
        methods: [
          { id: "m5", name: "Standard International", rate: 25000, estimateDays: "7–14 days" },
          { id: "m6", name: "Express International", rate: 45000, estimateDays: "3–5 days" },
        ],
      },
    ],
  };
}

function buildSettings() {
  return {
    store: {
      name: "LL Collectives",
      supportEmail: "hello@llcollectives.com",
      supportPhone: "+234 801 234 5678",
      address: "12 Admiralty Way, Lekki Phase 1, Lagos, Nigeria",
      currency: "NGN",
    },
    checkout: { guestCheckout: true, requirePhone: true, termsUrl: "/terms" },
    notifications: {
      emailOnNewOrder: true,
      emailOnLowStock: true,
      emailOnReturn: true,
      smsOnShipment: false,
    },
    email: {
      senderName: "LL Collectives",
      senderEmail: "orders@llcollectives.com",
      replyTo: "hello@llcollectives.com",
    },
    seo: {
      defaultTitle: "LL Collectives — Contemporary Ready-to-Wear",
      defaultDescription: "Shop contemporary ready-to-wear from LL Collectives.",
      socialImageTone: 0,
    },
    preferences: { dateFormat: "MMM D, YYYY", timezone: "Africa/Lagos", weekStartsOn: "Monday" },
    payments: { methodsEnabled: ["Card", "Bank Transfer", "Cash on Delivery"] },
    shipping: { defaultZoneId: "zone-nigeria" },
  };
}

let cached = null;

export function seedDatabase() {
  if (cached) return cached;

  const rng = createRng(20240501);
  const collections = buildCollections();
  const products = buildProductsAndAssignCollections(rng, collections);
  const staff = buildStaff(rng);
  const staffNames = staff.map((s) => s.name);
  let customers = buildCustomers(rng);
  const orders = buildOrders(rng, customers, products);
  customers = enrichCustomers(customers, orders);
  const inventory = buildInventory(rng, products, staffNames);
  const payments = buildPayments(orders);
  const returns = buildReturns(rng, orders, staffNames);
  const discounts = buildDiscounts(rng, products, collections);
  const notifications = buildNotifications(rng, orders, inventory, returns, payments);
  const activity = buildActivity(rng, staffNames, { products, orders, collections, discounts });
  const content = buildContent(collections, products);
  const navigation = buildNavigation();
  const banners = buildBanners(rng);
  const media = buildMedia(rng, products);
  const shipping = buildShipping();
  const settings = buildSettings();

  cached = {
    collections,
    products,
    customers,
    orders,
    staff,
    inventory,
    payments,
    returns,
    discounts,
    notifications,
    activity,
    content,
    navigation,
    banners,
    media,
    shipping,
    settings,
  };
  return cached;
}
