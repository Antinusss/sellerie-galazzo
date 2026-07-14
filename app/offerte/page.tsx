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
