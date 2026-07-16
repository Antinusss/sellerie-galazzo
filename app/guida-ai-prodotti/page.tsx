import Link from 'next/link'
import { GUIDE_LINKS } from '@/lib/guide-links'

export const metadata = { title: 'Guida ai prodotti — Selleria Galazzo' }

export default function GuidaAiProdottiPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-4xl font-black mb-8">
        Guida ai <em className="text-red">prodotti</em>
      </h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {GUIDE_LINKS.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className="flex items-center justify-center text-center bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow font-semibold text-black hover:text-red"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  )
}
