import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem, Product } from './types'

interface InternalState {
  items: CartItem[]
  addItem: (product: Product, quantity: number, variant?: string) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
}

export interface CartStore extends InternalState {
  totalItems: number
  totalPrice: number
}

const useInternalStore = create<InternalState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, quantity, variant) => {
        const existing = get().items.find(i => i.product.id === product.id)
        if (existing) {
          set(s => ({
            items: s.items.map(i =>
              i.product.id === product.id ? { ...i, quantity: i.quantity + quantity } : i
            ),
          }))
        } else {
          set(s => ({ items: [...s.items, { product, quantity, variant }] }))
        }
      },
      removeItem: (productId) =>
        set(s => ({ items: s.items.filter(i => i.product.id !== productId) })),
      updateQuantity: (productId, quantity) =>
        set(s => ({
          items: s.items.map(i => i.product.id === productId ? { ...i, quantity } : i),
        })),
      clearCart: () => set({ items: [] }),
    }),
    { name: 'selleria-galazzo-cart' }
  )
)

export function useCartStore(): CartStore {
  const store = useInternalStore()
  const { items } = store
  return {
    ...store,
    totalItems: items.reduce((sum, i) => sum + i.quantity, 0),
    totalPrice: items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
  }
}
