### Task 5: Home Page

**Files:**
- Create: `components/home/HeroSection.tsx`
- Create: `components/home/CategoryGrid.tsx`
- Create: `components/home/NewArrivalsCarousel.tsx`
- Create: `components/home/TrustSection.tsx`
- Create: `components/home/BrandCarousel.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Create HeroSection**

Create `components/home/HeroSection.tsx`:

```typescript
'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'

export default function HeroSection() {
  return (
    <section className="min-h-[90vh] flex items-center bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            <p className="text-sand font-semibold tracking-widest uppercase text-sm mb-4">
              Dal 1985 · Selleria Italiana
            </p>
            <h1 className="text-5xl lg:text-7xl font-black text-black leading-tight mb-6">
              Equipaggiati per{' '}
              <em className="font-serif text-red not-italic">vincere</em>
            </h1>
            <p className="text-gray-500 text-lg leading-relaxed mb-8 max-w-md">
              Prodotti selezionati per monta inglese, western e scuderia. Qualità professionale per ogni cavaliere.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/shop"
                className="bg-red text-white px-8 py-4 rounded-full font-semibold text-sm hover:bg-red-dark transition-colors"
              >
                Scopri il Shop
              </Link>
              <Link
                href="/shop?sort=newest"
                className="border-2 border-black text-black px-8 py-4 rounded-full font-semibold text-sm hover:bg-black hover:text-white transition-colors"
              >
                Le Novità
              </Link>
            </div>
            <div className="flex gap-8 mt-12 text-sm">
              <div>
                <div className="font-black text-2xl">10k+</div>
                <div className="text-gray-400">Cavalieri</div>
              </div>
              <div>
                <div className="font-black text-2xl">200+</div>
                <div className="text-gray-400">Brand selezionati</div>
              </div>
              <div>
                <div className="font-black text-2xl">40+</div>
                <div className="text-gray-400">Anni di esperienza</div>
              </div>
            </div>
          </motion.div>
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
            className="relative h-[500px] lg:h-[650px] rounded-3xl overflow-hidden"
          >
            <Image
              src="https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=1200&q=85"
              alt="Cavaliere in azione"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Create CategoryGrid**

Create `components/home/CategoryGrid.tsx`:

```typescript
'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import categories from '@/data/categories.json'

export default function CategoryGrid() {
  return (
    <section className="py-20 bg-gray-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-black text-black">
            Scegli la tua <em className="font-serif text-red not-italic">disciplina</em>
          </h2>
        </motion.div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Link
                href={`/shop?category=${cat.slug}`}
                className="group relative block aspect-[3/4] rounded-2xl overflow-hidden border-2 border-transparent hover:border-sand transition-all duration-300"
              >
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <h3 className="text-white text-xl font-black">{cat.name}</h3>
                  <p className="text-white/70 text-xs mt-1 hidden group-hover:block transition-all">
                    {cat.description}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Create ProductCard (shared)**

Create `components/shop/ProductCard.tsx`:

```typescript
'use client'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Heart, ShoppingCart } from 'lucide-react'
import { useCartStore } from '@/lib/store'
import { formatPrice } from '@/lib/utils'
import type { Product } from '@/lib/types'

interface ProductCardProps { product: Product }

export default function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore(s => s.addItem)
  const discountPct = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      <Link href={`/shop/${product.slug}`} className="block relative aspect-square overflow-hidden bg-gray-light">
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {discountPct && (
          <span className="absolute top-3 left-3 bg-red text-white text-xs font-bold px-2 py-1 rounded-full">
            -{discountPct}%
          </span>
        )}
        <button className="absolute top-3 right-3 p-2 bg-white/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:text-red">
          <Heart size={16} />
        </button>
        {/* Quick add */}
        <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button
            onClick={e => { e.preventDefault(); addItem(product, 1) }}
            className="w-full bg-red text-white py-3 text-sm font-semibold flex items-center justify-center gap-2 hover:bg-red-dark transition-colors"
          >
            <ShoppingCart size={16} />
            Aggiungi al carrello
          </button>
        </div>
      </Link>
      <div className="p-4">
        <p className="text-xs text-sand font-semibold uppercase tracking-wide mb-1">{product.category}</p>
        <h3 className="font-semibold text-sm text-black leading-tight mb-2 line-clamp-2">{product.name}</h3>
        <div className="flex items-baseline gap-2">
          <span className="font-black text-black">{formatPrice(product.price)}</span>
          {product.originalPrice && (
            <span className="text-gray-400 text-sm line-through">{formatPrice(product.originalPrice)}</span>
          )}
        </div>
      </div>
    </motion.div>
  )
}
```

- [ ] **Step 4: Create NewArrivalsCarousel**

Create `components/home/NewArrivalsCarousel.tsx`:

```typescript
import ProductCard from '@/components/shop/ProductCard'
import products from '@/data/products.json'
import type { Product } from '@/lib/types'

export default function NewArrivalsCarousel() {
  const recent = (products as Product[]).slice(0, 8)
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10">
          <h2 className="text-4xl font-black">
            Gli ultimi <em className="font-serif text-red not-italic">arrivati</em>
          </h2>
          <a href="/shop" className="text-sm font-semibold text-red underline underline-offset-4 hover:text-red-dark">
            Vedi tutti →
          </a>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {recent.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 5: Create TrustSection**

Create `components/home/TrustSection.tsx`:

```typescript
import { Truck, ShieldCheck, Headphones } from 'lucide-react'

const trusts = [
  { icon: Truck, title: 'Spedizione Gratuita', desc: 'Su tutti gli ordini superiori a €80. Consegna in 3-5 giorni lavorativi.' },
  { icon: ShieldCheck, title: 'Soddisfatti o Rimborsati', desc: 'Garanzia di rimborso al 100% entro 30 giorni dall\'acquisto.' },
  { icon: Headphones, title: 'Supporto 24/7', desc: 'Il nostro team è sempre disponibile per aiutarti nella scelta.' },
]

export default function TrustSection() {
  return (
    <section className="py-20 bg-red-dark text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {trusts.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex flex-col items-center text-center gap-4">
              <div className="w-14 h-14 rounded-full border-2 border-sand flex items-center justify-center">
                <Icon size={24} className="text-sand" />
              </div>
              <h3 className="text-xl font-black">{title}</h3>
              <p className="text-white/70 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 6: Create BrandCarousel**

Create `components/home/BrandCarousel.tsx`:

```typescript
import brands from '@/data/brands.json'

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
            <span className="text-xl font-black text-black">{brand.name}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 7: Update home page**

Replace `app/page.tsx`:

```typescript
import HeroSection from '@/components/home/HeroSection'
import CategoryGrid from '@/components/home/CategoryGrid'
import NewArrivalsCarousel from '@/components/home/NewArrivalsCarousel'
import TrustSection from '@/components/home/TrustSection'
import BrandCarousel from '@/components/home/BrandCarousel'

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <CategoryGrid />
      <NewArrivalsCarousel />
      <TrustSection />
      <BrandCarousel />
    </>
  )
}
```

- [ ] **Step 8: Configure next.config for external images**

Replace `next.config.ts`:

```typescript
import type { NextConfig } from 'next'
const config: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'picsum.photos' },
    ],
  },
}
export default config
```

- [ ] **Step 9: Verify home page in browser**

```bash
npm run dev
```

Check: hero renders, category grid 2x2, new arrivals 8 cards, dark trust section, brand marquee.

- [ ] **Step 10: Commit**

```bash
git add .
git commit -m "feat: home page — hero, categories, new arrivals, trust section, brands"
```

---

