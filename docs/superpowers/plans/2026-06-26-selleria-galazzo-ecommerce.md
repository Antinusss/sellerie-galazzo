# Selleria Galazzo Ecommerce Mockup — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a full-flow Next.js 14 ecommerce mockup (Home→Shop→Product→Cart→Checkout→Success) for Selleria Galazzo with modern design inspired by Huel.

**Architecture:** Next.js 14 App Router with Tailwind CSS for styling. Zustand manages cart state client-side. All product data is static JSON. No backend, no auth, no real payments.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, Framer Motion, Zustand, Lucide React, Jest + React Testing Library

## Global Constraints

- Node 18+
- Next.js 14.x App Router (no Pages Router)
- TypeScript strict mode
- Colors: white `#FFFFFF`, red `#CC0000`, sand `#C4A882`, black `#1A1A1A`, gray-light `#F4F4F4`, red-dark `#8B0000`
- Fonts: Inter (body/nav), Playfair Display (hero italic emphasis)
- All Italian copy (UI labels, headings, CTAs)
- Images: picsum.photos for product placeholders, Unsplash direct URLs for hero/category
- No real payments, no backend, no auth
- Responsive: mobile-first, breakpoints sm(640) md(768) lg(1024) xl(1280)

---

### Task 1: Project Scaffold

**Files:**
- Create: `package.json` (via npx)
- Create: `tailwind.config.ts`
- Create: `app/globals.css`
- Create: `next.config.ts`
- Create: `jest.config.ts`
- Create: `jest.setup.ts`

- [ ] **Step 1: Init Next.js project**

```bash
cd "/Users/leonardoantinucci/claude_code/Sellerie Galazzo Mock Up"
npx create-next-app@14 . --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*" --yes
```

Expected: project files created, `npm run dev` works.

- [ ] **Step 2: Install dependencies**

```bash
npm install framer-motion zustand lucide-react
npm install -D jest jest-environment-jsdom @testing-library/react @testing-library/jest-dom @types/jest ts-jest
```

- [ ] **Step 3: Install Google Fonts**

```bash
npm install @next/font
```

- [ ] **Step 4: Configure Tailwind**

Replace `tailwind.config.ts` with:

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        red: { DEFAULT: '#CC0000', dark: '#8B0000' },
        sand: '#C4A882',
        black: '#1A1A1A',
        'gray-light': '#F4F4F4',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
    },
  },
  plugins: [],
}
export default config
```

- [ ] **Step 5: Configure app/globals.css**

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply font-sans text-black bg-white;
  }
}

@layer utilities {
  .marquee {
    animation: marquee 30s linear infinite;
  }
  @keyframes marquee {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
}
```

- [ ] **Step 6: Configure Jest**

Create `jest.config.ts`:

```typescript
import type { Config } from 'jest'
const config: Config = {
  testEnvironment: 'jsdom',
  setupFilesAfterFramework: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/$1' },
  transform: { '^.+\\.tsx?$': ['ts-jest', { tsconfig: { jsx: 'react-jsx' } }] },
}
export default config
```

Create `jest.setup.ts`:

```typescript
import '@testing-library/jest-dom'
```

- [ ] **Step 7: Verify dev server**

```bash
npm run dev
```

Expected: `http://localhost:3000` loads Next.js default page.

- [ ] **Step 8: Commit**

```bash
git init
git add .
git commit -m "feat: scaffold Next.js 14 project with Tailwind, Zustand, Framer Motion"
```

---

### Task 2: Types + Data Layer

**Files:**
- Create: `lib/types.ts`
- Create: `lib/utils.ts`
- Create: `data/products.json`
- Create: `data/categories.json`
- Create: `data/brands.json`
- Create: `__tests__/utils.test.ts`

**Produces:**
- `Product`, `Category`, `Brand`, `CartItem` types
- `formatPrice(cents: number): string` → `"€17,50"`
- `slugify(name: string): string` → `"equestro-cap-apocalypse"`
- `getProductBySlug(slug: string, products: Product[]): Product | undefined`

- [ ] **Step 1: Write failing tests**

Create `__tests__/utils.test.ts`:

```typescript
import { formatPrice, slugify, getProductBySlug } from '@/lib/utils'
import type { Product } from '@/lib/types'

describe('formatPrice', () => {
  it('formats integer euros', () => expect(formatPrice(4500)).toBe('€45,00'))
  it('formats with decimals', () => expect(formatPrice(1750)).toBe('€17,50'))
  it('formats zero', () => expect(formatPrice(0)).toBe('€0,00'))
})

describe('slugify', () => {
  it('lowercases and hyphenates', () => expect(slugify('Equestro Cap')).toBe('equestro-cap'))
  it('removes special chars', () => expect(slugify('Occhiali Da Sole')).toBe('occhiali-da-sole'))
  it('handles accents', () => expect(slugify('Abbeveratoio a pressione')).toBe('abbeveratoio-a-pressione'))
})

describe('getProductBySlug', () => {
  const products: Product[] = [
    { id: '1', name: 'Test Product', slug: 'test-product', price: 1000, originalPrice: null,
      category: 'Monta Inglese', brand: 'Equestro', images: [], description: '', specs: '', inStock: true },
  ]
  it('finds product by slug', () => expect(getProductBySlug('test-product', products)?.id).toBe('1'))
  it('returns undefined for missing slug', () => expect(getProductBySlug('nope', products)).toBeUndefined())
})
```

- [ ] **Step 2: Run tests — expect FAIL**

```bash
npx jest __tests__/utils.test.ts
```

Expected: `Cannot find module '@/lib/utils'`

- [ ] **Step 3: Create types**

Create `lib/types.ts`:

```typescript
export interface Product {
  id: string
  name: string
  slug: string
  price: number        // in cents, e.g. 17000 = €170.00
  originalPrice: number | null  // null if not on sale
  category: 'Monta Inglese' | 'Monta Western' | 'Scuderia' | 'Cavaliere'
  brand: string
  images: string[]     // URLs
  description: string
  specs: string
  inStock: boolean
}

export interface Category {
  id: string
  name: string
  slug: string
  image: string
  description: string
}

export interface Brand {
  id: string
  name: string
  logo: string
}

export interface CartItem {
  product: Product
  quantity: number
  variant?: string
}
```

- [ ] **Step 4: Create utils**

Create `lib/utils.ts`:

```typescript
import type { Product } from './types'

export function formatPrice(cents: number): string {
  return '€' + (cents / 100).toFixed(2).replace('.', ',')
}

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

export function getProductBySlug(slug: string, products: Product[]): Product | undefined {
  return products.find(p => p.slug === slug)
}
```

- [ ] **Step 5: Run tests — expect PASS**

```bash
npx jest __tests__/utils.test.ts
```

Expected: 7 tests passing.

- [ ] **Step 6: Create products.json**

Create `data/products.json`:

