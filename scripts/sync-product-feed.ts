import { writeFileSync, mkdirSync } from 'node:fs'
import { XMLParser } from 'fast-xml-parser'
import {
  parsePriceToCents,
  splitDescriptionAndSpecs,
  slugFromLink,
  parseCategoryPath,
  dedupeSlugs,
} from '../lib/feed-transform'
import { applyOfferPricing } from '../lib/offers'
import { slugify } from '../lib/utils'
import type { Product, Category, Brand } from '../lib/types'

const FEED_URL = 'https://selleriagalazzo.com/wp-content/uploads/woo-product-feed-pro/xml/fRYAYy1zVWYyPvFfJ7Sgior0vSkVdGfF.xml'
const LOGO_URL = 'https://selleriagalazzo.com/wp-content/uploads/2024/02/logo-selleria-galazzo-200-b.png'

// Real brand logos, sourced from selleriagalazzo.com's own homepage "I Brand
// selezionati per voi" carousel. Only these 23 of the 62 real brands have a
// logo asset there; the rest fall back to a styled text badge in the UI.
const BRAND_LOGOS: Record<string, string> = {
  'Equestro': 'https://selleriagalazzo.com/wp-content/uploads/2024/03/Equestro-150x150.jpg',
  'Acavallo': 'https://selleriagalazzo.com/wp-content/uploads/2024/03/acavallo-150x150.png',
  'Franceschini': 'https://selleriagalazzo.com/wp-content/uploads/2024/04/Franceschini-150x150.png',
  'Acme': 'https://selleriagalazzo.com/wp-content/uploads/2024/03/Acme-150x150.png',
  'Effol': 'https://selleriagalazzo.com/wp-content/uploads/2024/03/Effol-150x150.jpeg',
  'Sergio Grasso': 'https://selleriagalazzo.com/wp-content/uploads/2024/04/Sergio-Grasso-150x150.png',
  'LeMieux': 'https://selleriagalazzo.com/wp-content/uploads/2024/04/LeMieux-150x150.png',
  'Tommy Hilfiger': 'https://selleriagalazzo.com/wp-content/uploads/2024/04/Tommy-Hilfiger-150x150.png',
  "Pool's": 'https://selleriagalazzo.com/wp-content/uploads/2024/04/pool-s-150x150.png',
  'Farnam': 'https://selleriagalazzo.com/wp-content/uploads/2024/04/Farnam-150x150.png',
  'Kask': 'https://selleriagalazzo.com/wp-content/uploads/2024/04/Kask-150x150.png',
  'Fiebing’s': 'https://selleriagalazzo.com/wp-content/uploads/2024/04/Fiebing-s-150x150.png',
  'Hawtorne': 'https://selleriagalazzo.com/wp-content/uploads/2024/04/Hawtorne-150x150.png',
  'MASC': 'https://selleriagalazzo.com/wp-content/uploads/2024/07/logo-masc-3-1-1.jpeg',
  'Absorbine': 'https://selleriagalazzo.com/wp-content/uploads/2024/03/Absorbine-150x150.png',
  'Flicka': 'https://selleriagalazzo.com/wp-content/uploads/2024/04/Flicka-150x150.png',
  'Lami-Cell': 'https://selleriagalazzo.com/wp-content/uploads/2024/04/Lami-Cell-150x150.png',
  'Lakota': 'https://selleriagalazzo.com/wp-content/uploads/2024/04/Lakota-150x150.png',
  'McBRYAN': 'https://selleriagalazzo.com/wp-content/uploads/2024/04/McBRYAN-150x150.png',
  'Schutz Brothers': 'https://selleriagalazzo.com/wp-content/uploads/2024/04/Schutz-Brothers-150x150.png',
  'Berlin Custom Leather Ltd': 'https://selleriagalazzo.com/wp-content/uploads/2024/04/Berlin-Custom-Leather-Ltd-150x150.png',
  'Burioni': 'https://selleriagalazzo.com/wp-content/uploads/2026/06/square-image-150x150.jpg',
  'Amahorse': 'https://selleriagalazzo.com/wp-content/uploads/2026/06/square-image-3-150x150.webp',
}

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

  const products = applyOfferPricing(dedupeSlugs(rawProducts))

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
    .map(([name, productCount]) => {
      const logo = BRAND_LOGOS[name]
      return logo ? { id: slugify(name), name, productCount, logo } : { id: slugify(name), name, productCount }
    })

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
