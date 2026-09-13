import { z } from "zod";

export const STAFF_ROLES = ["Owner", "Admin", "Manager", "Editor", "Support"];
export const STAFF_STATUSES = ["active", "invited", "suspended"];

export const ROLE_PERMISSIONS = {
  Owner: { orders: "manage", products: "manage", discounts: "manage", content: "manage", settings: "manage", staff: "manage" },
  Admin: { orders: "manage", products: "manage", discounts: "manage", content: "manage", settings: "manage", staff: "view" },
  Manager: { orders: "manage", products: "manage", discounts: "manage", content: "edit", settings: "view", staff: "none" },
  Editor: { orders: "view", products: "edit", discounts: "view", content: "manage", settings: "none", staff: "none" },
  Support: { orders: "edit", products: "view", discounts: "view", content: "view", settings: "none", staff: "none" },
};

export const staffInviteSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Enter a valid email"),
  role: z.enum(STAFF_ROLES).default("Support"),
});

/**
 * @typedef {{
 *   id: string, name: string, email: string, role: string,
 *   status: "active"|"invited"|"suspended", tone: number,
 *   lastActiveAt: string|null, joinedAt: string,
 * }} StaffMember
 */
