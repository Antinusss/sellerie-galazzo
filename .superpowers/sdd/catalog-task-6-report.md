# Task 6 Report: Real logo + real category links in Navbar and Footer

## Summary of files changed

- `components/layout/Navbar.tsx` — replaced the hardcoded `text-2xl font-black` text logo with `next/image` rendering `/logo-selleria-galazzo.png` (h-10 w-[93px], `object-contain object-left`, `priority`). Replaced the hardcoded 4-item `categories` array (Monta Inglese, Monta Western, Scuderia, Cavaliere with `/shop?category=` query links) with real category-tree data: imports `categoriesData` from `data/categories.json`, casts to `Category[]`, computes `topLevel = getChildren(categories, undefined)` (Task 3's helper) at module scope. Desktop nav now renders the 3 real top-level categories (Scuderia, Monta Western, Monta Inglese, sorted by `productCount` descending) as `/shop/${cat.slug.join('/')}` links, each with a hover dropdown listing `getChildren(categories, cat)` (the depth-2 children). Mobile menu updated the same way.
- `components/layout/Footer.tsx` — replaced the hardcoded text logo with the same `next/image` logo, wrapped in a `bg-white rounded-lg p-2` chip (h-12 w-[112px]) since the logo art is black-on-transparent and the footer background is black. Replaced the hardcoded 5-item Shop list (`Monta Inglese, Monta Western, Scuderia, Cavaliere, Offerte`, all linking to plain `/shop`) with `topLevel.map(...)`, each linking to `/shop/${cat.slug.join('/')}`.

Both files were written verbatim per `.superpowers/sdd/catalog-task-6-brief.md`, no deviations.

## Manual verification performed

- `npx tsc --noEmit` — Navbar.tsx and Footer.tsx produce zero errors. Remaining errors in the repo (`components/home/CategoryGrid.tsx`, `lib/feed-transform.ts`, `scripts/sync-product-feed.ts`) are pre-existing; confirmed via `git stash` + re-run that the exact same errors exist on the pre-Task-6 tree, so they are out of scope for this task.
- `npx next build` — compiles successfully through the Navbar/Footer bundle; the build then fails type-checking at `CategoryGrid.tsx:25` (`cat.id` doesn't exist on `Category`), which is the same pre-existing issue confirmed above, unrelated to this task's files.
- `npx jest` — all 4 suites / 40 tests pass (no test currently covers Navbar/Footer directly, consistent with the brief's context).
- `npx eslint components/layout/Navbar.tsx components/layout/Footer.tsx` — no lint errors.
- Ran `next dev` on port 3911 and curled `/`: HTTP 200, HTML contains `logo-selleria-galazzo.png` (used by both Navbar and Footer), and contains the real category names "Monta Inglese", "Monta Western", "Scuderia" (14/8/20 occurrences respectively across nav + dropdowns + footer + homepage category grid). Dev server log showed a pre-existing React key warning inside `CategoryGrid` (unrelated component, missing `id` field use), no errors from Navbar or Footer.
- Killed the dev server after verification.

## Deviations from the brief

None. Both files match the brief's code blocks exactly.

## Self-review notes

- `getChildren` is imported and reused as instructed, not reimplemented.
- Confirmed `lib/category-tree.ts` and `lib/types.ts` already exported everything the brief's imports need (`getChildren`, `Category`), and `data/categories.json` / `public/logo-selleria-galazzo.png` exist from Task 4 (123 nodes, 3 top-level: Scuderia, Monta Western, Monta Inglese).
- Note for whoever owns routing (likely Task 7/8): `app/shop` currently only has a single dynamic segment `app/shop/[slug]`, not a catch-all route. Multi-segment category links generated here (e.g. `/shop/monta-inglese/cavaliere`) will 404 until the shop route is converted to `[...slug]` or similar — this is expected to be handled by a later task and is outside Task 6's scope (the brief only asked to wire up the links, not the destination route).
- Pre-existing TypeScript/build errors in `CategoryGrid.tsx`, `feed-transform.ts`, and `sync-product-feed.ts` were verified unrelated to this change (present identically before Task 6 via `git stash` comparison) and left untouched, per the "minimal impact" instruction and since fixing them is not in this task's file list.
