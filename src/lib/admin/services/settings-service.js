import { createClient } from "@/lib/supabase/client";
import { logActivity } from "./activity-service";

const SECTIONS = ["store", "checkout", "notifications", "email", "seo", "preferences", "payments"];

export async function getSettings() {
  const supabase = createClient();
  const { data, error } = await supabase.from("store_settings").select("key, value").in("key", SECTIONS);
  if (error) throw error;
  return Object.fromEntries(data.map((row) => [row.key, row.value]));
}

export async function updateSettingsSection(section, patch) {
  const supabase = createClient();
  const { data: existing, error: readError } = await supabase
    .from("store_settings")
    .select("value")
    .eq("key", section)
    .maybeSingle();
  if (readError) throw readError;

  const next = { ...(existing?.value ?? {}), ...patch };
  const { error } = await supabase
    .from("store_settings")
    .upsert({ key: section, value: next, updated_at: new Date().toISOString() });
  if (error) throw error;

  logActivity({
    action: "updated settings",
    resourceType: "settings",
    resourceId: section,
    resourceLabel: section,
    details: `Updated ${section} settings`,
  });
  return getSettings();
}
