import { usePaymentsStore } from "../store/payments-store";
import { simulateLatency } from "../utils/async";
import { matchesSearch, sortBy, paginate } from "../utils/list-query";

const SEARCH_FIELDS = ["reference", "orderNumber", "customerName"];

export async function listPayments({
  search = "",
  status = "all",
  sort = { field: "date", direction: "desc" },
  page = 1,
  pageSize = 10,
} = {}) {
  await simulateLatency();
  const all = usePaymentsStore.getState().items;
  const filtered = all.filter((p) => {
    if (status !== "all" && p.status !== status) return false;
    return matchesSearch(p, search, SEARCH_FIELDS);
  });
  const sorted = sortBy(filtered, sort);
  return paginate(sorted, { page, pageSize });
}

export async function getPayment(id) {
  await simulateLatency(200);
  return usePaymentsStore.getState().items.find((p) => p.id === id) ?? null;
}

export function getPaymentCounts() {
  const all = usePaymentsStore.getState().items;
  return {
    all: all.length,
    successful: all.filter((p) => p.status === "successful").length,
    pending: all.filter((p) => p.status === "pending").length,
    failed: all.filter((p) => p.status === "failed").length,
    refunded: all.filter((p) => p.status === "refunded").length,
  };
}
