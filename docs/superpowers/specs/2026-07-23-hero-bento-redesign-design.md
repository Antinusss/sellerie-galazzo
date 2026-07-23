# Hero Home Redesign v2 (Bento Grid) — Design Spec

## Goal

Replace the current `HeroSection.tsx` (a 2-column banner + 3 quick-link cards, built 2026-07-22) with a bento-grid layout inspired by the client's new reference screenshot (a "Nitec" headphone-store template): a large product carousel card, 3 stacked category cards, and a 3-card bottom row (catalog size, trust stat, bestseller highlight). All content stays on real data — no new fabricated numbers beyond the one marketing claim ("10k+ Cavalieri soddisfatti") already used site-wide before round 1 removed it.

## Decisions from Q&A

- The large hero card is a **functional carousel** (prev/next arrows actually change slide), not a static single banner.
- Slides feature **real bestseller products** (via the existing `topBestsellers` helper), not the 3 top-level category branches — spotlighting specific products is more conversion-oriented than the previous, more abstract "shop by category" framing.
- The reference's "Popular Colors" swatch panel has no real-data equivalent (no per-product color-variant selector exists in this catalog) and is dropped. In its place, the right column keeps **3 category quick-link cards** (was 2 promo cards + 1 color panel in the reference) — `GUIDE_LINKS.slice(0, 3)`, same data source the current hero already uses.
- The bottom-center "avatar stack + big stat + rating" card reuses **"10k+ Cavalieri soddisfatti"** — the same marketing claim used in the original (pre-round-1) hero, not a new invented number. Avatars are generic colored initials circles, not fabricated human photos (avoids implying real customer photos that don't exist).

## Layout

**Large carousel card** (left, ~2/3 width):
- Local `activeSlide` state, prev/next buttons cycle through 4 slides (no autoplay — kept simple, manual-only).
- Each slide: category chip (product's `category` field), slide counter ("01/04" style), product name as headline, price, "Vedi il prodotto" CTA linking to `/prodotto/[slug]`, product photo with a few decorative CSS-positioned dots around it (no data dependency, purely visual, loosely inspired by the reference — not a pixel clone).
- Slides come from `topBestsellers(products, undefined, 8).slice(0, 4)` — the top 4 bestsellers site-wide.
- Below the carousel: "Seguici su" + the 3 real social links already established in `/contattaci` (Facebook, Instagram, TikTok — same URLs, no new research needed).

**Right column** (3 stacked cards): `GUIDE_LINKS.slice(0, 3)`, each a photo + label + circular arrow-icon button, replacing the current hero's "Acquistare →" text-link style with a rounded icon button (closer to the reference's visual treatment, still linking to the same `href`).

**Bottom row** (3 cards, new — this is the "460 plus items" / avatar-stat / "Listening Has Been Released" row from the reference):
1. **Catalog size card**: `{products.length}+ prodotti` (computed from the real `data/products.json` length, not hardcoded — stays accurate if `sync-feed` re-runs), a wishlist heart icon linking to `/wishlist`, and 3 real product thumbnails (`topBestsellers(products, undefined, 8).slice(4, 7)` — distinct from the carousel's 4 products, no repeats on screen).
2. **Trust stat card**: 3-4 overlapping colored circles with generic initials (deterministic color per position, decorative only) + "10k+ Cavalieri soddisfatti" + "4.8★" rating line.
3. **Bestseller highlight card**: the 8th product from the same `topBestsellers(products, undefined, 8)` list (index 7 — avoids reusing a photo already shown elsewhere on the section), a "Bestseller" badge, its real name and real review rating (via `getReviewSummary`), and an arrow linking to its product page.

The existing 4-item trust strip (spedizione/SSL/reso/Klarna, added in round 1) stays unchanged below all of this.

## Out of scope

- Any autoplay/timer-based carousel advancement.
- Per-product color variants (would require new data modeling, unrelated to this visual redesign).
- Changing `GUIDE_LINKS` itself, `topBestsellers`, or any other already-existing shared helper — this task only consumes them.
- Any other home-page section (`CategoryShowcase`, `BestsellersSection`, etc.) — this spec only replaces `HeroSection.tsx`.
