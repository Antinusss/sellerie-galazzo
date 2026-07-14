# Task 1: Wishlist data layer — Report

Implemented by controller directly (Agent tool was temporarily unavailable due to a
tool-classifier outage; work followed the brief exactly, same TDD sequence a
subagent would have run).

## What was done

- Created `__tests__/wishlist-store.test.ts` with 5 tests covering `toggleWishlist`
  (add/remove/multiple ids) and `isWishlisted` (false-by-default, true-after-toggle).
- Ran `npx jest __tests__/wishlist-store.test.ts` — confirmed FAIL
  (`Cannot find module '@/lib/wishlist-store'`).
- Created `lib/wishlist-store.ts`: a Zustand store with `persist` middleware
  (localStorage key `selleria-galazzo-wishlist`), exposing `productIds: string[]`,
  `toggleWishlist(productId)`, `isWishlisted(productId)`. Mirrors the existing
  `lib/store.ts` cart-store pattern.
- Ran `npx jest __tests__/wishlist-store.test.ts` again — PASS, 5/5.
- Committed as `52a3120`.

## Test command and output

```
npx jest __tests__/wishlist-store.test.ts
```

```
Test Suites: 1 passed, 1 total
Tests:       5 passed, 5 total
Snapshots:   0 total
Time:        0.48 s
```

## Commit

`52a3120` — "feat: add wishlist store"

## Concerns

None.
