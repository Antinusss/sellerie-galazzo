# Task 2: Product Badge Data Layer — Report

**Status:** DONE

**Commit:** `8483068`

**Tests:** All 5 tests passing

---

## Summary

Implemented a deterministic product badge module (`lib/badges.ts`) that assigns "Novità" or "Bestseller" labels to products based on review counts and product ID modulo arithmetic. The implementation follows TDD and consumes the existing `getReviewSummary()` from `lib/reviews.ts`.

## Files Created

### 1. **lib/badges.ts**
The badge module providing deterministic badge assignment:
- Exports `Badge` type: `'novita' | 'bestseller' | null`
- Exports `getBadge(productId: string): Badge` function
- Uses `BESTSELLER_COUNT_THRESHOLD = 110` for review count check
- Uses `NOVITA_MODULO = 12` for deterministic product ID check
- Includes `hashOf()` helper for numeric or string ID parsing
- Consumes `getReviewSummary()` from existing `lib/reviews.ts`

### 2. **__tests__/badges.test.ts**
Comprehensive test suite with 5 test cases:
- **Deterministic behavior**: Verifies same product ID always returns same badge
- **Bestseller logic**: Tests that product ID 108 (reviewCount=111, > threshold) returns "bestseller"
- **Novita logic**: Tests that product ID 12 (reviewCount=15, 12 % 12 === 0) returns "novita"
- **Null case**: Tests that product ID 1 (reviewCount=4, 1 % 12 !== 0) returns null
- **Coverage test**: Verifies all 300 product IDs yield exactly one of the three values

## Test Execution

### Step 1: Initial Test Run (Expected Failure)
```
FAIL __tests__/badges.test.ts
Configuration error: Could not locate module @/lib/badges
```
Status: ✓ Failed as expected (module did not exist)

### Step 2: Implementation Created
Created `lib/badges.ts` with exact specification from brief.

### Step 3: Final Test Run (Implementation Verification)
```
Test Suites: 1 passed, 1 total
Tests:       5 passed, 5 total
Snapshots:   0 total
Time:        0.422 s
```
Status: ✓ All tests passing

## Git Commit

```
Commit Hash: 8483068
Author: Antinusss
Message: feat: add deterministic product badge module
Files Changed:
  - __tests__/badges.test.ts (new, 28 lines)
  - lib/badges.ts (new, 20 lines)
Total: 2 files, 48 insertions
```

## Implementation Notes

### Badge Assignment Logic
1. **Bestseller**: If `reviewCount > 110`, return `'bestseller'`
2. **Novita**: If `hashOf(productId) % 12 === 0` (and not bestseller), return `'novita'`
3. **None**: Otherwise return `null`

### Design Pattern
- Follows established `lib/` module pattern from `lib/offers.ts`
- Small, deterministic, hash-based logic
- No side effects; pure function
- TypeScript strict mode compliant

## Dependencies
- Imports `getReviewSummary` from existing `lib/reviews.ts`
- No modifications to existing files
- Ready for consumption by Task 4 (ProductCard component)
