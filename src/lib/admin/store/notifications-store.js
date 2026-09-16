import { create } from "zustand";

// In-memory shared cache, not a mock data source: notification-service reads
// and writes Supabase directly, then mirrors the result here so the bell
// dropdown and the notifications page stay in sync without either one
// refetching on every render.
export const useNotificationsStore = create((set) => ({
  items: [],
  loaded: false,

  _setAll(items) {
    set({ items, loaded: true });
  },
  _upsert(item) {
    set((state) => {
      const idx = state.items.findIndex((i) => i.id === item.id);
      if (idx === -1) return { items: [item, ...state.items] };
      const next = state.items.slice();
      next[idx] = item;
      return { items: next };
    });
  },
}));
