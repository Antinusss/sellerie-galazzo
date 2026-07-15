### Task 4: Navbar account entry point

**Files:**
- Modify: `components/layout/Navbar.tsx`

**Interfaces:**
- Consumes: `useAuthStore()` from `lib/auth-store.ts` (already exists, produces `{ user: {name,email}|null; login(email,password): void; register(nome,cognome,email,password): void; logout(): void }`).

- [ ] **Step 1: Add the User icon import**

In `components/layout/Navbar.tsx`, replace:

```tsx
import { ShoppingCart, Heart, Search, Menu, X } from 'lucide-react'
import { useCartStore } from '@/lib/store'
import { useWishlistStore } from '@/lib/wishlist-store'
```

with:

```tsx
import { ShoppingCart, Heart, Search, User, Menu, X } from 'lucide-react'
import { useCartStore } from '@/lib/store'
import { useWishlistStore } from '@/lib/wishlist-store'
import { useAuthStore } from '@/lib/auth-store'
```

- [ ] **Step 2: Add the hook**

Inside the `Navbar` component, alongside the existing `const { productIds: wishlistIds } = useWishlistStore()` line, add:

```tsx
  const { user } = useAuthStore()
```

- [ ] **Step 3: Add the account icon between the wishlist heart and the cart button**

Replace:

```tsx
            <Link href="/wishlist" className="relative p-2 hover:text-red transition-colors">
              <Heart size={20} />
              {wishlistIds.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {wishlistIds.length}
                </span>
              )}
            </Link>
            <button className="relative p-2 hover:text-red transition-colors" onClick={openCart}>
```

with:

```tsx
            <Link href="/wishlist" className="relative p-2 hover:text-red transition-colors">
              <Heart size={20} />
              {wishlistIds.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {wishlistIds.length}
                </span>
              )}
            </Link>
            <Link href={user ? '/account' : '/account/login'} className="p-2 hover:text-red transition-colors">
              <User size={20} />
            </Link>
            <button className="relative p-2 hover:text-red transition-colors" onClick={openCart}>
```

- [ ] **Step 4: Verify the build**

Run: `npx tsc --noEmit`
Expected: no errors

Run: `npm run build`
Expected: build succeeds

- [ ] **Step 5: Commit**

```bash
git add components/layout/Navbar.tsx
git commit -m "feat: add account entry point to Navbar"
```
