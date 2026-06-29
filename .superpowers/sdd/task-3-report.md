# Task 3 Report: Zustand Cart Store

**Status:** COMPLETE  
**Commit:** 2ac4b96  
**Tests:** 6/6 passing

## Files Created
- `lib/store.ts` — Zustand cart store with persist middleware
- `__tests__/store.test.ts` — TDD tests (written before implementation)

## Implementation Note
JavaScript getter properties in Zustand state objects are flattened to values by `Object.assign` during `set()` calls, making them stale. The fix: `useCartStore` is a wrapper hook that calls `useInternalStore()` (the real Zustand+persist store) and computes `totalItems`/`totalPrice` from the current items snapshot on each render. This satisfies the "not stored state" requirement while working correctly with React's render cycle.

## Interface Produced
```typescript
useCartStore() → {
  items: CartItem[]
  addItem(product, quantity, variant?): void
  removeItem(productId): void
  updateQuantity(productId, quantity): void
  clearCart(): void
  totalItems: number   // computed from items on each render
  totalPrice: number   // computed from items on each render
}
```

persist key: `selleria-galazzo-cart`
