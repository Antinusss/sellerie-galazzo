import {
  parsePriceToCents,
  decodeEntities,
  stripTags,
  splitDescriptionAndSpecs,
  splitBulletedText,
  slugFromLink,
  parseCategoryPath,
  dedupeSlugs,
} from '@/lib/feed-transform'

describe('parsePriceToCents', () => {
  it('parses EUR-prefixed price into cents', () => expect(parsePriceToCents('EUR15.99')).toBe(1599))
  it('parses a smaller value', () => expect(parsePriceToCents('EUR7.99')).toBe(799))
  it('parses a whole-euro value', () => expect(parsePriceToCents('EUR100.00')).toBe(10000))
})

describe('decodeEntities', () => {
  it('decodes amp/lt/gt', () => expect(decodeEntities('Cuoio &amp; pelle &gt; 5 &lt; 10')).toBe('Cuoio & pelle > 5 < 10'))
  it('leaves plain text untouched', () => expect(decodeEntities('Nessuna entità qui')).toBe('Nessuna entità qui'))
})

describe('stripTags', () => {
  it('removes tags and decodes entities', () => expect(stripTags('<p>Cuoio &amp; pelle</p>')).toBe('Cuoio & pelle'))
  it('collapses whitespace left by removed tags', () => expect(stripTags('<b>A</b>  <i>B</i>')).toBe('A B'))
})

describe('splitDescriptionAndSpecs', () => {
  it('splits real feed description into plain description + pipe-joined specs', () => {
    const html = `Detergente specifico per la cura quotidiana del cuoio, arricchito con olio di mandorla e glicerina. Rimuove efficacemente sporco, sudore e residui, svolgendo al tempo stesso un'azione nutriente e ammorbidente sulle fibre. Ideale per mantenere il cuoio pulito, morbido ed elastico nel tempo, senza comprometterne la qualità.Per l'utilizzo, agitare bene prima dell'uso e spruzzare direttamente sulla superficie da trattare. Lasciare agire per qualche secondo, quindi strofinare con un panno pulito per rimuovere lo sporco. Completare il trattamento lucidando per ottenere una finitura uniforme e curata. L'uso regolare consente di preservare l'aspetto e le prestazioni del cuoio.<em><strong>Specifiche tecniche:</strong></em><ul> <li>Formula con olio di mandorla e glicerina</li> <li>Azione detergente efficace su sporco e sudore</li> <li>Nutre e ammorbidisce le fibre del cuoio</li> <li>Ideale per uso quotidiano</li> <li>Facile applicazione spray</li> <li>Mantiene elasticità e morbidezz</li></ul>`

    const result = splitDescriptionAndSpecs(html)

    expect(result.description).toBe(`Detergente specifico per la cura quotidiana del cuoio, arricchito con olio di mandorla e glicerina. Rimuove efficacemente sporco, sudore e residui, svolgendo al tempo stesso un'azione nutriente e ammorbidente sulle fibre. Ideale per mantenere il cuoio pulito, morbido ed elastico nel tempo, senza comprometterne la qualità.Per l'utilizzo, agitare bene prima dell'uso e spruzzare direttamente sulla superficie da trattare. Lasciare agire per qualche secondo, quindi strofinare con un panno pulito per rimuovere lo sporco. Completare il trattamento lucidando per ottenere una finitura uniforme e curata. L'uso regolare consente di preservare l'aspetto e le prestazioni del cuoio.`)
    expect(result.specs).toBe(`Formula con olio di mandorla e glicerina | Azione detergente efficace su sporco e sudore | Nutre e ammorbidisce le fibre del cuoio | Ideale per uso quotidiano | Facile applicazione spray | Mantiene elasticità e morbidezz`)
  })

  it('returns plain description with empty specs when there is no list', () => {
    const html = 'In cuoio di alta qualità, dotato di fibbia metallica resistente per regolazione precisa.'
    expect(splitDescriptionAndSpecs(html)).toEqual({
      description: 'In cuoio di alta qualità, dotato di fibbia metallica resistente per regolazione precisa.',
      specs: '',
    })
  })

  it('returns empty description and specs for empty input', () => {
    expect(splitDescriptionAndSpecs('')).toEqual({ description: '', specs: '' })
  })

  it('keeps an early <strong>/<em> run intact and only strips the heading right before the list', () => {
    // Regression: an earlier version's heading-stripping regex matched from the FIRST
    // formatting tag anywhere in the text through to the end, deleting the rest of the
    // description whenever it contained an early <strong>/<em> run (as most real feed
    // descriptions do, e.g. "<strong>lenti polarizzate</strong>" mid-sentence).
    const html = `Prodotto con <strong>materiale premium</strong> e finiture di alta qualità per un uso quotidiano intenso.<em><strong>Info e care:</strong></em><ul> <li>Pulire con panno morbido</li> <li>Non esporre al sole diretto</li></ul>`

    const result = splitDescriptionAndSpecs(html)

    expect(result.description).toBe('Prodotto con materiale premium e finiture di alta qualità per un uso quotidiano intenso.')
    expect(result.specs).toBe('Pulire con panno morbido | Non esporre al sole diretto')
  })

  it('does not truncate a real feed description with a fake inline bullet section before the real list', () => {
    // Real case (product 67217) that triggered the regression above: an early <strong> tag,
    // a "•"-bulleted section that is plain text (not a real <ul>), and only then the real
    // <ul> list with its own heading right before it.
    const html = `Occhiali da sole Sunniva con <strong>lenti polarizzate</strong> per sport equestri che offrono una visione nitida e confortevole grazie alla riduzione dell’abbagliamento e alla protezione dai raggi UV. Migliorano il contrasto e la percezione dei colori per una <strong>maggiore precisione e sicurezza in sella</strong>, riducono l’affaticamento visivo durante le lunghe sessioni di equitazione e, grazie alle caratteristiche <strong>antiurto e antigraffio</strong>, proteggono efficacemente da urti, detriti e condizioni ambientali impegnative.<em><strong>Specifiche tecniche:</strong></em>Vantaggi delle lenti Polaroid TAC•Polarizzazione superiore: offre una forte riduzione dei riflessi, ideale per condizioni di luce intensa all'aperto.<em><strong>Info e care:</strong></em><ul> <li>Pulire le lenti con un panno in microfibra e prodotti specifici per lenti</li> <li>Riporre sempre gli occhiali nella custodia protettiva quando non in uso</li></ul>`

    const result = splitDescriptionAndSpecs(html)

    expect(result.description.length).toBeGreaterThan(400)
    expect(result.description).toContain('lenti polarizzate')
    expect(result.description).toContain('antiurto e antigraffio')
    expect(result.description).toContain('impegnative.')
    expect(result.description).toContain('Polaroid TAC')
    expect(result.description).not.toContain('Info e care')
    expect(result.specs).toBe('Pulire le lenti con un panno in microfibra e prodotti specifici per lenti | Riporre sempre gli occhiali nella custodia protettiva quando non in uso')
  })
})

