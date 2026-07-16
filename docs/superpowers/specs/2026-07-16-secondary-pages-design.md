# Secondary Pages (Contattaci, Spedizioni, Resi, FAQ, Guida Taglie) — Design Spec

**Date:** 2026-07-16
**Status:** Approved

## Context

The Footer's "Assistenza" section has always linked five pages with
`href="#"` (dead links): Contattaci, Spedizioni, Resi e rimborsi, FAQ,
Guida alle taglie. An earlier round of this project deferred building
them, planning to pull real content from selleriagalazzo.com. The client
has now asked to build all five, using real content where recoverable
from the live site and plausible fabricated content everywhere else.

**Real content recovered from selleriagalazzo.com** (fetched live):
- Company: "Selleria Galazzo di Biagio Galazzo"
- Address: Via Vicario Savarino, 49 — 96019 Rosolini (SR), Italia
- Phone: +39 379 164 2334
- WhatsApp: 335 638 3953
- Email: info@selleriagalazzo.com
- P.IVA: 02144600893 (the Footer currently shows a placeholder
  "P.IVA 00000000000" — corrected as part of this work, since the real
  number is now known and lives in the same file being touched)
- Social: Facebook (m.facebook.com/galazzoselleria), Instagram
  (instagram.com/selleriagalazzo), TikTok (@selleria_galazzo)
- Return policy: the real Termini e Condizioni page states a 14-day
  right of withdrawal from receipt of goods, exercised by contacting
  info@selleriagalazzo.com

**Not found on the real site — no dedicated pages exist for shipping,
FAQ, or size guide.** For these, and for the parts of the return policy
the real site doesn't spell out (how-to steps, condition requirements,
refund timing), this spec uses plausible fabricated content, explicitly
flagged below.

## Decisions

### `/contattaci` — real content only

Company name, address, phone, WhatsApp, email, and social links exactly
as recovered above. No contact form (out of scope — the site has no
backend to receive submissions, and the client didn't ask for one).

### `/spedizioni` — reuses the mockup's own established numbers + fabricated detail

No real shipping page exists to source from. Rather than inventing new
numbers that would contradict the rest of the site, this page states the
shipping terms already shown consistently elsewhere in this mockup
(`AnnouncementBar`, `TrustSection`, `CartSummary`, `app/checkout/page.tsx`):
standard shipping free above €80 / €5.90 otherwise / 3-5 business days;
express €9.90 / 1-2 business days. Fabricated but clearly labeled as such
in this spec: tracking-email-on-dispatch, Italy-only delivery, and a
short packaging blurb — plausible, generic e-commerce boilerplate, not
attributed to the client as fact.

### `/resi-e-rimborsi` — real 14-day policy + fabricated procedural detail

States the real 14-day right of withdrawal and the real contact email.
Fabricated: step-by-step return instructions, condition requirements
(unused, original packaging/tags), who pays return shipping (customer,
unless the item is defective), and refund timing (5-10 business days
after the returned item is received) — standard, plausible e-commerce
terms, not claimed as verified facts from the client.

### `/faq` — fully fabricated

No real FAQ exists. ~9 question/answer pairs grouped into 3 categories
(Ordini, Spedizioni e Resi, Prodotti), covering common
equestrian-retailer questions (payment methods, order tracking, sizing
help, product authenticity, wholesale/business inquiries). Rendered as
an accordion (`'use client'`, local `useState` for which item is open) —
this page is the only consumer of this pattern, so it stays inline
rather than becoming a shared component (matches this codebase's
established YAGNI stance, e.g. `ProductTabs`).

### `/guida-alle-taglie` — fully fabricated

No real size guide exists. Three plausible sizing tables matching what
this catalog actually sells (verified against `data/products.json`
categories): abbigliamento cavaliere (S–XXL with chest/waist cm),
stivali (EU sizing 36–46), coperte cavallo (measured in cm, 115–155).

### Footer link wiring

`components/layout/Footer.tsx`'s "Assistenza" list currently maps five
label strings to `<a href="#">`. Each becomes a `<Link>` (already
imported in this file) to its real route:
`/contattaci`, `/spedizioni`, `/resi-e-rimborsi`, `/faq`,
`/guida-alle-taglie`. The bottom-bar "P.IVA 00000000000" text is updated
to the real "P.IVA 02144600893".

## Component/Route Changes

- `app/contattaci/page.tsx` (new)
- `app/spedizioni/page.tsx` (new)
- `app/resi-e-rimborsi/page.tsx` (new)
- `app/faq/page.tsx` (new)
- `app/guida-alle-taglie/page.tsx` (new)
- `components/layout/Footer.tsx`: Assistenza links wired, P.IVA corrected.

All five pages follow the existing page-header convention already used
by `/marche`, `/guida-ai-prodotti`, etc.:
`max-w-{2xl,3xl,4xl} mx-auto px-4 sm:px-6 lg:px-8 py-10/16`,
`<h1 className="text-4xl font-black mb-{2,8}">Title <em className="text-red">emphasis</em></h1>`.

## Out of Scope

- Privacy Policy, Cookie Policy (separate bottom-bar links, not part of
  this request).
- A working contact form or any backend submission handling.
- Multi-language content — Italian only, matching the rest of the site.
