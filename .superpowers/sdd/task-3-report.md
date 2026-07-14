# Task 3 Report: Wishlist page and Navbar entry point

## What was done

1. Created `app/wishlist/page.tsx` — client component using `useWishlistStore()` to filter
   `data/products.json` down to wishlisted products, rendering an empty state (Heart icon +
   CTA to `/shop`) when there are none, or a heading + `PaginatedProductGrid` when there are.
   Code matches the brief verbatim.

2. Modified `components/layout/Navbar.tsx`:
   - Added `import { useWishlistStore } from '@/lib/wishlist-store'` alongside the other
     `lib/` imports.
   - Added `const { productIds: wishlistIds } = useWishlistStore()` next to the existing
     `useCartStore()` destructure.
   - Replaced the decorative `<button>` wrapping the `Heart` icon with a `<Link href="/wishlist">`
     that shows a red count badge (same badge styling as the cart badge) when
     `wishlistIds.length > 0`.
   - No other lines in the file were touched.

## Build verification

`npx tsc --noEmit` — no output, no errors.

`npm run build` — succeeded:

```
Route (app)                                                                 Size     First Load JS
...
└ ○ /wishlist                                                               3.29 kB         413 kB
...
○  (Static)  prerendered as static content
```

New static route `○ /wishlist` appears in the route list as expected. Note: First Load JS for
`/wishlist` (413 kB) is larger than other routes because the page imports the full
`data/products.json` client-side (3066 products) to filter by id — this is the exact
implementation specified in the brief, not a deviation.

## Files changed

- `app/wishlist/page.tsx` (new)
- `components/layout/Navbar.tsx` (2 import/hook lines + 1 button→Link block replacement)

## Commit

- `324e4a1` — "feat: add wishlist page and navbar entry point"

## Note

This file previously (as of commit history before this task) contained a report for a
different, earlier "Task 3" (the Zustand cart store, commit `2ac4b96`). That work is already
committed and unaffected; this report has been overwritten to reflect the current plan's
Task 3 (wishlist page), per the task-3-brief.md in this same directory.
