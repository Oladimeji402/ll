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

export function initials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");
}
