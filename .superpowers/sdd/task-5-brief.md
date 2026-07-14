### Task 5: ProductInfo wishlist toggle

**Files:**
- Modify: `components/product/ProductInfo.tsx`

**Interfaces:**
- Consumes: `useWishlistStore()` from `lib/wishlist-store.ts` (already exists, produces `{ productIds: string[]; toggleWishlist(id): void; isWishlisted(id): boolean }`).

- [ ] **Step 1: Add import and hook**

Add to the existing imports:

```tsx
import { useWishlistStore } from '@/lib/wishlist-store'
```

Inside the component, alongside the existing `const { addItem, openCart } = useCartStore()` line, add:

```tsx
  const { toggleWishlist, isWishlisted } = useWishlistStore()
  const wishlisted = isWishlisted(product.id)
```

- [ ] **Step 2: Wire the wishlist button**

Replace:

```tsx
        <button className="w-full py-4 rounded-full font-bold border-2 border-black hover:bg-black hover:text-white transition-colors flex items-center justify-center gap-2">
          <Heart size={20} />
          Aggiungi alla wishlist
        </button>
```

with:

```tsx
        <button
          onClick={() => toggleWishlist(product.id)}
          className={`w-full py-4 rounded-full font-bold border-2 flex items-center justify-center gap-2 transition-colors ${
            wishlisted ? 'border-red bg-red/5 text-red' : 'border-black hover:bg-black hover:text-white'
          }`}
        >
          <Heart size={20} className={wishlisted ? 'fill-red' : ''} />
          {wishlisted ? 'Nella tua wishlist ✓' : 'Aggiungi alla wishlist'}
        </button>
```

- [ ] **Step 3: Verify the build**

Run: `npx tsc --noEmit`
Expected: no errors

Run: `npm run build`
Expected: build succeeds, all `/prodotto/[slug]` pages still generate (3066 paths)

- [ ] **Step 4: Commit**

```bash
git add components/product/ProductInfo.tsx
git commit -m "feat: wire wishlist toggle into ProductInfo"
```
