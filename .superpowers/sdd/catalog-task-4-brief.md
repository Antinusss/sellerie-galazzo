### Task 4: Sync script — fetch feed + logo, write real data files

**Files:**
- Create: `scripts/sync-product-feed.ts`
- Modify: `package.json`
- Create (via running the script): `data/products.json`, `data/categories.json`, `data/brands.json`, `public/logo-selleria-galazzo.png`, `app/icon.png`

**Interfaces:**
- Consumes: everything from Task 2 (`lib/feed-transform.ts`) and `slugify` from `lib/utils.ts`
- Produces: the committed `data/*.json` files that every remaining task's components and routes import directly (no interface — just files on disk in the shapes defined by `lib/types.ts`).

- [ ] **Step 1: Add dependencies and the `sync-feed` script to `package.json`**

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "jest",
    "sync-feed": "tsx scripts/sync-product-feed.ts"
  },
  "dependencies": {
    "fast-xml-parser": "^4.5.0",
    "framer-motion": "^12.42.0",
    "lucide-react": "^1.21.0",
    "next": "14.2.35",
    "react": "^18",
    "react-dom": "^18",
    "zustand": "^5.0.14"
  }
}
```

Add `"tsx": "^4.19.0"` to `devDependencies`.

Run: `npm install`
Expected: `fast-xml-parser` and `tsx` appear in `node_modules`, `package-lock.json` updated.

- [ ] **Step 2: Write `scripts/sync-product-feed.ts`**

```ts
import { writeFileSync, mkdirSync } from 'node:fs'
import { XMLParser } from 'fast-xml-parser'
import {
  parsePriceToCents,
  splitDescriptionAndSpecs,
  slugFromLink,
  parseCategoryPath,
  dedupeSlugs,
} from '../lib/feed-transform'
import { slugify } from '../lib/utils'
import type { Product, Category, Brand } from '../lib/types'

const FEED_URL = 'https://selleriagalazzo.com/wp-content/uploads/woo-product-feed-pro/xml/fRYAYy1zVWYyPvFfJ7Sgior0vSkVdGfF.xml'
const LOGO_URL = 'https://selleriagalazzo.com/wp-content/uploads/2024/02/logo-selleria-galazzo-200-b.png'

interface FeedItem {
  'g:id': number | string
  'g:title': string
  'g:description'?: string
  'g:link': string
  'g:image_link': string
  'g:price': string
  'g:availability': string
  'g:product_type': string
  'g:brand'?: string
}

async function main() {
  console.log('Fetching feed...')
  const xml = await (await fetch(FEED_URL)).text()

  const parser = new XMLParser({ ignoreAttributes: true, trimValues: true })
  const parsed = parser.parse(xml)
  const items: FeedItem[] = parsed.rss.channel.item

  const rawProducts: Product[] = items.map(item => {
    const { description, specs } = splitDescriptionAndSpecs(String(item['g:description'] ?? ''))
    const categoryPath = parseCategoryPath(item['g:product_type'])
    return {
      id: String(item['g:id']),
      name: item['g:title'],
      slug: slugFromLink(item['g:link']),
      price: parsePriceToCents(item['g:price']),
      originalPrice: null,
      category: categoryPath[0] ?? '',
      categoryPath,
      brand: item['g:brand'] ?? '',
      images: [item['g:image_link']],
      description,
      specs,
      inStock: item['g:availability'] === 'in_stock',
    }
  })

  const products = dedupeSlugs(rawProducts)

  const nodePaths = new Map<string, string[]>()
  for (const p of products) {
    for (let i = 1; i <= p.categoryPath.length; i++) {
      const path = p.categoryPath.slice(0, i)
      nodePaths.set(path.join(' > '), path)
    }
  }

  const categories: Category[] = [...nodePaths.values()].map(path => ({
    path,
    slug: path.map(slugify),
    name: path[path.length - 1],
    depth: path.length,
    productCount: products.filter(
      p => p.categoryPath.length >= path.length && path.every((seg, i) => p.categoryPath[i] === seg)
    ).length,
  }))

  for (const top of categories.filter(c => c.depth === 1)) {
    const rep = products.find(p => p.categoryPath[0] === top.name && p.images[0])
    if (rep) top.image = rep.images[0]
  }

  const brandCounts = new Map<string, number>()
  for (const p of products) {
    if (!p.brand) continue
    brandCounts.set(p.brand, (brandCounts.get(p.brand) ?? 0) + 1)
  }
  const brands: Brand[] = [...brandCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name, productCount]) => ({ id: slugify(name), name, productCount }))

  mkdirSync('data', { recursive: true })
  writeFileSync('data/products.json', JSON.stringify(products, null, 2))
  writeFileSync('data/categories.json', JSON.stringify(categories, null, 2))
  writeFileSync('data/brands.json', JSON.stringify(brands, null, 2))
  console.log(`Wrote ${products.length} products, ${categories.length} categories, ${brands.length} brands.`)

  console.log('Downloading logo...')
  const logoBuf = Buffer.from(await (await fetch(LOGO_URL)).arrayBuffer())
  mkdirSync('public', { recursive: true })
  writeFileSync('public/logo-selleria-galazzo.png', logoBuf)
  writeFileSync('app/icon.png', logoBuf)
  console.log('Done.')
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
```

- [ ] **Step 3: Run the script against the live feed**

Run: `npm run sync-feed`
Expected: prints `Wrote 3066 products, 123 categories, 62 brands.` then `Done.`; `data/products.json`, `data/categories.json`, `data/brands.json`, `public/logo-selleria-galazzo.png`, `app/icon.png` are created/overwritten.

- [ ] **Step 4: Spot-check the output**

Run:
```bash
node -e "const p = require('./data/products.json'); console.log(p.length, new Set(p.map(x => x.slug)).size)"
node -e "const c = require('./data/categories.json'); console.log(c.length, c.filter(x => x.depth === 1).map(x => x.name))"
```
Expected: first command prints `3066 3066` (all slugs unique after dedup); second prints `123 [ 'Monta Inglese', 'Monta Western', 'Scuderia' ]` (order may vary).

- [ ] **Step 5: Commit**

```bash
git add scripts/sync-product-feed.ts package.json package-lock.json data/products.json data/categories.json data/brands.json public/logo-selleria-galazzo.png app/icon.png
git commit -m "feat: sync real product catalog and logo from the live feed"
```

---

