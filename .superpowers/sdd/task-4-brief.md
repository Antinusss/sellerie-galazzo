### Task 4: ProductCard wishlist toggle and badge pill

**Files:**
- Modify: `components/shop/ProductCard.tsx`

**Interfaces:**
- Consumes: `useWishlistStore()` from `lib/wishlist-store.ts` (already exists, produces `{ productIds: string[]; toggleWishlist(id): void; isWishlisted(id): boolean }`).
- Consumes: `getBadge(productId: string): 'novita' | 'bestseller' | null` from `lib/badges.ts` (already exists).

- [ ] **Step 1: Add imports and hooks**

In `components/shop/ProductCard.tsx`, add these imports alongside the existing ones:

```tsx
import { useWishlistStore } from '@/lib/wishlist-store'
import { getBadge } from '@/lib/badges'
```

Inside the component, alongside the existing `const { addItem, openCart } = useCartStore()` line, add:

```tsx
  const { toggleWishlist, isWishlisted } = useWishlistStore()
  const wishlisted = isWishlisted(product.id)
  const badge = getBadge(product.id)
```

- [ ] **Step 2: Replace the discount-badge span with a stacked badge column**

Replace:

```tsx
        {discountPct && (
          <span className="absolute top-3 left-3 bg-red text-white text-xs font-bold px-2 py-1 rounded-full">
            -{discountPct}%
          </span>
        )}
```

with:

```tsx
        <div className="absolute top-3 left-3 flex flex-col gap-1 items-start">
          {discountPct && (
            <span className="bg-red text-white text-xs font-bold px-2 py-1 rounded-full">
              -{discountPct}%
            </span>
          )}
          {badge === 'bestseller' && (
            <span className="bg-black text-white text-xs font-bold px-2 py-1 rounded-full">Bestseller</span>
          )}
          {badge === 'novita' && (
            <span className="bg-sand text-black text-xs font-bold px-2 py-1 rounded-full">Novità</span>
          )}
        </div>
```

- [ ] **Step 3: Wire the heart button to the wishlist toggle**

Replace:

```tsx
        <button className="absolute top-3 right-3 p-2 bg-white/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:text-red">
          <Heart size={16} />
        </button>
```

with:

```tsx
        <button
          onClick={e => { e.preventDefault(); toggleWishlist(product.id) }}
          className={`absolute top-3 right-3 p-2 bg-white/90 rounded-full transition-opacity hover:text-red ${
            wishlisted ? 'opacity-100 text-red' : 'opacity-0 group-hover:opacity-100'
          }`}
        >
          <Heart size={16} className={wishlisted ? 'fill-red' : ''} />
        </button>
```

- [ ] **Step 4: Verify the build**

Run: `npx tsc --noEmit`
Expected: no errors

Run: `npm run build`
Expected: build succeeds (no route count change — `ProductCard` is used across existing routes)

- [ ] **Step 5: Commit**

```bash
git add components/shop/ProductCard.tsx
git commit -m "feat: wire wishlist toggle and badges into ProductCard"
```
