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
