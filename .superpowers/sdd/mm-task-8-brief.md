### Task 8: `/offerte` page

**Files:**
- Create: `app/offerte/page.tsx`

**Interfaces:**
- Consumes: `PaginatedProductGrid` (Task 3), `data/products.json` with `originalPrice` populated (Task 2)

- [ ] **Step 1: Create `app/offerte/page.tsx`**

```tsx
import allProducts from '@/data/products.json'
import type { Product } from '@/lib/types'
import PaginatedProductGrid from '@/components/shop/PaginatedProductGrid'

export const metadata = { title: 'Offerte — Selleria Galazzo' }

export default function OffertePage() {
  const products = (allProducts as Product[]).filter(p => p.originalPrice !== null)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-4xl font-black mb-2">
        Le nostre <em className="text-red">offerte</em>
      </h1>
      <p className="text-sm text-gray-400 mb-8">{products.length} prodotti in offerta</p>
      <PaginatedProductGrid products={products} />
    </div>
  )
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: zero errors

- [ ] **Step 3: Verify with the dev server**

Run: `npm run dev` (in background), then:

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/offerte
curl -s http://localhost:3000/offerte | grep -o "prodotti in offerta" | head -1
```

Expected: `200`, and `prodotti in offerta` found in the page. Stop the dev server after checking.

- [ ] **Step 4: Commit**

```bash
git add app/offerte/page.tsx
git commit -m "feat: add /offerte page listing discounted products"
```

---

