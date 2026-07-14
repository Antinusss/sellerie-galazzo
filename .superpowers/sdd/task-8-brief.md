### Task 8: Cookie consent banner

**Files:**
- Create: `components/layout/CookieBanner.tsx`
- Modify: `app/layout.tsx`

**Interfaces:**
- None new — standalone component, no props.

- [ ] **Step 1: Create the cookie banner**

Create `components/layout/CookieBanner.tsx`:

```tsx
'use client'
import { useEffect, useState } from 'react'

const STORAGE_KEY = 'selleria-galazzo-cookie-consent'

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) setVisible(true)
  }, [])

  const dismiss = (choice: 'accepted' | 'rejected') => {
    localStorage.setItem(STORAGE_KEY, choice)
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[60] bg-black text-white px-4 py-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center gap-4 justify-between">
        <p className="text-sm text-gray-300">
          Usiamo cookie tecnici necessari al funzionamento del sito. Nessun dato viene condiviso con terze parti.
        </p>
        <div className="flex gap-3 shrink-0">
          <button
            onClick={() => dismiss('rejected')}
            className="border border-white/30 px-4 py-2 rounded-full text-sm font-semibold hover:bg-white/10 transition-colors"
          >
            Rifiuta
          </button>
          <button
            onClick={() => dismiss('accepted')}
            className="bg-red text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-red-dark transition-colors"
          >
            Accetta
          </button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Mount it in the root layout**

In `app/layout.tsx`, add the import:

```tsx
import CookieBanner from '@/components/layout/CookieBanner'
```

Add `<CookieBanner />` as the last element inside `<body>`, after `<Footer />`:

```tsx
        <Footer />
        <CookieBanner />
```

Note: the current `app/layout.tsx` renders `<AnnouncementBar />`, `<Navbar />`, `{children}`, and `<Footer />` directly (no `ChromeGate` wrapper exists yet — that's a later task in this plan). Just add the `CookieBanner` import and the `<CookieBanner />` element after the existing `<Footer />` line; do not restructure anything else in this file.

- [ ] **Step 3: Verify the build**

Run: `npx tsc --noEmit`
Expected: no errors

Run: `npm run build`
Expected: build succeeds

- [ ] **Step 4: Commit**

```bash
git add components/layout/CookieBanner.tsx app/layout.tsx
git commit -m "feat: add cookie consent banner"
```
