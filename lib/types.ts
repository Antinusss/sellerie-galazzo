export interface Product {
  id: string
  name: string
  slug: string
  price: number        // in cents, e.g. 17000 = €170.00
  originalPrice: number | null  // null for real feed data; ~1/15 of products get a synthetic value via lib/offers.ts
  category: string      // top-level branch, e.g. "Monta Inglese"
  categoryPath: string[] // full path, e.g. ["Monta Inglese", "Cavaliere", "Donna", "Pantaloni"]
  brand: string          // may be '' — ~6% of feed items have no brand
  images: string[]       // URLs, single element (feed has one image per product)
  description: string
  specs: string           // pipe-joined bullet items, may be ''
  inStock: boolean
}

export interface Category {
  path: string[]    // e.g. ["Monta Inglese", "Cavaliere"]
  slug: string[]    // slugified per segment, e.g. ["monta-inglese", "cavaliere"]
  name: string       // last segment, e.g. "Cavaliere"
  depth: number       // path.length
  productCount: number
  image?: string       // only set on the 3 top-level (depth 1) nodes
}

export interface Brand {
  id: string
  name: string
  productCount: number
  logo?: string
}

export interface CartItem {
  product: Product
  quantity: number
  variant?: string
}
