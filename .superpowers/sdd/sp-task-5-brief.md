### Task 5: Guida alle taglie page

**Files:**
- Create: `app/guida-alle-taglie/page.tsx`

**Interfaces:**
- None — standalone static page.

- [ ] **Step 1: Create the page**

Create `app/guida-alle-taglie/page.tsx`:

```tsx
export const metadata = { title: 'Guida alle taglie — Selleria Galazzo' }

export default function GuidaAlleTagliePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-black mb-2">
        Guida alle <em className="text-red">taglie</em>
      </h1>
      <p className="text-gray-400 mb-10">
        Misura con un metro da sarto e confronta i valori con le tabelle qui sotto per
        trovare la taglia perfetta.
      </p>

      <div className="space-y-12">
        <div>
          <h2 className="font-black text-xl mb-4">Abbigliamento cavaliere</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-black">
                  <th className="py-3 pr-4 font-black">Taglia</th>
                  <th className="py-3 pr-4 font-black">Torace (cm)</th>
                  <th className="py-3 font-black">Vita (cm)</th>
                </tr>
              </thead>
              <tbody className="text-gray-600">
                {[
                  ['XS', '82-86', '62-66'],
                  ['S', '87-91', '67-71'],
                  ['M', '92-97', '72-77'],
                  ['L', '98-104', '78-84'],
                  ['XL', '105-111', '85-91'],
                  ['XXL', '112-119', '92-99'],
                ].map(([size, chest, waist]) => (
                  <tr key={size} className="border-b border-gray-100">
                    <td className="py-3 pr-4 font-semibold text-black">{size}</td>
                    <td className="py-3 pr-4">{chest}</td>
                    <td className="py-3">{waist}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h2 className="font-black text-xl mb-4">Stivali</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-black">
                  <th className="py-3 pr-4 font-black">Taglia EU</th>
                  <th className="py-3 font-black">Lunghezza piede (cm)</th>
                </tr>
              </thead>
              <tbody className="text-gray-600">
                {[
                  ['36', '22.5'],
                  ['37', '23.2'],
                  ['38', '23.8'],
                  ['39', '24.5'],
                  ['40', '25.2'],
                  ['41', '25.8'],
                  ['42', '26.5'],
                  ['43', '27.2'],
                  ['44', '27.8'],
                  ['45', '28.5'],
                  ['46', '29.2'],
                ].map(([size, length]) => (
                  <tr key={size} className="border-b border-gray-100">
                    <td className="py-3 pr-4 font-semibold text-black">{size}</td>
                    <td className="py-3">{length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h2 className="font-black text-xl mb-4">Coperte per cavallo</h2>
          <p className="text-sm text-gray-600 mb-4">
            Misura la lunghezza del cavallo dal centro del petto alla punta della coda per
            individuare la taglia più adatta.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-black">
                  <th className="py-3 pr-4 font-black">Taglia (cm)</th>
                  <th className="py-3 font-black">Altezza al garrese indicativa</th>
                </tr>
              </thead>
              <tbody className="text-gray-600">
                {[
                  ['115', 'Pony (circa 130 cm)'],
                  ['125', 'Pony/cavallo piccolo (circa 145 cm)'],
                  ['135', 'Cavallo medio (circa 155 cm)'],
                  ['145', 'Cavallo grande (circa 165 cm)'],
                  ['155', 'Cavallo molto grande (oltre 170 cm)'],
                ].map(([size, height]) => (
                  <tr key={size} className="border-b border-gray-100">
                    <td className="py-3 pr-4 font-semibold text-black">{size}</td>
                    <td className="py-3">{height}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify the build**

Run: `npx tsc --noEmit`
Expected: no errors

Run: `npm run build`
Expected: build succeeds, new static route `○ /guida-alle-taglie` appears in the route list

- [ ] **Step 3: Commit**

```bash
git add app/guida-alle-taglie/page.tsx
git commit -m "feat: add guida alle taglie page"
```
