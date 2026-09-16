import { createClient } from "@/lib/supabase/client";
import { paginate } from "../utils/list-query";

function mapActivityRow(row) {
  return {
    id: row.id,
    actor: row.actor,
    action: row.action,
    resourceType: row.resource_type,
    resourceId: row.resource_id,
    resourceLabel: row.resource_label,
    timestamp: row.created_at,
    details: row.details,
  };
}

// Every other service calls this synchronously, fire-and-forget, right
// after a write — same contract as the old zustand version. Making it
// `async` under the hood (a real insert needs to be) without requiring
// every call site to await it: resolve the current staff name, insert,
// swallow failures. A missed log entry shouldn't fail the action that
// triggered it.
export function logActivity({ actor, action, resourceType, resourceId, resourceLabel, details }) {
  const supabase = createClient();

  (async () => {
    let actorName = actor;
    if (!actorName) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: staff } = await supabase.from("staff_members").select("name").eq("id", user.id).maybeSingle();
        actorName = staff?.name ?? "";
      }
    }
    await supabase.from("activity_log").insert({
      actor: actorName ?? "",
      action,
      resource_type: resourceType,
      resource_id: String(resourceId ?? ""),
      resource_label: resourceLabel ?? "",
      details: details ?? `${actorName} ${action} "${resourceLabel}"`,
    });
  })().catch(() => {});
}

export async function listActivity({ page = 1, pageSize = 20, resourceType = "all" } = {}) {
  const supabase = createClient();
  let query = supabase.from("activity_log").select("*").order("created_at", { ascending: false });
  if (resourceType !== "all") query = query.eq("resource_type", resourceType);

  const { data, error } = await query;
  if (error) throw error;
  return paginate(data.map(mapActivityRow), { page, pageSize });
}

export async function getActivityForResource(resourceId, limit = 10) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("activity_log")
    .select("*")
    .eq("resource_id", String(resourceId))
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data.map(mapActivityRow);
}

export async function getRecentActivity(limit = 6) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("activity_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data.map(mapActivityRow);
}
