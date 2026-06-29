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

