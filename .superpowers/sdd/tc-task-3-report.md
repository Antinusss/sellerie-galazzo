# Task 3 Report: Fake reviews (`lib/reviews.ts`)

## Summary

Implemented a deterministic fake-review generator for the "Selleria Galazzo" mock ecommerce site,
per client approval to use fabricated review data as a trust signal ("anche finte"). The module
is a pure function of `productId` — no `Math.random()`, no `Date.now()`, no external state — so
the same product id always yields the exact same `ReviewSummary` across renders and builds.

Files created exactly as specified in the brief (`.superpowers/sdd/tc-task-3-brief.md`), verbatim:

- `lib/reviews.ts` — exports `Review`, `ReviewSummary` interfaces and `getReviewSummary(productId: string): ReviewSummary`.
  - Internal `hashOf(id)` uses `Number(id)` when the id is numeric, otherwise falls back to a
    char-code sum of the string — both paths are pure/deterministic.
  - `rating` is picked from a positive-skewed pool `[4.2, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 5.0]`.
  - `count` is `3 + (hash % 118)`, giving a range of 3–120 inclusive.
  - Up to 5 sample `reviews` are generated (capped at `count` when `count < 5`), each with a
    non-empty author/date/text drawn from fixed Italian-language pools, and a rating between 3.5
    and 5.0.
- `__tests__/reviews.test.ts` — the 8 tests from the brief, transcribed verbatim (determinism,
  rating pool membership, count bounds, 5-review cap, under-5 sample size, non-empty
  author/date/text + plausible rating, different output for different ids, non-numeric id
  robustness + determinism).

This is a standalone pure module with no dependency on and no dependents in the current codebase
(later tasks — `ProductCard`, `ProductInfo`, `ProductTabs` — will wire it in).

## Test output

Step 2 (pre-implementation, expected failure):

```
> sellerie-galazzo@0.1.0 test
> jest reviews

FAIL __tests__/reviews.test.ts
  ● Test suite failed to run

    Configuration error:

    Could not locate module @/lib/reviews mapped as:
    /Users/leonardoantinucci/claude_code/Sellerie Galazzo Mock Up/$1.
    ...
Test Suites: 1 failed, 1 total
Tests:       0 total
```

Step 4 (post-implementation, `npm test -- reviews`):

```
> sellerie-galazzo@0.1.0 test
> jest reviews

Test Suites: 1 passed, 1 total
Tests:       8 passed, 8 total
Snapshots:   0 total
Time:        0.421 s
Ran all test suites matching reviews.
```

Full suite (`npm test`), confirming no regressions elsewhere in the repo:

```
> sellerie-galazzo@0.1.0 test
> jest

Test Suites: 7 passed, 7 total
Tests:       76 passed, 76 total
Snapshots:   0 total
Time:        0.625 s, estimated 1 s
Ran all test suites.
```

## Deviations from the brief

None. Both `lib/reviews.ts` and `__tests__/reviews.test.ts` were written verbatim from the code
blocks in `.superpowers/sdd/tc-task-3-brief.md`.

## Self-review notes

- Verified determinism logic by hand for the two boundary test ids: `'117'` → `hash=117`,
  `count = 3 + (117 % 118) = 120` (> 5, exercises the 5-review cap); `'118'` → `hash=118`,
  `count = 3 + (118 % 118) = 3` (exercises the under-5 sample-size path). Both match test
  expectations and both passed.
- `hashOf` is total (never throws) for any string input, including non-numeric ids like `'abc'`,
  because `Number('abc')` is `NaN` → falls through to the char-code-sum branch, which is always
  a finite non-negative integer.
- No `Math.random()`, `Date.now()`, or other non-deterministic source is used anywhere in the
  module — confirmed by inspection of the full file.
- Ran the entire test suite (not just the new file) to confirm no naming collisions or
  regressions were introduced elsewhere.
- Did not investigate negative-number product ids (e.g. `'-5'`) since no test covers them and
  the brief's reference implementation doesn't handle that case specially either; behavior would
  still be deterministic (JS `%` can return a negative result for negative dividends), just not
  exercised by any current or anticipated caller since product ids in this codebase are
  non-negative strings.

## Commit

```
f435989 feat: add deterministic fake-review generator
```

`git status` after commit was clean with respect to the two new files (only pre-existing
unrelated `.superpowers/sdd/*` scratch files remained untracked/modified, none of which belong
to this task).
