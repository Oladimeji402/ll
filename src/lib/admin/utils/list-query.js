/**
 * Shared list-query helpers used by every service's list*() function, so
 * filtering/sorting/pagination logic lives in one place instead of being
 * re-implemented per entity.
 */

export function matchesSearch(record, term, fields) {
  if (!term) return true;
  const needle = term.trim().toLowerCase();
  if (!needle) return true;
  return fields.some((field) => {
    const value = typeof field === "function" ? field(record) : record[field];
    return String(value ?? "").toLowerCase().includes(needle);
  });
}

export function sortBy(items, sort) {
  if (!sort?.field) return items;
  const { field, direction = "asc" } = sort;
  const sorted = [...items].sort((a, b) => {
    const av = a[field];
    const bv = b[field];
    if (av == null && bv == null) return 0;
    if (av == null) return 1;
    if (bv == null) return -1;
    if (typeof av === "string") return av.localeCompare(bv);
    return av > bv ? 1 : av < bv ? -1 : 0;
  });
  return direction === "desc" ? sorted.reverse() : sorted;
}

export function paginate(items, { page = 1, pageSize = 10 } = {}) {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    page: safePage,
    pageSize,
    total,
    totalPages,
  };
}
