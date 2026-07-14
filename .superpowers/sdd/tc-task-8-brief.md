### Task 8: Homepage trust stat

**Files:**
- Modify: `components/home/HeroSection.tsx`

- [ ] **Step 1: Add a 4th stat to the Hero's stats row**

Change:

```tsx
            <div className="flex gap-8 mt-12 text-sm">
              <div>
                <div className="font-black text-2xl">10k+</div>
                <div className="text-gray-400">Cavalieri</div>
              </div>
              <div>
                <div className="font-black text-2xl">200+</div>
                <div className="text-gray-400">Brand selezionati</div>
              </div>
              <div>
                <div className="font-black text-2xl">40+</div>
                <div className="text-gray-400">Anni di esperienza</div>
              </div>
            </div>
```

to:

```tsx
            <div className="flex flex-wrap gap-8 mt-12 text-sm">
              <div>
                <div className="font-black text-2xl">10k+</div>
                <div className="text-gray-400">Cavalieri</div>
              </div>
              <div>
                <div className="font-black text-2xl">200+</div>
                <div className="text-gray-400">Brand selezionati</div>
              </div>
              <div>
                <div className="font-black text-2xl">40+</div>
                <div className="text-gray-400">Anni di esperienza</div>
              </div>
              <div>
                <div className="font-black text-2xl">4.8★</div>
                <div className="text-gray-400">Recensioni verificate</div>
              </div>
            </div>
```

(Note: `flex gap-8` becomes `flex flex-wrap gap-8` so the 4th stat wraps gracefully on narrow screens instead of overflowing.)

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: zero errors

- [ ] **Step 3: Commit**

```bash
git add components/home/HeroSection.tsx
git commit -m "feat: add reviews trust stat to homepage hero"
```

---

