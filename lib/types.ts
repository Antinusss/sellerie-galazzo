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
