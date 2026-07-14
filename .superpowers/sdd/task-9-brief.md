### Task 9: Checkout input polish

**Files:**
- Modify: `app/checkout/page.tsx`

**Interfaces:**
- None — attribute-only edits to existing `<input>` elements, no logic change.

- [ ] **Step 1: Add type/autoComplete attributes to the step-1 fields**

In `app/checkout/page.tsx`, replace:

```tsx
              <input placeholder="Email *" value={form.email} onChange={e => updateForm('email', e.target.value)} className={inputClass} />
              <div className="grid grid-cols-2 gap-4">
                <input placeholder="Nome *" value={form.nome} onChange={e => updateForm('nome', e.target.value)} className={inputClass} />
                <input placeholder="Cognome *" value={form.cognome} onChange={e => updateForm('cognome', e.target.value)} className={inputClass} />
              </div>
              <input placeholder="Indirizzo *" value={form.indirizzo} onChange={e => updateForm('indirizzo', e.target.value)} className={inputClass} />
              <div className="grid grid-cols-3 gap-4">
                <input placeholder="CAP *" value={form.cap} onChange={e => updateForm('cap', e.target.value)} className={inputClass} />
                <input placeholder="Città *" value={form.citta} onChange={e => updateForm('citta', e.target.value)} className={`${inputClass} col-span-2`} />
              </div>
```

with:

```tsx
              <input type="email" autoComplete="email" placeholder="Email *" value={form.email} onChange={e => updateForm('email', e.target.value)} className={inputClass} />
              <div className="grid grid-cols-2 gap-4">
                <input autoComplete="given-name" placeholder="Nome *" value={form.nome} onChange={e => updateForm('nome', e.target.value)} className={inputClass} />
                <input autoComplete="family-name" placeholder="Cognome *" value={form.cognome} onChange={e => updateForm('cognome', e.target.value)} className={inputClass} />
              </div>
              <input autoComplete="street-address" placeholder="Indirizzo *" value={form.indirizzo} onChange={e => updateForm('indirizzo', e.target.value)} className={inputClass} />
              <div className="grid grid-cols-3 gap-4">
                <input inputMode="numeric" autoComplete="postal-code" placeholder="CAP *" value={form.cap} onChange={e => updateForm('cap', e.target.value)} className={inputClass} />
                <input autoComplete="address-level2" placeholder="Città *" value={form.citta} onChange={e => updateForm('citta', e.target.value)} className={`${inputClass} col-span-2`} />
              </div>
```

- [ ] **Step 2: Add type/autoComplete attributes to the step-3 card fields**

Replace:

```tsx
                  <input placeholder="Numero carta *" className={inputClass} maxLength={19} />
                  <div className="grid grid-cols-2 gap-4">
                    <input placeholder="Scadenza MM/AA *" className={inputClass} />
                    <input placeholder="CVV *" className={inputClass} maxLength={4} />
                  </div>
                  <input placeholder="Nome sulla carta *" className={inputClass} />
```

with:

```tsx
                  <input inputMode="numeric" autoComplete="cc-number" placeholder="Numero carta *" className={inputClass} maxLength={19} />
                  <div className="grid grid-cols-2 gap-4">
                    <input autoComplete="cc-exp" placeholder="Scadenza MM/AA *" className={inputClass} />
                    <input inputMode="numeric" autoComplete="cc-csc" placeholder="CVV *" className={inputClass} maxLength={4} />
                  </div>
                  <input autoComplete="cc-name" placeholder="Nome sulla carta *" className={inputClass} />
```

- [ ] **Step 3: Verify the build**

Run: `npx tsc --noEmit`
Expected: no errors

Run: `npm run build`
Expected: build succeeds

- [ ] **Step 4: Commit**

```bash
git add app/checkout/page.tsx
git commit -m "feat: add autocomplete and input-mode attributes to checkout form"
```
