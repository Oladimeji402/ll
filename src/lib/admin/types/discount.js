import { z } from "zod";

export const DISCOUNT_TYPES = ["percentage", "fixed"];
export const DISCOUNT_STATUSES = ["active", "scheduled", "expired", "disabled"];

export const discountFormSchema = z
  .object({
    code: z
      .string()
      .min(3, "Code must be at least 3 characters")
      .max(20)
      .regex(/^[A-Z0-9-]+$/, "Use uppercase letters, numbers and dashes only"),
    type: z.enum(DISCOUNT_TYPES).default("percentage"),
    value: z.coerce.number().min(1, "Value must be greater than 0"),
    minOrderAmount: z.coerce.number().min(0).optional().default(0),
    productIds: z.array(z.string()).default([]),
    collectionIds: z.array(z.string()).default([]),
    usageLimit: z.coerce.number().min(0).optional().nullable(),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().optional().nullable(),
    active: z.boolean().default(true),
  })
  .refine((data) => data.type !== "percentage" || data.value <= 100, {
    message: "Percentage discounts can't exceed 100%",
    path: ["value"],
  });

/**
 * @typedef {z.infer<typeof discountFormSchema> & {
 *   id: string, usageCount: number, status: string,
 *   createdAt: string, updatedAt: string,
 * }} Discount
 */

export const discountDefaults = {
  code: "",
  type: "percentage",
  value: 10,
  minOrderAmount: 0,
  productIds: [],
  collectionIds: [],
  usageLimit: null,
  startDate: new Date().toISOString().slice(0, 10),
  endDate: null,
  active: true,
};
