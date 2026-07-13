### Task 9: `/shop/[[...slug]]` category routing (replaces `/shop`)

**Files:**
- Create: `components/shop/ShopCategoryClient.tsx`
- Modify: `components/shop/FilterSidebar.tsx`
- Create: `app/shop/[[...slug]]/page.tsx`
- Delete: `app/shop/page.tsx`

**Interfaces:**
- Consumes: `findCategoryBySlugPath`, `productsUnderCategory`, `breadcrumbFor`, `getChildren` from `lib/category-tree` (Task 3); `data/products.json`, `data/categories.json` (Task 4)
- Produces: `ShopCategoryClient` props `{ products: Product[]; currentPath: string[] }`; `FilterSidebar` props `{ currentPath: string[]; priceRange: [number, number]; onPriceChange: (r: [number, number]) => void }`

- [ ] **Step 1: Rewrite `components/shop/FilterSidebar.tsx`** as a category tree

```tsx
'use client'
import Link from 'next/link'
import categoriesData from '@/data/categories.json'
import type { Category } from '@/lib/types'
import { getChildren } from '@/lib/category-tree'

const categories = categoriesData as Category[]

interface FilterSidebarProps {
  currentPath: string[]
  priceRange: [number, number]
  onPriceChange: (r: [number, number]) => void
}

function CategoryBranch({ node, currentPath }: { node: Category; currentPath: string[] }) {
  const isActive = node.slug.length === currentPath.length && node.slug.every((s, i) => s === currentPath[i])
  const isAncestor = currentPath.length > node.slug.length && node.slug.every((s, i) => s === currentPath[i])
  const children = getChildren(categories, node)
  const expanded = isActive || isAncestor

  return (
    <div>
      <Link
        href={`/shop/${node.slug.join('/')}`}
        className={`flex justify-between items-center text-sm py-1 px-2 rounded-lg transition-colors ${
          isActive ? 'bg-red text-white font-semibold' : 'hover:bg-gray-light'
        }`}
      >
        <span>{node.name}</span>
        <span className={isActive ? 'text-white/70' : 'text-gray-400'}>{node.productCount}</span>
      </Link>
      {expanded && children.length > 0 && (
        <div className="pl-3 mt-1 space-y-1 border-l border-gray-200 ml-2">
          {children.map(child => (
            <CategoryBranch key={child.slug.join('/')} node={child} currentPath={currentPath} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function FilterSidebar({ currentPath, priceRange, onPriceChange }: FilterSidebarProps) {
  const topLevel = getChildren(categories, undefined)

  return (
    <aside className="w-full lg:w-64 shrink-0">
      <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-28">
        <h3 className="font-black text-lg mb-6">Filtri</h3>

        <div className="mb-8">
          <h4 className="font-semibold text-sm uppercase tracking-wide text-gray-400 mb-3">Categoria</h4>
          <div className="space-y-2">
            <Link
              href="/shop"
              className={`block w-full text-left text-sm py-1 px-2 rounded-lg transition-colors ${
                currentPath.length === 0 ? 'bg-red text-white font-semibold' : 'hover:bg-gray-light'
              }`}
            >
              Tutte le categorie
            </Link>
            {topLevel.map(node => (
              <CategoryBranch key={node.slug.join('/')} node={node} currentPath={currentPath} />
            ))}
          </div>
        </div>

        <div className="mb-8">
          <h4 className="font-semibold text-sm uppercase tracking-wide text-gray-400 mb-3">
            Prezzo: €{(priceRange[0] / 100).toFixed(0)} – €{(priceRange[1] / 100).toFixed(0)}
          </h4>
          <input
            type="range"
            min={0}
            max={50000}
            step={500}
            value={priceRange[1]}
            onChange={e => onPriceChange([priceRange[0], Number(e.target.value)])}
            className="w-full accent-red"
          />
        </div>
      </div>
    </aside>
  )
}
```

- [ ] **Step 2: Create `components/shop/ShopCategoryClient.tsx`**

```tsx
'use client'
import { useState, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import ProductCard from '@/components/shop/ProductCard'
import FilterSidebar from '@/components/shop/FilterSidebar'
import SortDropdown from '@/components/shop/SortDropdown'
import type { Product } from '@/lib/types'

interface ShopCategoryClientProps {
  products: Product[]
  currentPath: string[]
}

export default function ShopCategoryClient({ products, currentPath }: ShopCategoryClientProps) {
  const searchParams = useSearchParams()
  const [sort, setSort] = useState(searchParams.get('sort') ?? 'newest')
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000])

  const filtered = useMemo(() => {
    let list = products.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1])
    if (sort === 'price-asc') list = [...list].sort((a, b) => a.price - b.price)
    if (sort === 'price-desc') list = [...list].sort((a, b) => b.price - a.price)
    if (sort === 'sale') list = list.filter(p => p.originalPrice !== null)
    return list
  }, [products, sort, priceRange])

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <FilterSidebar currentPath={currentPath} priceRange={priceRange} onPriceChange={setPriceRange} />
      <div className="flex-1">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-400">{filtered.length} prodotti</p>
          <SortDropdown value={sort} onChange={setSort} />
        </div>
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg font-semibold">Nessun prodotto trovato</p>
            <button onClick={() => setPriceRange([0, 50000])} className="mt-4 text-red underline text-sm">
              Rimuovi i filtri
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create `app/shop/[[...slug]]/page.tsx`**

```tsx
import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import allProducts from '@/data/products.json'
import allCategories from '@/data/categories.json'
import type { Product, Category } from '@/lib/types'
import { findCategoryBySlugPath, productsUnderCategory, breadcrumbFor } from '@/lib/category-tree'
import ShopCategoryClient from '@/components/shop/ShopCategoryClient'

interface Props { params: { slug?: string[] } }

export async function generateStaticParams() {
  const nodes = (allCategories as Category[]).map(c => ({ slug: c.slug }))
  return [{ slug: [] }, ...nodes]
}

export default function ShopPage({ params }: Props) {
  const slugPath = params.slug ?? []
  const category = slugPath.length > 0
    ? findCategoryBySlugPath(allCategories as Category[], slugPath)
    : undefined

  if (slugPath.length > 0 && !category) notFound()

  const products = productsUnderCategory(allProducts as Product[], category)
  const title = category ? category.name : 'Tutto il'

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <p className="text-xs text-gray-400 mb-2">{breadcrumbFor(category)}</p>
      <h1 className="text-4xl font-black mb-8">
        {title} <em className="font-serif text-red not-italic">Shop</em>
      </h1>
      <Suspense fallback={<div>Caricamento...</div>}>
        <ShopCategoryClient products={products} currentPath={slugPath} />
      </Suspense>
    </div>
  )
}
```

- [ ] **Step 4: Delete the old route**

```bash
git rm app/shop/page.tsx
```

- [ ] **Step 5: Verify with the dev server**

Run: `npm run dev` (in background), then:
```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/shop
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/shop/monta-inglese
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/shop/monta-inglese/cavaliere/donna/pantaloni
```
Expected: `200` for all three. Stop the dev server after checking.

- [ ] **Step 6: Commit**

```bash
git add components/shop/FilterSidebar.tsx components/shop/ShopCategoryClient.tsx app/shop
git commit -m "feat: rebuild /shop as a nested category tree over the real catalog"
```

---

