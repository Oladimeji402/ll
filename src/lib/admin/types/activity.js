/**
 * @typedef {{
 *   id: string, actor: string, action: string, resourceType: string,
 *   resourceId: string, resourceLabel: string, timestamp: string,
 *   details: string,
 * }} ActivityLogEntry
 */
export const RESOURCE_TYPES = [
  "product",
  "order",
  "collection",
  "discount",
  "inventory",
  "customer",
  "content",
  "staff",
  "settings",
  "shipping",
  "return",
];
