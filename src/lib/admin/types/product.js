import { z } from "zod";

export const PRODUCT_STATUSES = ["draft", "active", "archived"];

export const productVariantSchema = z.object({
  id: z.string(),
  size: z.string(),
  color: z.string(),
  sku: z.string(),
  price: z.number().min(0).optional(),
  quantity: z.number().min(0).default(0),
});

export const productImageSchema = z.object({
  id: z.string(),
  tone: z.number().min(0).max(4),
  alt: z.string().default(""),
});

/**
 * Fields editable from the "New product" / product edit form. Kept
 * separate from the full productSchema because the form doesn't own
 * server-computed fields (id, sku, createdAt, unitsSold, revenue...).
 */
export const productFormSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters").max(120),
  description: z.string().max(2000).optional().default(""),
  slug: z.string().min(2, "Slug is required"),
  price: z.coerce.number().min(0, "Price must be 0 or more"),
  compareAtPrice: z.coerce.number().min(0).optional().nullable(),
  category: z.string().min(1, "Choose a category"),
  collectionIds: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  sizes: z.array(z.string()).min(1, "Select at least one size"),
  colors: z.array(z.string()).min(1, "Select at least one color"),
  sku: z.string().min(1, "SKU is required"),
  quantity: z.coerce.number().min(0, "Quantity must be 0 or more"),
  lowStockThreshold: z.coerce.number().min(0).default(5),
  status: z.enum(PRODUCT_STATUSES).default("draft"),
  seoTitle: z.string().max(70).optional().default(""),
  seoDescription: z.string().max(160).optional().default(""),
  images: z.array(productImageSchema).default([]),
});

/**
 * @typedef {z.infer<typeof productFormSchema> & {
 *   id: string,
 *   variants: z.infer<typeof productVariantSchema>[],
 *   unitsSold: number,
 *   revenue: number,
 *   createdAt: string,
 *   updatedAt: string,
 * }} Product
 */

export const productDefaults = {
  title: "",
  description: "",
  slug: "",
  price: 0,
  compareAtPrice: null,
  category: "",
  collectionIds: [],
  tags: [],
  sizes: [],
  colors: [],
  sku: "",
  quantity: 0,
  lowStockThreshold: 5,
  status: "draft",
  seoTitle: "",
  seoDescription: "",
  images: [],
};
