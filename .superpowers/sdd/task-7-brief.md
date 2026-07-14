### Task 7: Branded 404 page

**Files:**
- Create: `app/not-found.tsx`

**Interfaces:**
- None — standalone Next.js special file, no props.

- [ ] **Step 1: Create the 404 page**

Create `app/not-found.tsx`:

```tsx
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-24 text-center">
      <p className="text-sand font-black text-sm uppercase tracking-widest mb-4">Errore 404</p>
      <h1 className="text-4xl md:text-5xl font-black mb-4">
        Pagina <em className="text-red">non trovata</em>
      </h1>
      <p className="text-gray-400 mb-10">
        La pagina che cerchi non esiste più o è stata spostata. Torna allo shop per continuare
        a curiosare tra i nostri prodotti.
      </p>
      <Link
        href="/shop"
        className="inline-block bg-red text-white px-8 py-4 rounded-full font-bold hover:bg-red-dark transition-colors"
      >
        Vai allo shop
      </Link>
    </div>
  )
}
```

- [ ] **Step 2: Verify the build**

Run: `npx tsc --noEmit`
Expected: no errors

Run: `npm run build`
Expected: build succeeds, `/_not-found` route present in output (already listed today as a default Next.js route — this replaces its content, not its path)

- [ ] **Step 3: Commit**

```bash
git add app/not-found.tsx
git commit -m "feat: add branded 404 page"
```
