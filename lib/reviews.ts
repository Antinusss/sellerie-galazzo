import type { Category, Product } from './types'
import { productsUnderCategory } from './category-tree'

export interface Review {
  author: string
  rating: number
  date: string
  text: string
}

export interface ReviewSummary {
  rating: number
  count: number
  reviews: Review[]
}

const AUTHORS = [
  'Giulia R.', 'Marco B.', 'Francesca T.', 'Luca P.', 'Elena M.', 'Andrea C.',
  'Sara D.', 'Davide F.', 'Chiara V.', 'Matteo G.', 'Valentina S.', 'Simone L.',
  'Alessia N.', 'Federico Z.', 'Martina A.',
]

const DATES = ['3 giorni fa', '1 settimana fa', '2 settimane fa', '3 settimane fa', '1 mese fa', '2 mesi fa']

const TEXTS = [
  'Prodotto di ottima qualità, esattamente come descritto. Consigliato!',
  'Spedizione velocissima e imballo curato. Il prodotto è perfetto.',
  'Ottimo rapporto qualità prezzo, lo ricomprerei senza dubbio.',
  'Materiali robusti e ben rifiniti, si vede la qualità.',
  'Esattamente quello che cercavo per il mio cavallo, top.',
  'Arrivato in tempi rapidi, confezione integra. Molto soddisfatto.',
  'Qualità superiore alle aspettative, consigliatissimo.',
  'Un acquisto azzeccato, funziona benissimo e sembra durare nel tempo.',
  'Servizio clienti gentile e prodotto conforme alla descrizione.',
  'Ottimo prodotto, il mio cavallo lo adora già dal primo utilizzo.',
  'Buona qualità costruttiva, prezzo onesto per quello che offre.',
  'Consegna puntuale e prodotto identico alle foto. Tutto perfetto.',
  'Non è il massimo ma per il prezzo va benissimo.',
  'Comodo e pratico da usare, lo consiglio a tutti i cavalieri.',
  'Selleria affidabile, secondo acquisto e sono sempre soddisfatto.',
]

const RATING_POOL = [4.2, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 5.0]

export function hashOf(id: string): number {
  const n = Number(id)
  return Number.isFinite(n) ? n : id.split('').reduce((sum, c) => sum + c.charCodeAt(0), 0)
}

export function getReviewSummary(productId: string): ReviewSummary {
  const hash = hashOf(productId)
  const rating = RATING_POOL[hash % RATING_POOL.length]
  const count = 3 + (hash % 118)
  const sampleSize = Math.min(5, count)
  const individualRatings = [5.0, rating, rating, Math.max(3.5, rating - 1), 4.5]

  const reviews: Review[] = Array.from({ length: sampleSize }, (_, i) => {
    const offset = hash + i * 7
    return {
      author: AUTHORS[offset % AUTHORS.length],
      rating: individualRatings[i % individualRatings.length],
      date: DATES[offset % DATES.length],
      text: TEXTS[offset % TEXTS.length],
    }
  })

  return { rating, count, reviews }
}

export function topBestsellers(products: Product[], category: Category | undefined, limit: number): Product[] {
  return productsUnderCategory(products, category)
    .slice()
    .sort((a, b) => getReviewSummary(b.id).count - getReviewSummary(a.id).count)
    .slice(0, limit)
}
