### Task 2: Restyle the guida ai prodotti page with photo cards

**Files:**
- Modify: `app/guida-ai-prodotti/page.tsx`

**Interfaces:**
- Consumes: `GUIDE_LINKS` from `lib/guide-links.ts` (already exists, now includes `image: string`).

- [ ] **Step 1: Replace the full file**

Replace the full contents of `app/guida-ai-prodotti/page.tsx`:

```tsx
import Link from 'next/link'
import Image from 'next/image'
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
            className="group relative block aspect-[4/3] rounded-2xl overflow-hidden border-2 border-transparent hover:border-sand transition-all duration-300"
          >
            <Image
              src={link.image}
              alt={link.label}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h3 className="text-white font-black">{link.label}</h3>
            </div>
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
Expected: build succeeds

- [ ] **Step 3: Commit**

```bash
git add app/guida-ai-prodotti/page.tsx
git commit -m "feat: restyle guida ai prodotti page with photo cards"
```
