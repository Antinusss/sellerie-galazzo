### Task 1: `categoryDescription` template helper

**Files:**
- Create: `lib/category-description.ts`
- Test: `__tests__/category-description.test.ts`

**Interfaces:**
- Produces: `categoryDescription(category: Category): string` from `@/lib/category-description` — consumed by Task 2.

- [ ] **Step 1: Write the failing tests**

Create `__tests__/category-description.test.ts`:

```ts
import { categoryDescription } from '@/lib/category-description'
import type { Category } from '@/lib/types'

function category(overrides: Partial<Category>): Category {
  return {
    path: ['Monta Inglese'], slug: ['monta-inglese'], name: 'Monta Inglese',
    depth: 1, productCount: 10, ...overrides,
  }
}

describe('categoryDescription', () => {
  it('uses the branch template for depth-1 categories', () => {
    const cat = category({ path: ['Scuderia'], slug: ['scuderia'], name: 'Scuderia', depth: 1, productCount: 345 })
    expect(categoryDescription(cat)).toBe(
      'Tutto il necessario per Scuderia: 345 prodotti selezionati, spedizione rapida in tutta Italia e reso entro 14 giorni.'
    )
  })

  it('uses the parent-referencing template for depth-3 categories, referencing the immediate parent', () => {
    const cat = category({
      path: ['Monta Inglese', 'Cavaliere', 'Selle e accessori'],
      slug: ['monta-inglese', 'cavaliere', 'selle-e-accessori'],
      name: 'Selle e accessori', depth: 3, productCount: 42,
    })
    expect(categoryDescription(cat)).toBe(
      'Scopri i nostri 42 prodotti di Selle e accessori per Cavaliere: qualità professionale, spedizione tracciata e reso entro 14 giorni.'
    )
  })

  it('references the top-level branch as parent for depth-2 categories', () => {
    const cat = category({
      path: ['Monta Inglese', 'Cavaliere'],
      slug: ['monta-inglese', 'cavaliere'],
      name: 'Cavaliere', depth: 2, productCount: 120,
    })
    expect(categoryDescription(cat)).toBe(
      'Scopri i nostri 120 prodotti di Cavaliere per Monta Inglese: qualità professionale, spedizione tracciata e reso entro 14 giorni.'
    )
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- category-description.test.ts`
Expected: FAIL — `Cannot find module '@/lib/category-description'`.

- [ ] **Step 3: Implement `categoryDescription`**

Create `lib/category-description.ts`:

```ts
import type { Category } from './types'

export function categoryDescription(category: Category): string {
  if (category.depth === 1) {
    return `Tutto il necessario per ${category.name}: ${category.productCount} prodotti selezionati, spedizione rapida in tutta Italia e reso entro 14 giorni.`
  }
  const parent = category.path[category.path.length - 2]
  return `Scopri i nostri ${category.productCount} prodotti di ${category.name} per ${parent}: qualità professionale, spedizione tracciata e reso entro 14 giorni.`
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- category-description.test.ts`
Expected: PASS, all 3 tests.

- [ ] **Step 5: Run the full suite and typecheck**

Run: `npm test && npx tsc --noEmit`
Expected: all tests pass (no regressions), no type errors.

- [ ] **Step 6: Commit**

```bash
git add lib/category-description.ts __tests__/category-description.test.ts
git commit -m "feat: add categoryDescription SEO template helper"
```

---

