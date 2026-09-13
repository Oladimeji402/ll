import { useDiscountsStore } from "../store/discounts-store";
import { generateId } from "../utils/id";
import { simulateLatency } from "../utils/async";
import { matchesSearch, sortBy, paginate } from "../utils/list-query";
import { logActivity } from "./activity-service";

function computeStatus(discount) {
  if (!discount.active) return "disabled";
  const now = Date.now();
  const start = new Date(discount.startDate).getTime();
  const end = discount.endDate ? new Date(discount.endDate).getTime() : null;
  if (start > now) return "scheduled";
  if (end && end < now) return "expired";
  return "active";
}

export async function listDiscounts({
  search = "",
  status = "all",
  sort = { field: "createdAt", direction: "desc" },
  page = 1,
  pageSize = 10,
} = {}) {
  await simulateLatency();
  const all = useDiscountsStore.getState().items.map((d) => ({ ...d, status: computeStatus(d) }));
  const filtered = all.filter((d) => {
    if (status !== "all" && d.status !== status) return false;
    return matchesSearch(d, search, ["code"]);
  });
  const sorted = sortBy(filtered, sort);
  return paginate(sorted, { page, pageSize });
}

export async function getDiscount(id) {
  await simulateLatency(200);
  const discount = useDiscountsStore.getState().items.find((d) => d.id === id);
  return discount ? { ...discount, status: computeStatus(discount) } : null;
}

export async function createDiscount(input) {
  await simulateLatency(450);
  const now = new Date().toISOString();
  const discount = {
    id: generateId("disc"),
    ...input,
    usageCount: 0,
    status: computeStatus(input),
    createdAt: now,
    updatedAt: now,
  };
  useDiscountsStore.getState()._upsert(discount);
  logActivity({ action: "created discount", resourceType: "discount", resourceId: discount.id, resourceLabel: discount.code });
  return discount;
}

export async function updateDiscount(id, patch) {
  await simulateLatency(400);
  const existing = useDiscountsStore.getState().items.find((d) => d.id === id);
  if (!existing) throw new Error("Discount not found");
  const updated = { ...existing, ...patch, updatedAt: new Date().toISOString() };
  updated.status = computeStatus(updated);
  useDiscountsStore.getState()._upsert(updated);
  logActivity({ action: "updated discount", resourceType: "discount", resourceId: id, resourceLabel: updated.code });
  return updated;
}

export async function deleteDiscount(id) {
  await simulateLatency(350);
  const discount = useDiscountsStore.getState().items.find((d) => d.id === id);
  useDiscountsStore.getState()._remove(id);
  if (discount) {
    logActivity({ action: "deleted discount", resourceType: "discount", resourceId: id, resourceLabel: discount.code });
  }
}

export async function toggleDiscountActive(id) {
  const existing = useDiscountsStore.getState().items.find((d) => d.id === id);
  if (!existing) throw new Error("Discount not found");
  return updateDiscount(id, { active: !existing.active });
}
