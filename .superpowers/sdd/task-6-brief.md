### Task 6: Cart and footer trust polish

**Files:**
- Modify: `components/cart/CartDrawer.tsx`
- Modify: `app/cart/page.tsx`
- Modify: `components/layout/Footer.tsx`

**Interfaces:**
- None new — pure UI additions to existing components using data already available in each (`useCartStore`, `formatPrice`).

- [ ] **Step 1: Add free-shipping progress message to CartDrawer**

In `components/cart/CartDrawer.tsx`, insert this block immediately before the `<div className="flex justify-between font-black text-lg mb-4">` subtotal row (both are inside the `<div className="px-6 py-5 border-t border-gray-100">` footer block):

```tsx
              {totalPrice < 8000 && (
                <p className="text-xs text-gray-400 mb-3">
                  Aggiungi {formatPrice(8000 - totalPrice)} per la spedizione gratuita
                </p>
              )}
```

(`totalPrice` and `formatPrice` are already destructured/imported in this file.)

- [ ] **Step 2: Add "Continua lo shopping" link to the populated cart page**

In `app/cart/page.tsx`, replace:

```tsx
      <h1 className="text-4xl font-black mb-10">
        Il tuo <em className="text-red">carrello</em>
      </h1>
      <div className="flex flex-col lg:flex-row gap-10">
        <div className="flex-1">
          {items.map(item => <CartItem key={item.product.id} item={item} />)}
        </div>
```

with:

```tsx
      <h1 className="text-4xl font-black mb-6">
        Il tuo <em className="text-red">carrello</em>
      </h1>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-400">{items.length} {items.length === 1 ? 'articolo' : 'articoli'}</p>
        <Link href="/shop" className="text-sm font-semibold text-red hover:text-red-dark transition-colors">
          ← Continua lo shopping
        </Link>
      </div>
      <div className="flex flex-col lg:flex-row gap-10">
        <div className="flex-1">
          {items.map(item => <CartItem key={item.product.id} item={item} />)}
        </div>
```

(`Link` is already imported in this file.)

- [ ] **Step 3: Add "Torna su" link to the Footer**

`components/layout/Footer.tsx` currently has no `'use client'` directive. Add it as the first line of the file (before the imports):

```tsx
'use client'
```

Then, inside the bottom bar, replace:

```tsx
        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <p>© 2026 Selleria Galazzo di Biag Galazzo. Tutti i diritti riservati.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
            <a href="#" className="hover:text-white transition-colors">P.IVA 00000000000</a>
          </div>
        </div>
```

with:

```tsx
        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <p>© 2026 Selleria Galazzo di Biag Galazzo. Tutti i diritti riservati.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
            <a href="#" className="hover:text-white transition-colors">P.IVA 00000000000</a>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="hover:text-white transition-colors"
            >
              ↑ Torna su
            </button>
          </div>
        </div>
```

- [ ] **Step 4: Verify the build**

Run: `npx tsc --noEmit`
Expected: no errors

Run: `npm run build`
Expected: build succeeds

- [ ] **Step 5: Commit**

```bash
git add components/cart/CartDrawer.tsx app/cart/page.tsx components/layout/Footer.tsx
git commit -m "feat: add free-shipping progress, continue-shopping link, and back-to-top"
```
