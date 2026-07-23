# Cart & Checkout Trust Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add trust bullets and payment-method badges to the cart (both the full `/cart` page and the slide-in drawer), and convert checkout from a 3-step wizard into a single scrollable page with the same trust treatment — display-only, no real payment integration.

**Architecture:** One shared presentational component (`PaymentBadges`) and one small data file (`lib/payment-methods.ts`, id+label only) are consumed by both the cart components and the checkout `OrderSummary`. The checkout page itself drops its `step` state and `CheckoutSteps` stepper in favor of always-rendering all three form sections, with a single final submit button.

**Tech Stack:** Next.js 14 App Router, TypeScript, Tailwind CSS, Jest.

## Global Constraints

- lucide-react 1.21.0 has no brand icons — payment marks are small colored text badges (CSS only), not icons or downloaded logo images.
- `tailwind.config.ts`'s `content` globs only scan `./pages/**`, `./components/**`, `./app/**` — **not** `./lib/**`. Any Tailwind class string must live in a file under one of those three globs or it gets silently purged from the production build. `lib/payment-methods.ts` holds only `{ id, label }` data; the Tailwind bg/text class strings per method live inside `components/shared/PaymentBadges.tsx`.
- No component-level (`.test.tsx`) tests exist in this repo — only pure-logic `.test.ts` files under `__tests__/`. UI-only tasks in this plan are verified via `tsc --noEmit` + `npm run build` + `npm test` (regression guard), not new test files.
- Real, already-published site facts only in trust copy: "reso entro 14 giorni" (matches `/resi-e-rimborsi`), "spedizione gratuita sopra €80" (matches `FREE_SHIPPING_THRESHOLD` = 8000 cents in `lib/utils.ts`), "paga in 3 rate con Klarna" (matches the existing Klarna BNPL badge already on the product page and the Round-1 hero trust strip) — no new claims.
- No real payment gateway integration — badges are static and display-only, exactly as the existing mocked payment-method radios in checkout already are.

---

### Task 1: `PaymentBadges` component + data

**Files:**
- Create: `lib/payment-methods.ts`
- Create: `components/shared/PaymentBadges.tsx`

**Interfaces:**
- Produces: `PAYMENT_METHODS: PaymentMethod[]` (`{ id: string, label: string }[]`) from `@/lib/payment-methods`.
- Produces: `PaymentBadges({ methods: string[] })` (default export) from `@/components/shared/PaymentBadges` — renders a badge for each id in `methods` that matches an entry in `PAYMENT_METHODS`. Consumed by Tasks 2 and 4.

- [ ] **Step 1: Create the data file**

Create `lib/payment-methods.ts`:

```ts
export interface PaymentMethod {
  id: string
  label: string
}

export const PAYMENT_METHODS: PaymentMethod[] = [
  { id: 'visa', label: 'VISA' },
  { id: 'mastercard', label: 'Mastercard' },
  { id: 'paypal', label: 'PayPal' },
  { id: 'amex', label: 'Amex' },
  { id: 'maestro', label: 'Maestro' },
  { id: 'klarna', label: 'Klarna' },
  { id: 'applepay', label: 'Apple Pay' },
  { id: 'googlepay', label: 'Google Pay' },
]
```

- [ ] **Step 2: Create the component**

Create `components/shared/PaymentBadges.tsx`:

```tsx
import { PAYMENT_METHODS } from '@/lib/payment-methods'

const STYLES: Record<string, string> = {
  visa: 'bg-[#1A1F71] text-white',
  mastercard: 'bg-black text-white',
  paypal: 'bg-[#003087] text-white',
  amex: 'bg-[#006FCF] text-white',
  maestro: 'bg-[#0099DF] text-white',
  klarna: 'bg-[#FFB3C7] text-black',
  applepay: 'bg-black text-white',
  googlepay: 'bg-white text-black border border-gray-200',
}

interface PaymentBadgesProps { methods: string[] }

export default function PaymentBadges({ methods }: PaymentBadgesProps) {
  const items = PAYMENT_METHODS.filter(m => methods.includes(m.id))
  return (
    <div className="flex flex-wrap gap-2">
      {items.map(m => (
        <span key={m.id} className={`${STYLES[m.id]} text-xs font-bold px-3 py-1.5 rounded-md`}>
          {m.label}
        </span>
      ))}
    </div>
  )
}
```

