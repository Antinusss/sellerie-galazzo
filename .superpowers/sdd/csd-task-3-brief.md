### Task 3: Full build + test + manual verification

**Files:** None (verification only).

- [ ] **Step 1: Full automated check**

Run: `npx tsc --noEmit && npm test && npm run build`
Expected: no type errors, all tests pass, build succeeds with all `/shop/**` routes intact.

- [ ] **Step 2: Manual browser verification**

Start the production server (`npm run start`, port 3000) and check:

1. A depth-1 branch page (`/shop/scuderia`): visible description paragraph appears below the H1, reads "Tutto il necessario per Scuderia: 345 prodotti selezionati, spedizione rapida in tutta Italia e reso entro 14 giorni." (or the current real product count for Scuderia — confirm it's a real number, not a placeholder).
2. A deeper category page (e.g. `/shop/monta-inglese/cavaliere` or any depth ≥2 leaf under it): description reads "Scopri i nostri N prodotti di {name} per {parent}: qualità professionale, spedizione tracciata e reso entro 14 giorni." with the correct immediate-parent name.
3. The root `/shop` page: no description paragraph renders, and the H1-to-grid spacing looks the same as it did before this change (no visual regression from the conditional `mb-3`/`mb-8` class).
4. View page source (or use the browser's dev tools Elements panel) on a category page: confirm `<meta name="description" content="...">` is present in the `<head>` and matches the visible paragraph text exactly.
5. Browser console: no errors on any of the above pages.

- [ ] **Step 3: Record findings**

If any check in Step 2 fails, fix it before proceeding — do not mark this task complete with a known-broken interaction.
