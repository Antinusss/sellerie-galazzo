### Task 4: Full-screen hero

**Files:**
- Modify: `components/home/HeroSection.tsx`

**Interfaces:**
- None — self-contained component rewrite, no props, no new dependencies.

- [ ] **Step 1: Replace the full file**

Replace the full contents of `components/home/HeroSection.tsx`:

```tsx
'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'

export default function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      <Image
        src="https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=1600&q=85"
        alt="Cavaliere in azione"
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/10" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="max-w-xl"
        >
          <p className="text-sand font-semibold tracking-widest uppercase text-sm mb-4">
            Dal 1985 · Selleria Italiana
          </p>
          <h1 className="text-5xl lg:text-7xl font-black text-white leading-tight mb-6">
            Equipaggiati per{' '}
            <em className="text-red">vincere</em>
          </h1>
          <p className="text-white/80 text-lg leading-relaxed mb-8 max-w-md">
            Prodotti selezionati per monta inglese, western e scuderia. Qualità professionale per ogni cavaliere.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/shop"
              className="bg-red text-white px-8 py-4 rounded-full font-semibold text-sm hover:bg-red-dark transition-colors"
            >
              Scopri lo Shop
            </Link>
            <Link
              href="/shop?sort=newest"
              className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold text-sm hover:bg-white hover:text-black transition-colors"
            >
              Le Novità
            </Link>
          </div>
          <div className="flex flex-wrap gap-8 mt-12 text-sm">
            <div>
              <div className="font-black text-2xl text-white">10k+</div>
              <div className="text-white/60">Cavalieri</div>
            </div>
            <div>
              <div className="font-black text-2xl text-white">200+</div>
              <div className="text-white/60">Brand selezionati</div>
            </div>
            <div>
              <div className="font-black text-2xl text-white">40+</div>
              <div className="text-white/60">Anni di esperienza</div>
            </div>
            <div>
              <div className="font-black text-2xl text-white">4.8★</div>
              <div className="text-white/60">Recensioni verificate</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
```

Note: the secondary CTA ("Le Novità") switches from a black-outlined button (`border-black`, `hover:bg-black`) to a white-outlined one (`border-white`, `hover:bg-white hover:text-black`) — it now sits on a dark photo instead of a white background, so the outline color must invert to stay visible. This is a deliberate, necessary adaptation, not a copy-paste error.

- [ ] **Step 2: Verify the build**

Run: `npx tsc --noEmit`
Expected: no errors

Run: `npm run build`
Expected: build succeeds

- [ ] **Step 3: Commit**

```bash
git add components/home/HeroSection.tsx
git commit -m "feat: full-screen background photo for home hero"
```