```json
[
  {
    "id": "1",
    "name": "Equestro Cap Apocalypse",
    "slug": "equestro-cap-apocalypse",
    "price": 17000,
    "originalPrice": 18900,
    "category": "Monta Inglese",
    "brand": "Equestro",
    "images": [
      "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=800&q=80",
      "https://picsum.photos/seed/helmet1/800/600",
      "https://picsum.photos/seed/helmet2/800/600"
    ],
    "description": "Casco omologato EN 1384-2023 con calotta rivestita in tessuto tecnico. Ventilazione ottimale e comfort superiore per ogni disciplina.",
    "specs": "Omologazione: EN 1384-2023 | Materiale: ABS + EPS | Taglie: XS-XL",
    "inStock": true
  },
  {
    "id": "2",
    "name": "Equestro Leggings Full Grip Donna",
    "slug": "equestro-leggings-full-grip-donna",
    "price": 8900,
    "originalPrice": null,
    "category": "Monta Inglese",
    "brand": "Equestro",
    "images": [
      "https://picsum.photos/seed/leggings1/800/600",
      "https://picsum.photos/seed/leggings2/800/600"
    ],
    "description": "Leggings tecnici con grip totale in silicone. Comfort e aderenza perfetta per ore in sella.",
    "specs": "Materiale: 78% Poliestere 22% Elastan | Taglie: XS S M L XL XXL | Colori: Nero, Blu Navy",
    "inStock": true
  },
  {
    "id": "3",
    "name": "Giacca da Concorso Equestro Classic",
    "slug": "giacca-da-concorso-equestro-classic",
    "price": 28500,
    "originalPrice": null,
    "category": "Monta Inglese",
    "brand": "Equestro",
    "images": [
      "https://picsum.photos/seed/jacket1/800/600"
    ],
    "description": "Giacca da concorso regolamentare in tessuto stretch. Taglio sartoriale con venting posteriore.",
    "specs": "Materiale: 95% Poliestere 5% Elastan | Taglie: 38-52 | Colori: Nero, Blu",
    "inStock": true
  },
  {
    "id": "4",
    "name": "Stivali da Equitazione Franceschini",
    "slug": "stivali-da-equitazione-franceschini",
    "price": 42000,
    "originalPrice": 52000,
    "category": "Monta Inglese",
    "brand": "Franceschini",
    "images": [
      "https://picsum.photos/seed/boots1/800/600",
      "https://picsum.photos/seed/boots2/800/600"
    ],
    "description": "Stivali in vera pelle con zip laterale e suola in cuoio. Artigianato italiano dal 1952.",
    "specs": "Materiale: Pelle bovina | Tacco: 3cm | Taglie: 35-46 | Altezza gambale: 42cm",
    "inStock": true
  },
  {
    "id": "5",
    "name": "Guanti Equitazione Antigrip",
    "slug": "guanti-equitazione-antigrip",
    "price": 2490,
    "originalPrice": null,
    "category": "Monta Inglese",
    "brand": "Acavallo",
    "images": [
      "https://picsum.photos/seed/gloves1/800/600"
    ],
    "description": "Guanti tecnici con grip in silicone sul palmo. Traspiranti e lavabili.",
    "specs": "Materiale: Microfibra + silicone | Taglie: XS S M L XL",
    "inStock": true
  },
  {
    "id": "6",
    "name": "Redini in Gomma Supreme",
    "slug": "redini-in-gomma-supreme",
    "price": 2400,
    "originalPrice": 2590,
    "category": "Monta Inglese",
    "brand": "Acavallo",
    "images": [
      "https://picsum.photos/seed/reins1/800/600"
    ],
    "description": "Redini con rivestimento in gomma per presa sicura in ogni condizione atmosferica.",
    "specs": "Lunghezza: 150cm | Larghezza: 16mm | Colori: Nero, Marrone",
    "inStock": true
  },
  {
    "id": "7",
    "name": "Cappello Western Resistol",
    "slug": "cappello-western-resistol",
    "price": 9500,
    "originalPrice": null,
    "category": "Monta Western",
    "brand": "Acavallo",
    "images": [
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80",
      "https://picsum.photos/seed/hat1/800/600"
    ],
    "description": "Cappello western in feltro premium con fascia in pelle intrecciata.",
    "specs": "Materiale: Feltro 100% lana | Taglie: S M L XL | Colori: Marrone, Nero, Sabbia",
    "inStock": true
  },
  {
    "id": "8",
    "name": "Camicia Western Ricamata",
    "slug": "camicia-western-ricamata",
    "price": 6900,
    "originalPrice": null,
    "category": "Monta Western",
    "brand": "Acavallo",
    "images": [
      "https://picsum.photos/seed/shirt1/800/600"
    ],
    "description": "Camicia in cotone stretch con ricami western sul petto. Bottoni a pressione.",
    "specs": "Materiale: 98% Cotone 2% Elastan | Taglie: XS-XXL | Colori: Blu, Rosso, Verde",
    "inStock": true
  },
  {
    "id": "9",
    "name": "Stivali Western Punta Quadra",
    "slug": "stivali-western-punta-quadra",
    "price": 31000,
    "originalPrice": null,
    "category": "Monta Western",
    "brand": "Franceschini",
    "images": [
      "https://picsum.photos/seed/cowboy1/800/600"
    ],
    "description": "Stivali western in pelle con punta quadra e gambale decorato. Suola in cuoio con tacco western.",
    "specs": "Materiale: Pelle bovina | Tacco: 4cm western | Taglie: 36-46",
    "inStock": true
  },
  {
    "id": "10",
    "name": "Cintura Western Intrecciata",
    "slug": "cintura-western-intrecciata",
    "price": 3500,
    "originalPrice": null,
    "category": "Monta Western",
    "brand": "Acavallo",
    "images": [
      "https://picsum.photos/seed/belt1/800/600"
    ],
    "description": "Cintura in pelle intrecciata con fibbia in metallo argentato.",
    "specs": "Materiale: Pelle | Larghezza: 4cm | Taglie: S M L XL XXL",
    "inStock": true
  },
  {
    "id": "11",
    "name": "Speroni Western Jingle Bob",
    "slug": "speroni-western-jingle-bob",
    "price": 2800,
    "originalPrice": null,
    "category": "Monta Western",
    "brand": "Acavallo",
    "images": [
      "https://picsum.photos/seed/spurs1/800/600"
    ],
    "description": "Speroni in acciaio inox stile jingle bob. Rotella da 20mm.",
    "specs": "Materiale: Acciaio inox | Rotella: 20mm | Taglie: S M L",
    "inStock": true
  },
  {
    "id": "12",
    "name": "Corda da Lavoro Lunge Line",
    "slug": "corda-da-lavoro-lunge-line",
    "price": 1890,
    "originalPrice": null,
    "category": "Monta Western",
    "brand": "Acavallo",
    "images": [
      "https://picsum.photos/seed/rope1/800/600"
    ],
    "description": "Corda da lavoro in nylon con moschettone girevole. Lunghezza 8 metri.",
    "specs": "Materiale: Nylon | Lunghezza: 8m | Colori: Rosso, Blu, Verde",
    "inStock": true
  },
  {
    "id": "13",
    "name": "Abbeveratoio a Pressione Plastica",
    "slug": "abbeveratoio-a-pressione-plastica",
    "price": 3900,
    "originalPrice": 4690,
    "category": "Scuderia",
    "brand": "Acavallo",
    "images": [
      "https://picsum.photos/seed/waterer1/800/600"
    ],
    "description": "Abbeveratoio automatico a pressione in plastica robusta. Facile installazione.",
    "specs": "Materiale: Plastica ABS | Capacità: 3L | Colori: Nero, Bianco",
    "inStock": true
  },
  {
    "id": "14",
    "name": "Asciuga Sudore Curvo Plastica",
    "slug": "asciuga-sudore-curvo-plastica",
    "price": 550,
    "originalPrice": null,
    "category": "Scuderia",
    "brand": "Acavallo",
    "images": [
      "https://picsum.photos/seed/scraper1/800/600"
    ],
    "description": "Asciuga sudore curvo in plastica flessibile. Rimuove acqua e sudore dopo il bagno.",
    "specs": "Materiale: Plastica flessibile | Lunghezza: 65cm | Colori: Rosso, Blu",
    "inStock": true
  },
  {
    "id": "15",
    "name": "Coperta Cavallo Outdoor 300g",
    "slug": "coperta-cavallo-outdoor-300g",
    "price": 8900,
    "originalPrice": null,
    "category": "Scuderia",
    "brand": "Acavallo",
    "images": [
      "https://picsum.photos/seed/blanket1/800/600"
    ],
    "description": "Coperta outdoor impermeabile con imbottitura 300g. Resistente al vento e alla pioggia.",
    "specs": "Impermeabilità: 3000mm | Imbottitura: 300g | Taglie: 105-160cm | Colori: Navy, Verde",
    "inStock": true
  },
  {
    "id": "16",
    "name": "Cavezza Nylon Doppia Regolazione",
    "slug": "cavezza-nylon-doppia-regolazione",
    "price": 700,
    "originalPrice": 750,
    "category": "Scuderia",
    "brand": "Acavallo",
    "images": [
      "https://picsum.photos/seed/halter1/800/600"
    ],
    "description": "Cavezza in nylon con doppia regolazione nasale e nuca. Fibbie in alluminio.",
    "specs": "Materiale: Nylon | Taglie: Pony S M L XL | Colori: Rosso, Blu, Verde, Nero",
    "inStock": true
  },
  {
    "id": "17",
    "name": "Repellente Antimosche Roll-On 100ml",
    "slug": "repellente-antimosche-roll-on-100ml",
    "price": 1499,
    "originalPrice": null,
    "category": "Scuderia",
    "brand": "Acavallo",
    "images": [
      "https://picsum.photos/seed/repellent1/800/600"
    ],
    "description": "Repellente naturale con citronella e neem. Formula delicata per cute sensibile.",
    "specs": "Volume: 100ml | Attivo: 8 ore | Ingredienti: Citronella, Neem, Aloe",
    "inStock": true
  },
  {
    "id": "18",
    "name": "Grasso per Zoccoli al Burro di Karité",
    "slug": "grasso-per-zoccoli-al-burro-di-karite",
    "price": 1750,
    "originalPrice": null,
    "category": "Scuderia",
    "brand": "Acavallo",
    "images": [
      "https://picsum.photos/seed/hoofgrease1/800/600"
    ],
    "description": "Grasso nutriente con burro di karité per zoccoli secchi e fragili. Penetrazione rapida.",
    "specs": "Peso: 500ml | Ingredienti attivi: Karité, Lanolina, Vitamina E",
    "inStock": true
  },
  {
    "id": "19",
    "name": "Occhiali da Sole Equestro Sunniva",
    "slug": "occhiali-da-sole-equestro-sunniva",
    "price": 4500,
    "originalPrice": null,
    "category": "Cavaliere",
    "brand": "Equestro",
    "images": [
      "https://picsum.photos/seed/sunglasses1/800/600"
    ],
    "description": "Occhiali sportivi polarizzati con montatura ultraleggera. Protezione UV400.",
    "specs": "Lenti: Policarbonato polarizzato | UV: 400 | Montatura: Nylon flessibile | Colori: Giallo, Fumé",
    "inStock": true
  },
  {
    "id": "20",
    "name": "Sottosella Gel Anatomico",
    "slug": "sottosella-gel-anatomico",
    "price": 5900,
    "originalPrice": null,
    "category": "Cavaliere",
    "brand": "Acavallo",
    "images": [
      "https://picsum.photos/seed/saddlepad1/800/600"
    ],
    "description": "Sottosella in gel anatomico con copertura in cotone. Ammortizza i colpi e distribuisce il peso.",
    "specs": "Materiale: Gel + cotone | Taglie: Dressage, Jumping, Universal",
    "inStock": true
  },
  {
    "id": "21",
    "name": "Body Protector Level 3 BETA",
    "slug": "body-protector-level-3-beta",
    "price": 12900,
    "originalPrice": null,
    "category": "Cavaliere",
    "brand": "Equestro",
    "images": [
      "https://picsum.photos/seed/protector1/800/600"
    ],
    "description": "Pettorina protettiva certificata BETA 2018 livello 3. Leggera e traspirante.",
    "specs": "Certificazione: BETA 2018 Level 3 | Materiale: EVA foam | Taglie: XS S M L XL XXL",
    "inStock": true
  },
  {
    "id": "22",
    "name": "Guanti Invernali Thermo Grip",
    "slug": "guanti-invernali-thermo-grip",
    "price": 3200,
    "originalPrice": null,
    "category": "Cavaliere",
    "brand": "Acavallo",
    "images": [
      "https://picsum.photos/seed/wintergloves1/800/600"
    ],
    "description": "Guanti invernali con imbottitura termica e grip in silicone. Impermeabili.",
    "specs": "Materiale: Softshell + imbottitura | Temperatura: fino a -10°C | Taglie: XS-XL",
    "inStock": true
  },
  {
    "id": "23",
    "name": "Calzettoni Equestri Tecnici",
    "slug": "calzettoni-equestri-tecnici",
    "price": 1290,
    "originalPrice": null,
    "category": "Cavaliere",
    "brand": "Equestro",
    "images": [
      "https://picsum.photos/seed/socks1/800/600"
    ],
    "description": "Calzettoni tecnici con zona imbottita sul tallone e rinforzo sulla punta.",
    "specs": "Materiale: 75% Cotone 20% Poliammide 5% Elastan | Taglie: 35-38 39-42 43-46",
    "inStock": true
  },
  {
    "id": "24",
    "name": "Paraschiena Dorsale Carbon",
    "slug": "paraschiena-dorsale-carbon",
    "price": 18900,
    "originalPrice": 22000,
    "category": "Cavaliere",
    "brand": "Equestro",
    "images": [
      "https://picsum.photos/seed/backpro1/800/600"
    ],
    "description": "Paraschiena con inserti in fibra di carbonio. Certificato EN 13158:2018 livello 3.",
    "specs": "Certificazione: EN 13158:2018 L3 | Materiale: Carbon fiber + EVA | Taglie: XS-XXL",
    "inStock": true
  }
]
```

