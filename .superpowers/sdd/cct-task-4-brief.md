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

