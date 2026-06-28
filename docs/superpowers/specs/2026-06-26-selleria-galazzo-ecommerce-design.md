# Selleria Galazzo — Ecommerce Mockup Design Spec
**Date:** 2026-06-26  
**Status:** Approved

## Overview

Modern ecommerce mockup for Selleria Galazzo (https://selleriagalazzo.com/), an Italian equestrian shop. Built with Next.js 14 + Tailwind, deployed on Vercel via GitHub. Design inspired by eu.huel.com — clean, spacious, bold typography, fluid UX.

## Design Direction: "Equestrian Premium"

### Color Palette

| Token | Value | Usage |
|---|---|---|
| `--white` | `#FFFFFF` | Main background |
| `--red` | `#CC0000` | Primary CTAs, SALE badges, hover accents |
| `--sand` | `#C4A882` | Highlights, borders, alternate section accents |
| `--black` | `#1A1A1A` | Body text, headings |
| `--gray-light` | `#F4F4F4` | Secondary section backgrounds |
| `--red-dark` | `#8B0000` | Trust section background (dark CTA panel) |

### Typography

- **Inter** — sans-serif, used for body, navigation, labels, buttons
- **Playfair Display** — serif italic, used for hero keyword emphasis (Huel-style mix)
- Pattern: `Scopri <em>il tuo</em> stile equestre` — bold sans + italic serif hybrid

---

## Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | Next.js 14 App Router | Vercel-native, SSG-ready |
| Styling | Tailwind CSS | Utility-first, fast prototyping |
| Animation | Framer Motion | Smooth scroll-reveal, hover states |
| State | Zustand | Cart state across pages |
| Icons | Lucide React | Consistent, lightweight |
| Deploy | Vercel + GitHub | Zero-config CI/CD |

---

## Project Structure

```
/app
  layout.tsx                → Root layout (Navbar, AnnouncementBar, Footer)
  page.tsx                  → Home page
  /shop
    page.tsx                → Product listing with filters
    /[slug]
      page.tsx              → Product detail page
  /cart
    page.tsx                → Cart page
  /checkout
    page.tsx                → Checkout (3-step)

/components
  /layout
    AnnouncementBar.tsx     → Scrolling promo bar (top)
    Navbar.tsx              → Sticky nav with dropdown, search, cart icon
    Footer.tsx              → Links, newsletter, social
  /home
    HeroSection.tsx         → Full-width hero, headline, 2 CTAs
    CategoryGrid.tsx        → 2x2 category cards with hover
    NewArrivalsCarousel.tsx → 4-col product carousel
    TrustSection.tsx        → Dark panel with 3 trust badges
    BrandCarousel.tsx       → Logo slider
  /shop
    FilterSidebar.tsx       → Category, price range, brand filters
    ProductGrid.tsx         → 3-col responsive grid
    ProductCard.tsx         → Image, name, price, SALE badge, quick-add
    SortDropdown.tsx        → Sort by price/newest/relevance
  /product
    ProductGallery.tsx      → Main image + thumbnail strip
    ProductInfo.tsx         → Name, price, variants, qty, Add to Cart
    ProductTabs.tsx         → Description / Specs / Shipping tabs
  /cart
    CartItem.tsx            → Thumbnail, name, qty stepper, remove
    CartSummary.tsx         → Subtotal, discount code, checkout CTA
  /checkout
    CheckoutSteps.tsx       → Step indicator (3 steps)
    ContactForm.tsx         → Email + shipping address
    ShippingMethod.tsx      → Standard / Express options
    PaymentForm.tsx         → Card UI mockup (not functional)
    OrderSummary.tsx        → Fixed right panel, order recap

/data
  products.json             → 24 products: real names from selleriagalazzo.com,
                              real prices, real categories, Unsplash image URLs
  categories.json           → 4 categories with descriptions and hero images
  brands.json               → Brand logos (Acavallo, Equestro, Franceschini, ACME, etc.)

/lib
  store.ts                  → Zustand cart store (add, remove, update qty)
  utils.ts                  → Price formatting, slug generation
```

---

## Pages — Section Breakdown

### Home (`/`)

1. **AnnouncementBar** — horizontal scroll marquee: "Spedizione gratuita sopra €80 · Reso garantito 100% · Supporto 24/7"
2. **Navbar** — sticky on scroll. Logo left, category dropdowns center (Monta Inglese, Monta Western, Scuderia, Cavaliere), search + wishlist + cart icons right.
3. **HeroSection** — full-viewport-height. Left: headline (`Equipaggiati per *vincere*`), subheading, 2 pill CTAs ("Scopri il Shop" filled red, "Le Novità" outlined). Right: equestrian hero image.
4. **CategoryGrid** — 2x2 grid, each card full-bleed image + category name overlay, hover scale + sand border glow.
5. **NewArrivalsCarousel** — heading `Gli ultimi arrivati`, 4-col scrollable, ProductCard with hover zoom.
6. **TrustSection** — dark red background (`#8B0000`), 3 columns: truck icon "Spedizione gratuita" / shield "Soddisfatti o rimborsati" / headset "Supporto 24/7".
7. **BrandCarousel** — white bg, auto-scrolling logos, pause on hover.
8. **Footer** — 4 columns: logo+tagline, navigation links, customer service links, newsletter signup. Bottom bar: copyright + payment icons.

### Shop (`/shop`)

- Left sidebar (25%): filter by category checkboxes, price range slider, brand checkboxes, "Applica Filtri" CTA.
- Right content (75%): sort bar + product count + 3-col grid.
- **ProductCard**: white bg, image (hover: zoom 105%), category tag (small, sand), product name, price (crossed-out original if on sale), red SALE badge, hover: quick-add button slides up from bottom.
- Pagination at bottom.

### Product Detail (`/shop/[slug]`)

- Left (55%): **ProductGallery** — large main image, 4 thumbnail strip below. Click thumbnail → swap main.
- Right (45%): **ProductInfo**:
  - Category breadcrumb
  - Product name (large, Inter bold)
  - Price (current + original if discounted)
  - Star rating + review count
  - Variant selectors (color swatches or size pills)
  - Qty stepper (–/number/+)
  - "Aggiungi al carrello" (red pill button, full width)
  - "Aggiungi alla wishlist" (outline button)
  - Accordion: Descrizione / Specifiche tecniche / Spedizione & Resi

### Cart (`/cart`)

- Left (65%): list of CartItems. Each: thumbnail, name, variant, qty stepper, line total, remove (×).
- Right (35%): **CartSummary** — subtotal, discount code input, shipping estimate, total, "Procedi al checkout" CTA.
- Empty state: illustration + "Il tuo carrello è vuoto" + CTA to shop.

### Checkout (`/checkout`)

- **Step indicator** top: 1 Contatti → 2 Spedizione → 3 Pagamento
- Step 1: email, nome, cognome, indirizzo, CAP, città, paese.
- Step 2: radio select Standard (3-5 gg, gratis sopra €80) / Express (1-2 gg, €9.90).
- Step 3: card number mockup UI (visual only, not functional), billing same as shipping checkbox.
- Right panel (fixed): order items recap, subtotal, shipping, total.
- Final CTA: "Conferma ordine" → navigates to `/checkout/success` page with order confirmation message.

---

## Data: products.json

24 products across 4 categories, sourced from real Selleria Galazzo catalog:

**Monta Inglese (6):** Equestro Cap Apocalypse casco, leggings full-grip donna, giacca da concorso, stivali da equitazione, guanti, redini.  
**Monta Western (6):** Cappello western, sella western mockup, stivali cowboy, cintura, corda, abbigliamento.  
**Scuderia (6):** Abbeveratoio a pressione, asciuga sudore, coperta cavallo, cavezza nylon, repellente antimosche, grasso zoccoli.  
**Cavaliere (6):** Occhiali da sole sportivi, sottosella, paraschiena, body protector, guanti inverno, calzettoni equestri.

Images: Unsplash direct URLs (format: `https://images.unsplash.com/photo-{id}?w=800&q=80`), curated equestrian photos. No Unsplash API key needed — direct CDN links.

---

## Animations & Interactions

- **Scroll reveal:** sections fade+translateY on enter (Framer Motion `whileInView`)
- **ProductCard hover:** image scale 1.05, quick-add button slides up with overlay
- **Navbar:** transparent on hero → white+shadow on scroll
- **Cart icon:** bounce animation on add-to-cart
- **Category cards:** sand border glow + slight scale on hover
- **AnnouncementBar:** CSS marquee, pause on hover
- **Hero image:** subtle parallax on scroll

---

## Responsive Breakpoints

| Breakpoint | Layout changes |
|---|---|
| Mobile (<768px) | Single column, hamburger menu, cart drawer |
| Tablet (768-1024px) | 2-col product grid, sidebar collapses to filter modal |
| Desktop (>1024px) | Full layout as described above |

---

## Non-Goals (mockup scope)

- No real payment processing
- No backend / database
- No authentication / user accounts
- No real WooCommerce integration
- Checkout form is UI-only (no submission)
