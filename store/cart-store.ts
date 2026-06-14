import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Product } from '@/types/product.types'

export interface CartItem {
  id: number
  productId: number
  name: string
  price: number
  quantity: number
  image: string
  stock: number

}

interface CartState {
  items: CartItem[]
  addItem: (product: Product, quantity?: number) => void
  removeItem: (productId: number) => void
  updateQuantity: (productId: number, quantity: number) => void
  clearCart: () => void
  getTotalItems: () => number
  getSubtotal: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product: Product, quantity = 1) => {
        const items = [...get().items]
        const existingItem = items.find((item) => item.productId === product.id)

        if (existingItem) {
          existingItem.quantity += quantity
        } else {
          items.push({
            id: Date.now(),
            productId: product.id,
            name: product.name,
            price: typeof product.price === 'string' ? parseFloat(product.price) : product.price,
            quantity,
            image: product.images?.[0] || product.thumbnail || '',
            stock: product.stock,
          })
        }

        set({ items })
      },

      removeItem: (productId: number) => {
        set({
          items: get().items.filter((item) => item.productId !== productId),
        })
      },

      updateQuantity: (productId: number, quantity: number) => {
        const items = get().items.map((item) =>
          item.productId === productId ? { ...item, quantity: Math.max(1, Math.min(quantity, item.stock)) } : item
        )
        set({ items })
      },

      clearCart: () => set({ items: [] }),

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0)
      },

      getSubtotal: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0)
      },
    }),
    {
      name: 'cart-storage',
    }
  )
)