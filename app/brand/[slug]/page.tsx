import { notFound } from 'next/navigation'
import Image from 'next/image'
import allProducts from '@/data/products.json'
import allBrands from '@/data/brands.json'
import type { Product, Brand } from '@/lib/types'
import PaginatedProductGrid from '@/components/shop/PaginatedProductGrid'

interface Props { params: { slug: string } }

export async function generateStaticParams() {
  return (allBrands as Brand[]).map(b => ({ slug: b.id }))
}

export default function BrandPage({ params }: Props) {
  const brand = (allBrands as Brand[]).find(b => b.id === params.slug)
  if (!brand) notFound()

  const products = (allProducts as Product[]).filter(p => p.brand === brand.name)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center gap-4 mb-8">
        {brand.logo ? (
          <div className="relative w-16 h-16 shrink-0">
            <Image src={brand.logo} alt={brand.name} fill className="object-contain" />
          </div>
        ) : (
          <div className="w-16 h-16 shrink-0 rounded-full bg-gray-light flex items-center justify-center text-lg font-black text-gray-400">
            {brand.name.slice(0, 2).toUpperCase()}
          </div>
        )}
        <div>
          <h1 className="text-4xl font-black">{brand.name}</h1>
          <p className="text-sm text-gray-400">{products.length} prodotti</p>
        </div>
      </div>
      <PaginatedProductGrid products={products} />
    </div>
  )
}
