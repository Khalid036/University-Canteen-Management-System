import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      pickupTime: 'Immediate (ASAP)',
      notes: '',
      isPriority: false,
      isDrawerOpen: false,

      openDrawer: () => set({ isDrawerOpen: true }),
      closeDrawer: () => set({ isDrawerOpen: false }),
      toggleDrawer: () => set((state) => ({ isDrawerOpen: !state.isDrawerOpen })),

      addItem: (item, quantity = 1) => {
        const currentItems = get().items;
        const existingIndex = currentItems.findIndex((i) => i.id === item.id);

        if (existingIndex > -1) {
          const updated = [...currentItems];
          const newQty = updated[existingIndex].quantity + quantity;
          if (newQty <= item.stockQuantity) {
            updated[existingIndex].quantity = newQty;
            set({ items: updated, isDrawerOpen: true });
          }
        } else {
          set({
            items: [...currentItems, { ...item, quantity: Math.min(quantity, item.stockQuantity || 1) }],
            isDrawerOpen: true
          });
        }
      },

      removeItem: (id) => {
        set({ items: get().items.filter((i) => i.id !== id) });
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }
        const updated = get().items.map((item) => {
          if (item.id === id) {
            const validQty = Math.min(quantity, item.stockQuantity || 99);
            return { ...item, quantity: validQty };
          }
          return item;
        });
        set({ items: updated });
      },

      setPickupTime: (time) => set({ pickupTime: time }),
      setNotes: (notes) => set({ notes }),
      setPriority: (isPriority) => set({ isPriority }),
      clearCart: () => set({ items: [], notes: '', isPriority: false }),

      getTotalCount: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + (item.price * item.quantity), 0);
      }
    }),
    {
      name: 'canteen_cart_storage'
    }
  )
);
