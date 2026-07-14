### Task 11: Distraction-free checkout layout

**Files:**
- Create: `components/layout/ChromeGate.tsx`
- Modify: `app/layout.tsx`

**Interfaces:**
- Consumes: `AnnouncementBar` (existing, `components/layout/AnnouncementBar.tsx`, no props), `Navbar` (existing, `components/layout/Navbar.tsx`, no props), `Footer` (existing, `components/layout/Footer.tsx`, no props).
- Produces: `ChromeGate({ children: React.ReactNode })` — a client component that decides which chrome to render based on the current route; imported once, by `app/layout.tsx`.

- [ ] **Step 1: Create ChromeGate**

Create `components/layout/ChromeGate.tsx`:

```tsx
'use client'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Lock } from 'lucide-react'
import AnnouncementBar from './AnnouncementBar'
import Navbar from './Navbar'
import Footer from './Footer'

const MINIMAL_CHROME_PATHS = ['/checkout', '/checkout/success']

export default function ChromeGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const minimal = MINIMAL_CHROME_PATHS.includes(pathname)

  if (minimal) {
    return (
      <>
        <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <Link href="/" className="relative h-10 w-[93px]">
              <Image src="/logo-selleria-galazzo.png" alt="Selleria Galazzo" fill className="object-contain object-left" priority />
            </Link>
            <span className="flex items-center gap-2 text-xs font-semibold text-gray-500">
              <Lock size={14} />
              Pagamento sicuro
            </span>
          </div>
        </div>
        <main className="pt-16">{children}</main>
      </>
    )
  }

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50">
        <AnnouncementBar />
        <Navbar />
      </div>
      <main className="pt-24">{children}</main>
      <Footer />
    </>
  )
}
```

- [ ] **Step 2: Route layout.tsx through ChromeGate**

The current `app/layout.tsx` (after Task 8 added the `CookieBanner`) is:

```tsx
import type { Metadata } from 'next'
import './globals.css'
import AnnouncementBar from '@/components/layout/AnnouncementBar'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import CookieBanner from '@/components/layout/CookieBanner'

export const metadata: Metadata = {
  title: 'Selleria Galazzo — Articoli Equestri Online',
  description: 'Selleria online specializzata in articoli per equitazione, monta inglese, western e prodotti per la scuderia.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body className="antialiased">
        <div className="fixed top-0 left-0 right-0 z-50">
          <AnnouncementBar />
          <Navbar />
        </div>
        <main className="pt-24">{children}</main>
        <Footer />
        <CookieBanner />
      </body>
    </html>
  )
}
```

Replace the full contents of `app/layout.tsx` with:

```tsx
import type { Metadata } from 'next'
import './globals.css'
import ChromeGate from '@/components/layout/ChromeGate'
import CookieBanner from '@/components/layout/CookieBanner'

export const metadata: Metadata = {
  title: 'Selleria Galazzo — Articoli Equestri Online',
  description: 'Selleria online specializzata in articoli per equitazione, monta inglese, western e prodotti per la scuderia.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body className="antialiased">
        <ChromeGate>{children}</ChromeGate>
        <CookieBanner />
      </body>
    </html>
  )
}
```

(`CookieBanner` stays a direct sibling of `ChromeGate` inside `<body>` — not moved inside `ChromeGate` — so it renders on every route including `/checkout`.)

- [ ] **Step 3: Verify the build**

Run: `npx tsc --noEmit`
Expected: no errors

Run: `npm run build`
Expected: build succeeds, full page count unchanged from before this task (checkout is not a `generateStaticParams` route so no page-count change here), `/checkout` and `/checkout/success` routes still present in output.

- [ ] **Step 4: Commit**

```bash
git add components/layout/ChromeGate.tsx app/layout.tsx
git commit -m "feat: hide full navbar/footer on checkout for a distraction-free layout"
```
