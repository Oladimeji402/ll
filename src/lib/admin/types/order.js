import { z } from "zod";

export const PAYMENT_STATUSES = ["paid", "pending", "failed", "refunded"];
export const FULFILLMENT_STATUSES = [
  "unfulfilled",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "returned",
];

export const orderItemSchema = z.object({
  id: z.string(),
  productId: z.string(),
  title: z.string(),
  variant: z.string().optional(),
  sku: z.string(),
  tone: z.number().min(0).max(4).default(0),
  quantity: z.number().min(1),
  price: z.number().min(0),
});

export const orderTimelineEventSchema = z.object({
  id: z.string(),
  label: z.string(),
  timestamp: z.string(),
  note: z.string().optional(),
});

/**
 * @typedef {{
 *   id: string,
 *   orderNumber: string,
 *   customerId: string,
 *   customerName: string,
 *   email: string,
 *   items: z.infer<typeof orderItemSchema>[],
 *   subtotal: number,
 *   shippingCost: number,
 *   discount: number,
 *   tax: number,
 *   total: number,
 *   paymentMethod: string,
 *   paymentStatus: "paid"|"pending"|"failed"|"refunded",
 *   fulfillmentStatus: "unfulfilled"|"processing"|"shipped"|"delivered"|"cancelled"|"returned",
 *   trackingNumber: string|null,
 *   shippingAddress: { line1: string, city: string, state: string, country: string, postalCode: string },
 *   timeline: z.infer<typeof orderTimelineEventSchema>[],
 *   createdAt: string,
 *   updatedAt: string,
 * }} Order
 */
export const orderSchema = z.object({
  id: z.string(),
  orderNumber: z.string(),
  customerId: z.string(),
  customerName: z.string(),
  email: z.string().email(),
  items: z.array(orderItemSchema),
  subtotal: z.number(),
  shippingCost: z.number(),
  discount: z.number(),
  tax: z.number(),
  total: z.number(),
  paymentMethod: z.string(),
  paymentStatus: z.enum(PAYMENT_STATUSES),
  fulfillmentStatus: z.enum(FULFILLMENT_STATUSES),
  trackingNumber: z.string().nullable().optional(),
  shippingAddress: z.object({
    line1: z.string(),
    city: z.string(),
    state: z.string(),
    country: z.string(),
    postalCode: z.string(),
  }),
  timeline: z.array(orderTimelineEventSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
});
