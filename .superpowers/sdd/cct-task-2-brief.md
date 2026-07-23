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

