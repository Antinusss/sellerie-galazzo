import {
  findCategoryBySlugPath,
  getChildren,
  getTopLevelCategories,
  productsUnderCategory,
  breadcrumbFor,
  getRelatedProducts,
  findCategoryByPath,
} from '@/lib/category-tree'
import type { Category, Product } from '@/lib/types'

const categories: Category[] = [
  { path: ['Monta Inglese'], slug: ['monta-inglese'], name: 'Monta Inglese', depth: 1, productCount: 3 },
  { path: ['Monta Inglese', 'Cavallo'], slug: ['monta-inglese', 'cavallo'], name: 'Cavallo', depth: 2, productCount: 2 },
  { path: ['Monta Inglese', 'Cavaliere'], slug: ['monta-inglese', 'cavaliere'], name: 'Cavaliere', depth: 2, productCount: 1 },
  { path: ['Scuderia'], slug: ['scuderia'], name: 'Scuderia', depth: 1, productCount: 1 },
]

function product(id: string, categoryPath: string[]): Product {
  return {
    id, name: `P${id}`, slug: `p${id}`, price: 100, originalPrice: null,
    category: categoryPath[0], categoryPath, brand: 'X', images: [],
    description: '', specs: '', inStock: true,
  }
}

const products: Product[] = [
  product('1', ['Monta Inglese', 'Cavallo']),
  product('2', ['Monta Inglese', 'Cavallo']),
  product('3', ['Monta Inglese', 'Cavaliere']),
  product('4', ['Scuderia']),
]

describe('findCategoryBySlugPath', () => {
  it('finds a nested node by its full slug path', () => {
    expect(findCategoryBySlugPath(categories, ['monta-inglese', 'cavallo'])?.name).toBe('Cavallo')
  })
  it('returns undefined for an unknown path', () => {
    expect(findCategoryBySlugPath(categories, ['nope'])).toBeUndefined()
  })
  it('returns undefined for an empty path', () => {
    expect(findCategoryBySlugPath(categories, [])).toBeUndefined()
  })
})

describe('getTopLevelCategories', () => {
  it('returns depth-1 nodes sorted by productCount descending', () => {
    expect(getTopLevelCategories(categories).map(c => c.name)).toEqual(['Monta Inglese', 'Scuderia'])
  })
})

describe('getChildren', () => {
  it('returns direct children of a node, sorted by productCount descending', () => {
    const montaInglese = categories[0]
    expect(getChildren(categories, montaInglese).map(c => c.name)).toEqual(['Cavallo', 'Cavaliere'])
  })
  it('returns [] for a leaf node', () => {
    const cavallo = categories[1]
    expect(getChildren(categories, cavallo)).toEqual([])
  })
})

describe('productsUnderCategory', () => {
  it('returns all products when category is undefined', () => {
    expect(productsUnderCategory(products, undefined)).toHaveLength(4)
  })
  it('returns products under a top-level node, including descendants', () => {
    const montaInglese = categories[0]
    expect(productsUnderCategory(products, montaInglese).map(p => p.id).sort()).toEqual(['1', '2', '3'])
  })
  it('returns only products matching a leaf node exactly', () => {
    const cavallo = categories[1]
    expect(productsUnderCategory(products, cavallo).map(p => p.id).sort()).toEqual(['1', '2'])
  })
})

describe('getRelatedProducts', () => {
  it('prefers same-leaf-category products first, then fills from the same top-level category', () => {
    expect(getRelatedProducts(products[0], products).map(p => p.id)).toEqual(['2', '3'])
  })
  it('stops once same-leaf matches already fill the limit', () => {
    expect(getRelatedProducts(products[0], products, 1).map(p => p.id)).toEqual(['2'])
  })
  it('returns [] when no other product shares the top-level category', () => {
    expect(getRelatedProducts(products[3], products)).toEqual([])
  })
  it('excludes the product itself', () => {
    expect(getRelatedProducts(products[0], products).some(p => p.id === '1')).toBe(false)
  })
})

describe('breadcrumbFor', () => {
  it('joins the path with " / "', () => {
    expect(breadcrumbFor(categories[1])).toBe('Monta Inglese / Cavallo')
  })
  it('returns a fallback label for undefined (root)', () => {
    expect(breadcrumbFor(undefined)).toBe('Tutti i prodotti')
  })
})

describe('findCategoryByPath', () => {
  it('finds a node by its name path (not slug)', () => {
    expect(findCategoryByPath(categories, ['Monta Inglese', 'Cavallo'])?.name).toBe('Cavallo')
  })
  it('returns undefined for an unknown path', () => {
    expect(findCategoryByPath(categories, ['Nope'])).toBeUndefined()
  })
  it('returns undefined for an empty path', () => {
    expect(findCategoryByPath(categories, [])).toBeUndefined()
  })
})
