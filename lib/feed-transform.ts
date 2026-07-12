export function parsePriceToCents(raw: string): number {
  const match = raw.match(/(\d+)\.(\d{2})$/)
  if (!match) throw new Error(`Unrecognized price format: ${raw}`)
  return Number(match[1]) * 100 + Number(match[2])
}

const ENTITY_MAP: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  '#39': "'",
}

export function decodeEntities(text: string): string {
  return text.replace(/&(#?\w+);/g, (match, name) => ENTITY_MAP[name] ?? match)
}

export function stripTags(html: string): string {
  return decodeEntities(html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim())
}

export interface DescriptionParts {
  description: string
  specs: string
}

export function splitDescriptionAndSpecs(html: string): DescriptionParts {
  if (!html) return { description: '', specs: '' }

  const lists = [...html.matchAll(/<(ul|ol)>([\s\S]*?)<\/\1>/g)]
  if (lists.length === 0) {
    return { description: stripTags(html), specs: '' }
  }

  const lastList = lists[lists.length - 1]
  let before = html.slice(0, lastList.index)
  // Remove any formatting/header tags and content that appear right before the list
  before = before.replace(/<(?:em|strong|b|i|span|p)[^>]*>[\s\S]*?<\/(?:em|strong|b|i|span|p)>\s*$/g, '')

  const items = [...lastList[2].matchAll(/<li>([\s\S]*?)<\/li>/g)]
    .map(m => stripTags(m[1]))
    .filter(Boolean)

  return { description: stripTags(before), specs: items.join(' | ') }
}

export function slugFromLink(link: string): string {
  const path = new URL(link).pathname
  const segments = path.split('/').filter(Boolean)
  return segments[segments.length - 1]
}

export function parseCategoryPath(rawProductType: string): string[] {
  return rawProductType
    .split('&gt;')
    .map(s => s.trim())
    .filter(s => s.length > 0 && s !== 'Home')
}

export function dedupeSlugs<T extends { slug: string; id: string }>(items: T[]): T[] {
  const seen = new Set<string>()
  return items.map(item => {
    if (!seen.has(item.slug)) {
      seen.add(item.slug)
      return item
    }
    const uniqueSlug = `${item.slug}-${item.id}`
    seen.add(uniqueSlug)
    return { ...item, slug: uniqueSlug }
  })
}
