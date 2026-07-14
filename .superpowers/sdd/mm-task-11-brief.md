### Task 11: Full build + test + manual verification

**Files:** none (verification only)

- [ ] **Step 1: Run the full test suite**

Run: `npm test`
Expected: PASS, all suites green (category-tree, offers, feed-transform, store, utils)

- [ ] **Step 2: Type-check and build**

Run: `npx tsc --noEmit && npm run build`
Expected: zero TypeScript errors; build succeeds. Page count grows by 62 (`/brand/[slug]`) + 2 (`/marche`, `/offerte`) over the previous ~3199, so expect roughly 3263 static pages generated.

- [ ] **Step 3: Manual smoke test with the production build**

Run: `npm run start` (in background), then:

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/marche
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/brand/equestro
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/offerte
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/shop/monta-inglese
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/prodotto/acavallo-sapone-per-il-cuoio-alla-mandorla-500ml-glicerina
```

Expected: `200` for every route. Stop the server after checking.

- [ ] **Step 4: Browser check of the golden path**

Using the `run` skill or a browser tool, confirm interactively: hovering each of the 3 category nav items shows the multi-column flyout with the promo photo on the right; hovering "Marche" shows the logo grid; "Offerte" is a plain red-tinted link; hovering "Guida ai prodotti" shows the 8 links; `/marche` renders all 62 brand tiles; a brand page (`/brand/tommy-hilfiger`) lists only that brand's products with working pagination; `/offerte` shows only discounted products with a strike-through original price; a product page shows the new "Venduto da" brand block and the category breadcrumb is clickable at every level; a long category (`/shop/monta-inglese`) shows page-number controls and clicking page 2 changes the grid.

- [ ] **Step 5: Final commit (if any fixups were needed)**

```bash
git add -A
git commit -m "fix: address issues found during full verification"
```

(Skip this step if Steps 1-4 all passed cleanly with no changes needed.)
