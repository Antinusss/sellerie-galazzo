### Task 9: Payment methods at checkout

**Files:**
- Modify: `app/checkout/page.tsx`

- [ ] **Step 1: Add payment-method state**

Change:

```tsx
  const [step, setStep] = useState<Step>(1)
  const [form, setForm] = useState({ email: '', nome: '', cognome: '', indirizzo: '', cap: '', citta: '', shipping: 'standard' })
```

to:

```tsx
  const [step, setStep] = useState<Step>(1)
  const [form, setForm] = useState({ email: '', nome: '', cognome: '', indirizzo: '', cap: '', citta: '', shipping: 'standard' })
  const [payment, setPayment] = useState('card')
```

- [ ] **Step 2: Replace the step-3 block**

Change:

```tsx
          {step === 3 && (
            <div className="space-y-5">
              <h2 className="text-2xl font-black">Pagamento</h2>
              <div className="bg-gray-light rounded-xl p-4 text-xs text-gray-400 flex items-center gap-2">
                🔒 Connessione sicura — I tuoi dati sono protetti con crittografia SSL
              </div>
              <input placeholder="Numero carta *" className={inputClass} maxLength={19} />
              <div className="grid grid-cols-2 gap-4">
                <input placeholder="Scadenza MM/AA *" className={inputClass} />
                <input placeholder="CVV *" className={inputClass} maxLength={4} />
              </div>
              <input placeholder="Nome sulla carta *" className={inputClass} />
              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(2)} className="flex-1 border-2 border-black py-4 rounded-full font-bold hover:bg-black hover:text-white transition-colors">
                  ← Indietro
                </button>
                <button
                  onClick={() => { clearCart(); router.push('/checkout/success') }}
                  className="flex-1 bg-red text-white py-4 rounded-full font-bold hover:bg-red-dark transition-colors"
                >
                  Conferma ordine
                </button>
              </div>
            </div>
          )}
```

to:

```tsx
          {step === 3 && (
            <div className="space-y-5">
              <h2 className="text-2xl font-black">Pagamento</h2>
              <div className="bg-gray-light rounded-xl p-4 text-xs text-gray-400 flex items-center gap-2">
                🔒 Connessione sicura — I tuoi dati sono protetti con crittografia SSL
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'card', label: 'Carta di credito/debito' },
                  { id: 'paypal', label: 'PayPal' },
                  { id: 'klarna', label: 'Klarna — Paga a rate' },
                  { id: 'bonifico', label: 'Bonifico bancario' },
                ].map(opt => (
                  <label
                    key={opt.id}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                      payment === opt.id ? 'border-red bg-red/5' : 'border-gray-200 hover:border-sand'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={opt.id}
                      checked={payment === opt.id}
                      onChange={() => setPayment(opt.id)}
                      className="accent-red"
                    />
                    <span className="font-semibold text-sm">{opt.label}</span>
                  </label>
                ))}
              </div>

              {payment === 'card' && (
                <>
                  <input placeholder="Numero carta *" className={inputClass} maxLength={19} />
                  <div className="grid grid-cols-2 gap-4">
                    <input placeholder="Scadenza MM/AA *" className={inputClass} />
                    <input placeholder="CVV *" className={inputClass} maxLength={4} />
                  </div>
                  <input placeholder="Nome sulla carta *" className={inputClass} />
                </>
              )}
              {payment === 'paypal' && (
                <p className="text-sm text-gray-600 bg-gray-light rounded-xl p-4">
                  Verrai reindirizzato a PayPal per completare il pagamento in sicurezza.
                </p>
              )}
              {payment === 'klarna' && (
                <p className="text-sm text-gray-600 bg-gray-light rounded-xl p-4">
                  Paga in 3 rate senza interessi o tra 30 giorni con Klarna. Verrai reindirizzato a Klarna per completare l&apos;acquisto.
                </p>
              )}
              {payment === 'bonifico' && (
                <p className="text-sm text-gray-600 bg-gray-light rounded-xl p-4">
                  Riceverai le coordinate bancarie via email per completare il bonifico. L&apos;ordine sarà spedito alla ricezione del pagamento.
                </p>
              )}

              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(2)} className="flex-1 border-2 border-black py-4 rounded-full font-bold hover:bg-black hover:text-white transition-colors">
                  ← Indietro
                </button>
                <button
                  onClick={() => { clearCart(); router.push('/checkout/success') }}
                  className="flex-1 bg-red text-white py-4 rounded-full font-bold hover:bg-red-dark transition-colors"
                >
                  Conferma ordine
                </button>
              </div>
            </div>
          )}
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: zero errors

- [ ] **Step 4: Verify with the dev server**

Run: `npm run dev` (in background), then:

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/checkout
```

Expected: `200`. Note: the payment-method selector only renders once a user has clicked through to step 3 (`step === 3` is client-side React state, not a URL — there's nothing for `curl` to inspect there), so this step only confirms the page itself still loads. The actual selector behavior is verified interactively in Task 10's browser pass. Stop the dev server after checking.

- [ ] **Step 5: Commit**

```bash
git add app/checkout/page.tsx
git commit -m "feat: add PayPal/Klarna/bank-transfer payment options to checkout"
```

---

