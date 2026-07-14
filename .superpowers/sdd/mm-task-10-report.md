# Task 10 Report: Clickable breadcrumbs on the product page

## Summary

Modified `components/product/ProductInfo.tsx` exactly per the brief:
- Added `Link` (next/link), `findCategoryByPath` (from `@/lib/category-tree`), `categoriesData` (from `@/data/categories.json`), and the `Category` type import.
- Added `const categories = categoriesData as Category[]` module-level cast.
- Added `const breadcrumbSlug = findCategoryByPath(categories, product.categoryPath)?.slug ?? []` inside the component.
- Replaced the plain `<p>{product.categoryPath.join(' / ')}</p>` breadcrumb with a `<nav>` that renders each `categoryPath` segment as a `Link` to the corresponding depth of `/shop/...` (built from `breadcrumbSlug.slice(0, i + 1).join('/')`), falling back to plain `<span>` text if no matching category is found (`breadcrumbSlug.length === 0`).

No deviations from the brief's verbatim code.

## `npx tsc --noEmit` output

```
(no output — zero errors)
```

## Dev server verification (curl)

Command:
```bash
curl -s http://localhost:3000/prodotto/acavallo-sapone-per-il-cuoio-alla-mandorla-500ml-glicerina | grep -o 'href="/shop/scuderia[^"]*"' | sort -u
```

Output (includes breadcrumb links plus sidebar filter links, all under `/shop/scuderia*`):
```
href="/shop/scuderia"
href="/shop/scuderia/abbeveratoi"
href="/shop/scuderia/attrezzatura-da-scuderia"
href="/shop/scuderia/attrezzatura-da-scuderia/bauli-e-bauletti"
href="/shop/scuderia/attrezzatura-da-scuderia/borse-e-zaini"
href="/shop/scuderia/attrezzatura-da-scuderia/pulizia-scuderia"
href="/shop/scuderia/cura-del-cavallo"
href="/shop/scuderia/cura-del-cavallo/accessori-coda-e-criniera"
href="/shop/scuderia/cura-del-cavallo/benessere-e-recupero"
href="/shop/scuderia/cura-del-cavallo/coperte"
href="/shop/scuderia/cura-del-cavallo/cura-degli-zoccoli"
href="/shop/scuderia/cura-del-cavallo/repellenti-e-maschere-antimosche"
href="/shop/scuderia/cura-del-cavallo/shampoo-e-sgroviglianti"
href="/shop/scuderia/cura-del-cavallo/snack-e-biscotti"
href="/shop/scuderia/cura-del-cavallo/spazzole-nettapiedi-e-striglie"
href="/shop/scuderia/cura-del-cavallo/tosatrici-e-accessori"
href="/shop/scuderia/cura-del-cuoio"
href="/shop/scuderia/mangiatoie"
href="/shop/scuderia/recinti-elettrici-e-accessori"
```

Both expected links are present: `href="/shop/scuderia"` and `href="/shop/scuderia/cura-del-cuoio"`. (The additional links come from the sidebar category filter on the same page, not the breadcrumb — confirmed below by isolating just the `<nav>` element.)

To confirm the breadcrumb itself renders correctly (isolated extraction via Python regex on the saved HTML):
```
<nav class="text-sand font-bold uppercase text-xs tracking-widest mb-2 flex flex-wrap items-center gap-1"><span class="flex items-center gap-1"><a class="hover:text-red transition-colors" href="/shop/scuderia">Scuderia</a></span><span class="flex items-center gap-1"><span class="text-gray-300">/</span><a class="hover:text-red transition-colors" href="/shop/scuderia/cura-del-cuoio">Cura del cuoio</a></span></nav>
```

This confirms exactly 2 links in the breadcrumb nav, correctly nested (`/shop/scuderia` then `/shop/scuderia/cura-del-cuoio`), with a `/` separator between them.

Dev server was stopped after verification (`lsof -ti:3000 | xargs kill`, confirmed port free).

## `npm test` output

```
> sellerie-galazzo@0.1.0 test
> jest

Test Suites: 5 passed, 5 total
Tests:       60 passed, 60 total
Snapshots:   0 total
Time:        0.58 s, estimated 1 s
Ran all test suites.
```

No regressions. No test covers `ProductInfo` directly, as expected.

## Deviations

None. Code applied verbatim from the brief.

## Self-review notes

- `findCategoryByPath` matches by `path` (name array), not `slug`, per Task 1 contract — used correctly, not reimplemented.
- Fallback path (`breadcrumbSlug.length === 0` → plain `<span>`) preserves current behavior for any product whose `categoryPath` doesn't match a real category node, avoiding broken links to `/shop/` with empty slugs.
- `key={segment}` on the mapped `<span>` is safe here since `categoryPath` segments are distinct category names within a single product's path (no duplicate segments expected within one path).
- Verified the breadcrumb only produces 2 `<a>` tags (matching the 2-level `categoryPath`), not conflated with the sidebar filter's category links which happen to share the `/shop/scuderia*` URL prefix.
- Only `components/product/ProductInfo.tsx` was staged and committed, consistent with the brief's scope.

## Commit hash

`e648ade` — "feat: clickable category breadcrumbs on product pages"
