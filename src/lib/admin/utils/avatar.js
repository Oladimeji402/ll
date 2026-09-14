const AVATAR_COLORS = [
  "var(--color-primary)",
  "var(--admin-success)",
  "var(--admin-info)",
  "var(--admin-warning)",
  "var(--color-primary-dark)",
];

export function avatarColor(tone = 0) {
  return AVATAR_COLORS[tone % AVATAR_COLORS.length];
}

// Stable tone index for records (e.g. real staff/customers from the
// database) that don't carry a stored `tone` field.
export function toneFromString(value = "") {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) % AVATAR_COLORS.length;
  }
  return hash;
}

export function initials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");
}
