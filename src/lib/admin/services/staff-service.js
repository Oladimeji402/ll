import { createClient } from "@/lib/supabase/client";
import { sortBy } from "../utils/list-query";
import { logActivity } from "./activity-service";

function toneFromString(value = "") {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) hash = (hash * 31 + value.charCodeAt(i)) % 5;
  return hash;
}

function mapStaffRow(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    status: row.status,
    tone: toneFromString(row.email),
    lastActiveAt: row.last_active_at,
    joinedAt: row.joined_at,
  };
}

export async function listStaff({ sort = { field: "joinedAt", direction: "asc" } } = {}) {
  const supabase = createClient();
  const { data, error } = await supabase.from("staff_members").select("*");
  if (error) throw error;
  return sortBy(data.map(mapStaffRow), sort);
}

// Creating a real staff account means creating a real Supabase Auth user
// first (staff_members.id is a foreign key to auth.users) — that needs
// admin.inviteUserByEmail with the service_role key, which this client
// doesn't have. Surfacing that clearly rather than pretending to invite.
export async function inviteStaff() {
  throw new Error(
    "Inviting staff isn't wired up yet — it needs a Supabase service_role key (server-side only) to create the auth account.",
  );
}

export async function updateStaffRole(id, role) {
  const supabase = createClient();
  const { data, error } = await supabase.from("staff_members").update({ role }).eq("id", id).select().single();
  if (error) throw error;
  const member = mapStaffRow(data);
  logActivity({
    action: "changed role for",
    resourceType: "staff",
    resourceId: id,
    resourceLabel: member.name,
    details: `Changed ${member.name}'s role to ${role}`,
  });
  return member;
}

export async function setStaffStatus(id, status) {
  const supabase = createClient();
  const { data, error } = await supabase.from("staff_members").update({ status }).eq("id", id).select().single();
  if (error) throw error;
  const member = mapStaffRow(data);
  logActivity({
    action: status === "suspended" ? "suspended" : "reactivated",
    resourceType: "staff",
    resourceId: id,
    resourceLabel: member.name,
  });
  return member;
}

export async function removeStaff(id) {
  const supabase = createClient();
  const { data: existing } = await supabase.from("staff_members").select("name").eq("id", id).maybeSingle();
  const { error } = await supabase.from("staff_members").delete().eq("id", id);
  if (error) throw error;
  if (existing) {
    logActivity({ action: "removed", resourceType: "staff", resourceId: id, resourceLabel: existing.name });
  }
}
