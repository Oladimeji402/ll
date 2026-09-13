export const PAYMENT_METHODS = ["Card", "Bank Transfer", "Cash on Delivery", "Wallet"];
export const PAYMENT_TX_STATUSES = ["successful", "pending", "failed", "refunded"];

/**
 * @typedef {{
 *   id: string, reference: string, orderId: string, orderNumber: string,
 *   customerName: string, amount: number, method: string,
 *   status: "successful"|"pending"|"failed"|"refunded", date: string,
 *   gatewayNote: string,
 * }} Payment
 */
