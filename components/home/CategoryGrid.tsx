'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import categoriesData from '@/data/categories.json'
import type { Category } from '@/lib/types'
import { getChildren } from '@/lib/category-tree'

const DESCRIPTIONS: Record<string, string> = {
  'Monta Inglese': 'Selle, abbigliamento e accessori per salto ostacoli e dressage',
  'Monta Western': 'Tutto per la monta western: cappelli, stivali, selle e abbigliamento',
  'Scuderia': 'Prodotti per la cura quotidiana del cavallo e della scuderia',
}

export default function CategoryGrid() {
  const topLevel = getChildren(categoriesData as Category[], undefined)

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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {topLevel.map((cat, i) => (
            <motion.div
              key={cat.slug.join('/')}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Link
                href={`/shop/${cat.slug.join('/')}`}
                className="group relative block aspect-[3/4] rounded-2xl overflow-hidden border-2 border-transparent hover:border-sand transition-all duration-300"
              >
                <Image
                  src={cat.image ?? ''}
                  alt={cat.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <h3 className="text-white text-xl font-black">{cat.name}</h3>
                  <p className="text-white/70 text-xs mt-1 hidden group-hover:block transition-all">
                    {DESCRIPTIONS[cat.name] ?? ''}
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
