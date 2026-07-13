### Task 7: Product presentation components — real data shape

**Files:**
- Modify: `components/shop/ProductCard.tsx`
- Modify: `components/product/ProductInfo.tsx`
- Modify: `components/product/ProductTabs.tsx`

**Interfaces:**
- Consumes: `Product` from `lib/types` (Task 1)

- [ ] **Step 1: `components/shop/ProductCard.tsx`** — link to the new product route

Change:
```tsx
<Link href={`/shop/${product.slug}`} className="block relative aspect-square overflow-hidden bg-gray-light">
```
to:
```tsx
<Link href={`/prodotto/${product.slug}`} className="block relative aspect-square overflow-hidden bg-gray-light">
```

- [ ] **Step 2: `components/product/ProductInfo.tsx`** — breadcrumb category, guard empty brand

Change:
```tsx
<p className="text-sand font-bold uppercase text-xs tracking-widest mb-2">{product.category}</p>
```
to:
```tsx
<p className="text-sand font-bold uppercase text-xs tracking-widest mb-2">{product.categoryPath.join(' / ')}</p>
```

Change:
```tsx
<p className="text-gray-400 text-sm mt-1">{product.brand}</p>
```
to:
```tsx
{product.brand && <p className="text-gray-400 text-sm mt-1">{product.brand}</p>}
```

- [ ] **Step 3: `components/product/ProductTabs.tsx`** — bullet-list specs with empty states

Replace the `content` object:

```tsx
const content: Record<typeof TABS[number], React.ReactNode> = {
  'Descrizione': description ? (
    <p className="text-gray-600 leading-relaxed">{description}</p>
  ) : (
    <p className="text-gray-400">Descrizione non disponibile.</p>
  ),
  'Specifiche': specs ? (
    <ul className="space-y-2 list-disc list-inside text-sm text-gray-600">
      {specs.split(' | ').map(item => <li key={item}>{item}</li>)}
    </ul>
  ) : (
    <p className="text-sm text-gray-400">Nessuna specifica tecnica disponibile per questo prodotto.</p>
  ),
  'Spedizione & Resi': (
    <div className="space-y-4 text-sm text-gray-600">
      <p>🚚 <strong>Spedizione standard:</strong> 3-5 giorni lavorativi. Gratuita sopra €80, altrimenti €5,90.</p>
      <p>⚡ <strong>Spedizione express:</strong> 1-2 giorni lavorativi. €9,90.</p>
      <p>↩️ <strong>Resi:</strong> Gratuiti entro 30 giorni dall&apos;acquisto. Prodotto integro e imballato.</p>
    </div>
  ),
}
```

- [ ] **Step 4: Run the suite**

Run: `npm test`
Expected: PASS (no test covers these components directly, but this confirms no regressions elsewhere)

- [ ] **Step 5: Commit**

```bash
git add components/shop/ProductCard.tsx components/product/ProductInfo.tsx components/product/ProductTabs.tsx
git commit -m "feat: adapt product components to real catalog data shape"
```

---

