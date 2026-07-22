import Image from 'next/image'
import Link from 'next/link'
import productsData from '@/data/products.json'
import categoriesData from '@/data/categories.json'
import type { Product, Category } from '@/lib/types'
import { GUIDE_LINKS } from '@/lib/guide-links'
import { findCategoryBySlugPath } from '@/lib/category-tree'
import { topBestsellers } from '@/lib/reviews'
import ProductCard from '@/components/shop/ProductCard'

const products = productsData as Product[]
const categories = categoriesData as Category[]

function categoryForHref(href: string): Category | undefined {
  const slugPath = href.replace('/shop/', '').split('/')
  return findCategoryBySlugPath(categories, slugPath)
}

export default function CategoryShowcase() {
  const rows = GUIDE_LINKS.slice(0, 4).map(link => ({
    link,
    products: topBestsellers(products, categoryForHref(link.href), 6),
  }))

  return (
    <section className="py-20 bg-gray-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-black text-center mb-12">
          Scegli la tua <em className="text-red">categoria</em>
        </h2>
        <div className="space-y-10">
          {rows.map(({ link, products: rowProducts }) => (
            <div key={link.href} className="flex flex-col lg:flex-row gap-6">
              <Link
                href={link.href}
                className="group relative shrink-0 w-full lg:w-64 aspect-[4/3] lg:aspect-auto rounded-2xl overflow-hidden"
              >
                <Image
                  src={link.image}
                  alt={link.label}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <p className="text-white text-xl font-black">{link.label}</p>
                  <p className="text-white/80 text-xs font-semibold mt-1">Vai ai prodotti →</p>
                </div>
              </Link>
              <div className="flex-1 flex gap-5 overflow-x-auto pb-2">
                {rowProducts.map(p => (
                  <div key={p.id} className="w-56 shrink-0">
                    <ProductCard product={p} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
