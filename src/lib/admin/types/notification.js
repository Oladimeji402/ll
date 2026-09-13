export const NOTIFICATION_TYPES = [
  "new-order",
  "low-stock",
  "out-of-stock",
  "payment-failed",
  "return-requested",
  "system",
];

/**
 * @typedef {{
 *   id: string, type: string, title: string, body: string,
 *   read: boolean, createdAt: string, href: string|null,
 * }} Notification
 */
