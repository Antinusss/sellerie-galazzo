import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface WishlistState {
  productIds: string[]
  toggleWishlist: (productId: string) => void
  isWishlisted: (productId: string) => boolean
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      productIds: [],
      toggleWishlist: (productId) =>
        set(s => ({
          productIds: s.productIds.includes(productId)
            ? s.productIds.filter(id => id !== productId)
            : [...s.productIds, productId],
        })),
      isWishlisted: (productId) => get().productIds.includes(productId),
    }),
    { name: 'selleria-galazzo-wishlist' }
  )
)
