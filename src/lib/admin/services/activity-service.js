import { useActivityStore } from "../store/activity-store";
import { generateId } from "../utils/id";
import { CURRENT_STAFF } from "../utils/current-user";
import { simulateLatency } from "../utils/async";
import { paginate } from "../utils/list-query";

export function logActivity({ actor = CURRENT_STAFF.name, action, resourceType, resourceId, resourceLabel, details }) {
  const entry = {
    id: generateId("act"),
    actor,
    action,
    resourceType,
    resourceId,
    resourceLabel,
    timestamp: new Date().toISOString(),
    details: details ?? `${actor} ${action} "${resourceLabel}"`,
  };
  useActivityStore.getState()._upsert(entry);
  return entry;
}

export async function listActivity({ page = 1, pageSize = 20, resourceType = "all" } = {}) {
  await simulateLatency(200);
  const all = useActivityStore
    .getState()
    .items.filter((entry) => resourceType === "all" || entry.resourceType === resourceType)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  return paginate(all, { page, pageSize });
}

export function getActivityForResource(resourceId, limit = 10) {
  return useActivityStore
    .getState()
    .items.filter((entry) => entry.resourceId === resourceId)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, limit);
}

export function getRecentActivity(limit = 6) {
  return [...useActivityStore.getState().items]
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, limit);
}