- [ ] **Step 3: Verify the build**

Run: `npx tsc --noEmit`
Expected: no errors.

Run: `npm run build`
Expected: build succeeds (this component isn't used anywhere yet, so no visible change — this just confirms it compiles).

- [ ] **Step 4: Commit**

```bash
git add lib/payment-methods.ts components/shared/PaymentBadges.tsx
git commit -m "feat: add PaymentBadges component and payment-methods data"
```

---

### Task 2: Cart trust wiring (`CartSummary`, `CartDrawer`)

**Files:**
- Modify: `components/cart/CartSummary.tsx`
- Modify: `components/cart/CartDrawer.tsx`

**Interfaces:**
- Consumes: `PaymentBadges({ methods: string[] })` from Task 1.

- [ ] **Step 1: Update `CartSummary.tsx`**

Replace this block (the import line and the closing `</div>`/`Link` section):

```tsx
'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useCartStore } from '@/lib/store'
import { formatPrice, FREE_SHIPPING_THRESHOLD } from '@/lib/utils'
```

with:

```tsx
'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useCartStore } from '@/lib/store'
import { formatPrice, FREE_SHIPPING_THRESHOLD } from '@/lib/utils'
import PaymentBadges from '@/components/shared/PaymentBadges'
```

Then replace:

```tsx
      <Link
        href="/checkout"
        className="block w-full bg-red text-white text-center py-4 rounded-full font-bold hover:bg-red-dark transition-colors"
      >
        Procedi al checkout
      </Link>
    </div>
  )
}
```

with:

```tsx
      <ul className="space-y-2 text-xs text-gray-500 mb-4">
        <li>Consegna a domicilio disponibile</li>
        <li>Pagamento sicuro SSL</li>
        <li>Reso entro 14 giorni</li>
      </ul>

      <Link
        href="/checkout"
        className="block w-full bg-red text-white text-center py-4 rounded-full font-bold hover:bg-red-dark transition-colors"
      >
        Procedi al checkout
      </Link>

      <div className="mt-4 pt-4 border-t border-gray-300">
        <p className="text-xs text-gray-400 mb-2">Pagamento sicuro e protetto</p>
        <PaymentBadges methods={['visa', 'mastercard', 'paypal', 'amex', 'maestro']} />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Update `CartDrawer.tsx`**

Replace this import block:

```tsx
'use client'
import Image from 'next/image'
import Link from 'next/link'
import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react'
import { useCartStore } from '@/lib/store'
import { formatPrice, FREE_SHIPPING_THRESHOLD } from '@/lib/utils'
```

with:

```tsx
'use client'
import Image from 'next/image'
import Link from 'next/link'
import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react'
import { useCartStore } from '@/lib/store'
import { formatPrice, FREE_SHIPPING_THRESHOLD } from '@/lib/utils'
import PaymentBadges from '@/components/shared/PaymentBadges'
```

Then replace:

```tsx
              <div className="flex flex-col gap-2">
                <Link
                  href="/cart"
                  onClick={closeCart}
                  className="w-full text-center border-2 border-black py-3 rounded-full font-bold text-sm hover:bg-black hover:text-white transition-colors"
                >
                  Vai al carrello
                </Link>
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="w-full text-center bg-red text-white py-3 rounded-full font-bold text-sm hover:bg-red-dark transition-colors"
                >
                  Vai al checkout
                </Link>
              </div>
            </div>
          </>
```

with:

```tsx
              <div className="flex flex-col gap-2">
                <Link
                  href="/cart"
                  onClick={closeCart}
                  className="w-full text-center border-2 border-black py-3 rounded-full font-bold text-sm hover:bg-black hover:text-white transition-colors"
                >
                  Vai al carrello
                </Link>
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="w-full text-center bg-red text-white py-3 rounded-full font-bold text-sm hover:bg-red-dark transition-colors"
                >
                  Vai al checkout
                </Link>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 flex justify-center">
                <PaymentBadges methods={['visa', 'mastercard', 'paypal', 'amex', 'maestro']} />
              </div>
            </div>
          </>
```

- [ ] **Step 3: Verify the build**

Run: `npx tsc --noEmit`
Expected: no errors.

Run: `npm run build`
Expected: build succeeds.

Run: `npm test`
Expected: all tests still pass (neither file has a dedicated test suite; this guards against an unrelated regression).

- [ ] **Step 4: Commit**

```bash
git add components/cart/CartSummary.tsx components/cart/CartDrawer.tsx
git commit -m "feat: add trust bullets and payment badges to cart"
```

---

### Task 3: Checkout one-page conversion

**Files:**
- Modify: `app/checkout/page.tsx`
- Delete: `components/checkout/CheckoutSteps.tsx`

**Interfaces:**
- None new — this task removes the `CheckoutSteps` import/render and the `step` state, keeping every existing form field, radio option, and the final submit handler unchanged.

- [ ] **Step 1: Replace the full file**

Replace the entire contents of `app/checkout/page.tsx` with:

```tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/lib/store'
import OrderSummary from '@/components/checkout/OrderSummary'

export default function CheckoutPage() {
  const [form, setForm] = useState({ email: '', nome: '', cognome: '', indirizzo: '', cap: '', citta: '', shipping: 'standard' })
  const [payment, setPayment] = useState('card')
  const router = useRouter()
  const { clearCart } = useCartStore()

  const updateForm = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }))

  const inputClass = "w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-sand transition-colors"

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-black mb-8">Checkout</h1>
      <div className="flex flex-col lg:flex-row gap-10">
        {/* Form area */}
        <div className="flex-1 space-y-10">
          <div className="space-y-5">
            <h2 className="text-2xl font-black">Contatti e indirizzo</h2>
            <input type="email" autoComplete="email" placeholder="Email *" value={form.email} onChange={e => updateForm('email', e.target.value)} className={inputClass} />
            <div className="grid grid-cols-2 gap-4">
              <input autoComplete="given-name" placeholder="Nome *" value={form.nome} onChange={e => updateForm('nome', e.target.value)} className={inputClass} />
              <input autoComplete="family-name" placeholder="Cognome *" value={form.cognome} onChange={e => updateForm('cognome', e.target.value)} className={inputClass} />
            </div>
            <input autoComplete="street-address" placeholder="Indirizzo *" value={form.indirizzo} onChange={e => updateForm('indirizzo', e.target.value)} className={inputClass} />
            <div className="grid grid-cols-3 gap-4">
              <input inputMode="numeric" autoComplete="postal-code" placeholder="CAP *" value={form.cap} onChange={e => updateForm('cap', e.target.value)} className={inputClass} />
              <input autoComplete="address-level2" placeholder="Città *" value={form.citta} onChange={e => updateForm('citta', e.target.value)} className={`${inputClass} col-span-2`} />
            </div>
          </div>

          <div className="space-y-5">
            <h2 className="text-2xl font-black">Metodo di spedizione</h2>
            {[
              { id: 'standard', label: 'Standard', desc: '3-5 giorni lavorativi', price: 'Gratuita sopra €80, altrimenti €5,90' },
              { id: 'express', label: 'Express', desc: '1-2 giorni lavorativi', price: '€9,90' },
            ].map(opt => (
              <label
                key={opt.id}
                className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                  form.shipping === opt.id ? 'border-red bg-red/5' : 'border-gray-200 hover:border-sand'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="shipping"
                    value={opt.id}
                    checked={form.shipping === opt.id}
                    onChange={() => updateForm('shipping', opt.id)}
                    className="accent-red"
                  />
                  <div>
                    <p className="font-bold text-sm">{opt.label}</p>
                    <p className="text-xs text-gray-400">{opt.desc}</p>
                  </div>
                </div>
                <p className="text-sm font-semibold">{opt.price}</p>
              </label>
            ))}
          </div>

          <div className="space-y-5">
            <h2 className="text-2xl font-black">Pagamento</h2>
            <div className="bg-gray-light rounded-xl p-4 text-xs text-gray-400 flex items-center gap-2">
              🔒 Connessione sicura — I tuoi dati sono protetti con crittografia SSL
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'card', label: 'Carta di credito/debito' },
                { id: 'paypal', label: 'PayPal' },
                { id: 'klarna', label: 'Klarna — Paga a rate' },
                { id: 'bonifico', label: 'Bonifico bancario' },
              ].map(opt => (
                <label
                  key={opt.id}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                    payment === opt.id ? 'border-red bg-red/5' : 'border-gray-200 hover:border-sand'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={opt.id}
                    checked={payment === opt.id}
                    onChange={() => setPayment(opt.id)}
                    className="accent-red"
                  />
                  <span className="font-semibold text-sm">{opt.label}</span>
                </label>
              ))}
            </div>

            {payment === 'card' && (
              <>
                <input inputMode="numeric" autoComplete="cc-number" placeholder="Numero carta *" className={inputClass} maxLength={19} />
                <div className="grid grid-cols-2 gap-4">
                  <input autoComplete="cc-exp" placeholder="Scadenza MM/AA *" className={inputClass} />
                  <input inputMode="numeric" autoComplete="cc-csc" placeholder="CVV *" className={inputClass} maxLength={4} />
                </div>
                <input autoComplete="cc-name" placeholder="Nome sulla carta *" className={inputClass} />
              </>
            )}
            {payment === 'paypal' && (
              <p className="text-sm text-gray-600 bg-gray-light rounded-xl p-4">
                Verrai reindirizzato a PayPal per completare il pagamento in sicurezza.
              </p>
            )}
            {payment === 'klarna' && (
              <p className="text-sm text-gray-600 bg-gray-light rounded-xl p-4">
                Paga in 3 rate senza interessi o tra 30 giorni con Klarna. Verrai reindirizzato a Klarna per completare l&apos;acquisto.
              </p>
            )}
            {payment === 'bonifico' && (
              <p className="text-sm text-gray-600 bg-gray-light rounded-xl p-4">
                Riceverai le coordinate bancarie via email per completare il bonifico. L&apos;ordine sarà spedito alla ricezione del pagamento.
              </p>
            )}
          </div>

          <button
            onClick={() => { clearCart(); router.push('/checkout/success') }}
            className="w-full bg-red text-white py-4 rounded-full font-bold hover:bg-red-dark transition-colors"
          >
            Conferma ordine
          </button>
        </div>

        {/* Order summary sidebar */}
        <div className="lg:w-80">
          <OrderSummary />
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Delete `CheckoutSteps.tsx`**

