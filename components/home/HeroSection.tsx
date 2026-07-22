'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { Truck, Lock, RotateCcw, CreditCard } from 'lucide-react'
import { GUIDE_LINKS } from '@/lib/guide-links'

const TRUST_POINTS = [
  { icon: Truck, title: 'Spedizione gratuita sopra €80', desc: 'Corriere tracciato in tutta Italia' },
  { icon: Lock, title: 'Pagamento sicuro SSL', desc: 'I tuoi dati sono sempre protetti' },
  { icon: RotateCcw, title: 'Reso entro 14 giorni', desc: 'Cambio idea? Nessun problema' },
  { icon: CreditCard, title: 'Paga in 3 rate con Klarna', desc: 'Senza interessi, zero pensieri' },
]

export default function HeroSection() {
  return (
    <section className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="lg:col-span-2 relative rounded-2xl overflow-hidden min-h-[420px] flex items-end"
          >
            <Image
              src="https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=1600&q=85"
              alt="Cavaliere in azione"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="relative p-8 sm:p-10 max-w-md">
              <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight mb-4">
                Tutto il necessario per il tuo <em className="text-red">cavallo</em>
              </h1>
              <Link
                href="/shop"
                className="inline-block bg-red text-white px-8 py-4 rounded-full font-semibold text-sm hover:bg-red-dark transition-colors"
              >
                Scopri lo Shop
              </Link>
            </div>
          </motion.div>

          <div className="flex flex-col gap-4">
            {GUIDE_LINKS.slice(0, 3).map((link, i) => (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 + i * 0.1 }}
              >
                <Link
                  href={link.href}
                  className="group flex items-center gap-4 bg-gray-light rounded-2xl p-4 hover:bg-sand/10 transition-colors"
                >
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0">
                    <Image src={link.image} alt={link.label} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-black text-sm text-black">{link.label}</p>
                    <p className="text-xs text-red font-semibold mt-1">Acquistare →</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          {TRUST_POINTS.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-start gap-3 bg-gray-light rounded-xl p-4">
              <Icon className="text-red shrink-0 mt-0.5" size={22} />
              <div>
                <p className="font-bold text-xs text-black leading-tight">{title}</p>
                <p className="text-[11px] text-gray-500 mt-1 leading-tight">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
