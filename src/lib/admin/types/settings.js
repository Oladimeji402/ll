import { z } from "zod";

export const storeSettingsSchema = z.object({
  name: z.string().min(2, "Store name is required"),
  supportEmail: z.string().email("Enter a valid email"),
  supportPhone: z.string().min(6, "Enter a valid phone number"),
  address: z.string().min(4, "Address is required"),
  currency: z.enum(["NGN", "USD", "GBP"]).default("NGN"),
});

export const checkoutSettingsSchema = z.object({
  guestCheckout: z.boolean().default(true),
  requirePhone: z.boolean().default(true),
  termsUrl: z.string().optional().default(""),
});

export const notificationSettingsSchema = z.object({
  emailOnNewOrder: z.boolean().default(true),
  emailOnLowStock: z.boolean().default(true),
  emailOnReturn: z.boolean().default(true),
  smsOnShipment: z.boolean().default(false),
});

export const emailSettingsSchema = z.object({
  senderName: z.string().min(2, "Sender name is required"),
  senderEmail: z.string().email("Enter a valid email"),
  replyTo: z.string().email("Enter a valid email"),
});

export const seoSettingsSchema = z.object({
  defaultTitle: z.string().min(2).max(70),
  defaultDescription: z.string().max(160),
  socialImageTone: z.number().min(0).max(4).default(0),
});

export const preferencesSettingsSchema = z.object({
  dateFormat: z.enum(["MMM D, YYYY", "DD/MM/YYYY", "MM/DD/YYYY"]).default("MMM D, YYYY"),
  timezone: z.string().default("Africa/Lagos"),
  weekStartsOn: z.enum(["Sunday", "Monday"]).default("Monday"),
});