```bash
git rm components/checkout/CheckoutSteps.tsx
```

- [ ] **Step 3: Verify the build**

Run: `npx tsc --noEmit`
Expected: no errors — in particular, no "unused import" or "cannot find module" errors referencing `CheckoutSteps`.

Run: `grep -rn "CheckoutSteps" --include="*.tsx" --include="*.ts" . | grep -v node_modules`
Expected: no output (zero remaining references anywhere in the repo).

Run: `npm run build`
Expected: build succeeds, `/checkout` route still generates.

- [ ] **Step 4: Commit**

```bash
git add "app/checkout/page.tsx" components/checkout/CheckoutSteps.tsx
git commit -m "feat: convert checkout from 3-step wizard to single page"
```

---

### Task 4: `OrderSummary` trust wiring

**Files:**
- Modify: `components/checkout/OrderSummary.tsx`

**Interfaces:**
- Consumes: `PaymentBadges({ methods: string[] })` from Task 1.

- [ ] **Step 1: Update the file**

Replace this import block:

```tsx
'use client'
import Image from 'next/image'
import { useCartStore } from '@/lib/store'
import { formatPrice } from '@/lib/utils'
```

with:

```tsx
'use client'
import Image from 'next/image'
import { useCartStore } from '@/lib/store'
import { formatPrice } from '@/lib/utils'
import PaymentBadges from '@/components/shared/PaymentBadges'
```