- [ ] **Step 7: Create categories.json**

Create `data/categories.json`:

```json
[
  {
    "id": "monta-inglese",
    "name": "Monta Inglese",
    "slug": "monta-inglese",
    "image": "https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=800&q=80",
    "description": "Selle, abbigliamento e accessori per salto ostacoli e dressage"
  },
  {
    "id": "monta-western",
    "name": "Monta Western",
    "slug": "monta-western",
    "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80",
    "description": "Tutto per la monta western: cappelli, stivali, selle e abbigliamento"
  },
  {
    "id": "scuderia",
    "name": "Scuderia",
    "slug": "scuderia",
    "image": "https://images.unsplash.com/photo-1534470397-6cfb73b8d4c5?w=800&q=80",
    "description": "Prodotti per la cura quotidiana del cavallo e della scuderia"
  },
  {
    "id": "cavaliere",
    "name": "Cavaliere",
    "slug": "cavaliere",
    "image": "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=800&q=80",
    "description": "Abbigliamento tecnico e protezioni per il cavaliere"
  }
]
```

- [ ] **Step 8: Create brands.json**

Create `data/brands.json`:

```json
[
  { "id": "acavallo", "name": "Acavallo", "logo": "https://picsum.photos/seed/acavallo/200/80" },
  { "id": "equestro", "name": "Equestro", "logo": "https://picsum.photos/seed/equestro/200/80" },
  { "id": "franceschini", "name": "Franceschini Stivali", "logo": "https://picsum.photos/seed/franceschini/200/80" },
  { "id": "acme", "name": "ACME", "logo": "https://picsum.photos/seed/acme/200/80" },
  { "id": "kerbl", "name": "Kerbl", "logo": "https://picsum.photos/seed/kerbl/200/80" },
  { "id": "waldhausen", "name": "Waldhausen", "logo": "https://picsum.photos/seed/waldhausen/200/80" }
]
```

- [ ] **Step 9: Commit**

```bash
git add .
git commit -m "feat: add types, utils, and static data layer"
```

---

### Task 3: Zustand Cart Store

**Files:**
- Create: `lib/store.ts`
- Create: `__tests__/store.test.ts`

**Produces:**
- `useCartStore()` hook with: `items: CartItem[]`, `addItem(product, quantity, variant?)`, `removeItem(productId)`, `updateQuantity(productId, quantity)`, `clearCart()`, `totalItems: number`, `totalPrice: number`

- [ ] **Step 1: Write failing tests**

Create `__tests__/store.test.ts`:

```typescript
import { act, renderHook } from '@testing-library/react'
import { useCartStore } from '@/lib/store'
import type { Product } from '@/lib/types'

const mockProduct: Product = {
  id: '1', name: 'Test', slug: 'test', price: 5000, originalPrice: null,
  category: 'Monta Inglese', brand: 'Test', images: [], description: '', specs: '', inStock: true,
}

beforeEach(() => {
  const { result } = renderHook(() => useCartStore())
  act(() => result.current.clearCart())
})

describe('addItem', () => {
  it('adds new item', () => {
    const { result } = renderHook(() => useCartStore())
    act(() => result.current.addItem(mockProduct, 1))
    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].quantity).toBe(1)
  })
  it('increments existing item quantity', () => {
    const { result } = renderHook(() => useCartStore())
    act(() => result.current.addItem(mockProduct, 1))
    act(() => result.current.addItem(mockProduct, 2))
    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].quantity).toBe(3)
  })
})

describe('removeItem', () => {
  it('removes item by product id', () => {
    const { result } = renderHook(() => useCartStore())
    act(() => result.current.addItem(mockProduct, 1))
    act(() => result.current.removeItem('1'))
    expect(result.current.items).toHaveLength(0)
  })
})

describe('updateQuantity', () => {
  it('updates quantity', () => {
    const { result } = renderHook(() => useCartStore())
    act(() => result.current.addItem(mockProduct, 1))
    act(() => result.current.updateQuantity('1', 5))
    expect(result.current.items[0].quantity).toBe(5)
  })
})

describe('computed values', () => {
  it('totalItems counts all quantities', () => {
    const { result } = renderHook(() => useCartStore())
    act(() => result.current.addItem(mockProduct, 3))
    expect(result.current.totalItems).toBe(3)
  })
  it('totalPrice sums prices in cents', () => {
    const { result } = renderHook(() => useCartStore())
    act(() => result.current.addItem(mockProduct, 2))
    expect(result.current.totalPrice).toBe(10000)
  })
})
```

- [ ] **Step 2: Run tests — expect FAIL**

```bash
npx jest __tests__/store.test.ts
```

