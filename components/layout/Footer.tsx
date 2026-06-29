import Link from 'next/link'
import { Globe, Share2, Mail } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-black text-white mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="text-2xl font-black mb-3">
              Selleria<span className="text-red">Galazzo</span>
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
          {/* Shop */}
          <div>
            <h4 className="font-bold mb-4 text-sand">Shop</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              {['Monta Inglese', 'Monta Western', 'Scuderia', 'Cavaliere', 'Offerte'].map(l => (
                <li key={l}><Link href="/shop" className="hover:text-white transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div>
          {/* Customer service */}
          <div>
            <h4 className="font-bold mb-4 text-sand">Assistenza</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              {['Contattaci', 'Spedizioni', 'Resi e rimborsi', 'FAQ', 'Guida alle taglie'].map(l => (
                <li key={l}><a href="#" className="hover:text-white transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>
          {/* Newsletter */}
          <div>
            <h4 className="font-bold mb-4 text-sand">Newsletter</h4>
            <p className="text-sm text-gray-400 mb-4">Novità, offerte esclusive e consigli per cavalieri.</p>
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
