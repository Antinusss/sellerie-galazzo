### Task 6: Shop Page

**Files:**
- Create: `components/shop/FilterSidebar.tsx`
- Create: `components/shop/SortDropdown.tsx`
- Create: `app/shop/page.tsx`

- [ ] **Step 1: Create FilterSidebar**

Create `components/shop/FilterSidebar.tsx`:

```typescript
'use client'
import { useState } from 'react'

const CATEGORIES = ['Monta Inglese', 'Monta Western', 'Scuderia', 'Cavaliere']
const BRANDS = ['Acavallo', 'Equestro', 'Franceschini', 'ACME', 'Kerbl']

interface FilterSidebarProps {
  selectedCategory: string
  onCategoryChange: (c: string) => void
  priceRange: [number, number]
  onPriceChange: (r: [number, number]) => void
}

export default function FilterSidebar({ selectedCategory, onCategoryChange, priceRange, onPriceChange }: FilterSidebarProps) {
  return (
    <aside className="w-full lg:w-64 shrink-0">
      <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-28">
        <h3 className="font-black text-lg mb-6">Filtri</h3>

        {/* Category */}
        <div className="mb-8">
          <h4 className="font-semibold text-sm uppercase tracking-wide text-gray-400 mb-3">Categoria</h4>
          <div className="space-y-2">
            <button
              onClick={() => onCategoryChange('')}
              className={`block w-full text-left text-sm py-1 px-2 rounded-lg transition-colors ${
                selectedCategory === '' ? 'bg-red text-white font-semibold' : 'hover:bg-gray-light'
              }`}
            >
              Tutte le categorie
            </button>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => onCategoryChange(cat)}
                className={`block w-full text-left text-sm py-1 px-2 rounded-lg transition-colors ${
                  selectedCategory === cat ? 'bg-red text-white font-semibold' : 'hover:bg-gray-light'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Price range */}
        <div className="mb-8">
          <h4 className="font-semibold text-sm uppercase tracking-wide text-gray-400 mb-3">
            Prezzo: €{(priceRange[0]/100).toFixed(0)} – €{(priceRange[1]/100).toFixed(0)}
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

- [ ] **Step 2: Create SortDropdown**

Create `components/shop/SortDropdown.tsx`:

```typescript
'use client'

interface SortDropdownProps {
  value: string
  onChange: (v: string) => void
}

export default function SortDropdown({ value, onChange }: SortDropdownProps) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="border border-gray-200 rounded-full px-4 py-2 text-sm font-medium bg-white focus:outline-none focus:border-sand"
    >
      <option value="newest">Più recenti</option>
      <option value="price-asc">Prezzo crescente</option>
      <option value="price-desc">Prezzo decrescente</option>
      <option value="sale">In offerta</option>
    </select>
  )
}
```

- [ ] **Step 3: Create shop page**

Create `app/shop/page.tsx`:

```typescript
'use client'
import { useState, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import ProductCard from '@/components/shop/ProductCard'
import FilterSidebar from '@/components/shop/FilterSidebar'
import SortDropdown from '@/components/shop/SortDropdown'
import allProducts from '@/data/products.json'
import type { Product } from '@/lib/types'

export default function ShopPage() {
  const searchParams = useSearchParams()
  const initialCat = searchParams.get('category')
    ? (allProducts as Product[]).find(p => p.category.toLowerCase().replace(/ /g, '-') === searchParams.get('category'))?.category ?? ''
    : ''

  const [selectedCategory, setSelectedCategory] = useState(initialCat)
  const [sort, setSort] = useState('newest')
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000])

  const filtered = useMemo(() => {
    let products = allProducts as Product[]
    if (selectedCategory) products = products.filter(p => p.category === selectedCategory)
    products = products.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1])
    if (sort === 'price-asc') products = [...products].sort((a, b) => a.price - b.price)
    if (sort === 'price-desc') products = [...products].sort((a, b) => b.price - a.price)
    if (sort === 'sale') products = products.filter(p => p.originalPrice !== null)
    return products
  }, [selectedCategory, sort, priceRange])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-4xl font-black mb-8">
        {selectedCategory || 'Tutto il'} <em className="font-serif text-red not-italic">Shop</em>
      </h1>
      <div className="flex flex-col lg:flex-row gap-8">
        <FilterSidebar
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          priceRange={priceRange}
          onPriceChange={setPriceRange}
        />
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-gray-400">{filtered.length} prodotti</p>
            <SortDropdown value={sort} onChange={setSort} />
          </div>
          {filtered.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-lg font-semibold">Nessun prodotto trovato</p>
              <button onClick={() => { setSelectedCategory(''); setPriceRange([0, 50000]) }} className="mt-4 text-red underline text-sm">
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
    </div>
  )
}
```

- [ ] **Step 4: Verify shop page**

Open `http://localhost:3000/shop` — filter by category, sort, price range all work.

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: shop page with filter sidebar, sort, product grid"
```

---

