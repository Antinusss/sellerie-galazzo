### Task 6: Wire Footer Assistenza links and fix P.IVA

**Files:**
- Modify: `components/layout/Footer.tsx`

**Interfaces:**
- Consumes: the five routes created in Tasks 1-5 (`/contattaci`, `/spedizioni`, `/resi-e-rimborsi`, `/faq`, `/guida-alle-taglie`).

- [ ] **Step 1: Replace the Assistenza dead links with real routes**

In `components/layout/Footer.tsx`, replace:

```tsx
          <div>
            <h4 className="font-bold mb-4 text-sand">Assistenza</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              {['Contattaci', 'Spedizioni', 'Resi e rimborsi', 'FAQ', 'Guida alle taglie'].map(l => (
                <li key={l}><a href="#" className="hover:text-white transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>
```

with:

```tsx
          <div>
            <h4 className="font-bold mb-4 text-sand">Assistenza</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              {[
                { label: 'Contattaci', href: '/contattaci' },
                { label: 'Spedizioni', href: '/spedizioni' },
                { label: 'Resi e rimborsi', href: '/resi-e-rimborsi' },
                { label: 'FAQ', href: '/faq' },
                { label: 'Guida alle taglie', href: '/guida-alle-taglie' },
              ].map(l => (
                <li key={l.href}><Link href={l.href} className="hover:text-white transition-colors">{l.label}</Link></li>
              ))}
            </ul>
          </div>
```

(`Link` is already imported at the top of this file.)

- [ ] **Step 2: Fix the placeholder P.IVA**

Replace:

```tsx
            <a href="#" className="hover:text-white transition-colors">P.IVA 00000000000</a>
```

with:

```tsx
            <span>P.IVA 02144600893</span>
```

- [ ] **Step 3: Verify the build**

Run: `npx tsc --noEmit`
Expected: no errors

Run: `npm run build`
Expected: build succeeds

- [ ] **Step 4: Commit**

```bash
git add components/layout/Footer.tsx
git commit -m "feat: wire footer assistenza links to real pages, fix placeholder P.IVA"
```
