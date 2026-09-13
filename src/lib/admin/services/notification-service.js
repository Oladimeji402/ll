import { useNotificationsStore } from "../store/notifications-store";
import { generateId } from "../utils/id";
import { simulateLatency } from "../utils/async";

export function pushNotification({ type, title, body, href = null }) {
  const notification = {
    id: generateId("notif"),
    type,
    title,
    body,
    read: false,
    createdAt: new Date().toISOString(),
    href,
  };
  useNotificationsStore.getState()._upsert(notification);
  return notification;
}

export async function listNotifications() {
  await simulateLatency(150);
  return [...useNotificationsStore.getState().items].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  );
}

export function markNotificationRead(id) {
  const notification = useNotificationsStore.getState().items.find((n) => n.id === id);
  if (!notification) return null;
  const updated = { ...notification, read: true };
  useNotificationsStore.getState()._upsert(updated);
  return updated;
}

export function markAllNotificationsRead() {
  const all = useNotificationsStore.getState().items.map((n) => ({ ...n, read: true }));
  useNotificationsStore.getState()._setAll(all);
  return all;
}
