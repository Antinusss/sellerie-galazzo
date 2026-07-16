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
