import type { Category, Product } from './types'

export function findCategoryBySlugPath(categories: Category[], slugPath: string[]): Category | undefined {
  if (slugPath.length === 0) return undefined
  return categories.find(
    c => c.slug.length === slugPath.length && c.slug.every((s, i) => s === slugPath[i])
  )
}

export function getChildren(categories: Category[], parent: Category | undefined): Category[] {
  const parentDepth = parent ? parent.depth : 0
  const parentSlug = parent ? parent.slug : []
  return categories
    .filter(c => c.depth === parentDepth + 1 && parentSlug.every((s, i) => c.slug[i] === s))
    .sort((a, b) => b.productCount - a.productCount)
}

export function getTopLevelCategories(categories: Category[]): Category[] {
  return getChildren(categories, undefined)
}

export function productsUnderCategory(products: Product[], category: Category | undefined): Product[] {
  if (!category) return products
  return products.filter(
    p => p.categoryPath.length >= category.path.length &&
      category.path.every((seg, i) => p.categoryPath[i] === seg)
  )
}

export function breadcrumbFor(category: Category | undefined): string {
  return category ? category.path.join(' / ') : 'Tutti i prodotti'
}

export function getRelatedProducts(product: Product, allProducts: Product[], limit = 4): Product[] {
  const leafKey = product.categoryPath.join(' > ')
  const sameLeaf = allProducts.filter(
    p => p.id !== product.id && p.categoryPath.join(' > ') === leafKey
  )
  if (sameLeaf.length >= limit) return sameLeaf.slice(0, limit)

  const sameLeafIds = new Set(sameLeaf.map(p => p.id))
  const sameTop = allProducts.filter(
    p => p.id !== product.id && p.category === product.category && !sameLeafIds.has(p.id)
  )
  return [...sameLeaf, ...sameTop].slice(0, limit)
}

export function findCategoryByPath(categories: Category[], path: string[]): Category | undefined {
  if (path.length === 0) return undefined
  return categories.find(
    c => c.path.length === path.length && c.path.every((seg, i) => seg === path[i])
  )
}
