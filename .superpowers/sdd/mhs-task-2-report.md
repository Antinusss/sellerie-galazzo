# Task 2 Report: Extract GUIDE_LINKS and fix the Navbar link

## What was done

1. Created `lib/guide-links.ts` with the `GuideLink` interface and the `GUIDE_LINKS` array (8 entries), copied verbatim from the brief.
2. Modified `components/layout/Navbar.tsx` with exactly the three edits specified in the brief:
   - Added `import { GUIDE_LINKS } from '@/lib/guide-links'` alongside the other `lib/` imports (after the `BRANCH_IMAGES` import, before `HeaderSearchBar`).
   - Removed the local `const GUIDE_LINKS = [...]` array (8-entry block) that previously lived above `export default function Navbar()`.
   - Replaced the non-clickable `<span className="text-sm font-medium text-black h-12 inline-flex items-center cursor-default">Guida ai prodotti</span>` with `<Link href="/guida-ai-prodotti" className="text-sm font-medium text-black hover:text-red transition-colors h-12 inline-flex items-center">Guida ai prodotti</Link>`.
3. No other lines in `Navbar.tsx` were touched (confirmed via `git diff` — only the import addition, the constant removal, and the span-to-Link swap appear in the diff).

## Build verification

- `npx tsc --noEmit` — completed with no output (no type errors).
- `npm run build` — succeeded:
  - `✓ Compiled successfully`
  - `✓ Generating static pages (3267/3267)`
  - Full route manifest printed with no errors, including all existing dynamic routes (`/brand/[slug]`, `/prodotto/[slug]`, `/shop/[[...slug]]`) unaffected.
  - Note: `/guida-ai-prodotti` (the target of the new Link) does not yet exist as a page — that page is out of scope for this task and will be added in the next task per the brief. This does not break the build since Next.js does not validate `<Link href>` targets at build time.

## Commit

- `10423ac4cb4ee490953c0b693686f92e2564758b` — "feat: extract GUIDE_LINKS and make Guida ai prodotti a real link"
  - `components/layout/Navbar.tsx` | 16 +++-------------
  - `lib/guide-links.ts` | 15 +++++++++++++++
  - 2 files changed, 18 insertions(+), 13 deletions(-)

Not pushed to any remote, per instructions.
