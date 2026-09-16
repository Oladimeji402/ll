import { createClient } from "@/lib/supabase/client";
import { useNotificationsStore } from "../store/notifications-store";

function mapRow(row) {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    body: row.body,
    read: row.read,
    createdAt: row.created_at,
    href: row.href,
  };
}

// Fire-and-forget, same contract as the old zustand-only version: callers
// (product-service, inventory-service, order-service) call this right after
// a write and don't await it. Insert into Supabase, then mirror the real
// row into the shared store once it comes back.
export function pushNotification({ type, title, body, href = null }) {
  const supabase = createClient();
  (async () => {
    const { data, error } = await supabase
      .from("notifications")
      .insert({ type, title, body, href })
      .select()
      .single();
    if (error) throw error;
    useNotificationsStore.getState()._upsert(mapRow(data));
  })().catch(() => {});
}

export async function listNotifications() {
  const supabase = createClient();
  const { data, error } = await supabase.from("notifications").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  const items = data.map(mapRow);
  useNotificationsStore.getState()._setAll(items);
  return items;
}

export async function ensureNotificationsLoaded() {
  if (useNotificationsStore.getState().loaded) return;
  await listNotifications();
}

export async function markNotificationRead(id) {
  const notification = useNotificationsStore.getState().items.find((n) => n.id === id);
  if (!notification || notification.read) return notification ?? null;
  const updated = { ...notification, read: true };
  useNotificationsStore.getState()._upsert(updated);

  const supabase = createClient();
  const { error } = await supabase.from("notifications").update({ read: true }).eq("id", id);
  if (error) throw error;
  return updated;
}

export async function markAllNotificationsRead() {
  const all = useNotificationsStore.getState().items.map((n) => ({ ...n, read: true }));
  all.forEach((n) => useNotificationsStore.getState()._upsert(n));

  const supabase = createClient();
  const { error } = await supabase.from("notifications").update({ read: true }).eq("read", false);
  if (error) throw error;
  return all;
}
