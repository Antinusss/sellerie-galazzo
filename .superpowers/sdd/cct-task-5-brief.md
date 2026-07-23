### Task 5: Full build + test + manual verification

**Files:** None (verification only).

- [ ] **Step 1: Full automated check**

Run: `npx tsc --noEmit && npm test && npm run build`
Expected: no type errors, all tests pass, build succeeds, `/checkout` and `/cart` routes both present.

- [ ] **Step 2: Manual browser verification**

Start the production server (`npm run start`, port 3000), add at least one product to the cart, and check:

1. `/cart`: the order-summary box shows the 3 trust bullets (Consegna a domicilio / Pagamento sicuro SSL / Reso entro 14 giorni) between the total and the "Procedi al checkout" button, then below the button a "Pagamento sicuro e protetto" caption and 5 colored payment badges (VISA, Mastercard, PayPal, Amex, Maestro) — confirm each badge renders with its distinct background color (not unstyled/transparent — this is the specific Tailwind-purge risk called out in Global Constraints).
2. Open the cart drawer (cart icon in the navbar): confirm the same 5 payment badges appear below the two CTA buttons, correctly colored.
3. `/checkout`: confirm there is no step indicator/stepper at the top, and all three sections (Contatti e indirizzo, Metodo di spedizione, Pagamento) are visible on the page at once without needing to click "Continua". Fill in the contact fields, pick a shipping option, pick a payment option, and confirm the conditional payment sub-fields (card number / PayPal note / Klarna note / bonifico note) still switch correctly when you change the payment radio.
4. On `/checkout`, confirm the order-summary sidebar shows the 4 trust bullets (spedizione gratuita sopra €80, pagamento sicuro SSL, reso entro 14 giorni, paga in 3 rate con Klarna) and the wider 6-badge payment row (Klarna, Apple Pay, Google Pay, Visa, Mastercard, Amex), all correctly colored.
5. Click "Conferma ordine" on `/checkout`: confirm it still clears the cart and navigates to `/checkout/success` (unchanged behavior from before this plan).
6. Browser console: no errors on `/cart` or `/checkout`.

- [ ] **Step 3: Record findings**

If any check in Step 2 fails, fix it before proceeding — do not mark this task complete with a known-broken interaction.
