### Task 3: Wishlist page and Navbar entry point

**Files:**
- Create: `app/wishlist/page.tsx`
- Modify: `components/layout/Navbar.tsx`

**Interfaces:**
- Consumes: `useWishlistStore()` from `lib/wishlist-store.ts` (already exists, produces `{ productIds: string[]; toggleWishlist(id): void; isWishlisted(id): boolean }`).
- Consumes: `PaginatedProductGrid({ products: Product[] })` (existing, `components/shop/PaginatedProductGrid.tsx`).

- [ ] **Step 1: Create the wishlist page**

Create `app/wishlist/page.tsx`:

```tsx
'use client'
import Link from 'next/link'
import { Heart } from 'lucide-react'
import allProducts from '@/data/products.json'
import type { Product } from '@/lib/types'
import { useWishlistStore } from '@/lib/wishlist-store'
import PaginatedProductGrid from '@/components/shop/PaginatedProductGrid'

const products = allProducts as Product[]

export default function WishlistPage() {
  const { productIds } = useWishlistStore()
  const wishlisted = products.filter(p => productIds.includes(p.id))

  if (wishlisted.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <Heart size={64} className="mx-auto text-gray-200 mb-6" />
        <h1 className="text-3xl font-black mb-3">La tua wishlist è vuota</h1>
        <p className="text-gray-400 mb-8">Salva i prodotti che ti piacciono per ritrovarli facilmente.</p>
        <Link
          href="/shop"
          className="inline-block bg-red text-white px-8 py-4 rounded-full font-bold hover:bg-red-dark transition-colors"
        >
          Vai allo shop
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-4xl font-black mb-2">
        La tua <em className="text-red">wishlist</em>
      </h1>
      <p className="text-sm text-gray-400 mb-8">{wishlisted.length} prodotti salvati</p>
      <PaginatedProductGrid products={wishlisted} />
    </div>
  )
}
```

- [ ] **Step 2: Wire the Navbar heart icon to the wishlist**

In `components/layout/Navbar.tsx`, add the import (near the other `lib/` imports):

```tsx
import { useWishlistStore } from '@/lib/wishlist-store'
```

Inside the `Navbar` component body, alongside the existing `const { totalItems, openCart } = useCartStore()` line, add:

```tsx
const { productIds: wishlistIds } = useWishlistStore()
```

Replace this block:

```tsx
            <button className="p-2 hover:text-red transition-colors">
              <Heart size={20} />
            </button>
```

with:

```tsx
            <Link href="/wishlist" className="relative p-2 hover:text-red transition-colors">
              <Heart size={20} />
              {wishlistIds.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {wishlistIds.length}
                </span>
              )}
            </Link>
```

(`Link` is already imported in this file.)

- [ ] **Step 3: Verify the build**

Run: `npx tsc --noEmit`
Expected: no errors

Run: `npm run build`
Expected: build succeeds, new static route `○ /wishlist` appears in the route list

- [ ] **Step 4: Commit**

```bash
git add app/wishlist/page.tsx components/layout/Navbar.tsx
git commit -m "feat: add wishlist page and navbar entry point"
```
