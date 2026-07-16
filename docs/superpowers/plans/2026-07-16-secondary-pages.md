# Secondary Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the five secondary pages the Footer's "Assistenza" section has always dead-linked to (Contattaci, Spedizioni, Resi e rimborsi, FAQ, Guida alle taglie), using real content recovered from the client's live site where available and clearly plausible fabricated content elsewhere, then wire the Footer to them.

**Architecture:** Five independent, self-contained page routes under `app/`, each following the existing page-header convention (`max-w-* mx-auto px-4 sm:px-6 lg:px-8 py-*`, `<h1 className="text-4xl font-black">Title <em className="text-red">emphasis</em></h1>`) already used by `/marche` and `/guida-ai-prodotti`. No shared data layer needed — each page's content is static JSX. The Footer task is separate since it touches a different, shared file.

**Tech Stack:** Next.js 14 App Router, TypeScript, Tailwind CSS, Lucide React icons.

## Global Constraints

- Real content only where verified against the live selleriagalazzo.com site (recovered during design: company name, address, phone, WhatsApp, email, P.IVA, social handles, the 14-day right-of-withdrawal policy). Everywhere else, content is plausible fabricated boilerplate, not claimed as verified fact.
- The `/spedizioni` page must state exactly the shipping terms already used elsewhere in this mockup: standard free above €80 / €5,90 otherwise / 3-5 giorni lavorativi; express €9,90 / 1-2 giorni lavorativi. Do not invent different numbers.
- `lucide-react` (this project's installed version, 1.21.0) has **no brand icons** (`Facebook`, `Instagram`, `Twitter`, etc. are all `undefined`) — use generic icons (`ExternalLink`, `MapPin`, `Phone`, `Mail`, `MessageCircle`, `Truck`, `Zap`, `Package`, `Globe`, `RotateCcw`, `PackageCheck`, `Clock`, `ChevronDown`) which are all confirmed present in this version.
- The FAQ page requires `'use client'` (interactive accordion via `useState`) — Next.js does not allow a `'use client'` file to export `metadata`, so `/faq` has no `metadata` export, consistent with this codebase's other client-only pages (`/cart`, `/wishlist`).
- Component-level changes in this codebase are not unit-tested (established convention — only `lib/` pure modules have Jest tests); verify all tasks via `npm run build` + manual/browser checks.
- Italian copy throughout, matching the site's existing tone.
- Reuse existing Tailwind color/utility classes only (`bg-red`, `hover:bg-red-dark`, `text-red`, `bg-sand`, `text-sand`, `bg-gray-light`, `border-gray-200`, `text-gray-400`/`600`, `rounded-2xl`, `rounded-xl`) — no new colors.

---

### Task 1: Contattaci page

**Files:**
- Create: `app/contattaci/page.tsx`

**Interfaces:**
- None — standalone static page.

- [ ] **Step 1: Create the page**

Create `app/contattaci/page.tsx`:

```tsx
import { MapPin, Phone, Mail, MessageCircle, ExternalLink } from 'lucide-react'

export const metadata = { title: 'Contattaci — Selleria Galazzo' }

export default function ContattaciPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-black mb-2">
        Contatta<em className="text-red">ci</em>
      </h1>
      <p className="text-gray-400 mb-10">
        Siamo a tua disposizione per qualsiasi domanda su prodotti, ordini e spedizioni.
      </p>

      <div className="grid sm:grid-cols-2 gap-6">
        <div className="bg-gray-light rounded-2xl p-6">
          <MapPin className="text-red mb-3" size={28} />
          <h2 className="font-black mb-1">Dove siamo</h2>
          <p className="text-sm text-gray-600">
            Selleria Galazzo di Biagio Galazzo<br />
            Via Vicario Savarino, 49<br />
            96019 Rosolini (SR), Italia
          </p>
        </div>

        <div className="bg-gray-light rounded-2xl p-6">
          <Phone className="text-red mb-3" size={28} />
          <h2 className="font-black mb-1">Telefono</h2>
          <p className="text-sm text-gray-600">+39 379 164 2334</p>
        </div>

        <div className="bg-gray-light rounded-2xl p-6">
          <MessageCircle className="text-red mb-3" size={28} />
          <h2 className="font-black mb-1">WhatsApp</h2>
          <p className="text-sm text-gray-600">335 638 3953</p>
        </div>

        <div className="bg-gray-light rounded-2xl p-6">
          <Mail className="text-red mb-3" size={28} />
          <h2 className="font-black mb-1">Email</h2>
          <p className="text-sm text-gray-600">info@selleriagalazzo.com</p>
        </div>
      </div>

      <div className="mt-10">
        <h2 className="font-black text-lg mb-4">Seguici</h2>
        <div className="flex flex-wrap gap-4">
          <a
            href="https://m.facebook.com/galazzoselleria/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 border-2 border-gray-200 rounded-full px-4 py-2 text-sm font-semibold hover:border-red hover:text-red transition-colors"
          >
            Facebook <ExternalLink size={14} />
          </a>
          <a
            href="https://instagram.com/selleriagalazzo/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 border-2 border-gray-200 rounded-full px-4 py-2 text-sm font-semibold hover:border-red hover:text-red transition-colors"
          >
            Instagram <ExternalLink size={14} />
          </a>
          <a
            href="https://tiktok.com/@selleria_galazzo/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 border-2 border-gray-200 rounded-full px-4 py-2 text-sm font-semibold hover:border-red hover:text-red transition-colors"
          >
            TikTok <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify the build**

Run: `npx tsc --noEmit`
Expected: no errors

Run: `npm run build`
Expected: build succeeds, new static route `○ /contattaci` appears in the route list

- [ ] **Step 3: Commit**

```bash
git add app/contattaci/page.tsx
git commit -m "feat: add contattaci page with real contact info"
```

---

### Task 2: Spedizioni page

**Files:**
- Create: `app/spedizioni/page.tsx`

**Interfaces:**
- None — standalone static page.

- [ ] **Step 1: Create the page**

Create `app/spedizioni/page.tsx`:

```tsx
import { Truck, Zap, Package, Globe } from 'lucide-react'

export const metadata = { title: 'Spedizioni — Selleria Galazzo' }

export default function SpedizioniPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-black mb-2">
        Spedi<em className="text-red">zioni</em>
      </h1>
      <p className="text-gray-400 mb-10">Tutto quello che devi sapere su tempi e costi di consegna.</p>

      <div className="space-y-6">
        <div className="flex gap-4 bg-gray-light rounded-2xl p-6">
          <Truck className="text-red shrink-0" size={28} />
          <div>
            <h2 className="font-black mb-1">Spedizione standard</h2>
            <p className="text-sm text-gray-600">
              Consegna in 3-5 giorni lavorativi. Gratuita per ordini superiori a €80,
              altrimenti €5,90.
            </p>
          </div>
        </div>

        <div className="flex gap-4 bg-gray-light rounded-2xl p-6">
          <Zap className="text-red shrink-0" size={28} />
          <div>
            <h2 className="font-black mb-1">Spedizione express</h2>
            <p className="text-sm text-gray-600">
              Consegna in 1-2 giorni lavorativi al costo di €9,90.
            </p>
          </div>
        </div>

        <div className="flex gap-4 bg-gray-light rounded-2xl p-6">
          <Package className="text-red shrink-0" size={28} />
          <div>
            <h2 className="font-black mb-1">Tracciamento e imballaggio</h2>
            <p className="text-sm text-gray-600">
              Non appena il tuo ordine parte dal nostro magazzino riceverai un&apos;email
              con il link per tracciare la spedizione. Ogni articolo viene imballato con
              cura per arrivare in perfette condizioni.
            </p>
          </div>
        </div>

        <div className="flex gap-4 bg-gray-light rounded-2xl p-6">
          <Globe className="text-red shrink-0" size={28} />
          <div>
            <h2 className="font-black mb-1">Zone di consegna</h2>
            <p className="text-sm text-gray-600">
              Al momento spediamo solo in Italia. Per richieste di spedizione
              internazionale contattaci direttamente.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify the build**

Run: `npx tsc --noEmit`
Expected: no errors

Run: `npm run build`
Expected: build succeeds, new static route `○ /spedizioni` appears in the route list

- [ ] **Step 3: Commit**

```bash
git add app/spedizioni/page.tsx
git commit -m "feat: add spedizioni page"
```

---

### Task 3: Resi e rimborsi page

**Files:**
- Create: `app/resi-e-rimborsi/page.tsx`

**Interfaces:**
- None — standalone static page.

- [ ] **Step 1: Create the page**

Create `app/resi-e-rimborsi/page.tsx`:

```tsx
import { RotateCcw, PackageCheck, Clock, Truck } from 'lucide-react'

export const metadata = { title: 'Resi e rimborsi — Selleria Galazzo' }

export default function ResiERimborsiPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-black mb-2">
        Resi e <em className="text-red">rimborsi</em>
      </h1>
      <p className="text-gray-400 mb-10">
        Hai 14 giorni di tempo dalla ricezione dell&apos;ordine per cambiare idea.
      </p>

      <div className="space-y-6">
        <div className="flex gap-4 bg-gray-light rounded-2xl p-6">
          <RotateCcw className="text-red shrink-0" size={28} />
          <div>
            <h2 className="font-black mb-1">Diritto di recesso</h2>
            <p className="text-sm text-gray-600">
              Puoi recedere dall&apos;acquisto entro 14 giorni dalla ricezione dei
              prodotti. Per esercitare il diritto di recesso scrivi a{' '}
              <a href="mailto:info@selleriagalazzo.com" className="text-red font-semibold hover:text-red-dark">
                info@selleriagalazzo.com
              </a>{' '}
              indicando il numero d&apos;ordine entro il termine previsto.
            </p>
          </div>
        </div>

        <div className="flex gap-4 bg-gray-light rounded-2xl p-6">
          <PackageCheck className="text-red shrink-0" size={28} />
          <div>
            <h2 className="font-black mb-1">Condizioni del reso</h2>
            <p className="text-sm text-gray-600">
              L&apos;articolo deve essere integro, mai utilizzato e restituito con
              etichette e confezione originale. Prodotti su misura o personalizzati non
              sono rimborsabili.
            </p>
          </div>
        </div>

        <div className="flex gap-4 bg-gray-light rounded-2xl p-6">
          <Truck className="text-red shrink-0" size={28} />
          <div>
            <h2 className="font-black mb-1">Spese di spedizione del reso</h2>
            <p className="text-sm text-gray-600">
              Le spese di spedizione per il reso sono a carico del cliente, salvo il caso
              in cui l&apos;articolo ricevuto sia difettoso o diverso da quanto ordinato.
            </p>
          </div>
        </div>

        <div className="flex gap-4 bg-gray-light rounded-2xl p-6">
          <Clock className="text-red shrink-0" size={28} />
          <div>
            <h2 className="font-black mb-1">Tempi di rimborso</h2>
            <p className="text-sm text-gray-600">
              Una volta ricevuto e controllato il reso, il rimborso viene elaborato entro
              5-10 giorni lavorativi con lo stesso metodo di pagamento utilizzato per
              l&apos;acquisto.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify the build**

Run: `npx tsc --noEmit`
Expected: no errors

Run: `npm run build`
Expected: build succeeds, new static route `○ /resi-e-rimborsi` appears in the route list

- [ ] **Step 3: Commit**

```bash
git add app/resi-e-rimborsi/page.tsx
git commit -m "feat: add resi e rimborsi page"
```

---

### Task 4: FAQ page

**Files:**
- Create: `app/faq/page.tsx`

**Interfaces:**
- None — standalone client page (no other file consumes anything from it).

- [ ] **Step 1: Create the page**

Create `app/faq/page.tsx`:

```tsx
'use client'
import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

interface FaqItem {
  question: string
  answer: string
}

interface FaqCategory {
  title: string
  items: FaqItem[]
}

const FAQ_CATEGORIES: FaqCategory[] = [
  {
    title: 'Ordini',
    items: [
      { question: 'Quali metodi di pagamento accettate?', answer: 'Accettiamo carta di credito/debito, PayPal, Klarna (pagamento a rate) e bonifico bancario.' },
      { question: 'Come posso tracciare il mio ordine?', answer: 'Riceverai un’email con il link di tracciamento non appena il tuo ordine viene spedito.' },
      { question: 'Posso modificare o annullare un ordine dopo averlo effettuato?', answer: 'Contattaci il prima possibile via email o WhatsApp: se l’ordine non è ancora stato spedito possiamo modificarlo o annullarlo.' },
    ],
  },
  {
    title: 'Spedizioni e resi',
    items: [
      { question: 'Quanto costa la spedizione?', answer: 'La spedizione standard è gratuita per ordini superiori a €80, altrimenti costa €5,90. La spedizione express costa €9,90.' },
      { question: 'Spedite anche all’estero?', answer: 'Al momento spediamo solo in Italia. Per richieste internazionali contattaci direttamente.' },
      { question: 'Come faccio un reso?', answer: 'Hai 14 giorni dalla ricezione per richiedere un reso scrivendo a info@selleriagalazzo.com con il numero d’ordine.' },
    ],
  },
  {
    title: 'Prodotti',
    items: [
      { question: 'I prodotti sono originali?', answer: 'Sì, vendiamo esclusivamente prodotti originali dei marchi che trovi in negozio, senza intermediari non autorizzati.' },
      { question: 'Come scelgo la taglia giusta?', answer: 'Consulta la nostra guida alle taglie, disponibile per abbigliamento, stivali e coperte da cavallo.' },
      { question: 'Vendete anche ad aziende o maneggi?', answer: 'Sì, per ordini all’ingrosso o forniture per maneggi scrivici a info@selleriagalazzo.com per un preventivo dedicato.' },
    ],
  },
]

export default function FaqPage() {
  const [openIndex, setOpenIndex] = useState<string | null>(null)

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-black mb-2">
        Domande <em className="text-red">frequenti</em>
      </h1>
      <p className="text-gray-400 mb-10">Le risposte alle domande che ci fate più spesso.</p>

      <div className="space-y-10">
        {FAQ_CATEGORIES.map(category => (
          <div key={category.title}>
            <h2 className="font-black text-sm mb-4 text-sand uppercase tracking-wide">{category.title}</h2>
            <div className="space-y-2">
              {category.items.map((item, i) => {
                const key = `${category.title}-${i}`
                const isOpen = openIndex === key
                return (
                  <div key={key} className="border border-gray-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setOpenIndex(isOpen ? null : key)}
                      className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left font-semibold text-sm hover:bg-gray-light transition-colors"
                    >
                      {item.question}
                      <ChevronDown size={18} className={`shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isOpen && (
                      <p className="px-5 pb-4 text-sm text-gray-600">{item.answer}</p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify the build**

Run: `npx tsc --noEmit`
Expected: no errors

Run: `npm run build`
Expected: build succeeds, new static route `○ /faq` appears in the route list

- [ ] **Step 3: Commit**

```bash
git add app/faq/page.tsx
git commit -m "feat: add faq page with accordion"
```

---

### Task 5: Guida alle taglie page

**Files:**
- Create: `app/guida-alle-taglie/page.tsx`

**Interfaces:**
- None — standalone static page.

- [ ] **Step 1: Create the page**

Create `app/guida-alle-taglie/page.tsx`:

```tsx
export const metadata = { title: 'Guida alle taglie — Selleria Galazzo' }

export default function GuidaAlleTagliePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-black mb-2">
        Guida alle <em className="text-red">taglie</em>
      </h1>
      <p className="text-gray-400 mb-10">
        Misura con un metro da sarto e confronta i valori con le tabelle qui sotto per
        trovare la taglia perfetta.
      </p>

      <div className="space-y-12">
        <div>
          <h2 className="font-black text-xl mb-4">Abbigliamento cavaliere</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-black">
                  <th className="py-3 pr-4 font-black">Taglia</th>
                  <th className="py-3 pr-4 font-black">Torace (cm)</th>
                  <th className="py-3 font-black">Vita (cm)</th>
                </tr>
              </thead>
              <tbody className="text-gray-600">
                {[
                  ['XS', '82-86', '62-66'],
                  ['S', '87-91', '67-71'],
                  ['M', '92-97', '72-77'],
                  ['L', '98-104', '78-84'],
                  ['XL', '105-111', '85-91'],
                  ['XXL', '112-119', '92-99'],
                ].map(([size, chest, waist]) => (
                  <tr key={size} className="border-b border-gray-100">
                    <td className="py-3 pr-4 font-semibold text-black">{size}</td>
                    <td className="py-3 pr-4">{chest}</td>
                    <td className="py-3">{waist}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h2 className="font-black text-xl mb-4">Stivali</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-black">
                  <th className="py-3 pr-4 font-black">Taglia EU</th>
                  <th className="py-3 font-black">Lunghezza piede (cm)</th>
                </tr>
              </thead>
              <tbody className="text-gray-600">
                {[
                  ['36', '22.5'],
                  ['37', '23.2'],
                  ['38', '23.8'],
                  ['39', '24.5'],
                  ['40', '25.2'],
                  ['41', '25.8'],
                  ['42', '26.5'],
                  ['43', '27.2'],
                  ['44', '27.8'],
                  ['45', '28.5'],
                  ['46', '29.2'],
                ].map(([size, length]) => (
                  <tr key={size} className="border-b border-gray-100">
                    <td className="py-3 pr-4 font-semibold text-black">{size}</td>
                    <td className="py-3">{length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h2 className="font-black text-xl mb-4">Coperte per cavallo</h2>
          <p className="text-sm text-gray-600 mb-4">
            Misura la lunghezza del cavallo dal centro del petto alla punta della coda per
            individuare la taglia più adatta.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-black">
                  <th className="py-3 pr-4 font-black">Taglia (cm)</th>
                  <th className="py-3 font-black">Altezza al garrese indicativa</th>
                </tr>
              </thead>
              <tbody className="text-gray-600">
                {[
                  ['115', 'Pony (circa 130 cm)'],
                  ['125', 'Pony/cavallo piccolo (circa 145 cm)'],
                  ['135', 'Cavallo medio (circa 155 cm)'],
                  ['145', 'Cavallo grande (circa 165 cm)'],
                  ['155', 'Cavallo molto grande (oltre 170 cm)'],
                ].map(([size, height]) => (
                  <tr key={size} className="border-b border-gray-100">
                    <td className="py-3 pr-4 font-semibold text-black">{size}</td>
                    <td className="py-3">{height}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify the build**

Run: `npx tsc --noEmit`
Expected: no errors

Run: `npm run build`
Expected: build succeeds, new static route `○ /guida-alle-taglie` appears in the route list

- [ ] **Step 3: Commit**

```bash
git add app/guida-alle-taglie/page.tsx
git commit -m "feat: add guida alle taglie page"
```

---

### Task 6: Wire Footer Assistenza links and fix P.IVA

**Files:**
- Modify: `components/layout/Footer.tsx`

**Interfaces:**
- Consumes: the five routes created in Tasks 1-5 (`/contattaci`, `/spedizioni`, `/resi-e-rimborsi`, `/faq`, `/guida-alle-taglie`).

- [ ] **Step 1: Replace the Assistenza dead links with real routes**

In `components/layout/Footer.tsx`, replace:

```tsx
          <div>
            <h4 className="font-bold mb-4 text-sand">Assistenza</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              {['Contattaci', 'Spedizioni', 'Resi e rimborsi', 'FAQ', 'Guida alle taglie'].map(l => (
                <li key={l}><a href="#" className="hover:text-white transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>
```

with:

```tsx
          <div>
            <h4 className="font-bold mb-4 text-sand">Assistenza</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              {[
                { label: 'Contattaci', href: '/contattaci' },
                { label: 'Spedizioni', href: '/spedizioni' },
                { label: 'Resi e rimborsi', href: '/resi-e-rimborsi' },
                { label: 'FAQ', href: '/faq' },
                { label: 'Guida alle taglie', href: '/guida-alle-taglie' },
              ].map(l => (
                <li key={l.href}><Link href={l.href} className="hover:text-white transition-colors">{l.label}</Link></li>
              ))}
            </ul>
          </div>
```

(`Link` is already imported at the top of this file.)

- [ ] **Step 2: Fix the placeholder P.IVA**

Replace:

```tsx
            <a href="#" className="hover:text-white transition-colors">P.IVA 00000000000</a>
```

with:

```tsx
            <span>P.IVA 02144600893</span>
```

- [ ] **Step 3: Verify the build**

Run: `npx tsc --noEmit`
Expected: no errors

Run: `npm run build`
Expected: build succeeds

- [ ] **Step 4: Commit**

```bash
git add components/layout/Footer.tsx
git commit -m "feat: wire footer assistenza links to real pages, fix placeholder P.IVA"
```

---

### Task 7: Full build, test, and manual verification

**Files:** None (verification-only task).

**Interfaces:** None.

- [ ] **Step 1: Run the full test suite**

Run: `npm test`
Expected: all suites pass, same count as before this plan (no new `lib/` modules were added — every task in this plan is a component/page).

- [ ] **Step 2: Type-check and build**

Run: `npx tsc --noEmit && npm run build`
Expected: zero TypeScript errors; build succeeds; route list includes `○ /contattaci`, `○ /spedizioni`, `○ /resi-e-rimborsi`, `○ /faq`, `○ /guida-alle-taglie` alongside all previously existing routes.

- [ ] **Step 3: Smoke test the production build**

```bash
npm run start &
sleep 3
curl -o /dev/null -s -w "%{http_code}\n" http://localhost:3000/contattaci
curl -o /dev/null -s -w "%{http_code}\n" http://localhost:3000/spedizioni
curl -o /dev/null -s -w "%{http_code}\n" http://localhost:3000/resi-e-rimborsi
curl -o /dev/null -s -w "%{http_code}\n" http://localhost:3000/faq
curl -o /dev/null -s -w "%{http_code}\n" http://localhost:3000/guida-alle-taglie
lsof -ti:3000 | xargs kill -9
```

Expected: `200` for every route.

- [ ] **Step 4: Browser check of the golden path**

Using the claude-in-chrome MCP tools against a freshly started `npm run start` server:

1. Scroll to the Footer on any page — confirm all five "Assistenza" links are real (not `href="#"`) and the bottom bar shows "P.IVA 02144600893" (not the old placeholder).
2. Click each of the five links in turn, confirm each lands on its page with real content (no broken layout, no missing icons).
3. On `/faq`, click a few questions — confirm the accordion opens/closes and only one relevant item's answer is shown per click (per-item toggle, not all-open).
4. On `/contattaci`, click the Facebook/Instagram/TikTok buttons — confirm they open the real social URLs in a new tab (`target="_blank"`).
5. On `/guida-alle-taglie`, confirm all three tables render with readable columns (no horizontal overflow breaking the layout on desktop width).
6. Check the browser console for JS errors during the whole pass — expect none from the application.

- [ ] **Step 5: Fix any bugs found**

If Steps 1–4 reveal any issue, fix it directly, re-run the affected step(s), and commit the fix:

```bash
git add -A
git commit -m "fix: <describe the bug fixed during secondary-pages verification>"
```

If Steps 1–4 pass cleanly, skip this step — nothing to commit.