Expected: `Cannot find module '@/lib/store'`

- [ ] **Step 3: Implement store**

Create `lib/store.ts`:

```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem, Product } from './types'

interface CartStore {
  items: CartItem[]
  addItem: (product: Product, quantity: number, variant?: string) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, quantity, variant) => {
        const existing = get().items.find(i => i.product.id === product.id)
        if (existing) {
          set(s => ({
            items: s.items.map(i =>
              i.product.id === product.id ? { ...i, quantity: i.quantity + quantity } : i
            ),
          }))
        } else {
          set(s => ({ items: [...s.items, { product, quantity, variant }] }))
        }
      },
      removeItem: (productId) =>
        set(s => ({ items: s.items.filter(i => i.product.id !== productId) })),
      updateQuantity: (productId, quantity) =>
        set(s => ({
          items: s.items.map(i => i.product.id === productId ? { ...i, quantity } : i),
        })),
      clearCart: () => set({ items: [] }),
      get totalItems() { return get().items.reduce((sum, i) => sum + i.quantity, 0) },
      get totalPrice() { return get().items.reduce((sum, i) => sum + i.product.price * i.quantity, 0) },
    }),
    { name: 'selleria-galazzo-cart' }
  )
)
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
npx jest __tests__/store.test.ts
```

Expected: 7 tests passing.

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: Zustand cart store with persist middleware"
```

---

### Task 4: Layout Components

**Files:**
- Create: `components/layout/AnnouncementBar.tsx`
- Create: `components/layout/Navbar.tsx`
- Create: `components/layout/Footer.tsx`
- Modify: `app/layout.tsx`

**Interfaces:**
- `AnnouncementBar` — no props
- `Navbar` — no props, reads `useCartStore().totalItems`
- `Footer` — no props

- [ ] **Step 1: Create AnnouncementBar**

Create `components/layout/AnnouncementBar.tsx`:

```typescript
'use client'
export default function AnnouncementBar() {
  const items = [
    '🚚 Spedizione gratuita su ordini superiori a €80',
    '↩️ Reso garantito al 100%',
    '🕐 Supporto clienti 24/7',
    '⭐ Oltre 10.000 cavalieri soddisfatti',
  ]
  const repeated = [...items, ...items]
  return (
    <div className="bg-black text-white text-xs py-2 overflow-hidden">
      <div className="flex whitespace-nowrap marquee">
        {repeated.map((item, i) => (
          <span key={i} className="mx-8">{item}</span>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create Navbar**

Create `components/layout/Navbar.tsx`:

```typescript
'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ShoppingCart, Heart, Search, Menu, X } from 'lucide-react'
import { useCartStore } from '@/lib/store'

const categories = [
  { name: 'Monta Inglese', slug: 'monta-inglese' },
  { name: 'Monta Western', slug: 'monta-western' },
  { name: 'Scuderia', slug: 'scuderia' },
  { name: 'Cavaliere', slug: 'cavaliere' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const totalItems = useCartStore(s => s.totalItems)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav className={`fixed top-8 left-0 right-0 z-40 transition-all duration-300 ${
      scrolled ? 'bg-white shadow-md' : 'bg-white/95 backdrop-blur-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <span className="text-2xl font-black text-black tracking-tight">
              Selleria<span className="text-red">Galazzo</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {categories.map(cat => (
              <Link
                key={cat.slug}
                href={`/shop?category=${cat.slug}`}
                className="text-sm font-medium text-black hover:text-red transition-colors"
              >
                {cat.name}
              </Link>
            ))}
          </div>

          {/* Icons */}
          <div className="flex items-center gap-4">
            <button className="p-2 hover:text-red transition-colors">
              <Search size={20} />
            </button>
            <button className="p-2 hover:text-red transition-colors">
              <Heart size={20} />
            </button>
            <Link href="/cart" className="relative p-2 hover:text-red transition-colors">
              <ShoppingCart size={20} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {totalItems}
                </span>
              )}
            </Link>
            <button
              className="md:hidden p-2"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-100 py-4">
            {categories.map(cat => (
              <Link
                key={cat.slug}
                href={`/shop?category=${cat.slug}`}
                className="block py-3 text-sm font-medium text-black hover:text-red"
                onClick={() => setMobileOpen(false)}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  )
}
```

- [ ] **Step 3: Create Footer**

Create `components/layout/Footer.tsx`:

```typescript
import Link from 'next/link'
import { Instagram, Facebook, Mail } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-black text-white mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="text-2xl font-black mb-3">
              Selleria<span className="text-red">Galazzo</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Selleria online specializzata in articoli per equitazione e abbigliamento tecnico per cavallo e cavaliere.
            </p>
            <div className="flex gap-4 mt-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors"><Instagram size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors"><Facebook size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors"><Mail size={20} /></a>
            </div>
          </div>
          {/* Shop */}
          <div>
            <h4 className="font-bold mb-4 text-sand">Shop</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              {['Monta Inglese', 'Monta Western', 'Scuderia', 'Cavaliere', 'Offerte'].map(l => (
                <li key={l}><Link href="/shop" className="hover:text-white transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div>
          {/* Customer service */}
          <div>
            <h4 className="font-bold mb-4 text-sand">Assistenza</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              {['Contattaci', 'Spedizioni', 'Resi e rimborsi', 'FAQ', 'Guida alle taglie'].map(l => (
                <li key={l}><a href="#" className="hover:text-white transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>
          {/* Newsletter */}
          <div>
            <h4 className="font-bold mb-4 text-sand">Newsletter</h4>
            <p className="text-sm text-gray-400 mb-4">Novità, offerte esclusive e consigli per cavalieri.</p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="La tua email"
                className="flex-1 bg-white/10 border border-white/20 rounded-full px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-sand"
              />
              <button className="bg-red text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-red-dark transition-colors">
                OK
              </button>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <p>© 2026 Selleria Galazzo di Biag Galazzo. Tutti i diritti riservati.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
            <a href="#" className="hover:text-white transition-colors">P.IVA 00000000000</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
```

- [ ] **Step 4: Update root layout**

Replace `app/layout.tsx`:

```typescript
import type { Metadata } from 'next'
import './globals.css'
import AnnouncementBar from '@/components/layout/AnnouncementBar'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'Selleria Galazzo — Articoli Equestri Online',
  description: 'Selleria online specializzata in articoli per equitazione, monta inglese, western e prodotti per la scuderia.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body>
        <div className="fixed top-0 left-0 right-0 z-50">
          <AnnouncementBar />
          <Navbar />
        </div>
        <main className="pt-24">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
```

- [ ] **Step 5: Verify in browser**

```bash
npm run dev
```

Open `http://localhost:3000` — check: announcement bar scrolls, navbar visible, footer renders.

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "feat: layout components — AnnouncementBar, Navbar, Footer"
```

---

### Task 5: Home Page

**Files:**
- Create: `components/home/HeroSection.tsx`
- Create: `components/home/CategoryGrid.tsx`
- Create: `components/home/NewArrivalsCarousel.tsx`
- Create: `components/home/TrustSection.tsx`
- Create: `components/home/BrandCarousel.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Create HeroSection**

Create `components/home/HeroSection.tsx`:

```typescript
'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'

export default function HeroSection() {
  return (
    <section className="min-h-[90vh] flex items-center bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            <p className="text-sand font-semibold tracking-widest uppercase text-sm mb-4">
              Dal 1985 · Selleria Italiana
            </p>
            <h1 className="text-5xl lg:text-7xl font-black text-black leading-tight mb-6">
              Equipaggiati per{' '}
              <em className="font-serif text-red not-italic">vincere</em>
            </h1>
            <p className="text-gray-500 text-lg leading-relaxed mb-8 max-w-md">
              Prodotti selezionati per monta inglese, western e scuderia. Qualità professionale per ogni cavaliere.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/shop"
                className="bg-red text-white px-8 py-4 rounded-full font-semibold text-sm hover:bg-red-dark transition-colors"
              >
                Scopri il Shop
              </Link>
              <Link
                href="/shop?sort=newest"
                className="border-2 border-black text-black px-8 py-4 rounded-full font-semibold text-sm hover:bg-black hover:text-white transition-colors"
              >
                Le Novità
              </Link>
            </div>
            <div className="flex gap-8 mt-12 text-sm">
              <div>
                <div className="font-black text-2xl">10k+</div>
                <div className="text-gray-400">Cavalieri</div>
              </div>
              <div>
                <div className="font-black text-2xl">200+</div>
                <div className="text-gray-400">Brand selezionati</div>
              </div>
              <div>
                <div className="font-black text-2xl">40+</div>
                <div className="text-gray-400">Anni di esperienza</div>
              </div>
            </div>
          </motion.div>
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
            className="relative h-[500px] lg:h-[650px] rounded-3xl overflow-hidden"
          >
            <Image
              src="https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=1200&q=85"
              alt="Cavaliere in azione"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Create CategoryGrid**

Create `components/home/CategoryGrid.tsx`:

```typescript
'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import categories from '@/data/categories.json'

export default function CategoryGrid() {
  return (
    <section className="py-20 bg-gray-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-black text-black">
            Scegli la tua <em className="font-serif text-red not-italic">disciplina</em>
          </h2>
        </motion.div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Link
                href={`/shop?category=${cat.slug}`}
                className="group relative block aspect-[3/4] rounded-2xl overflow-hidden border-2 border-transparent hover:border-sand transition-all duration-300"
              >
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <h3 className="text-white text-xl font-black">{cat.name}</h3>
                  <p className="text-white/70 text-xs mt-1 hidden group-hover:block transition-all">
                    {cat.description}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Create ProductCard (shared)**

Create `components/shop/ProductCard.tsx`:

```typescript
'use client'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Heart, ShoppingCart } from 'lucide-react'
import { useCartStore } from '@/lib/store'
import { formatPrice } from '@/lib/utils'
import type { Product } from '@/lib/types'

interface ProductCardProps { product: Product }

export default function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore(s => s.addItem)
  const discountPct = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      <Link href={`/shop/${product.slug}`} className="block relative aspect-square overflow-hidden bg-gray-light">
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {discountPct && (
          <span className="absolute top-3 left-3 bg-red text-white text-xs font-bold px-2 py-1 rounded-full">
            -{discountPct}%
          </span>
        )}
        <button className="absolute top-3 right-3 p-2 bg-white/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:text-red">
          <Heart size={16} />
        </button>
        {/* Quick add */}
        <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button
            onClick={e => { e.preventDefault(); addItem(product, 1) }}
            className="w-full bg-red text-white py-3 text-sm font-semibold flex items-center justify-center gap-2 hover:bg-red-dark transition-colors"
          >
            <ShoppingCart size={16} />
            Aggiungi al carrello
          </button>
        </div>
      </Link>
      <div className="p-4">
        <p className="text-xs text-sand font-semibold uppercase tracking-wide mb-1">{product.category}</p>
        <h3 className="font-semibold text-sm text-black leading-tight mb-2 line-clamp-2">{product.name}</h3>
        <div className="flex items-baseline gap-2">
          <span className="font-black text-black">{formatPrice(product.price)}</span>
          {product.originalPrice && (
            <span className="text-gray-400 text-sm line-through">{formatPrice(product.originalPrice)}</span>
          )}
        </div>
      </div>
    </motion.div>
  )
}
```

- [ ] **Step 4: Create NewArrivalsCarousel**

Create `components/home/NewArrivalsCarousel.tsx`:

```typescript
import ProductCard from '@/components/shop/ProductCard'
import products from '@/data/products.json'
import type { Product } from '@/lib/types'

export default function NewArrivalsCarousel() {
  const recent = (products as Product[]).slice(0, 8)
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10">
          <h2 className="text-4xl font-black">
            Gli ultimi <em className="font-serif text-red not-italic">arrivati</em>
          </h2>
          <a href="/shop" className="text-sm font-semibold text-red underline underline-offset-4 hover:text-red-dark">
            Vedi tutti →
          </a>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {recent.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 5: Create TrustSection**

Create `components/home/TrustSection.tsx`:

```typescript
import { Truck, ShieldCheck, Headphones } from 'lucide-react'

const trusts = [
  { icon: Truck, title: 'Spedizione Gratuita', desc: 'Su tutti gli ordini superiori a €80. Consegna in 3-5 giorni lavorativi.' },
  { icon: ShieldCheck, title: 'Soddisfatti o Rimborsati', desc: 'Garanzia di rimborso al 100% entro 30 giorni dall\'acquisto.' },
  { icon: Headphones, title: 'Supporto 24/7', desc: 'Il nostro team è sempre disponibile per aiutarti nella scelta.' },
]

export default function TrustSection() {
  return (
    <section className="py-20 bg-red-dark text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {trusts.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex flex-col items-center text-center gap-4">
              <div className="w-14 h-14 rounded-full border-2 border-sand flex items-center justify-center">
                <Icon size={24} className="text-sand" />
              </div>
              <h3 className="text-xl font-black">{title}</h3>
              <p className="text-white/70 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 6: Create BrandCarousel**

Create `components/home/BrandCarousel.tsx`:

```typescript
import brands from '@/data/brands.json'

export default function BrandCarousel() {
  const doubled = [...brands, ...brands]
  return (
    <section className="py-16 bg-gray-light overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 mb-8 text-center">
        <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">I brand selezionati per voi</h3>
      </div>
      <div className="flex whitespace-nowrap marquee">
        {doubled.map((brand, i) => (
          <div key={i} className="inline-flex items-center justify-center mx-12 opacity-50 hover:opacity-100 transition-opacity">
            <span className="text-xl font-black text-black">{brand.name}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 7: Update home page**

Replace `app/page.tsx`:

```typescript
import HeroSection from '@/components/home/HeroSection'
import CategoryGrid from '@/components/home/CategoryGrid'
import NewArrivalsCarousel from '@/components/home/NewArrivalsCarousel'
import TrustSection from '@/components/home/TrustSection'
import BrandCarousel from '@/components/home/BrandCarousel'

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <CategoryGrid />
      <NewArrivalsCarousel />
      <TrustSection />
      <BrandCarousel />
    </>
  )
}
```

- [ ] **Step 8: Configure next.config for external images**

Replace `next.config.ts`:

```typescript
import type { NextConfig } from 'next'
const config: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'picsum.photos' },
    ],
  },
}
export default config
```

- [ ] **Step 9: Verify home page in browser**

```bash
npm run dev
```

Check: hero renders, category grid 2x2, new arrivals 8 cards, dark trust section, brand marquee.

- [ ] **Step 10: Commit**

```bash
git add .
git commit -m "feat: home page — hero, categories, new arrivals, trust section, brands"
```

---

### Task 6: Shop Page

**Files:**
- Create: `components/shop/FilterSidebar.tsx`
- Create: `components/shop/SortDropdown.tsx`
- Create: `app/shop/page.tsx`

- [ ] **Step 1: Create FilterSidebar**

Create `components/shop/FilterSidebar.tsx`:

```typescript
'use client'
import { useState } from 'react'

const CATEGORIES = ['Monta Inglese', 'Monta Western', 'Scuderia', 'Cavaliere']
const BRANDS = ['Acavallo', 'Equestro', 'Franceschini', 'ACME', 'Kerbl']

interface FilterSidebarProps {
  selectedCategory: string
  onCategoryChange: (c: string) => void
  priceRange: [number, number]
  onPriceChange: (r: [number, number]) => void
}

export default function FilterSidebar({ selectedCategory, onCategoryChange, priceRange, onPriceChange }: FilterSidebarProps) {
  return (
    <aside className="w-full lg:w-64 shrink-0">
      <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-28">
        <h3 className="font-black text-lg mb-6">Filtri</h3>

        {/* Category */}
        <div className="mb-8">
          <h4 className="font-semibold text-sm uppercase tracking-wide text-gray-400 mb-3">Categoria</h4>
          <div className="space-y-2">
            <button
              onClick={() => onCategoryChange('')}
              className={`block w-full text-left text-sm py-1 px-2 rounded-lg transition-colors ${
                selectedCategory === '' ? 'bg-red text-white font-semibold' : 'hover:bg-gray-light'
              }`}
            >
              Tutte le categorie
            </button>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => onCategoryChange(cat)}
                className={`block w-full text-left text-sm py-1 px-2 rounded-lg transition-colors ${
                  selectedCategory === cat ? 'bg-red text-white font-semibold' : 'hover:bg-gray-light'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Price range */}
        <div className="mb-8">
          <h4 className="font-semibold text-sm uppercase tracking-wide text-gray-400 mb-3">
            Prezzo: €{(priceRange[0]/100).toFixed(0)} – €{(priceRange[1]/100).toFixed(0)}
          </h4>
          <input
            type="range"
            min={0}
            max={50000}
            step={500}
            value={priceRange[1]}
            onChange={e => onPriceChange([priceRange[0], Number(e.target.value)])}
            className="w-full accent-red"
          />
        </div>
      </div>
    </aside>
  )
}
```

- [ ] **Step 2: Create SortDropdown**

Create `components/shop/SortDropdown.tsx`:

```typescript
'use client'

interface SortDropdownProps {
  value: string
  onChange: (v: string) => void
}

export default function SortDropdown({ value, onChange }: SortDropdownProps) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="border border-gray-200 rounded-full px-4 py-2 text-sm font-medium bg-white focus:outline-none focus:border-sand"
    >
      <option value="newest">Più recenti</option>
      <option value="price-asc">Prezzo crescente</option>
      <option value="price-desc">Prezzo decrescente</option>
      <option value="sale">In offerta</option>
    </select>
  )
}
```

- [ ] **Step 3: Create shop page**

Create `app/shop/page.tsx`:

```typescript
'use client'
import { useState, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import ProductCard from '@/components/shop/ProductCard'
import FilterSidebar from '@/components/shop/FilterSidebar'
import SortDropdown from '@/components/shop/SortDropdown'
import allProducts from '@/data/products.json'
import type { Product } from '@/lib/types'

export default function ShopPage() {
  const searchParams = useSearchParams()
  const initialCat = searchParams.get('category')
    ? (allProducts as Product[]).find(p => p.category.toLowerCase().replace(/ /g, '-') === searchParams.get('category'))?.category ?? ''
    : ''

  const [selectedCategory, setSelectedCategory] = useState(initialCat)
  const [sort, setSort] = useState('newest')
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000])

  const filtered = useMemo(() => {
    let products = allProducts as Product[]
    if (selectedCategory) products = products.filter(p => p.category === selectedCategory)
    products = products.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1])
    if (sort === 'price-asc') products = [...products].sort((a, b) => a.price - b.price)
    if (sort === 'price-desc') products = [...products].sort((a, b) => b.price - a.price)
    if (sort === 'sale') products = products.filter(p => p.originalPrice !== null)
    return products
  }, [selectedCategory, sort, priceRange])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-4xl font-black mb-8">
        {selectedCategory || 'Tutto il'} <em className="font-serif text-red not-italic">Shop</em>
      </h1>
      <div className="flex flex-col lg:flex-row gap-8">
        <FilterSidebar
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          priceRange={priceRange}
          onPriceChange={setPriceRange}
        />
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-gray-400">{filtered.length} prodotti</p>
            <SortDropdown value={sort} onChange={setSort} />
          </div>
          {filtered.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-lg font-semibold">Nessun prodotto trovato</p>
              <button onClick={() => { setSelectedCategory(''); setPriceRange([0, 50000]) }} className="mt-4 text-red underline text-sm">
                Rimuovi i filtri
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Verify shop page**

Open `http://localhost:3000/shop` — filter by category, sort, price range all work.

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: shop page with filter sidebar, sort, product grid"
```

---

### Task 7: Product Detail Page

**Files:**
- Create: `components/product/ProductGallery.tsx`
- Create: `components/product/ProductInfo.tsx`
- Create: `components/product/ProductTabs.tsx`
- Create: `app/shop/[slug]/page.tsx`

- [ ] **Step 1: Create ProductGallery**

Create `components/product/ProductGallery.tsx`:

```typescript
'use client'
import { useState } from 'react'
import Image from 'next/image'

interface ProductGalleryProps { images: string[]; name: string }

export default function ProductGallery({ images, name }: ProductGalleryProps) {
  const [selected, setSelected] = useState(0)
  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-square rounded-3xl overflow-hidden bg-gray-light">
        <Image src={images[selected]} alt={name} fill className="object-cover" />
      </div>
      {images.length > 1 && (
        <div className="flex gap-3">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-colors ${
                selected === i ? 'border-red' : 'border-transparent hover:border-sand'
              }`}
            >
              <Image src={img} alt="" fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Create ProductInfo**

Create `components/product/ProductInfo.tsx`:

```typescript
'use client'
import { useState } from 'react'
import { Heart, Minus, Plus, ShoppingCart } from 'lucide-react'
import { useCartStore } from '@/lib/store'
import { formatPrice } from '@/lib/utils'
import type { Product } from '@/lib/types'

interface ProductInfoProps { product: Product }

export default function ProductInfo({ product }: ProductInfoProps) {
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const addItem = useCartStore(s => s.addItem)

  const discountPct = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null

  const handleAdd = () => {
    addItem(product, qty)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-sand font-bold uppercase text-xs tracking-widest mb-2">{product.category}</p>
        <h1 className="text-3xl lg:text-4xl font-black text-black leading-tight">{product.name}</h1>
        <p className="text-gray-400 text-sm mt-1">{product.brand}</p>
      </div>

      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-black">{formatPrice(product.price)}</span>
        {product.originalPrice && (
          <>
            <span className="text-gray-400 line-through">{formatPrice(product.originalPrice)}</span>
            <span className="bg-red text-white text-xs font-bold px-2 py-0.5 rounded-full">-{discountPct}%</span>
          </>
        )}
      </div>

      {/* Qty */}
      <div>
        <p className="text-sm font-semibold mb-3">Quantità</p>
        <div className="flex items-center gap-4">
          <div className="flex items-center border-2 border-gray-200 rounded-full overflow-hidden">
            <button
              onClick={() => setQty(Math.max(1, qty - 1))}
              className="px-4 py-2 hover:bg-gray-light transition-colors"
            >
              <Minus size={16} />
            </button>
            <span className="px-4 font-bold">{qty}</span>
            <button
              onClick={() => setQty(qty + 1)}
              className="px-4 py-2 hover:bg-gray-light transition-colors"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* CTAs */}
      <div className="flex flex-col gap-3">
        <button
          onClick={handleAdd}
          className={`w-full py-4 rounded-full font-bold flex items-center justify-center gap-2 transition-colors ${
            added ? 'bg-green-600 text-white' : 'bg-red text-white hover:bg-red-dark'
          }`}
        >
          <ShoppingCart size={20} />
          {added ? 'Aggiunto al carrello ✓' : 'Aggiungi al carrello'}
        </button>
        <button className="w-full py-4 rounded-full font-bold border-2 border-black hover:bg-black hover:text-white transition-colors flex items-center justify-center gap-2">
          <Heart size={20} />
          Aggiungi alla wishlist
        </button>
      </div>

      {/* Trust mini */}
      <div className="border-t border-gray-100 pt-4 grid grid-cols-3 gap-2 text-center text-xs text-gray-400">
        <div>🚚 Spedizione gratuita<br/>sopra €80</div>
        <div>↩️ Reso gratuito<br/>30 giorni</div>
        <div>🔒 Pagamento<br/>sicuro</div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create ProductTabs**

Create `components/product/ProductTabs.tsx`:

```typescript
'use client'
import { useState } from 'react'

interface ProductTabsProps { description: string; specs: string }

const TABS = ['Descrizione', 'Specifiche', 'Spedizione & Resi'] as const

export default function ProductTabs({ description, specs }: ProductTabsProps) {
  const [active, setActive] = useState<typeof TABS[number]>('Descrizione')

  const content: Record<typeof TABS[number], React.ReactNode> = {
    'Descrizione': <p className="text-gray-600 leading-relaxed">{description}</p>,
    'Specifiche': (
      <div className="space-y-2">
        {specs.split(' | ').map(spec => {
          const [key, val] = spec.split(': ')
          return (
            <div key={spec} className="flex gap-4 py-2 border-b border-gray-100">
              <span className="font-semibold text-sm w-40 shrink-0">{key}</span>
              <span className="text-sm text-gray-600">{val}</span>
            </div>
          )
        })}
      </div>
    ),
    'Spedizione & Resi': (
      <div className="space-y-4 text-sm text-gray-600">
        <p>🚚 <strong>Spedizione standard:</strong> 3-5 giorni lavorativi. Gratuita sopra €80, altrimenti €5,90.</p>
        <p>⚡ <strong>Spedizione express:</strong> 1-2 giorni lavorativi. €9,90.</p>
        <p>↩️ <strong>Resi:</strong> Gratuiti entro 30 giorni dall'acquisto. Prodotto integro e imballato.</p>
      </div>
    ),
  }

  return (
    <div className="mt-12">
      <div className="flex gap-0 border-b border-gray-200">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActive(tab)}
            className={`px-6 py-3 text-sm font-semibold transition-colors border-b-2 -mb-px ${
              active === tab ? 'border-red text-red' : 'border-transparent text-gray-400 hover:text-black'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="py-6">{content[active]}</div>
    </div>
  )
}
```

- [ ] **Step 4: Create product detail route**

Create `app/shop/[slug]/page.tsx`:

```typescript
import { notFound } from 'next/navigation'
import allProducts from '@/data/products.json'
import type { Product } from '@/lib/types'
import ProductGallery from '@/components/product/ProductGallery'
import ProductInfo from '@/components/product/ProductInfo'
import ProductTabs from '@/components/product/ProductTabs'

interface Props { params: { slug: string } }

export async function generateStaticParams() {
  return (allProducts as Product[]).map(p => ({ slug: p.slug }))
}

export default function ProductPage({ params }: Props) {
  const product = (allProducts as Product[]).find(p => p.slug === params.slug)
  if (!product) notFound()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <ProductGallery images={product.images} name={product.name} />
        <ProductInfo product={product} />
      </div>
      <ProductTabs description={product.description} specs={product.specs} />
    </div>
  )
}
```

- [ ] **Step 5: Verify product page**

Open `http://localhost:3000/shop/equestro-cap-apocalypse` — gallery, info, tabs, add to cart all work.

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "feat: product detail page with gallery, info, tabs, add-to-cart"
```

---

### Task 8: Cart Page

**Files:**
- Create: `components/cart/CartItem.tsx`
- Create: `components/cart/CartSummary.tsx`
- Create: `app/cart/page.tsx`

- [ ] **Step 1: Create CartItem**

Create `components/cart/CartItem.tsx`:

```typescript
'use client'
import Image from 'next/image'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { useCartStore } from '@/lib/store'
import { formatPrice } from '@/lib/utils'
import type { CartItem as CartItemType } from '@/lib/types'

interface CartItemProps { item: CartItemType }

export default function CartItem({ item }: CartItemProps) {
  const { removeItem, updateQuantity } = useCartStore()
  return (
    <div className="flex gap-4 py-5 border-b border-gray-100">
      <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-gray-light shrink-0">
        <Image src={item.product.images[0]} alt={item.product.name} fill className="object-cover" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-sand font-semibold uppercase">{item.product.category}</p>
        <p className="font-bold text-sm leading-tight mt-0.5">{item.product.name}</p>
        <p className="text-gray-400 text-xs mt-0.5">{item.product.brand}</p>
        <div className="flex items-center gap-4 mt-3">
          <div className="flex items-center border border-gray-200 rounded-full overflow-hidden text-sm">
            <button
              onClick={() => item.quantity > 1 ? updateQuantity(item.product.id, item.quantity - 1) : removeItem(item.product.id)}
              className="px-3 py-1 hover:bg-gray-light"
            >
              <Minus size={12} />
            </button>
            <span className="px-3 font-bold">{item.quantity}</span>
            <button
              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
              className="px-3 py-1 hover:bg-gray-light"
            >
              <Plus size={12} />
            </button>
          </div>
          <button
            onClick={() => removeItem(item.product.id)}
            className="text-gray-300 hover:text-red transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      <div className="text-right shrink-0">
        <p className="font-black">{formatPrice(item.product.price * item.quantity)}</p>
        {item.quantity > 1 && (
          <p className="text-xs text-gray-400">{formatPrice(item.product.price)} cad.</p>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create CartSummary**

Create `components/cart/CartSummary.tsx`:

```typescript
'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useCartStore } from '@/lib/store'
import { formatPrice } from '@/lib/utils'

export default function CartSummary() {
  const { totalPrice } = useCartStore()
  const [coupon, setCoupon] = useState('')
  const shipping = totalPrice >= 8000 ? 0 : 590
  const total = totalPrice + shipping

  return (
    <div className="bg-gray-light rounded-2xl p-6 sticky top-28">
      <h3 className="font-black text-lg mb-6">Riepilogo ordine</h3>

      <div className="space-y-3 text-sm mb-6">
        <div className="flex justify-between">
          <span className="text-gray-500">Subtotale</span>
          <span className="font-semibold">{formatPrice(totalPrice)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Spedizione</span>
          <span className={`font-semibold ${shipping === 0 ? 'text-green-600' : ''}`}>
            {shipping === 0 ? 'Gratuita' : formatPrice(shipping)}
          </span>
        </div>
        {shipping > 0 && (
          <p className="text-xs text-gray-400">Aggiungi {formatPrice(8000 - totalPrice)} per la spedizione gratuita</p>
        )}
      </div>

      <div className="flex gap-2 mb-6">
        <input
          value={coupon}
          onChange={e => setCoupon(e.target.value)}
          placeholder="Codice sconto"
          className="flex-1 border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-sand"
        />
        <button className="border border-black px-4 py-2 rounded-full text-sm font-semibold hover:bg-black hover:text-white transition-colors">
          Applica
        </button>
      </div>

      <div className="border-t border-gray-300 pt-4 mb-6">
        <div className="flex justify-between font-black text-lg">
          <span>Totale</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>

      <Link
        href="/checkout"
        className="block w-full bg-red text-white text-center py-4 rounded-full font-bold hover:bg-red-dark transition-colors"
      >
        Procedi al checkout
      </Link>
    </div>
  )
}
```

- [ ] **Step 3: Create cart page**

Create `app/cart/page.tsx`:

```typescript
'use client'
import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'
import { useCartStore } from '@/lib/store'
import CartItem from '@/components/cart/CartItem'
import CartSummary from '@/components/cart/CartSummary'

export default function CartPage() {
  const items = useCartStore(s => s.items)

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <ShoppingBag size={64} className="mx-auto text-gray-200 mb-6" />
        <h1 className="text-3xl font-black mb-3">Il tuo carrello è vuoto</h1>
        <p className="text-gray-400 mb-8">Aggiungi qualcosa di bello per i tuoi cavalli e per te.</p>
        <Link
          href="/shop"
          className="inline-block bg-red text-white px-8 py-4 rounded-full font-bold hover:bg-red-dark transition-colors"
        >
          Vai allo shop
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-4xl font-black mb-10">
        Il tuo <em className="font-serif text-red not-italic">carrello</em>
      </h1>
      <div className="flex flex-col lg:flex-row gap-10">
        <div className="flex-1">
          {items.map(item => <CartItem key={item.product.id} item={item} />)}
        </div>
        <div className="lg:w-80">
          <CartSummary />
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Verify cart**

Add a product from shop, go to `/cart` — item shows, qty works, empty state works.

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: cart page with items, quantity control, summary"
```

---

### Task 9: Checkout + Success Pages

**Files:**
- Create: `components/checkout/CheckoutSteps.tsx`
- Create: `components/checkout/OrderSummary.tsx`
- Create: `app/checkout/page.tsx`
- Create: `app/checkout/success/page.tsx`

- [ ] **Step 1: Create CheckoutSteps**

Create `components/checkout/CheckoutSteps.tsx`:

```typescript
interface CheckoutStepsProps { currentStep: 1 | 2 | 3 }

const STEPS = ['Contatti', 'Spedizione', 'Pagamento'] as const

export default function CheckoutSteps({ currentStep }: CheckoutStepsProps) {
  return (
    <div className="flex items-center gap-0 mb-10">
      {STEPS.map((step, i) => {
        const n = i + 1 as 1 | 2 | 3
        const done = currentStep > n
        const active = currentStep === n
        return (
          <div key={step} className="flex items-center">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                done ? 'bg-green-600 text-white' : active ? 'bg-red text-white' : 'bg-gray-light text-gray-400'
              }`}>
                {done ? '✓' : n}
              </div>
              <span className={`text-sm font-semibold hidden sm:block ${active ? 'text-black' : 'text-gray-400'}`}>
                {step}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`w-12 sm:w-20 h-0.5 mx-3 ${currentStep > n ? 'bg-green-600' : 'bg-gray-200'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 2: Create OrderSummary**

Create `components/checkout/OrderSummary.tsx`:

```typescript
'use client'
import Image from 'next/image'
import { useCartStore } from '@/lib/store'
import { formatPrice } from '@/lib/utils'

export default function OrderSummary() {
  const { items, totalPrice } = useCartStore()
  const shipping = totalPrice >= 8000 ? 0 : 590

  return (
    <div className="bg-gray-light rounded-2xl p-6">
      <h3 className="font-black text-lg mb-4">Il tuo ordine</h3>
      <div className="space-y-3 mb-4">
        {items.map(item => (
          <div key={item.product.id} className="flex gap-3 items-center">
            <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-white shrink-0">
              <Image src={item.product.images[0]} alt={item.product.name} fill className="object-cover" />
              <span className="absolute -top-1 -right-1 bg-gray-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                {item.quantity}
              </span>
            </div>
            <p className="text-xs font-semibold flex-1 line-clamp-2">{item.product.name}</p>
            <p className="text-xs font-black">{formatPrice(item.product.price * item.quantity)}</p>
          </div>
        ))}
      </div>
      <div className="border-t border-gray-300 pt-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">Subtotale</span>
          <span>{formatPrice(totalPrice)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Spedizione</span>
          <span className={shipping === 0 ? 'text-green-600 font-semibold' : ''}>
            {shipping === 0 ? 'Gratuita' : formatPrice(shipping)}
          </span>
        </div>
        <div className="flex justify-between font-black text-base pt-2 border-t border-gray-300">
          <span>Totale</span>
          <span>{formatPrice(totalPrice + shipping)}</span>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create checkout page (3-step)**

Create `app/checkout/page.tsx`:

```typescript
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/lib/store'
import CheckoutSteps from '@/components/checkout/CheckoutSteps'
import OrderSummary from '@/components/checkout/OrderSummary'

type Step = 1 | 2 | 3

export default function CheckoutPage() {
  const [step, setStep] = useState<Step>(1)
  const [form, setForm] = useState({ email: '', nome: '', cognome: '', indirizzo: '', cap: '', citta: '', shipping: 'standard' })
  const router = useRouter()
  const clearCart = useCartStore(s => s.clearCart)

  const updateForm = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }))

  const inputClass = "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-sand transition-colors"

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <CheckoutSteps currentStep={step} />
      <div className="flex flex-col lg:flex-row gap-10">
        {/* Form area */}
        <div className="flex-1">
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-2xl font-black">Contatti e indirizzo</h2>
              <input placeholder="Email *" value={form.email} onChange={e => updateForm('email', e.target.value)} className={inputClass} />
              <div className="grid grid-cols-2 gap-4">
                <input placeholder="Nome *" value={form.nome} onChange={e => updateForm('nome', e.target.value)} className={inputClass} />
                <input placeholder="Cognome *" value={form.cognome} onChange={e => updateForm('cognome', e.target.value)} className={inputClass} />
              </div>
              <input placeholder="Indirizzo *" value={form.indirizzo} onChange={e => updateForm('indirizzo', e.target.value)} className={inputClass} />
              <div className="grid grid-cols-3 gap-4">
                <input placeholder="CAP *" value={form.cap} onChange={e => updateForm('cap', e.target.value)} className={inputClass} />
                <input placeholder="Città *" value={form.citta} onChange={e => updateForm('citta', e.target.value)} className={`${inputClass} col-span-2`} />
              </div>
              <button onClick={() => setStep(2)} className="w-full bg-red text-white py-4 rounded-full font-bold hover:bg-red-dark transition-colors mt-4">
                Continua alla spedizione →
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-2xl font-black">Metodo di spedizione</h2>
              {[
                { id: 'standard', label: 'Standard', desc: '3-5 giorni lavorativi', price: 'Gratuita sopra €80, altrimenti €5,90' },
                { id: 'express', label: 'Express', desc: '1-2 giorni lavorativi', price: '€9,90' },
              ].map(opt => (
                <label
                  key={opt.id}
                  className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                    form.shipping === opt.id ? 'border-red bg-red/5' : 'border-gray-200 hover:border-sand'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="shipping"
                      value={opt.id}
                      checked={form.shipping === opt.id}
                      onChange={() => updateForm('shipping', opt.id)}
                      className="accent-red"
                    />
                    <div>
                      <p className="font-bold text-sm">{opt.label}</p>
                      <p className="text-xs text-gray-400">{opt.desc}</p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold">{opt.price}</p>
                </label>
              ))}
              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(1)} className="flex-1 border-2 border-black py-4 rounded-full font-bold hover:bg-black hover:text-white transition-colors">
                  ← Indietro
                </button>
                <button onClick={() => setStep(3)} className="flex-1 bg-red text-white py-4 rounded-full font-bold hover:bg-red-dark transition-colors">
                  Continua al pagamento →
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <h2 className="text-2xl font-black">Pagamento</h2>
              <div className="bg-gray-light rounded-xl p-4 text-xs text-gray-400 flex items-center gap-2">
                🔒 Connessione sicura — I tuoi dati sono protetti con crittografia SSL
              </div>
              <input placeholder="Numero carta *" className={inputClass} maxLength={19} />
              <div className="grid grid-cols-2 gap-4">
                <input placeholder="Scadenza MM/AA *" className={inputClass} />
                <input placeholder="CVV *" className={inputClass} maxLength={4} />
              </div>
              <input placeholder="Nome sul carta *" className={inputClass} />
              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(2)} className="flex-1 border-2 border-black py-4 rounded-full font-bold hover:bg-black hover:text-white transition-colors">
                  ← Indietro
                </button>
                <button
                  onClick={() => { clearCart(); router.push('/checkout/success') }}
                  className="flex-1 bg-red text-white py-4 rounded-full font-bold hover:bg-red-dark transition-colors"
                >
                  Conferma ordine
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order summary sidebar */}
        <div className="lg:w-80">
          <OrderSummary />
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Create success page**

Create `app/checkout/success/page.tsx`:

```typescript
import Link from 'next/link'
import { CheckCircle } from 'lucide-react'

export default function SuccessPage() {
  return (
    <div className="max-w-lg mx-auto px-4 py-24 text-center">
      <CheckCircle size={72} className="mx-auto text-green-500 mb-6" />
      <h1 className="text-4xl font-black mb-3">Ordine confermato!</h1>
      <p className="text-gray-500 leading-relaxed mb-8">
        Grazie per il tuo acquisto. Riceverai una email di conferma con i dettagli della spedizione entro pochi minuti.
      </p>
      <div className="bg-gray-light rounded-2xl p-6 mb-8 text-left">
        <p className="text-sm font-semibold mb-1">Numero ordine</p>
        <p className="text-2xl font-black text-red">#SG-{Math.floor(Math.random() * 90000) + 10000}</p>
        <p className="text-xs text-gray-400 mt-2">Conserva questo numero per eventuali comunicazioni</p>
      </div>
      <Link
        href="/shop"
        className="inline-block bg-red text-white px-8 py-4 rounded-full font-bold hover:bg-red-dark transition-colors"
      >
        Continua lo shopping
      </Link>
    </div>
  )
}
```

- [ ] **Step 5: Verify full flow**

Go through: add product → cart → checkout steps 1→2→3 → confirm → success page.

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "feat: checkout flow with 3 steps and success page"
```

---

### Task 10: Deploy to Vercel

**Files:**
- No new files — Vercel reads from GitHub

- [ ] **Step 1: Push to GitHub**

```bash
git remote add origin https://github.com/<USERNAME>/selleria-galazzo-mockup.git
git branch -M main
git push -u origin main
```

- [ ] **Step 2: Deploy on Vercel**

1. Go to vercel.com → New Project
2. Import GitHub repo `selleria-galazzo-mockup`
3. Framework: Next.js (auto-detected)
4. Click Deploy

Expected: build succeeds, live URL provided.

- [ ] **Step 3: Smoke test on live URL**

Verify: home page loads, shop filters work, product page renders, cart persists via localStorage, checkout flow completes.

- [ ] **Step 4: Final commit**

```bash
git add .
git commit -m "chore: verify deploy on Vercel"
```

---

## Self-Review

**Spec coverage:**
- ✅ Next.js 14 App Router
- ✅ Tailwind CSS with custom palette
- ✅ Framer Motion animations
- ✅ Zustand cart with persist
- ✅ 5 pages: Home, Shop, Product, Cart, Checkout + Success
- ✅ Announcement bar marquee
- ✅ Sticky navbar with cart count
- ✅ Hero with bold/italic typography mix
- ✅ 2x2 category grid
- ✅ New arrivals carousel/grid
- ✅ Trust section (dark red background)
- ✅ Brand carousel
- ✅ Filter sidebar (category + price)
- ✅ Sort dropdown
- ✅ ProductCard with hover quick-add
- ✅ Product gallery with thumbnails
- ✅ Qty stepper + add to cart
- ✅ Product tabs (Description / Specs / Shipping)
- ✅ Cart with qty control + empty state
- ✅ Cart summary with shipping threshold
- ✅ Checkout 3-step flow
- ✅ Order summary sidebar
- ✅ Success page
- ✅ Vercel deploy
- ✅ 24 products in JSON with real Italian names
- ✅ 4 categories
- ✅ Responsive (mobile hamburger, grid breakpoints)
- ✅ Italian copy throughout

**Types consistent:** `CartItem`, `Product`, `Category`, `Brand` defined in Task 2, used identically throughout.

**No placeholders found.**
