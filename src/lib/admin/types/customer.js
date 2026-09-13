import { z } from "zod";

export const CUSTOMER_SEGMENTS = ["new", "returning", "high-value", "inactive"];

/**
 * @typedef {{
 *   id: string, name: string, email: string, phone: string,
 *   tone: number, address: object, ordersCount: number,
 *   totalSpent: number, averageOrderValue: number, lastOrderAt: string|null,
 *   segment: "new"|"returning"|"high-value"|"inactive", createdAt: string,
 *   notes: string,
 * }} Customer
 */
export const customerNoteSchema = z.object({
  note: z.string().min(1, "Note can't be empty").max(500),
});
