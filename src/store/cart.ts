import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  skuId: string;
  name: string;
  price: number; // cents
  image: string | null;
  quantity: number;
};

type CartState = {
  items: CartItem[];
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  addItem: (item: Omit<CartItem, "quantity">, qty?: number) => void;
  removeItem: (skuId: string) => void;
  setQuantity: (skuId: string, qty: number) => void;
  clear: () => void;
};

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      setOpen: (open) => set({ isOpen: open }),
      addItem: (item, qty = 1) =>
        set((state) => {
          const existing = state.items.find((i) => i.skuId === item.skuId);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.skuId === item.skuId ? { ...i, quantity: i.quantity + qty } : i
              ),
            };
          }
          return { items: [...state.items, { ...item, quantity: qty }] };
        }),
      removeItem: (skuId) =>
        set((state) => ({ items: state.items.filter((i) => i.skuId !== skuId) })),
      setQuantity: (skuId, qty) =>
        set((state) => ({
          items: qty <= 0
            ? state.items.filter((i) => i.skuId !== skuId)
            : state.items.map((i) => (i.skuId === skuId ? { ...i, quantity: qty } : i)),
        })),
      clear: () => set({ items: [] }),
    }),
    { name: "irepair-cart" }
  )
);

export const formatPrice = (cents: number | null | undefined) =>
  `$${((cents ?? 0) / 100).toFixed(2)}`;
