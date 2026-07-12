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