describe('splitBulletedText', () => {
  it('returns the text unchanged as intro when there is no bullet character', () => {
    expect(splitBulletedText('Testo normale senza elenchi.')).toEqual({
      intro: 'Testo normale senza elenchi.',
      items: [],
    })
  })

  it('splits an inline "•"-delimited run into intro + items', () => {
    const text = "Vantaggi delle lenti TAC•Polarizzazione superiore: ottima.•Elevata nitidezza ottica."
    expect(splitBulletedText(text)).toEqual({
      intro: 'Vantaggi delle lenti TAC',
      items: ['Polarizzazione superiore: ottima.', 'Elevata nitidezza ottica.'],
    })
  })

  it('returns an empty intro when the text starts with a bullet', () => {
    expect(splitBulletedText('•Primo punto.•Secondo punto.')).toEqual({
      intro: '',
      items: ['Primo punto.', 'Secondo punto.'],
    })
  })
})

describe('slugFromLink', () => {
  it('extracts the slug from a real product URL with tracking params', () => {
    const link = 'https://selleriagalazzo.com/prodotto/acavallo-sapone-per-il-cuoio-alla-mandorla-500ml-glicerina/?utm_source=Google%20Shopping&utm_campaign=Google%20Shopping'
    expect(slugFromLink(link)).toBe('acavallo-sapone-per-il-cuoio-alla-mandorla-500ml-glicerina')
  })
})

describe('parseCategoryPath', () => {
  it('splits the double-encoded product_type into segments, dropping Home', () => {
    expect(parseCategoryPath('Home &gt; Scuderia &gt; Cura del cuoio')).toEqual(['Scuderia', 'Cura del cuoio'])
  })
  it('handles a deeper path', () => {
    expect(parseCategoryPath('Home &gt; Monta Inglese &gt; Cavaliere &gt; Donna &gt; Pantaloni'))
      .toEqual(['Monta Inglese', 'Cavaliere', 'Donna', 'Pantaloni'])
  })
})

describe('dedupeSlugs', () => {
  it('leaves unique slugs untouched', () => {
    const items = [{ id: '1', slug: 'a' }, { id: '2', slug: 'b' }]
    expect(dedupeSlugs(items)).toEqual(items)
  })
  it('suffixes every collision after the first with its id', () => {
    const items = [
      { id: '67027', slug: 'frustino-bicolore-master' },
      { id: '67025', slug: 'frustino-bicolore-master' },
      { id: '67026', slug: 'frustino-bicolore-master' },
    ]
    expect(dedupeSlugs(items).map(i => i.slug)).toEqual([
      'frustino-bicolore-master',
      'frustino-bicolore-master-67025',
      'frustino-bicolore-master-67026',
    ])
  })
})
