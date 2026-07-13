import ProductCard from '@/components/shop/ProductCard'
import allProducts from '@/data/products.json'
import type { Product } from '@/lib/types'
import { getRelatedProducts } from '@/lib/category-tree'

interface RelatedProductsProps { product: Product }

export default function RelatedProducts({ product }: RelatedProductsProps) {
  const related = getRelatedProducts(product, allProducts as Product[], 4)
  if (related.length === 0) return null

  return (
    <section className="mt-16">
      <h2 className="text-2xl font-black mb-6">
        Prodotti <em className="text-red">consigliati</em>
      </h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {related.map(p => <ProductCard key={p.id} product={p} />)}
      </div>
    </section>
  )
}
