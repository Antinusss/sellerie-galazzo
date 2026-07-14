import Link from 'next/link'
import Image from 'next/image'
import { Globe, Share2, Mail } from 'lucide-react'
import categoriesData from '@/data/categories.json'
import type { Category } from '@/lib/types'
import { getChildren } from '@/lib/category-tree'

const topLevel = getChildren(categoriesData as Category[], undefined)

export default function Footer() {
  return (
    <footer className="bg-black text-white mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <div className="relative h-12 w-[112px] bg-white rounded-lg p-2 mb-3">
              <Image src="/logo-selleria-galazzo.png" alt="Selleria Galazzo" fill className="object-contain p-1" />
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Selleria online specializzata in articoli per equitazione e abbigliamento tecnico per cavallo e cavaliere.
            </p>
            <div className="flex gap-4 mt-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors"><Globe size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors"><Share2 size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors"><Mail size={20} /></a>
            </div>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-sand">Shop</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              {topLevel.map(cat => (
                <li key={cat.slug.join('/')}>
                  <Link href={`/shop/${cat.slug.join('/')}`} className="hover:text-white transition-colors">{cat.name}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-sand">Assistenza</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              {['Contattaci', 'Spedizioni', 'Resi e rimborsi', 'FAQ', 'Guida alle taglie'].map(l => (
                <li key={l}><a href="#" className="hover:text-white transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-sand">Newsletter</h4>
            <p className="text-sm text-gray-400 mb-4">Iscriviti e ricevi il 10% di sconto sul primo ordine.</p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="La tua email"
                className="flex-1 bg-white/10 border border-white/20 rounded-full px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-sand"
              />
              <button className="bg-red text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-red-dark transition-colors">
                OK
              </button>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <p>© 2026 Selleria Galazzo di Biag Galazzo. Tutti i diritti riservati.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
            <a href="#" className="hover:text-white transition-colors">P.IVA 00000000000</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
