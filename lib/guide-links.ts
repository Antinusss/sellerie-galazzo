import categoriesData from '@/data/categories.json'
import productsData from '@/data/products.json'
import type { Category, Product } from './types'
import { findCategoryBySlugPath, productsUnderCategory } from './category-tree'

export interface GuideLink {
  label: string
  href: string
  image: string
}

interface RawGuideLink {
  label: string
  href: string
}

const RAW_GUIDE_LINKS: RawGuideLink[] = [
  { label: 'Cura del cavallo', href: '/shop/scuderia/cura-del-cavallo' },
  { label: 'Cura del cuoio', href: '/shop/scuderia/cura-del-cuoio' },
  { label: 'Attrezzatura da scuderia', href: '/shop/scuderia/attrezzatura-da-scuderia' },
  { label: 'Selle e accessori (Inglese)', href: '/shop/monta-inglese/cavallo/selle-e-accessori' },
  { label: 'Coperte', href: '/shop/monta-inglese/cavallo/coperte' },
  { label: 'Protezioni', href: '/shop/monta-inglese/cavallo/protezioni' },
  { label: 'Selle e accessori (Western)', href: '/shop/monta-western/cavallo/selle-e-accessori' },
  { label: 'Briglie e accessori', href: '/shop/monta-inglese/cavallo/briglie-e-accessori' },
]

const categories = categoriesData as Category[]
const products = productsData as Product[]

function imageForHref(href: string): string {
  const slugPath = href.replace('/shop/', '').split('/')
  const category = findCategoryBySlugPath(categories, slugPath)
  const match = productsUnderCategory(products, category).find(p => p.images[0])
  return match?.images[0] ?? ''
}

export const GUIDE_LINKS: GuideLink[] = RAW_GUIDE_LINKS.map(link => ({
  ...link,
  image: imageForHref(link.href),
}))
