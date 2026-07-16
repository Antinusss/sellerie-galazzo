### Task 3: Home page shortcut section

**Files:**
- Create: `components/home/GuideLinksSection.tsx`
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: `GUIDE_LINKS` from `lib/guide-links.ts` (already exists, includes `image: string`).

- [ ] **Step 1: Create the section**

Create `components/home/GuideLinksSection.tsx`:

```tsx
import Link from 'next/link'
import Image from 'next/image'
import { GUIDE_LINKS } from '@/lib/guide-links'

export default function GuideLinksSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10">
          <h2 className="text-4xl font-black">
            Trova quello che <em className="text-red">cerchi</em>
          </h2>
          <Link href="/guida-ai-prodotti" className="text-sm font-semibold text-red underline underline-offset-4 hover:text-red-dark">
            Vedi tutte →
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {GUIDE_LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="group relative block aspect-square rounded-2xl overflow-hidden border-2 border-transparent hover:border-sand transition-all duration-300"
            >
              <Image
                src={link.image}
                alt={link.label}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <p className="text-white text-sm font-black leading-tight">{link.label}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Wire it into the home page**

In `app/page.tsx`, add the import:

```tsx
import GuideLinksSection from '@/components/home/GuideLinksSection'
```

Replace:

```tsx
      <HeroSection />
      <CategoryGrid />
      <NewArrivalsCarousel />
      <BestsellersSection />
      <TrustSection />
      <TestimonialsCarousel />
      <BrandCarousel />
```

with:

```tsx
      <HeroSection />
      <CategoryGrid />
      <GuideLinksSection />
      <NewArrivalsCarousel />
      <BestsellersSection />
      <TrustSection />
      <TestimonialsCarousel />
      <BrandCarousel />
```

- [ ] **Step 3: Verify the build**

Run: `npx tsc --noEmit`
Expected: no errors

Run: `npm run build`
Expected: build succeeds

- [ ] **Step 4: Commit**

```bash
git add components/home/GuideLinksSection.tsx app/page.tsx
git commit -m "feat: add guide-links shortcut section to home page"
```
