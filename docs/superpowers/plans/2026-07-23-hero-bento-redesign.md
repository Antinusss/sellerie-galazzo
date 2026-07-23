# Hero Bento Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace `HeroSection.tsx`'s current 2-column layout with a bento-grid layout: a functional product carousel (4 real bestsellers), 3 category quick-link cards, and a new bottom row of 3 cards (catalog size, trust stat, bestseller highlight).

**Architecture:** Single-file rewrite of `components/home/HeroSection.tsx`. All data comes from already-existing helpers (`topBestsellers`, `getReviewSummary`, `GUIDE_LINKS`) — no new lib code, no new data files.

**Tech Stack:** Next.js 14 App Router, TypeScript, Tailwind CSS, Framer Motion, lucide-react 1.21.0.

## Global Constraints

- lucide-react 1.21.0 has no brand icons — social links use the existing `ExternalLink`-icon-plus-text-label pattern already established on `/contattaci`, not per-brand icons.
- Social link URLs must be byte-identical to the real ones already used on `/contattaci`: Facebook `https://m.facebook.com/galazzoselleria/`, Instagram `https://instagram.com/selleriagalazzo/`, TikTok `https://tiktok.com/@selleria_galazzo/`.
- "10k+ Cavalieri soddisfatti" is a reused marketing claim (was in the site's original hero before round 1 removed it) — not a new fabricated number.
- Catalog size ("`{products.length}+` prodotti") must be computed from `data/products.json`'s actual length, never hardcoded — stays accurate if `sync-feed` re-runs.
- No autoplay/timer-based carousel advancement — prev/next buttons only.
- No component-level tests exist in this repo (only pure-logic `.test.ts` files) — this task is UI-only, verified via `tsc --noEmit` + `npm run build` + manual browser check, no new test files.
- Never nest an `<a>`/`Link` inside another `<a>`/`Link` — invalid HTML. The bottom-left "catalog size" card must use two sibling `Link`s (one for the product-count text, one for the wishlist heart icon), not a card-wide `Link` with a nested heart link.

---

### Task 1: Rewrite `HeroSection.tsx`

**Files:**
- Modify: `components/home/HeroSection.tsx`

**Interfaces:**
- Consumes: `topBestsellers(products: Product[], category: Category | undefined, limit: number): Product[]` and `getReviewSummary(productId: string): ReviewSummary` from `@/lib/reviews`; `GUIDE_LINKS: GuideLink[]` from `@/lib/guide-links`; `formatPrice(cents: number): string` from `@/lib/utils`.

- [ ] **Step 1: Replace the full file**

Replace the entire contents of `components/home/HeroSection.tsx` with:

```tsx
'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, Heart, Star, ArrowUpRight, ExternalLink, Truck, Lock, RotateCcw, CreditCard } from 'lucide-react'
import productsData from '@/data/products.json'
import type { Product } from '@/lib/types'
import { topBestsellers, getReviewSummary } from '@/lib/reviews'
import { formatPrice } from '@/lib/utils'
import { GUIDE_LINKS } from '@/lib/guide-links'

const products = productsData as Product[]
const featured = topBestsellers(products, undefined, 8)
const slides = featured.slice(0, 4)
const thumbnails = featured.slice(4, 7)
const highlight = featured[7]

const SOCIAL_LINKS = [
  { label: 'Facebook', href: 'https://m.facebook.com/galazzoselleria/' },
  { label: 'Instagram', href: 'https://instagram.com/selleriagalazzo/' },
  { label: 'TikTok', href: 'https://tiktok.com/@selleria_galazzo/' },
]

const AVATAR_COLORS = ['bg-red', 'bg-sand', 'bg-black']

const TRUST_POINTS = [
  { icon: Truck, title: 'Spedizione gratuita sopra €80', desc: 'Corriere tracciato in tutta Italia' },
  { icon: Lock, title: 'Pagamento sicuro SSL', desc: 'I tuoi dati sono sempre protetti' },
  { icon: RotateCcw, title: 'Reso entro 14 giorni', desc: 'Cambio idea? Nessun problema' },
  { icon: CreditCard, title: 'Paga in 3 rate con Klarna', desc: 'Senza interessi, zero pensieri' },
]

export default function HeroSection() {
  const [activeSlide, setActiveSlide] = useState(0)
  const slide = slides[activeSlide]
  const { rating: highlightRating, count: highlightCount } = getReviewSummary(highlight.id)

  const prevSlide = () => setActiveSlide(i => (i - 1 + slides.length) % slides.length)
  const nextSlide = () => setActiveSlide(i => (i + 1) % slides.length)

  return (
    <section className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Carousel card */}
          <div className="lg:col-span-2 relative rounded-2xl overflow-hidden min-h-[420px] bg-gray-light flex flex-col">
            <div className="flex-1 relative overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={slide.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="absolute inset-0 flex items-center"
                >
                  <div className="relative z-10 p-8 sm:p-10 max-w-xs">
                    <span className="inline-block bg-white text-xs font-bold px-3 py-1 rounded-full mb-4">{slide.category}</span>
                    <p className="text-xs text-gray-500 font-semibold mb-2">{String(activeSlide + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}</p>
                    <h1 className="text-2xl sm:text-3xl font-black text-black leading-tight mb-3">{slide.name}</h1>
                    <p className="font-black text-xl text-red mb-4">{formatPrice(slide.price)}</p>
                    <Link
                      href={`/prodotto/${slide.slug}`}
                      className="inline-flex items-center gap-2 bg-red text-white px-6 py-3 rounded-full font-semibold text-sm hover:bg-red-dark transition-colors"
                    >
                      Vedi il prodotto
                      <ArrowUpRight size={16} />
                    </Link>
                  </div>
                  <div className="absolute right-0 top-0 bottom-0 w-1/2 flex items-center justify-center">
                    <span className="absolute w-3 h-3 rounded-full bg-red/30 top-8 left-4" />
                    <span className="absolute w-2 h-2 rounded-full bg-sand/50 bottom-12 right-8" />
                    <span className="absolute w-4 h-4 rounded-full bg-black/10 top-1/2 right-4" />
                    <div className="relative w-56 h-56 sm:w-72 sm:h-72">
                      <Image src={slide.images[0] ?? ''} alt={slide.name} fill className="object-contain" priority={activeSlide === 0} />
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="relative z-10 flex items-center justify-between px-8 sm:px-10 py-5 border-t border-black/5 bg-white/60">
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span>Seguici su:</span>
                {SOCIAL_LINKS.map(s => (
                  <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 font-semibold hover:text-red transition-colors">
                    {s.label} <ExternalLink size={12} />
                  </a>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={prevSlide} className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-light transition-colors">
                  <ChevronLeft size={16} />
                </button>
                <button onClick={nextSlide} className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-light transition-colors">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Category cards */}
          <div className="flex flex-col gap-4">
            {GUIDE_LINKS.slice(0, 3).map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="group flex items-center gap-4 bg-gray-light rounded-2xl p-4 hover:bg-sand/10 transition-colors"
              >
                <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0">
                  <Image src={link.image} alt={link.label} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-black text-sm text-black">{link.label}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0 group-hover:bg-red group-hover:text-white transition-colors">
                  <ArrowUpRight size={16} />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom row */}
        <div className="grid sm:grid-cols-3 gap-4 mt-6">
          <div className="bg-gray-light rounded-2xl p-5 flex flex-col justify-between">
            <div className="flex items-start justify-between mb-4">
              <Link href="/shop" className="hover:text-red transition-colors">
                <p className="font-black text-lg">{products.length}+ prodotti</p>
                <p className="text-xs text-gray-500">Tutto il catalogo</p>
              </Link>
              <Link href="/wishlist" className="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:text-red transition-colors shrink-0">
                <Heart size={14} />
              </Link>
            </div>
            <div className="flex -space-x-3">
              {thumbnails.map(p => (
                <div key={p.id} className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-white bg-white">
                  <Image src={p.images[0] ?? ''} alt={p.name} fill className="object-cover" />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-light rounded-2xl p-5 flex flex-col justify-between">
            <div className="flex -space-x-3 mb-4">
              {AVATAR_COLORS.map((c, i) => (
                <div key={i} className={`w-10 h-10 rounded-full border-2 border-white ${c} text-white flex items-center justify-center text-xs font-bold`}>
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
            </div>
            <div>
              <p className="font-black text-lg">10k+ Cavalieri</p>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <Star size={12} className="fill-sand text-sand" /> 4.8 su 5
              </p>
            </div>
          </div>

          <Link href={`/prodotto/${highlight.slug}`} className="group relative rounded-2xl overflow-hidden min-h-[140px] flex items-end">
            <Image src={highlight.images[0] ?? ''} alt={highlight.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <span className="absolute top-4 left-4 bg-sand text-black text-xs font-bold px-3 py-1 rounded-full">Bestseller</span>
            <div className="relative z-10 p-5 text-white">
              <p className="font-black text-sm leading-tight mb-1">{highlight.name}</p>
              <p className="text-xs flex items-center gap-1">
                <Star size={12} className="fill-sand text-sand" /> {highlightRating.toFixed(1)} ({highlightCount})
              </p>
            </div>
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          {TRUST_POINTS.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-start gap-3 bg-gray-light rounded-xl p-4">
              <Icon className="text-red shrink-0 mt-0.5" size={22} />
              <div>
                <p className="font-bold text-xs text-black leading-tight">{title}</p>
                <p className="text-[11px] text-gray-500 mt-1 leading-tight">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Verify the build**

Run: `npx tsc --noEmit`
Expected: no errors.

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add components/home/HeroSection.tsx
git commit -m "feat: redesign home hero as bento grid with product carousel"
```

---

### Task 2: Full build + test + manual verification

**Files:** None (verification only).

- [ ] **Step 1: Full automated check**

Run: `npx tsc --noEmit && npm test && npm run build`
Expected: no type errors, all tests pass, build succeeds, home route (`/`) generates.

- [ ] **Step 2: Manual browser verification**

Start the production server (`npm run start`, port 3000) and check:

1. Home page (`/`): carousel card shows slide 1 of 4 — real product photo, category chip, "01 / 04" counter, product name as headline, real price, "Vedi il prodotto" button.
2. Click the next-arrow button 3 times: confirm the slide content changes each time (different product photo/name/price), and wraps back to slide 1 on a 4th click. Click the prev-arrow: confirm it cycles backward correctly (including wrapping from slide 1 back to slide 4).
3. Click "Vedi il prodotto" on the currently showing slide: confirm it navigates to that exact product's `/prodotto/[slug]` page (matching the name/price just shown).
4. Click each of the 3 "Seguici su" social links: confirm they open the correct real URLs (m.facebook.com/galazzoselleria, instagram.com/selleriagalazzo, tiktok.com/@selleria_galazzo) in a new tab.
5. Right column: 3 category cards render with real photos and labels, each links to its `GUIDE_LINKS` href.
6. Bottom-left card: shows "{real product count}+ prodotti" (matches the actual `data/products.json` length — confirm the number isn't a stray placeholder), clicking the text navigates to `/shop`; clicking the separate heart icon navigates to `/wishlist` (confirm these are two independently clickable areas, not one link swallowing the other — this was a specific nested-`<a>` risk called out in this plan).
7. Bottom-center card: shows 3 colored avatar circles, "10k+ Cavalieri", "4.8 su 5" rating line.
8. Bottom-right card: shows a real bestseller product photo/name/rating with a "Bestseller" badge, clicking it navigates to that product's page.
9. Trust strip (4 items) unchanged from before this plan, still renders below everything.
10. Browser console: no errors on `/` or after any of the above interactions.

- [ ] **Step 3: Record findings**

If any check in Step 2 fails, fix it before proceeding — do not mark this task complete with a known-broken interaction.
