import { z } from "zod";

export const COLLECTION_STATUSES = ["visible", "hidden"];

export const collectionFormSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters").max(80),
  slug: z.string().min(2, "Slug is required"),
  description: z.string().max(1000).optional().default(""),
  tone: z.number().min(0).max(4).default(0),
  status: z.enum(COLLECTION_STATUSES).default("visible"),
  seoTitle: z.string().max(70).optional().default(""),
  seoDescription: z.string().max(160).optional().default(""),
});

/**
 * @typedef {z.infer<typeof collectionFormSchema> & {
 *   id: string,
 *   productIds: string[],
 *   position: number,
 *   createdAt: string,
 *   updatedAt: string,
 * }} Collection
 */

export const collectionDefaults = {
  title: "",
  slug: "",
  description: "",
  tone: 0,
  status: "visible",
  seoTitle: "",
  seoDescription: "",
};
