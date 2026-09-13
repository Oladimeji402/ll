import { useStaffStore } from "../store/staff-store";
import { generateId } from "../utils/id";
import { simulateLatency } from "../utils/async";
import { sortBy } from "../utils/list-query";
import { logActivity } from "./activity-service";

export async function listStaff({ sort = { field: "joinedAt", direction: "asc" } } = {}) {
  await simulateLatency(300);
  return sortBy(useStaffStore.getState().items, sort);
}

export async function inviteStaff(input) {
  await simulateLatency(450);
  const member = {
    id: generateId("staff"),
    ...input,
    status: "invited",
    tone: useStaffStore.getState().items.length % 5,
    lastActiveAt: null,
    joinedAt: new Date().toISOString(),
  };
  useStaffStore.getState()._upsert(member);
  logActivity({ action: "invited", resourceType: "staff", resourceId: member.id, resourceLabel: member.name });
  return member;
}

export async function updateStaffRole(id, role) {
  await simulateLatency(350);
  const member = useStaffStore.getState().items.find((s) => s.id === id);
  if (!member) throw new Error("Staff member not found");
  const updated = { ...member, role };
  useStaffStore.getState()._upsert(updated);
  logActivity({
    action: "changed role for",
    resourceType: "staff",
    resourceId: id,
    resourceLabel: member.name,
    details: `Changed ${member.name}'s role to ${role}`,
  });
  return updated;
}

export async function setStaffStatus(id, status) {
  await simulateLatency(350);
  const member = useStaffStore.getState().items.find((s) => s.id === id);
  if (!member) throw new Error("Staff member not found");
  const updated = { ...member, status };
  useStaffStore.getState()._upsert(updated);
  logActivity({
    action: status === "suspended" ? "suspended" : "reactivated",
    resourceType: "staff",
    resourceId: id,
    resourceLabel: member.name,
  });
  return updated;
}

export async function removeStaff(id) {
  await simulateLatency(350);
  const member = useStaffStore.getState().items.find((s) => s.id === id);
  useStaffStore.getState()._remove(id);
  if (member) {
    logActivity({ action: "removed", resourceType: "staff", resourceId: id, resourceLabel: member.name });
  }
}
