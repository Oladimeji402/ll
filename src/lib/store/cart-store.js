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

function lineId(slug, size) {
  return `${slug}::${size}`;
}

export const useCartStore = create(
  persist(
    (set) => ({
      items: [],
      open: false,

      openCart() {
        set({ open: true });
      },
      closeCart() {
        set({ open: false });
      },

      addItem(product, size, quantity = 1) {
        const id = lineId(product.slug, size);
        set((state) => {
          const existing = state.items.find((item) => item.id === id);
          if (existing) {
            return {
              items: state.items.map((item) =>
                item.id === id ? { ...item, quantity: item.quantity + quantity } : item,
              ),
            };
          }
          return {
            items: [
              ...state.items,
              {
                id,
                slug: product.slug,
                name: product.name,
                price: product.price,
                originalPrice: product.originalPrice ?? null,
                tone: product.tone ?? 0,
                size,
                quantity,
              },
            ],
          };
        });
      },

      removeItem(id) {
        set((state) => ({ items: state.items.filter((item) => item.id !== id) }));
      },

      setQuantity(id, quantity) {
        set((state) => {
          if (quantity < 1) {
            return { items: state.items.filter((item) => item.id !== id) };
          }
          return { items: state.items.map((item) => (item.id === id ? { ...item, quantity } : item)) };
        });
      },

      clearCart() {
        set({ items: [] });
      },
    }),
    {
      name: "ll-store:cart",
      storage: createJSONStorage(browserStorage),
      version: 1,
      partialize: (state) => ({ items: state.items }),
    },
  ),
);

export function useCartCount() {
  return useCartStore((state) => state.items.reduce((sum, item) => sum + item.quantity, 0));
}

export function useCartSubtotal() {
  return useCartStore((state) => state.items.reduce((sum, item) => sum + item.price * item.quantity, 0));
}
