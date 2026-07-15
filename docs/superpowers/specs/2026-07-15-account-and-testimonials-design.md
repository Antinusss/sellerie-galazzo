# Account Emulation + Home Testimonials Carousel — Design Spec

**Date:** 2026-07-15
**Status:** Approved

## Context

Client asked to "emulate the account part" (previously excluded from the
CRO checklist batch as not applicable, since this mockup has no backend or
auth system) and to add a fake reviews carousel to the home page. Design
specifics delegated to the assistant ("generale tu").

No account infrastructure exists at all today (`grep` for
account/login/register across `app/`, `components/`, `lib/` returns
nothing).

## Decisions

### Account emulation

Entirely client-side, no real backend, same philosophy as the existing
cart/wishlist stores and the mock payment methods already on the checkout
page (Klarna/PayPal/Bonifico are equally unreal — this is consistent with
established mockup conventions, not a new exception).

- `lib/auth-store.ts` (new): Zustand + `persist` store, same shape family
  as `lib/wishlist-store.ts`. Holds `user: { name: string; email: string }
  | null`. Actions: `login(email: string, password: string): void`
  (accepts any non-empty input, sets `user` from the email — no password
  is stored or checked, matching the "no real backend" scope),
  `register(nome: string, cognome: string, email: string, password:
  string): void` (sets `user = { name: `${nome} ${cognome}`, email }`),
  `logout(): void` (sets `user = null`). `persist` key
  `selleria-galazzo-auth`.
- `app/account/login/page.tsx` (new): email + password inputs, "Accedi"
  button calling `login`, then `router.push('/account')`. Link to
  `/account/register` for users without an account.
- `app/account/register/page.tsx` (new): nome, cognome, email, password
  inputs, "Crea account" button calling `register`, then
  `router.push('/account')`. Link to `/account/login`.
- `app/account/page.tsx` (new): client component. If `user` is `null`,
  redirect to `/account/login` (`useEffect` + `router.push`). Otherwise
  shows: a greeting ("Ciao, {name}"), a read-only "I tuoi dati" section
  (name + email, no edit form — out of scope, nothing to persist it to),
  an "I tuoi ordini" section with an empty state ("Non hai ancora
  effettuato ordini" + a CTA to `/shop` — this mockup does not persist
  completed orders anywhere, so a real order history is out of scope), a
  link to `/wishlist`, and an "Esci" button calling `logout` then
  redirecting to `/`.
- `components/layout/Navbar.tsx`: add a `User` icon (Lucide) between the
  existing wishlist heart and cart icons, linking to `/account` if a user
  is logged in, `/account/login` otherwise. No count badge (unlike
  cart/wishlist, there's nothing to count).
- Cart and wishlist state are unaffected by login/logout — both already
  persist independently per-browser, and a real e-commerce guest cart
  survives login too.

### Home testimonials carousel

Reuses the existing deterministic fake-review data (`lib/reviews.ts`,
already an approved synthetic-data exception) rather than inventing a
second fabricated-text pool — pulls the first sample review from each of
the 8 bestseller products (same product-id list `BestsellersSection`
already computes by ranking on `getReviewSummary(id).count`), stripped of
any product reference, and displays them as generic site testimonials
(author, star rating, text, relative date).

- `components/home/TestimonialsCarousel.tsx` (new): client component.
  Computes its 8 testimonials the same way `BestsellersSection` computes
  its product list (ranks `data/products.json` by
  `getReviewSummary(id).count`, takes the top 8, maps each to
  `getReviewSummary(id).reviews[0]`). Renders one testimonial card
  centered at a time with author, a 5-star row (filled up to the
  review's rating), the review text, and the relative date. Auto-advances
  every 5 seconds (`useEffect` + `setInterval`, paused while a manual
  interaction is pending is out of scope — YAGNI for a mockup carousel);
  previous/next arrow buttons allow manual navigation and reset the
  auto-advance timer only implicitly (moving to the next tick naturally
  on the existing interval — no explicit pause/resume state, keeping the
  component simple).
- Wired into `app/page.tsx` between `TrustSection` and `BrandCarousel`.

## Data Layer

- `lib/auth-store.ts`: `useAuthStore(): { user: {name,email}|null; login(email,password): void; register(nome,cognome,email,password): void; logout(): void }`.
  Pure Zustand store, no async, no network — no dedicated Jest suite
  needed beyond what mirrors `wishlist-store.test.ts`'s coverage (this
  spec follows the plan's task breakdown for exact test cases).

## Component/Route Changes

- `app/account/login/page.tsx`, `app/account/register/page.tsx`,
  `app/account/page.tsx` (new routes).
- `components/layout/Navbar.tsx`: new `User` icon/link.
- `components/home/TestimonialsCarousel.tsx` (new).
- `app/page.tsx`: wires in the new carousel.

## Out of Scope

- Any real authentication, password hashing, session tokens, or backend
  of any kind.
- Editing account details (name/email) after registration.
- Persisted order history — the checkout success page already exists but
  writes nothing to any store; building real order persistence is a
  separate, larger feature not requested here.
- Password reset / "forgot password" flow.
- Social login (Google/Facebook/Apple).
- Carousel autoplay pause-on-hover or swipe gestures — manual arrows are
  sufficient for a mockup.
