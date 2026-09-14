export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export function slugify(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function formatPrice(amount) {
  return `₦${amount.toLocaleString("en-NG")}`;
}
