import { z } from "zod";

export const RETURN_STATUSES = ["requested", "approved", "processing", "completed", "rejected"];
export const RETURN_REASONS = [
  "Wrong size",
  "Changed my mind",
  "Item damaged",
  "Not as described",
  "Arrived late",
];

export const returnStatusUpdateSchema = z.object({
  status: z.enum(RETURN_STATUSES),
  note: z.string().max(300).optional().default(""),
});

/**
 * @typedef {{
 *   id: string, returnNumber: string, orderId: string, orderNumber: string,
 *   customerName: string, items: Array<{ title: string, sku: string, quantity: number }>,
 *   reason: string, status: "requested"|"approved"|"processing"|"completed"|"rejected",
 *   refundAmount: number, requestedAt: string, resolvedAt: string|null, notes: string,
 * }} ReturnRequest
 */
