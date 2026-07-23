# Cart & Checkout Trust Redesign — Design Spec

**Round 3 of 3** (this batch: Nav & Home redesign — done, Category page SEO description — done, Cart & Checkout trust redesign — this spec).

## Goal

Add trust elements (delivery/security/return bullets, payment-method badges) to the cart, matching the client's reference screenshot, and convert checkout from a 3-step wizard into a single scrollable page with the same trust treatment — display-only, no real payment integration.

## Decisions from Q&A

- Trust elements go in both the full `/cart` page (`CartSummary.tsx`) and the slide-in `CartDrawer.tsx` (a condensed version — payment badges only, no bullet list, given the drawer's narrow width).
- lucide-react has no brand icons (confirmed project-wide constraint). Payment-method marks are rendered as small colored CSS badges with the brand name as text — no external logo assets are downloaded or embedded.
- A new shared component and data file are introduced since both cart and checkout consume the same badge set: `lib/payment-methods.ts` (data) + `components/shared/PaymentBadges.tsx` (presentational, takes a subset of method ids to render).
- Checkout's 3-step wizard (`CheckoutSteps.tsx` + `step` state in `app/checkout/page.tsx`) is replaced by a single page: all three sections (Contatti e indirizzo / Metodo di spedizione / Pagamento) render stacked and always visible, one "Conferma ordine" button at the bottom. `CheckoutSteps.tsx` is deleted (no longer used anywhere).
- "Promo qualifier" (from the original request) is now-clarified as: spedizione gratuita, pagamenti sicuri, certificato SSL, reso entro 14 giorni — the same 4-point trust list already used elsewhere on the site (hero trust strip, from Round 1). This list is added to `OrderSummary.tsx` (the checkout sidebar), alongside a wider payment-badge row (Klarna, Apple Pay, Google Pay, Visa, Mastercard, Amex) reflecting the payment methods checkout already claims to support.

## Payment badges

`lib/payment-methods.ts` exports a typed list of payment methods, each with just `id` and `label`:

| id | label |
|---|---|
| visa | VISA |
| mastercard | Mastercard |
| paypal | PayPal |
| amex | Amex |
| maestro | Maestro |
| klarna | Klarna |
| applepay | Apple Pay |
| googlepay | Google Pay |

The Tailwind style classes per method (bg/text colors — `visa: bg-[#1A1F71] text-white`, `mastercard: bg-black text-white`, `paypal: bg-[#003087] text-white`, `amex: bg-[#006FCF] text-white`, `maestro: bg-[#0099DF] text-white`, `klarna: bg-[#FFB3C7] text-black`, `applepay: bg-black text-white`, `googlepay: bg-white text-black border border-gray-200`) live in `components/shared/PaymentBadges.tsx` itself, **not** in `lib/payment-methods.ts` — `tailwind.config.ts`'s `content` globs only scan `./pages/**`, `./components/**`, `./app/**` (not `./lib/**`), so any Tailwind class string placed in a `lib/` file would be silently purged from the production CSS build. Keeping the class strings inside the component file (already covered by the `./components/**` glob) avoids that bug entirely, no config change needed.

`PaymentBadges` renders a `flex flex-wrap gap-2` row of small rounded-pill badges from a list of method ids passed in as a prop — cart uses `['visa','mastercard','paypal','amex','maestro']` (5, matching the reference screenshot exactly), checkout uses `['klarna','applepay','googlepay','visa','mastercard','amex']` (6, matching the broader "Klarna, Apple Pay, Google Pay, Visa, Mastercard, Amex" from the original request).

## Cart placement

- `CartSummary.tsx` (full `/cart` page): a 3-line bullet list ("Consegna a domicilio disponibile", "Pagamento sicuro SSL", "Reso entro 14 giorni") between the total and the "Procedi al checkout" button, then below the button a "Pagamento sicuro e protetto" caption + the 5-badge `PaymentBadges` row — matching the reference screenshot's layout order.
- `CartDrawer.tsx`: just the `PaymentBadges` row (5 methods, same set as the cart page) added below the existing CTA buttons, no bullet list (narrow width, avoid clutter).

## Checkout redesign

`app/checkout/page.tsx`: remove the `step` state and `CheckoutSteps` import/render. All three existing section bodies (contact/address fields, shipping-method radios, payment-method radios + conditional fields) render in sequence, unconditionally, each under its own `<h2>`. The three inter-section "Continua →" / "← Indietro" button pairs are removed; a single "Conferma ordine" button (the existing final-step submit handler: `clearCart()` + redirect to `/checkout/success`) appears once, at the very end of the form.

`components/checkout/OrderSummary.tsx`: gains the same 4-point trust list used in the Round 1 hero trust strip (spedizione gratuita sopra €80, pagamento sicuro SSL, reso entro 14 giorni, paga in 3 rate con Klarna — reusing the exact copy already established, not new claims) plus a `PaymentBadges` row with the 6-method checkout set, placed below the existing totals block.

`components/checkout/CheckoutSteps.tsx` is deleted (`git rm`) — its only consumer (`app/checkout/page.tsx`) stops importing it in this same change.

## Out of scope

- Any real payment gateway integration — badges are static, display-only, exactly as the current mocked payment-method radios already are.
- Changing the underlying form fields, validation, or the shipping/payment option lists themselves — only the step-gating UI and the trust/badge additions.
- Cart page's coupon-code field, quantity controls, or any other existing cart/checkout functionality not explicitly mentioned above.
