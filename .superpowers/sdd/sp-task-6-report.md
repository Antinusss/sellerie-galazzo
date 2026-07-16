# Task 6 Report: Wire Footer Assistenza links and fix P.IVA

## What was done

Applied the two exact edits from `.superpowers/sdd/sp-task-6-brief.md` to `components/layout/Footer.tsx`, and only those two edits — no other part of the file was touched (Shop links, logo/social icons, Newsletter form, "Torna su" button, and the rest of the bottom bar remain unchanged).

1. **Assistenza list**: Replaced the array-of-strings mapping to `<a href="#">` dead links with an array of `{ label, href }` objects mapping to `<Link href={l.href}>`, pointing at the five real routes:
   - `/contattaci`
   - `/spedizioni`
   - `/resi-e-rimborsi`
   - `/faq`
   - `/guida-alle-taglie`

   `Link` was already imported at the top of the file (`import Link from 'next/link'`), so no import changes were needed.

2. **P.IVA fix**: Replaced `<a href="#" className="hover:text-white transition-colors">P.IVA 00000000000</a>` with `<span>P.IVA 02144600893</span>`.

## Build verification

`npx tsc --noEmit` — completed with no output, no errors.

`npm run build` — succeeded:

```
▲ Next.js 14.2.35
 ✓ Compiled successfully
   Linting and checking validity of types ...
   Collecting page data ...
 ✓ Generating static pages (3274/3274)
   Finalizing page optimization ...
   Collecting build traces ...
```

All five Assistenza routes (`/contattaci`, `/spedizioni`, `/resi-e-rimborsi`, `/faq`, `/guida-alle-taglie`) appear in the build's route table as static pages, confirming they build correctly and are now linked.

## Commit

- `5c95adc5ea73195ee1accd6ccae04b87f9cda70a` — "feat: wire footer assistenza links to real pages, fix placeholder P.IVA"
  - 1 file changed: `components/layout/Footer.tsx` (+9/-3)

Not pushed to any remote, per instructions.
