'use client'
import { useState } from 'react'
import { Star } from 'lucide-react'
import { splitBulletedText } from '@/lib/feed-transform'
import { getReviewSummary } from '@/lib/reviews'

interface ProductTabsProps { description: string; specs: string; productId: string }

const TABS = ['Descrizione', 'Specifiche', 'Recensioni', 'Spedizione & Resi'] as const

export default function ProductTabs({ description, specs, productId }: ProductTabsProps) {
  const [active, setActive] = useState<typeof TABS[number]>('Descrizione')
  const { intro, items: bulletItems } = splitBulletedText(description)
  const { rating, count, reviews } = getReviewSummary(productId)

  const content: Record<typeof TABS[number], React.ReactNode> = {
    'Descrizione': description ? (
      <div className="space-y-4">
        {intro && <p className="text-gray-600 leading-relaxed">{intro}</p>}
        {bulletItems.length > 0 && (
          <ul className="space-y-2 list-disc list-inside text-sm text-gray-600">
            {bulletItems.map((item, i) => <li key={i}>{item}</li>)}
          </ul>
        )}
      </div>
    ) : (
      <p className="text-gray-400">Descrizione non disponibile.</p>
    ),
    'Specifiche': specs ? (
      <ul className="space-y-2 list-disc list-inside text-sm text-gray-600">
        {specs.split(' | ').map(item => <li key={item}>{item}</li>)}
      </ul>
    ) : (
      <p className="text-sm text-gray-400">Nessuna specifica tecnica disponibile per questo prodotto.</p>
    ),
    'Recensioni': (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }, (_, i) => (
              <Star key={i} size={18} className={i < Math.round(rating) ? 'fill-sand text-sand' : 'text-gray-200'} />
            ))}
          </div>
          <span className="font-black text-lg">{rating.toFixed(1)}</span>
          <span className="text-sm text-gray-400">su {count} recensioni</span>
        </div>
        <div className="space-y-5">
          {reviews.map((review, i) => (
            <div key={i} className="border-b border-gray-100 pb-5 last:border-0">
              <div className="flex items-center justify-between mb-1">
                <p className="font-semibold text-sm">{review.author}</p>
                <p className="text-xs text-gray-400">{review.date}</p>
              </div>
              <div className="flex items-center gap-0.5 mb-2">
                {Array.from({ length: 5 }, (_, i2) => (
                  <Star key={i2} size={12} className={i2 < Math.round(review.rating) ? 'fill-sand text-sand' : 'text-gray-200'} />
                ))}
              </div>
              <p className="text-sm text-gray-600">{review.text}</p>
            </div>
          ))}
        </div>
      </div>
    ),
    'Spedizione & Resi': (
      <div className="space-y-4 text-sm text-gray-600">
        <p>🚚 <strong>Spedizione standard:</strong> 3-5 giorni lavorativi. Gratuita sopra €80, altrimenti €5,90.</p>
        <p>⚡ <strong>Spedizione express:</strong> 1-2 giorni lavorativi. €9,90.</p>
        <p>↩️ <strong>Resi:</strong> Gratuiti entro 30 giorni dall&apos;acquisto. Prodotto integro e imballato.</p>
      </div>
    ),
  }

  return (
    <div className="mt-12">
      <div className="flex gap-0 border-b border-gray-200">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActive(tab)}
            className={`px-6 py-3 text-sm font-semibold transition-colors border-b-2 -mb-px ${
              active === tab ? 'border-red text-red' : 'border-transparent text-gray-400 hover:text-black'
            }`}
          >
            {tab === 'Recensioni' ? `Recensioni (${count})` : tab}
          </button>
        ))}
      </div>
      <div className="py-6">{content[active]}</div>
    </div>
  )
}