Then replace:

```tsx
        <div className="flex justify-between font-black text-base pt-2 border-t border-gray-300">
          <span>Totale</span>
          <span>{formatPrice(totalPrice + shipping)}</span>
        </div>
      </div>
    </div>
  )
}
```

with:

```tsx
        <div className="flex justify-between font-black text-base pt-2 border-t border-gray-300">
          <span>Totale</span>
          <span>{formatPrice(totalPrice + shipping)}</span>
        </div>
      </div>

      <ul className="space-y-2 text-xs text-gray-500 mt-4 pt-4 border-t border-gray-300">
        <li>Spedizione gratuita sopra €80</li>
        <li>Pagamento sicuro SSL</li>
        <li>Reso entro 14 giorni</li>
        <li>Paga in 3 rate con Klarna</li>
      </ul>

      <div className="mt-4 pt-4 border-t border-gray-300">
        <PaymentBadges methods={['klarna', 'applepay', 'googlepay', 'visa', 'mastercard', 'amex']} />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify the build**

Run: `npx tsc --noEmit`
Expected: no errors.

Run: `npm run build`
Expected: build succeeds.

Run: `npm test`
Expected: all tests still pass (this file has no dedicated test suite).

- [ ] **Step 3: Commit**

```bash
git add components/checkout/OrderSummary.tsx
git commit -m "feat: add trust list and payment badges to checkout order summary"
```

---

### Task 5: Full build + test + manual verification

**Files:** None (verification only).

- [ ] **Step 1: Full automated check**

Run: `npx tsc --noEmit && npm test && npm run build`
Expected: no type errors, all tests pass, build succeeds, `/checkout` and `/cart` routes both present.

- [ ] **Step 2: Manual browser verification**

Start the production server (`npm run start`, port 3000), add at least one product to the cart, and check:

1. `/cart`: the order-summary box shows the 3 trust bullets (Consegna a domicilio / Pagamento sicuro SSL / Reso entro 14 giorni) between the total and the "Procedi al checkout" button, then below the button a "Pagamento sicuro e protetto" caption and 5 colored payment badges (VISA, Mastercard, PayPal, Amex, Maestro) — confirm each badge renders with its distinct background color (not unstyled/transparent — this is the specific Tailwind-purge risk called out in Global Constraints).
2. Open the cart drawer (cart icon in the navbar): confirm the same 5 payment badges appear below the two CTA buttons, correctly colored.
3. `/checkout`: confirm there is no step indicator/stepper at the top, and all three sections (Contatti e indirizzo, Metodo di spedizione, Pagamento) are visible on the page at once without needing to click "Continua". Fill in the contact fields, pick a shipping option, pick a payment option, and confirm the conditional payment sub-fields (card number / PayPal note / Klarna note / bonifico note) still switch correctly when you change the payment radio.
4. On `/checkout`, confirm the order-summary sidebar shows the 4 trust bullets (spedizione gratuita sopra €80, pagamento sicuro SSL, reso entro 14 giorni, paga in 3 rate con Klarna) and the wider 6-badge payment row (Klarna, Apple Pay, Google Pay, Visa, Mastercard, Amex), all correctly colored.
5. Click "Conferma ordine" on `/checkout`: confirm it still clears the cart and navigates to `/checkout/success` (unchanged behavior from before this plan).
6. Browser console: no errors on `/cart` or `/checkout`.

- [ ] **Step 3: Record findings**

If any check in Step 2 fails, fix it before proceeding — do not mark this task complete with a known-broken interaction.
