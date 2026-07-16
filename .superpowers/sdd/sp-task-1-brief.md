### Task 1: Contattaci page

**Files:**
- Create: `app/contattaci/page.tsx`

**Interfaces:**
- None — standalone static page.

- [ ] **Step 1: Create the page**

Create `app/contattaci/page.tsx`:

```tsx
import { MapPin, Phone, Mail, MessageCircle, ExternalLink } from 'lucide-react'

export const metadata = { title: 'Contattaci — Selleria Galazzo' }

export default function ContattaciPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-black mb-2">
        Contatta<em className="text-red">ci</em>
      </h1>
      <p className="text-gray-400 mb-10">
        Siamo a tua disposizione per qualsiasi domanda su prodotti, ordini e spedizioni.
      </p>

      <div className="grid sm:grid-cols-2 gap-6">
        <div className="bg-gray-light rounded-2xl p-6">
          <MapPin className="text-red mb-3" size={28} />
          <h2 className="font-black mb-1">Dove siamo</h2>
          <p className="text-sm text-gray-600">
            Selleria Galazzo di Biagio Galazzo<br />
            Via Vicario Savarino, 49<br />
            96019 Rosolini (SR), Italia
          </p>
        </div>

        <div className="bg-gray-light rounded-2xl p-6">
          <Phone className="text-red mb-3" size={28} />
          <h2 className="font-black mb-1">Telefono</h2>
          <p className="text-sm text-gray-600">+39 379 164 2334</p>
        </div>

        <div className="bg-gray-light rounded-2xl p-6">
          <MessageCircle className="text-red mb-3" size={28} />
          <h2 className="font-black mb-1">WhatsApp</h2>
          <p className="text-sm text-gray-600">335 638 3953</p>
        </div>

        <div className="bg-gray-light rounded-2xl p-6">
          <Mail className="text-red mb-3" size={28} />
          <h2 className="font-black mb-1">Email</h2>
          <p className="text-sm text-gray-600">info@selleriagalazzo.com</p>
        </div>
      </div>

      <div className="mt-10">
        <h2 className="font-black text-lg mb-4">Seguici</h2>
        <div className="flex flex-wrap gap-4">
          <a
            href="https://m.facebook.com/galazzoselleria/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 border-2 border-gray-200 rounded-full px-4 py-2 text-sm font-semibold hover:border-red hover:text-red transition-colors"
          >
            Facebook <ExternalLink size={14} />
          </a>
          <a
            href="https://instagram.com/selleriagalazzo/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 border-2 border-gray-200 rounded-full px-4 py-2 text-sm font-semibold hover:border-red hover:text-red transition-colors"
          >
            Instagram <ExternalLink size={14} />
          </a>
          <a
            href="https://tiktok.com/@selleria_galazzo/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 border-2 border-gray-200 rounded-full px-4 py-2 text-sm font-semibold hover:border-red hover:text-red transition-colors"
          >
            TikTok <ExternalLink size={14} />
          </a>
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
Expected: build succeeds, new static route `○ /contattaci` appears in the route list

- [ ] **Step 3: Commit**

```bash
git add app/contattaci/page.tsx
git commit -m "feat: add contattaci page with real contact info"
```
