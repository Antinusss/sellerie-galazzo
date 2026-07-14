### Task 6: `/marche` page — all brands grid

**Files:**
- Create: `app/marche/page.tsx`

**Interfaces:**
- Consumes: `data/brands.json` with `logo` populated (Task 2)

- [ ] **Step 1: Create `app/marche/page.tsx`**

```tsx
import Link from 'next/link'
import Image from 'next/image'
import brandsData from '@/data/brands.json'
import type { Brand } from '@/lib/types'

export const metadata = { title: 'Tutti i marchi — Selleria Galazzo' }

export default function MarchePage() {
  const brands = [...(brandsData as Brand[])].sort((a, b) => b.productCount - a.productCount)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-4xl font-black mb-8">
        Tutti i <em className="text-red">marchi</em>
      </h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {brands.map(brand => (
          <Link
            key={brand.id}
            href={`/brand/${brand.id}`}
            className="flex flex-col items-center gap-3 bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow text-center"
          >
            {brand.logo ? (
              <div className="relative w-16 h-16">
                <Image src={brand.logo} alt={brand.name} fill className="object-contain" />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-light flex items-center justify-center text-lg font-black text-gray-400">
                {brand.name.slice(0, 2).toUpperCase()}
              </div>
            )}
            <span className="text-sm font-semibold text-black">{brand.name}</span>
            <span className="text-xs text-gray-400">{brand.productCount} prodotti</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: zero errors

- [ ] **Step 3: Verify with the dev server**

Run: `npm run dev` (in background), then:

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/marche
```

Expected: `200`. Stop the dev server after checking.

- [ ] **Step 4: Commit**

```bash
git add app/marche/page.tsx
git commit -m "feat: add /marche page listing all brands"
```

---

