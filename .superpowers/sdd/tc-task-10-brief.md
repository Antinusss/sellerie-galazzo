### Task 10: Full build + test + manual verification

**Files:** none (verification only)

- [ ] **Step 1: Run the full test suite**

Run: `npm test`
Expected: PASS, all suites green (store, search, reviews, category-tree, offers, feed-transform, utils)

- [ ] **Step 2: Type-check and build**

Run: `npx tsc --noEmit && npm run build`
Expected: zero TypeScript errors; build succeeds; page count unchanged from before this plan (~3263 — this plan adds no new routes)

- [ ] **Step 3: Manual smoke test with the production build**

Run: `npm run start` (in background), then:

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/prodotto/acavallo-sapone-per-il-cuoio-alla-mandorla-500ml-glicerina
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/checkout
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/cart
```

Expected: `200` for every route. Stop the server after checking.

- [ ] **Step 4: Browser check of the golden path**

Using interactive browser tooling, confirm: the header search bar is visible without clicking anything on desktop widths, typing shows a live dropdown of real results, clicking a result navigates to that product; clicking "Aggiungi al carrello" on a product card or product page opens the slide-in cart drawer from the right with the item in it; the drawer's "Vai al checkout" link works; on `/checkout` step 3, selecting each payment method swaps the visible content correctly and the order still completes via "Conferma ordine"; a product page shows star ratings under the title and in a card grid, and a working "Recensioni (N)" tab with sample reviews; the Klarna badge appears under the price; the homepage hero shows the 4th "4.8★ Recensioni verificate" stat.

- [ ] **Step 5: Final commit (if any fixups were needed)**

```bash
git add -A
git commit -m "fix: address issues found during full verification"
```

(Skip this step if Steps 1-4 all passed cleanly with no changes needed.)
