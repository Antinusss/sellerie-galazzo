# Task 1 Report: Add a real representative image to each guide link

## Summary

Successfully implemented TDD workflow to add a computed `image` field to each guide link entry. The implementation resolves a real product image from the catalog for each category referenced by the guide links.

## Changes Made

### Files Modified
1. **`lib/guide-links.ts`** - Complete rewrite:
   - Added `image: string` field to `GuideLink` interface
   - Created `RawGuideLink` interface for static label/href pairs
   - Imported category and product data files with proper types
   - Implemented `imageForHref()` helper function that:
     - Parses href to extract category slug path
     - Uses `findCategoryBySlugPath()` to locate the category
     - Uses `productsUnderCategory()` to get products for that category
     - Returns the first image URL from the first product with an image (or empty string if none)
   - Updated `GUIDE_LINKS` export to map raw links with computed images

2. **`__tests__/guide-links.test.ts`** - New test file:
   - Test 1: Verifies 8 entries exist
   - Test 2: Verifies all entries have non-empty label, href, and image fields
   - Test 3: Verifies a known category resolves to a real product image URL from selleriagalazzo.com

## Test Results

```
> sellerie-galazzo@0.1.0 test
> jest __tests__/guide-links.test.ts

Test Suites: 1 passed, 1 total
Tests:       3 passed, 3 total
Snapshots:   0 total
Time:        0.463 s, estimated 1 s
Ran all test suites matching __tests__/guide-links.test.ts.
```

All tests passed on first run after implementation.

## Implementation Details

The solution follows the exact specification from the brief:
- Uses existing catalog data (`data/categories.json`, `data/products.json`)
- Leverages existing `category-tree` utilities (`findCategoryBySlugPath`, `productsUnderCategory`)
- Each guide link now includes a representative product image from its category
- Maintains backward compatibility: `label` and `href` fields unchanged
- Existing consumers (Navbar, guida-ai-prodotti page) continue to work; new field available for future use

## Commit Information

- Commit hash: `a990d0c`
- Message: `feat: resolve a real product image per guide link category`
- Files committed: `lib/guide-links.ts`, `__tests__/guide-links.test.ts`
