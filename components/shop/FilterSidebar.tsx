'use client'
import Link from 'next/link'
import categoriesData from '@/data/categories.json'
import type { Category } from '@/lib/types'
import { getChildren } from '@/lib/category-tree'

const categories = categoriesData as Category[]

interface FilterSidebarProps {
  currentPath: string[]
  priceRange: [number, number]
  onPriceChange: (r: [number, number]) => void
}

function CategoryBranch({ node, currentPath }: { node: Category; currentPath: string[] }) {
  const isActive = node.slug.length === currentPath.length && node.slug.every((s, i) => s === currentPath[i])
  const isAncestor = currentPath.length > node.slug.length && node.slug.every((s, i) => s === currentPath[i])
  const children = getChildren(categories, node)
  const expanded = isActive || isAncestor

  return (
    <div>
      <Link
        href={`/shop/${node.slug.join('/')}`}
        className={`flex justify-between items-center text-sm py-1 px-2 rounded-lg transition-colors ${
          isActive ? 'bg-red text-white font-semibold' : 'hover:bg-gray-light'
        }`}
      >
        <span>{node.name}</span>
        <span className={isActive ? 'text-white/70' : 'text-gray-400'}>{node.productCount}</span>
      </Link>
      {expanded && children.length > 0 && (
        <div className="pl-3 mt-1 space-y-1 border-l border-gray-200 ml-2">
          {children.map(child => (
            <CategoryBranch key={child.slug.join('/')} node={child} currentPath={currentPath} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function FilterSidebar({ currentPath, priceRange, onPriceChange }: FilterSidebarProps) {
  const topLevel = getChildren(categories, undefined)

  return (
    <aside className="w-full lg:w-64 shrink-0">
      <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-28">
        <h3 className="font-black text-lg mb-6">Filtri</h3>

        <div className="mb-8">
          <h4 className="font-semibold text-sm uppercase tracking-wide text-gray-400 mb-3">Categoria</h4>
          <div className="space-y-2">
            <Link
              href="/shop"
              className={`block w-full text-left text-sm py-1 px-2 rounded-lg transition-colors ${
                currentPath.length === 0 ? 'bg-red text-white font-semibold' : 'hover:bg-gray-light'
              }`}
            >
              Tutte le categorie
            </Link>
            {topLevel.map(node => (
              <CategoryBranch key={node.slug.join('/')} node={node} currentPath={currentPath} />
            ))}
          </div>
        </div>

        <div className="mb-8">
          <h4 className="font-semibold text-sm uppercase tracking-wide text-gray-400 mb-3">
            Prezzo: €{(priceRange[0] / 100).toFixed(0)} – €{(priceRange[1] / 100).toFixed(0)}
          </h4>
          <input
            type="range"
            min={0}
            max={50000}
            step={500}
            value={priceRange[1]}
            onChange={e => onPriceChange([priceRange[0], Number(e.target.value)])}
            className="w-full accent-red"
          />
        </div>
      </div>
    </aside>
  )
}
