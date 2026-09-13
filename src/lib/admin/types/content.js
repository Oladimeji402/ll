import { z } from "zod";

export const bannerFormSchema = z
  .object({
    heading: z.string().min(2, "Heading is required").max(80),
    subheading: z.string().max(160).optional().default(""),
    ctaLabel: z.string().max(40).optional().default(""),
    ctaHref: z.string().max(200).optional().default(""),
    tone: z.number().min(0).max(4).default(0),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().optional().nullable(),
    status: z.enum(["scheduled", "active", "expired", "draft"]).default("draft"),
  })
  .refine((data) => !data.endDate || data.endDate >= data.startDate, {
    message: "End date must be after the start date",
    path: ["endDate"],
  });

export const navItemFormSchema = z.object({
  label: z.string().min(1, "Label is required").max(40),
  href: z.string().min(1, "Link is required").max(200),
});

export const homepageHeroSchema = z.object({
  heading: z.string().min(1).max(120),
  description: z.string().max(400).optional().default(""),
  ctaLabel: z.string().max(40).optional().default(""),
  ctaHref: z.string().max(200).optional().default(""),
});

export const announcementBarSchema = z.object({
  text: z.string().max(120),
  enabled: z.boolean().default(true),
});

/**
 * @typedef {{ id: string, label: string, href: string, order: number, children: NavItem[] }} NavItem
 * @typedef {{
 *   id: string, tone: number, heading: string, subheading: string,
 *   ctaLabel: string, ctaHref: string, startDate: string, endDate: string|null,
 *   status: "scheduled"|"active"|"expired"|"draft",
 * }} Banner
 * @typedef {{ id: string, name: string, tone: number, size: string, uploadedAt: string, usedIn: string[] }} MediaAsset
 * @typedef {{
 *   hero: z.infer<typeof homepageHeroSchema> & { panels: {tone:number, alt:string}[] },
 *   announcementBar: z.infer<typeof announcementBarSchema>,
 *   featuredCollectionIds: string[],
 *   featuredProductIds: string[],
 *   editorialSections: { id: string, heading: string, body: string }[],
 * }} HomepageContent
 */
