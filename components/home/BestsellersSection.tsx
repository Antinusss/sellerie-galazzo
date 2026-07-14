import Link from 'next/link'
import ProductCard from '@/components/shop/ProductCard'
import products from '@/data/products.json'
import type { Product } from '@/lib/types'
import { getReviewSummary } from '@/lib/reviews'

export default function BestsellersSection() {
  const ranked = [...(products as Product[])]
    .sort((a, b) => getReviewSummary(b.id).count - getReviewSummary(a.id).count)
    .slice(0, 8)

  return (
    <section className="py-20 bg-gray-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10">
          <h2 className="text-4xl font-black">
            I più <em className="text-red">venduti</em>
          </h2>
          <Link href="/shop" className="text-sm font-semibold text-red underline underline-offset-4 hover:text-red-dark">
            Vedi tutti →
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {ranked.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      </div>
    </section>
  )
}
