import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const noopStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

function browserStorage() {
  if (typeof window === "undefined") return noopStorage;
  return window.localStorage;
}

/**
 * One localStorage-backed store per mock entity. This is the ONLY place
 * that touches persistence — services read/write through the setters here,
 * components never import this module directly (they go through the
 * matching service in lib/admin/services). Swapping mock data for Supabase
 * later means deleting the corresponding store file, not touching the UI.
 */
export function createEntityStore(key, seed) {
  return create(
    persist(
      (set, get) => ({
        items: typeof seed === "function" ? seed() : seed,

        _setAll(items) {
          set({ items });
        },
        _upsert(item) {
          set((state) => {
            const idx = state.items.findIndex((i) => i.id === item.id);
            if (idx === -1) return { items: [item, ...state.items] };
            const next = state.items.slice();
            next[idx] = item;
            return { items: next };
          });
          return item;
        },
        _upsertMany(itemsToUpsert) {
          set((state) => {
            const byId = new Map(state.items.map((i) => [i.id, i]));
            itemsToUpsert.forEach((item) => byId.set(item.id, item));
            return { items: Array.from(byId.values()) };
          });
        },
        _remove(id) {
          set((state) => ({ items: state.items.filter((i) => i.id !== id) }));
        },
        _removeMany(ids) {
          const idSet = new Set(ids);
          set((state) => ({ items: state.items.filter((i) => !idSet.has(i.id)) }));
        },
        _reset() {
          set({ items: typeof seed === "function" ? seed() : seed });
        },
      }),
      {
        name: `ll-admin:${key}`,
        storage: createJSONStorage(browserStorage),
        version: 1,
      },
    ),
  );
}

/**
 * Same idea as createEntityStore but for single-record settings-shaped
 * state (homepage content, shipping config, store settings) rather than a
 * list of records.
 */
export function createSingletonStore(key, seed) {
  return create(
    persist(
      (set, get) => ({
        value: typeof seed === "function" ? seed() : seed,
        _set(value) {
          set({ value });
        },
        _patch(patch) {
          set((state) => ({ value: { ...state.value, ...patch } }));
        },
        _reset() {
          set({ value: typeof seed === "function" ? seed() : seed });
        },
      }),
      {
        name: `ll-admin:${key}`,
        storage: createJSONStorage(browserStorage),
        version: 1,
      },
    ),
  );
}
