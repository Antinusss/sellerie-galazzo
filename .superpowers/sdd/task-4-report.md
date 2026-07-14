## Task 4 Report: ProductCard Wishlist Toggle and Badge Pill

### What Was Done

Applied three edits to `components/shop/ProductCard.tsx`:

1. **Added imports**: Integrated `useWishlistStore` from `lib/wishlist-store.ts` and `getBadge` from `lib/badges.ts`

2. **Added hooks**: Instantiated wishlist state with:
   - `const { toggleWishlist, isWishlisted } = useWishlistStore()`
   - `const wishlisted = isWishlisted(product.id)`
   - `const badge = getBadge(product.id)`

3. **Replaced discount badge**: Changed single discount-only `<span>` to stacked `<div>` that renders:
   - Discount badge (if applicable)
   - "Bestseller" badge (when `badge === 'bestseller'`, black background)
   - "Novità" badge (when `badge === 'novita'`, sand background)

4. **Wired heart button**: Updated button to:
   - Call `toggleWishlist(product.id)` on click
   - Toggle visibility: always visible when wishlisted, hover-only when not
   - Fill heart icon red when wishlisted
   - Prevent default link navigation via `e.preventDefault()`

### Build Verification

**TypeScript Check**: ✅ `npx tsc --noEmit` — no errors

**Build Output**: ✅ `npm run build` — succeeded
- Compiled successfully
- 3264 routes generated (no count change expected, ProductCard is used across existing routes)
- Largest route: 151 kB (home page)
- No build errors or warnings

### Commit

- Hash: `8de071f`
- Message: "feat: wire wishlist toggle and badges into ProductCard"
- Files changed: 1 (`components/shop/ProductCard.tsx`)
- Insertions: 25, Deletions: 7
