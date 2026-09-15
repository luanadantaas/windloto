'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartLineItem {
  variantId: string
  title: string
  price: number
  image: string
  quantity: number
}

interface CartStore {
  cart: CartLineItem[]
  shopifyCartId: string | null
  setShopifyCartId: (id: string) => void
  addToCart: (item: CartLineItem) => void
  removeFromCart: (variantId: string) => void
  updateQuantity: (variantId: string, quantity: number) => void
  clearCart: () => void
  totalItems: () => number
  totalPrice: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      cart: [],
      shopifyCartId: null,

      setShopifyCartId: (id) => set({ shopifyCartId: id }),

      addToCart: (item) => {
        const existing = get().cart.find((i) => i.variantId === item.variantId)
        if (existing) {
          set({
            cart: get().cart.map((i) =>
              i.variantId === item.variantId
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            ),
          })
        } else {
          set({ cart: [...get().cart, item] })
        }
      },

      removeFromCart: (variantId) =>
        set({ cart: get().cart.filter((i) => i.variantId !== variantId) }),

      updateQuantity: (variantId, quantity) =>
        set({
          cart: quantity <= 0
            ? get().cart.filter((i) => i.variantId !== variantId)
            : get().cart.map((i) =>
                i.variantId === variantId ? { ...i, quantity } : i
              ),
        }),

      clearCart: () => set({ cart: [], shopifyCartId: null }),

      totalItems: () => get().cart.reduce((sum, i) => sum + i.quantity, 0),

      totalPrice: () => get().cart.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    { name: 'windloto-shopify-cart' }
  )
)
