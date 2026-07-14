# Task 5 Completion Report: Real Brand Logos in Homepage Carousel

## Summary
Updated `components/home/BrandCarousel.tsx` to render real brand logo images when available (using the `logo` field from `data/brands.json`), with fallback to styled text badges for brands without logos. This leverages the 23 brands with logos regenerated in Task 2.

## Changes Made
- Added `Image` import from `next/image`
- Changed import from default to named import and added type assertion for `Brand` type
- Added conditional rendering logic: `{brand.logo ? <Image /> : <span>}`
- Preserved all existing styles and functionality for non-logo brands

## TypeScript Typecheck Output
```
(no output - zero errors)
```

## Deviations
None. Implementation matches the brief exactly.

## Self-Review Notes
- Guard condition `brand.logo ?` correctly handles missing `logo` field (39 brands) since the field is absent, not `null`
- Image component uses `fill` with `object-contain` for proper responsive scaling
- Fallback text badge preserves original styling: `text-xl font-black text-black`
- No visual regression for brands without logos
- Doubled array mapping still works correctly with both conditional branches

## Commit Hash
```
32d55f0 feat: real brand logos in the homepage carousel
```
