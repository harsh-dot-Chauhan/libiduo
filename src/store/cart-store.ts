import { create } from "zustand";
import axios from "axios";
import type { CartItem, Cart } from "@/types/cart";

type CartStore = Cart & {
  isOpen: boolean;
  loading: boolean;
  fetchCart: () => Promise<void>;
  addItem: (productId: string, quantity?: number) => Promise<void>;
  updateItem: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  openDrawer: () => void;
  closeDrawer: () => void;
};

function computeTotals(items: CartItem[]): { total: number; count: number } {
  return {
    total: items.reduce((s, i) => s + i.price * i.quantity, 0),
    count: items.reduce((s, i) => s + i.quantity, 0),
  };
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  total: 0,
  count: 0,
  isOpen: false,
  loading: false,

  fetchCart: async () => {
    try {
      const res = await axios.get<{ success: boolean; data: Cart }>("/api/cart");
      if (res.data.success) {
        set({ items: res.data.data.items, total: res.data.data.total, count: res.data.data.count });
      }
    } catch {
      // silently fail — cart loads on next interaction
    }
  },

  addItem: async (productId, quantity = 1) => {
    set({ loading: true });
    try {
      const res = await axios.post<{ success: boolean; data: Cart }>("/api/cart", { productId, quantity });
      if (res.data.success) {
        set({ items: res.data.data.items, ...computeTotals(res.data.data.items), isOpen: true });
      }
    } finally {
      set({ loading: false });
    }
  },

  updateItem: async (productId, quantity) => {
    // Optimistic update
    const prev = get().items;
    const next =
      quantity === 0
        ? prev.filter((i) => i.productId !== productId)
        : prev.map((i) => (i.productId === productId ? { ...i, quantity } : i));
    set({ items: next, ...computeTotals(next) });

    try {
      const res = await axios.put<{ success: boolean; data: Cart }>(`/api/cart/${productId}`, { quantity });
      if (res.data.success) {
        set({ items: res.data.data.items, ...computeTotals(res.data.data.items) });
      }
    } catch {
      // roll back optimistic update
      set({ items: prev, ...computeTotals(prev) });
    }
  },

  removeItem: async (productId) => {
    const prev = get().items;
    const next = prev.filter((i) => i.productId !== productId);
    set({ items: next, ...computeTotals(next) });

    try {
      const res = await axios.delete<{ success: boolean; data: Cart }>(`/api/cart/${productId}`);
      if (res.data.success) {
        set({ items: res.data.data.items, ...computeTotals(res.data.data.items) });
      }
    } catch {
      set({ items: prev, ...computeTotals(prev) });
    }
  },

  openDrawer: () => set({ isOpen: true }),
  closeDrawer: () => set({ isOpen: false }),
}));
