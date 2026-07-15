### Task 3: Account dashboard

**Files:**
- Create: `app/account/page.tsx`

**Interfaces:**
- Consumes: `useAuthStore()` from `lib/auth-store.ts` (already exists, produces `{ user: {name,email}|null; login(email,password): void; register(nome,cognome,email,password): void; logout(): void }`).

- [ ] **Step 1: Create the dashboard page**

Create `app/account/page.tsx`:

```tsx
'use client'
import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Package, Heart } from 'lucide-react'
import { useAuthStore } from '@/lib/auth-store'

export default function AccountPage() {
  const { user, logout } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!user) router.push('/account/login')
  }, [user, router])

  if (!user) return null

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-black mb-2">
        Ciao, <em className="text-red">{user.name}</em>
      </h1>
      <p className="text-gray-400 mb-10">{user.email}</p>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="bg-gray-light rounded-2xl p-6">
          <h2 className="font-black text-lg mb-4">I tuoi dati</h2>
          <p className="text-sm text-gray-600 mb-1"><span className="text-gray-400">Nome:</span> {user.name}</p>
          <p className="text-sm text-gray-600"><span className="text-gray-400">Email:</span> {user.email}</p>
        </div>

        <div className="bg-gray-light rounded-2xl p-6">
          <h2 className="font-black text-lg mb-4">I tuoi ordini</h2>
          <div className="text-center py-6">
            <Package size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-sm text-gray-400 mb-4">Non hai ancora effettuato ordini.</p>
            <Link href="/shop" className="text-sm font-semibold text-red hover:text-red-dark">
              Vai allo shop →
            </Link>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mt-8">
        <Link
          href="/wishlist"
          className="flex-1 flex items-center justify-center gap-2 border-2 border-black py-3 rounded-full font-bold hover:bg-black hover:text-white transition-colors"
        >
          <Heart size={18} />
          La tua wishlist
        </Link>
        <button
          onClick={handleLogout}
          className="flex-1 border-2 border-gray-200 py-3 rounded-full font-bold text-gray-500 hover:border-red hover:text-red transition-colors"
        >
          Esci
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify the build**

Run: `npx tsc --noEmit`
Expected: no errors

Run: `npm run build`
Expected: build succeeds, new static route `○ /account` appears in the route list

- [ ] **Step 3: Commit**

```bash
git add app/account/page.tsx
git commit -m "feat: add account dashboard page"
```
