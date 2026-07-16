### Task 2: Extract GUIDE_LINKS and fix the Navbar link

**Files:**
- Create: `lib/guide-links.ts`
- Modify: `components/layout/Navbar.tsx`

**Interfaces:**
- Produces: `GUIDE_LINKS: { label: string; href: string }[]` from `lib/guide-links.ts`, consumed by `components/layout/Navbar.tsx` (this task) and `app/guida-ai-prodotti/page.tsx` (next task).

- [ ] **Step 1: Create the shared constant**

Create `lib/guide-links.ts`:

```ts
export interface GuideLink {
  label: string
  href: string
}

export const GUIDE_LINKS: GuideLink[] = [
  { label: 'Cura del cavallo', href: '/shop/scuderia/cura-del-cavallo' },
  { label: 'Cura del cuoio', href: '/shop/scuderia/cura-del-cuoio' },
  { label: 'Attrezzatura da scuderia', href: '/shop/scuderia/attrezzatura-da-scuderia' },
  { label: 'Selle e accessori (Inglese)', href: '/shop/monta-inglese/cavallo/selle-e-accessori' },
  { label: 'Coperte', href: '/shop/monta-inglese/cavallo/coperte' },
  { label: 'Protezioni', href: '/shop/monta-inglese/cavallo/protezioni' },
  { label: 'Selle e accessori (Western)', href: '/shop/monta-western/cavallo/selle-e-accessori' },
  { label: 'Briglie e accessori', href: '/shop/monta-inglese/cavallo/briglie-e-accessori' },
]
```

- [ ] **Step 2: Remove the local constant from Navbar.tsx and import the shared one**

In `components/layout/Navbar.tsx`, remove this block entirely:

```tsx
const GUIDE_LINKS = [
  { label: 'Cura del cavallo', href: '/shop/scuderia/cura-del-cavallo' },
  { label: 'Cura del cuoio', href: '/shop/scuderia/cura-del-cuoio' },
  { label: 'Attrezzatura da scuderia', href: '/shop/scuderia/attrezzatura-da-scuderia' },
  { label: 'Selle e accessori (Inglese)', href: '/shop/monta-inglese/cavallo/selle-e-accessori' },
  { label: 'Coperte', href: '/shop/monta-inglese/cavallo/coperte' },
  { label: 'Protezioni', href: '/shop/monta-inglese/cavallo/protezioni' },
  { label: 'Selle e accessori (Western)', href: '/shop/monta-western/cavallo/selle-e-accessori' },
  { label: 'Briglie e accessori', href: '/shop/monta-inglese/cavallo/briglie-e-accessori' },
]
```

Add this import alongside the other `lib/` imports at the top of the file:

```tsx
import { GUIDE_LINKS } from '@/lib/guide-links'
```

- [ ] **Step 3: Turn the "Guida ai prodotti" span into a real link**

Replace:

```tsx
          <div className="group relative">
            <span className="text-sm font-medium text-black h-12 inline-flex items-center cursor-default">
              Guida ai prodotti
            </span>
            <div className="absolute right-0 top-full hidden group-hover:block bg-white shadow-lg rounded-xl p-6 z-50 w-64">
```

with:

```tsx
          <div className="group relative">
            <Link href="/guida-ai-prodotti" className="text-sm font-medium text-black hover:text-red transition-colors h-12 inline-flex items-center">
              Guida ai prodotti
            </Link>
            <div className="absolute right-0 top-full hidden group-hover:block bg-white shadow-lg rounded-xl p-6 z-50 w-64">
```

(`Link` is already imported in this file; the flyout content below this block — the `GUIDE_LINKS.map(...)` — is unchanged.)

- [ ] **Step 4: Verify the build**

Run: `npx tsc --noEmit`
Expected: no errors

Run: `npm run build`
Expected: build succeeds

- [ ] **Step 5: Commit**

```bash
git add lib/guide-links.ts components/layout/Navbar.tsx
git commit -m "feat: extract GUIDE_LINKS and make Guida ai prodotti a real link"
```
