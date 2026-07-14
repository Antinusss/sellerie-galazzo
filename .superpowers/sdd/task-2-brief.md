### Task 2: Product badge data layer

**Files:**
- Create: `lib/badges.ts`
- Test: `__tests__/badges.test.ts`

**Interfaces:**
- Consumes: `getReviewSummary(productId: string): ReviewSummary` from `lib/reviews.ts` (existing, produces `{ rating, count, reviews }`).
- Produces: `getBadge(productId: string): 'novita' | 'bestseller' | null`, imported by Task 4 (`ProductCard`).

- [ ] **Step 1: Write the failing test**

Create `__tests__/badges.test.ts`:

```ts
import { getBadge } from '@/lib/badges'

describe('getBadge', () => {
  it('is deterministic for the same product id', () => {
    expect(getBadge('67217')).toBe(getBadge('67217'))
  })

  it('returns "bestseller" for a product with a high review count', () => {
    // id=108 -> reviewCount = 3 + (108 % 118) = 111, above the 110 threshold
    expect(getBadge('108')).toBe('bestseller')
  })

  it('returns "novita" for a product whose id is a multiple of 12 and not a bestseller', () => {
    // id=12 -> reviewCount = 3 + (12 % 118) = 15 (below threshold), 12 % 12 === 0
    expect(getBadge('12')).toBe('novita')
  })

  it('returns null for a product matching neither rule', () => {
    // id=1 -> reviewCount = 4 (below threshold), 1 % 12 !== 0
    expect(getBadge('1')).toBeNull()
  })

  it('never returns both — every id yields exactly one of the three values', () => {
    for (let id = 0; id < 300; id++) {
      expect(['novita', 'bestseller', null]).toContain(getBadge(String(id)))
    }
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest __tests__/badges.test.ts`
Expected: FAIL with `Cannot find module '@/lib/badges'`

- [ ] **Step 3: Write minimal implementation**

Create `lib/badges.ts`:

```ts
import { getReviewSummary } from './reviews'

export type Badge = 'novita' | 'bestseller' | null

const NOVITA_MODULO = 12
const BESTSELLER_COUNT_THRESHOLD = 110

function hashOf(id: string): number {
  const n = Number(id)
  return Number.isFinite(n) ? n : id.split('').reduce((sum, c) => sum + c.charCodeAt(0), 0)
}

export function getBadge(productId: string): Badge {
  const { count } = getReviewSummary(productId)
  if (count > BESTSELLER_COUNT_THRESHOLD) return 'bestseller'

  if (hashOf(productId) % NOVITA_MODULO === 0) return 'novita'

  return null
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest __tests__/badges.test.ts`
Expected: PASS, 5/5 tests

- [ ] **Step 5: Commit**

```bash
git add lib/badges.ts __tests__/badges.test.ts
git commit -m "feat: add deterministic product badge module"
```
