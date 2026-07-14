import Image from 'next/image'
import brandsData from '@/data/brands.json'
import type { Brand } from '@/lib/types'

const brands = brandsData as Brand[]

export default function BrandCarousel() {
  const doubled = [...brands, ...brands]
  return (
    <section className="py-16 bg-gray-light overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 mb-8 text-center">
        <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">I brand selezionati per voi</h3>
      </div>
      <div className="flex whitespace-nowrap marquee">
        {doubled.map((brand, i) => (
          <div key={i} className="inline-flex items-center justify-center mx-12 opacity-50 hover:opacity-100 transition-opacity">
            {brand.logo ? (
              <div className="relative w-24 h-12">
                <Image src={brand.logo} alt={brand.name} fill className="object-contain" />
              </div>
            ) : (
              <span className="text-xl font-black text-black">{brand.name}</span>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
