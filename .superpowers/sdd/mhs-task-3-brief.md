### Task 3: Guida ai prodotti landing page

**Files:**
- Create: `app/guida-ai-prodotti/page.tsx`

**Interfaces:**
- Consumes: `GUIDE_LINKS` from `lib/guide-links.ts` (already exists, produces `{ label: string; href: string }[]`).

- [ ] **Step 1: Create the page**

Create `app/guida-ai-prodotti/page.tsx`:

```tsx
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
```

- [ ] **Step 2: Verify the build**

Run: `npx tsc --noEmit`
Expected: no errors

Run: `npm run build`
Expected: build succeeds, new static route `○ /guida-ai-prodotti` appears in the route list

- [ ] **Step 3: Commit**

```bash
git add app/guida-ai-prodotti/page.tsx
git commit -m "feat: add guida ai prodotti landing page"
```
