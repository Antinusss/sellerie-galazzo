### Task 3: Fake reviews

**Files:**
- Create: `lib/reviews.ts`
- Test: `__tests__/reviews.test.ts`

**Interfaces:**
- Produces: `Review = { author: string; rating: number; date: string; text: string }`,
  `ReviewSummary = { rating: number; count: number; reviews: Review[] }`,
  `getReviewSummary(productId: string): ReviewSummary` — consumed by Tasks 5, 6, 7 (`ProductCard`, `ProductInfo`, `ProductTabs`).

- [ ] **Step 1: Write the failing tests**

Create `__tests__/reviews.test.ts`:

```ts
import { getReviewSummary } from '@/lib/reviews'

describe('getReviewSummary', () => {
  it('is deterministic for the same product id', () => {
    expect(getReviewSummary('67217')).toEqual(getReviewSummary('67217'))
  })

  it('returns a rating from the positive-skewed pool', () => {
    const { rating } = getReviewSummary('15')
    expect([4.2, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 5.0]).toContain(rating)
  })

  it('returns a count between 3 and 120', () => {
    const { count } = getReviewSummary('42')
    expect(count).toBeGreaterThanOrEqual(3)
    expect(count).toBeLessThanOrEqual(120)
  })

  it('caps sample reviews at 5 even when count is higher', () => {
    const { count, reviews } = getReviewSummary('117')
    expect(count).toBeGreaterThan(5)
    expect(reviews.length).toBe(5)
  })

  it('returns fewer sample reviews than 5 when count is under 5', () => {
    const { count, reviews } = getReviewSummary('118')
    expect(count).toBe(3)
    expect(reviews.length).toBe(3)
  })

  it('every sample review has a non-empty author/date/text and a plausible rating', () => {
    const { reviews } = getReviewSummary('999')
    for (const r of reviews) {
      expect(r.author.length).toBeGreaterThan(0)
      expect(r.date.length).toBeGreaterThan(0)
      expect(r.text.length).toBeGreaterThan(0)
      expect(r.rating).toBeGreaterThanOrEqual(3.5)
      expect(r.rating).toBeLessThanOrEqual(5.0)
    }
  })

  it('produces different output for different product ids', () => {
    const a = getReviewSummary('10')
    const b = getReviewSummary('11')
    expect(a).not.toEqual(b)
  })

  it('does not throw for a non-numeric id and stays deterministic', () => {
    expect(() => getReviewSummary('abc')).not.toThrow()
    expect(getReviewSummary('abc')).toEqual(getReviewSummary('abc'))
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- reviews`
Expected: FAIL with "Cannot find module '@/lib/reviews'"

- [ ] **Step 3: Implement `lib/reviews.ts`**

```ts
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

function hashOf(id: string): number {
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
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- reviews`
Expected: PASS (8/8 tests green)

- [ ] **Step 5: Commit**

```bash
git add lib/reviews.ts __tests__/reviews.test.ts
git commit -m "feat: add deterministic fake-review generator"
```

---

