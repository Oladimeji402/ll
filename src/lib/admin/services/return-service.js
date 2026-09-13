import { useReturnsStore } from "../store/returns-store";
import { CURRENT_STAFF } from "../utils/current-user";
import { simulateLatency } from "../utils/async";
import { matchesSearch, sortBy, paginate } from "../utils/list-query";
import { logActivity } from "./activity-service";

const SEARCH_FIELDS = ["returnNumber", "orderNumber", "customerName"];

export async function listReturns({
  search = "",
  status = "all",
  sort = { field: "requestedAt", direction: "desc" },
  page = 1,
  pageSize = 10,
} = {}) {
  await simulateLatency();
  const all = useReturnsStore.getState().items;
  const filtered = all.filter((r) => {
    if (status !== "all" && r.status !== status) return false;
    return matchesSearch(r, search, SEARCH_FIELDS);
  });
  const sorted = sortBy(filtered, sort);
  return paginate(sorted, { page, pageSize });
}

export async function getReturn(id) {
  await simulateLatency(200);
  return useReturnsStore.getState().items.find((r) => r.id === id) ?? null;
}

export function getReturnCounts() {
  const all = useReturnsStore.getState().items;
  return {
    all: all.length,
    requested: all.filter((r) => r.status === "requested").length,
    approved: all.filter((r) => r.status === "approved").length,
    processing: all.filter((r) => r.status === "processing").length,
    completed: all.filter((r) => r.status === "completed").length,
    rejected: all.filter((r) => r.status === "rejected").length,
  };
}

export async function updateReturnStatus(id, status, note) {
  await simulateLatency(400);
  const existing = useReturnsStore.getState().items.find((r) => r.id === id);
  if (!existing) throw new Error("Return not found");
  const resolved = ["completed", "rejected"].includes(status);
  const updated = {
    ...existing,
    status,
    notes: note || existing.notes,
    handledBy: CURRENT_STAFF.name,
    resolvedAt: resolved ? new Date().toISOString() : existing.resolvedAt,
  };
  useReturnsStore.getState()._upsert(updated);
  logActivity({
    action: "updated return status for",
    resourceType: "return",
    resourceId: id,
    resourceLabel: existing.returnNumber,
    details: `Marked return ${existing.returnNumber} as ${status}`,
  });
  return updated;
}
