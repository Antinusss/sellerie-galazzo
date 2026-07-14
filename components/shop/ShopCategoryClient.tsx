'use client'
import { useState, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import PaginatedProductGrid from '@/components/shop/PaginatedProductGrid'
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
          <PaginatedProductGrid products={filtered} />
        )}
      </div>
    </div>
  )
}
