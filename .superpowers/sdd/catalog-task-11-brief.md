### Task 11: Full build + test + manual verification

**Files:** none (verification only)

- [ ] **Step 1: Run the full test suite**

Run: `npm test`
Expected: PASS, 14+ tests (original 14 plus the new `feed-transform` and `category-tree` suites from Tasks 2-3).

- [ ] **Step 2: Type-check and build**

Run: `npm run build`
Expected: build succeeds; output reports ~3190 static pages generated (3066 products + 123 category nodes + 1 shop root + other existing routes). No TypeScript errors.

- [ ] **Step 3: Manual smoke test with the production build**

Run: `npm run start` (in background), then:
```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/shop
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/shop/scuderia
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/prodotto/acavallo-sapone-per-il-cuoio-alla-mandorla-500ml-glicerina
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/cart
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/checkout
```
Expected: `200` for every route. Stop the server after checking.

- [ ] **Step 4: Browser check of the golden path**

Open `http://localhost:3000` in a browser (or via the `run` skill), confirm: real logo shows in Navbar and Footer, homepage category grid shows 3 real branches with real photos, `/shop` shows real products with working category tree navigation, a product detail page shows a real image/price/description, "Aggiungi al carrello" works and the cart badge updates, `/cart` → `/checkout` flow completes to the success page.

- [ ] **Step 5: Final commit (if any fixups were needed)**

```bash
git add -A
git commit -m "fix: address issues found during full verification"
```

(Skip this step if Steps 1-4 all passed cleanly with no changes needed.)
