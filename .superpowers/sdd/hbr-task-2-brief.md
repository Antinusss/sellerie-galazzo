### Task 2: Full build + test + manual verification

**Files:** None (verification only).

- [ ] **Step 1: Full automated check**

Run: `npx tsc --noEmit && npm test && npm run build`
Expected: no type errors, all tests pass, build succeeds, home route (`/`) generates.

- [ ] **Step 2: Manual browser verification**

Start the production server (`npm run start`, port 3000) and check:

1. Home page (`/`): carousel card shows slide 1 of 4 — real product photo, category chip, "01 / 04" counter, product name as headline, real price, "Vedi il prodotto" button.
2. Click the next-arrow button 3 times: confirm the slide content changes each time (different product photo/name/price), and wraps back to slide 1 on a 4th click. Click the prev-arrow: confirm it cycles backward correctly (including wrapping from slide 1 back to slide 4).
3. Click "Vedi il prodotto" on the currently showing slide: confirm it navigates to that exact product's `/prodotto/[slug]` page (matching the name/price just shown).
4. Click each of the 3 "Seguici su" social links: confirm they open the correct real URLs (m.facebook.com/galazzoselleria, instagram.com/selleriagalazzo, tiktok.com/@selleria_galazzo) in a new tab.
5. Right column: 3 category cards render with real photos and labels, each links to its `GUIDE_LINKS` href.
6. Bottom-left card: shows "{real product count}+ prodotti" (matches the actual `data/products.json` length — confirm the number isn't a stray placeholder), clicking the text navigates to `/shop`; clicking the separate heart icon navigates to `/wishlist` (confirm these are two independently clickable areas, not one link swallowing the other — this was a specific nested-`<a>` risk called out in this plan).
7. Bottom-center card: shows 3 colored avatar circles, "10k+ Cavalieri", "4.8 su 5" rating line.
8. Bottom-right card: shows a real bestseller product photo/name/rating with a "Bestseller" badge, clicking it navigates to that product's page.
9. Trust strip (4 items) unchanged from before this plan, still renders below everything.
10. Browser console: no errors on `/` or after any of the above interactions.

- [ ] **Step 3: Record findings**

If any check in Step 2 fails, fix it before proceeding — do not mark this task complete with a known-broken interaction.
