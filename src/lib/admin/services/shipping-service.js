import { createClient } from "@/lib/supabase/client";
import { generateId } from "../utils/id";
import { logActivity } from "./activity-service";

async function readConfig(supabase) {
  const { data, error } = await supabase.from("store_settings").select("value").eq("key", "shipping").maybeSingle();
  if (error) throw error;
  return data?.value ?? { freeShippingThreshold: 0, zones: [] };
}

async function writeConfig(supabase, value) {
  const { error } = await supabase
    .from("store_settings")
    .upsert({ key: "shipping", value, updated_at: new Date().toISOString() });
  if (error) throw error;
}

export async function getShippingConfig() {
  const supabase = createClient();
  return readConfig(supabase);
}

export async function updateFreeShippingThreshold(amount) {
  const supabase = createClient();
  const config = await readConfig(supabase);
  const updated = { ...config, freeShippingThreshold: amount };
  await writeConfig(supabase, updated);
  logActivity({ action: "updated free shipping threshold", resourceType: "shipping", resourceId: "config", resourceLabel: "Shipping" });
  return updated;
}

export async function addShippingMethod(zoneId, method) {
  const supabase = createClient();
  const config = await readConfig(supabase);
  const zones = config.zones.map((zone) =>
    zone.id === zoneId
      ? { ...zone, methods: [...zone.methods, { id: generateId("method"), ...method }] }
      : zone,
  );
  await writeConfig(supabase, { ...config, zones });
  logActivity({ action: "added shipping method to", resourceType: "shipping", resourceId: zoneId, resourceLabel: method.name });
  return zones;
}

export async function updateShippingMethod(zoneId, methodId, patch) {
  const supabase = createClient();
  const config = await readConfig(supabase);
  const zones = config.zones.map((zone) =>
    zone.id === zoneId
      ? { ...zone, methods: zone.methods.map((m) => (m.id === methodId ? { ...m, ...patch } : m)) }
      : zone,
  );
  await writeConfig(supabase, { ...config, zones });
  return zones;
}

export async function removeShippingMethod(zoneId, methodId) {
  const supabase = createClient();
  const config = await readConfig(supabase);
  const zones = config.zones.map((zone) =>
    zone.id === zoneId ? { ...zone, methods: zone.methods.filter((m) => m.id !== methodId) } : zone,
  );
  await writeConfig(supabase, { ...config, zones });
  return zones;
}
