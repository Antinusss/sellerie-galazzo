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
