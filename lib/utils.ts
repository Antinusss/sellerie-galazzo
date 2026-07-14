import type { Product } from './types'

export const FREE_SHIPPING_THRESHOLD = 8000

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
