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
  // Remove a short heading (e.g. "<em><strong>Specifiche tecniche:</strong></em>") immediately
  // before the list. Bounded to tag-free inner text so it can't reach back into an earlier
  // <strong>/<em> run inside the real description and eat everything after it.
  before = before.replace(/(?:<(?:em|strong|b|i|span|p)>)+[^<]{0,200}(?:<\/(?:em|strong|b|i|span|p)>)+\s*$/, '')

  const items = [...lastList[2].matchAll(/<li>([\s\S]*?)<\/li>/g)]
    .map(m => stripTags(m[1]))
    .filter(Boolean)

  return { description: stripTags(before), specs: items.join(' | ') }
}

export interface BulletedText {
  intro: string
  items: string[]
}

// Some feed descriptions embed a "•"-delimited list as plain text rather than a real
// <ul>/<li> list (e.g. "...Vantaggi delle lenti TAC•Item uno.•Item due."). Split that out
// so it can be rendered as an actual bullet list instead of one run-on paragraph.
export function splitBulletedText(text: string): BulletedText {
  if (!text.includes('•')) return { intro: text, items: [] }
  const [intro, ...rest] = text.split('•')
  return { intro: intro.trim(), items: rest.map(s => s.trim()).filter(Boolean) }
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
