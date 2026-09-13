import { z } from "zod";

export const shippingMethodFormSchema = z.object({
  name: z.string().min(2, "Name is required").max(60),
  rate: z.coerce.number().min(0, "Rate must be 0 or more"),
  estimateDays: z.string().min(1, "Estimate is required"),
});

/**
 * @typedef {{ id: string, name: string, rate: number, estimateDays: string }} ShippingMethod
 * @typedef {{ id: string, name: string, regions: string[], methods: ShippingMethod[] }} ShippingZone
 */
