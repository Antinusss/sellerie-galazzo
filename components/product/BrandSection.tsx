import Image from 'next/image'
import Link from 'next/link'
import allBrands from '@/data/brands.json'
import type { Brand, Product } from '@/lib/types'

interface BrandSectionProps { product: Product }

export default function BrandSection({ product }: BrandSectionProps) {
  if (!product.brand) return null
  const brand = (allBrands as Brand[]).find(b => b.name === product.brand)
  if (!brand) return null

  return (
    <section className="mt-12 bg-gray-light rounded-2xl p-6 flex items-center gap-4">
      {brand.logo ? (
        <div className="relative w-14 h-14 shrink-0 bg-white rounded-full overflow-hidden">
          <Image src={brand.logo} alt={brand.name} fill className="object-contain p-2" />
        </div>
      ) : (
        <div className="w-14 h-14 shrink-0 rounded-full bg-white flex items-center justify-center text-sm font-black text-gray-400">
          {brand.name.slice(0, 2).toUpperCase()}
        </div>
      )}
      <div className="flex-1">
        <p className="text-xs text-gray-400 uppercase tracking-wide">Venduto da</p>
        <p className="font-black text-lg">{brand.name}</p>
      </div>
      <Link href={`/brand/${brand.id}`} className="text-sm font-semibold text-red hover:text-red-dark whitespace-nowrap">
        Vedi tutti i prodotti →
      </Link>
    </section>
  )
}
