import { z } from "zod";

export const STOCK_REASONS = ["restock", "sale", "return", "damage", "correction"];

export const stockAdjustmentSchema = z.object({
  direction: z.enum(["increase", "decrease"]).default("increase"),
  quantity: z.coerce.number().min(1, "Enter a quantity greater than 0"),
  reason: z.enum(STOCK_REASONS, { message: "Choose a reason" }),
  note: z.string().max(300).optional().default(""),
});

/**
 * @typedef {{
 *   id: string, productId: string, productTitle: string, sku: string,
 *   tone: number, available: number, reserved: number, total: number,
 *   lowStockThreshold: number, history: Array<{
 *     id: string, date: string, change: number, reason: string,
 *     note: string, resultingQty: number, actor: string,
 *   }>,
 * }} InventoryItem
 */
export function inventoryStatus(item) {
  if (item.available <= 0) return "out-of-stock";
  if (item.available <= item.lowStockThreshold) return "low-stock";
  return "in-stock";
}
