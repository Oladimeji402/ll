let counter = 0;

/**
 * Deterministic-enough id generator for mock records created at runtime
 * (real inserts will get a DB-generated id once Supabase is wired in).
 */
export function generateId(prefix = "id") {
  counter += 1;
  return `${prefix}_${Date.now().toString(36)}${counter.toString(36)}`;
}

export function generateOrderNumber(sequence) {
  return `LC-${1000 + sequence}`;
}

export function generateReturnNumber(sequence) {
  return `RT-${1000 + sequence}`;
}

export function generatePaymentReference(sequence) {
  return `PAY-${100000 + sequence}`;
}

export function generateSku(title, sequence) {
  const stub = title
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .split("-")
    .filter(Boolean)
    .slice(0, 2)
    .join("-");
  return `${stub || "SKU"}-${String(sequence).padStart(4, "0")}`;
}
