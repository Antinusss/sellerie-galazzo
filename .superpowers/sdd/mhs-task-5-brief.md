### Task 5: Search results page and search bar submit wiring

**Files:**
- Create: `app/cerca/page.tsx`
- Modify: `components/layout/HeaderSearchBar.tsx`

**Interfaces:**
- Consumes: `searchProducts(products: Product[], query: string, limit = 8): Product[]` from `lib/search.ts` (already reworked and committed — this task calls it with `Infinity` as the third argument to get every match uncapped).
- Consumes: `PaginatedProductGrid({ products: Product[] })` (existing, `components/shop/PaginatedProductGrid.tsx`).

- [ ] **Step 1: Create the search results page**

Create `app/cerca/page.tsx`:

```tsx
'use client'
import { useSearchParams } from 'next/navigation'
import allProducts from '@/data/products.json'
import type { Product } from '@/lib/types'
import { searchProducts } from '@/lib/search'
import PaginatedProductGrid from '@/components/shop/PaginatedProductGrid'

const products = allProducts as Product[]

export default function CercaPage() {
  const searchParams = useSearchParams()
  const q = searchParams.get('q') ?? ''
  const results = searchProducts(products, q, Infinity)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-4xl font-black mb-2">
        Risultati per <em className="text-red">&quot;{q}&quot;</em>
      </h1>
      <p className="text-sm text-gray-400 mb-8">{results.length} prodotti trovati</p>
      {results.length === 0 ? (
        <p className="text-gray-400">Nessun prodotto corrisponde alla tua ricerca.</p>
      ) : (
        <PaginatedProductGrid products={results} />
      )}
    </div>
  )
}
```

- [ ] **Step 2: Wire the search bar to submit to it**

In `components/layout/HeaderSearchBar.tsx`, add the import:

```tsx
import { useRouter } from 'next/navigation'
```

Inside the component, alongside the existing `const containerRef = useRef<HTMLDivElement>(null)` line, add:

```tsx
  const router = useRouter()
```

Replace:

```tsx
      <div className="flex items-center gap-2 bg-gray-light rounded-full px-4 py-2">
        <Search size={16} className="text-gray-400 shrink-0" />
        <input
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          placeholder="Cerca un prodotto..."
          className="flex-1 bg-transparent outline-none text-sm"
        />
      </div>
```

with:

```tsx
      <form
        onSubmit={e => {
          e.preventDefault()
          if (!query.trim()) return
          setOpen(false)
          router.push(`/cerca?q=${encodeURIComponent(query)}`)
        }}
        className="flex items-center gap-2 bg-gray-light rounded-full px-4 py-2"
      >
        <button type="submit" className="text-gray-400 shrink-0 hover:text-red transition-colors">
          <Search size={16} />
        </button>
        <input
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          placeholder="Cerca un prodotto..."
          className="flex-1 bg-transparent outline-none text-sm"
        />
      </form>
```

- [ ] **Step 3: Verify the build**

Run: `npx tsc --noEmit`
Expected: no errors

Run: `npm run build`
Expected: build succeeds, new static route `○ /cerca` appears in the route list

- [ ] **Step 4: Commit**

```bash
git add app/cerca/page.tsx components/layout/HeaderSearchBar.tsx
git commit -m "feat: add search results page and wire search bar submit"
```
