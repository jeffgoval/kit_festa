import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartEntry, CartState } from '@/core/types'

interface CartActions {
  initCart: (tenantSlug: string) => void
  addItem: (entry: Omit<CartEntry, 'quantity'> & { quantity?: number }) => void
  removeItem: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  setEventDate: (date: string | null) => void
  addCompositionBase: (compositionId: string, items: CartEntry[]) => void
  clearCart: () => void
  total: () => number
  itemCount: () => number
}

type CartStore = CartState & CartActions

const emptyState: CartState = {
  tenantSlug: null,
  entries: [],
  eventDate: null,
  originCompositionIds: [],
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      ...emptyState,

      initCart(tenantSlug) {
        // Reset if switching tenant (e.g. user navigates to a different store)
        if (get().tenantSlug !== tenantSlug) {
          set({ ...emptyState, tenantSlug })
        }
      },

      addItem(entry) {
        const qty = entry.quantity ?? 1
        set((state) => {
          const existing = state.entries.find((e) => e.itemId === entry.itemId)
          if (existing) {
            return {
              entries: state.entries.map((e) =>
                e.itemId === entry.itemId
                  ? { ...e, quantity: Math.min(e.quantity + qty, e.totalAvailable) }
                  : e,
              ),
            }
          }
          return {
            entries: [
              ...state.entries,
              { ...entry, quantity: Math.min(qty, entry.totalAvailable) },
            ],
          }
        })
      },

      removeItem(itemId) {
        set((state) => ({
          entries: state.entries.filter((e) => e.itemId !== itemId),
        }))
      },

      updateQuantity(itemId, quantity) {
        if (quantity <= 0) {
          get().removeItem(itemId)
          return
        }
        set((state) => ({
          entries: state.entries.map((e) =>
            e.itemId === itemId
              ? { ...e, quantity: Math.min(quantity, e.totalAvailable) }
              : e,
          ),
        }))
      },

      setEventDate(date) {
        set({ eventDate: date })
      },

      addCompositionBase(compositionId, items) {
        set((state) => {
          const alreadyUsed = state.originCompositionIds.includes(compositionId)
          let entries = [...state.entries]

          for (const item of items) {
            const existing = entries.find((e) => e.itemId === item.itemId)
            if (existing) {
              entries = entries.map((e) =>
                e.itemId === item.itemId
                  ? { ...e, quantity: Math.min(e.quantity + item.quantity, e.totalAvailable) }
                  : e,
              )
            } else {
              entries.push({ ...item, compositionId })
            }
          }

          return {
            entries,
            originCompositionIds: alreadyUsed
              ? state.originCompositionIds
              : [...state.originCompositionIds, compositionId],
          }
        })
      },

      clearCart() {
        set((state) => ({ ...emptyState, tenantSlug: state.tenantSlug }))
      },

      total() {
        return get().entries.reduce(
          (sum, e) => sum + (e.unitPrice ?? 0) * e.quantity,
          0,
        )
      },

      itemCount() {
        return get().entries.reduce((sum, e) => sum + e.quantity, 0)
      },
    }),
    {
      name: 'recriar-cart',
      // Scope storage key per tenant to avoid cross-store contamination
      partialize: (state) => ({
        tenantSlug: state.tenantSlug,
        entries: state.entries,
        eventDate: state.eventDate,
        originCompositionIds: state.originCompositionIds,
      }),
    },
  ),
)
