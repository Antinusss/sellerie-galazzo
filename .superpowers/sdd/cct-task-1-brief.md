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

