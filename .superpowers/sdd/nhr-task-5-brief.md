### Task 5: Full build + test + manual verification

**Files:** None (verification only).

- [ ] **Step 1: Full automated check**

Run: `npx tsc --noEmit && npm test && npm run build`
Expected: no type errors, all tests pass, build succeeds with the home route (`/`) and no broken imports.

- [ ] **Step 2: Manual browser verification**

Start the production server (`npm run start`, port 3000) and check:

1. Home page (`/`): hero shows the contained banner (not full-screen), 3 category quick-link cards to its right, 4-item trust strip below. `CategoryShowcase` section below it shows 4 rows, each with a promo tile and a horizontally-scrollable strip of real product cards (photo, name, price, add-to-cart button all render).
2. Hover each of the 3 top-nav categories (Monta Inglese / Monta Western / Scuderia): panel opens with a left sidebar of sub-categories, a center grid of leaf-category tiles for the first (default-selected) sidebar item, and a right "In evidenza" column of 4 real products with photo/name/price.
3. Hover a different sidebar item within an open panel: confirm the center grid updates to that item's leaf categories, and the sidebar highlight moves — without the panel closing.
4. Move the mouse out of the top-nav item and back in: confirm the sidebar selection resets to the first item each time (not sticky from a previous hover).
5. Click a product in the mega menu's "In evidenza" column: confirm it navigates to the correct `/prodotto/[slug]` page.
6. Click a promo tile and a product's "aggiungi al carrello" button in the new home category rows: confirm navigation and cart-add both work.
7. Browser console: no errors on `/`.

- [ ] **Step 3: Record findings**

If any check in Step 2 fails, fix it before proceeding — do not mark this task complete with a known-broken interaction.
