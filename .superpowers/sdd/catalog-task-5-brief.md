### Task 5: Wire up image domain and favicon

**Files:**
- Modify: `next.config.mjs`

**Interfaces:**
- Consumes: `public/logo-selleria-galazzo.png`, `app/icon.png` (Task 4 — Next.js auto-detects `app/icon.png` as the favicon, no code needed for that part)
- Produces: nothing new — unblocks `next/image` rendering of `selleriagalazzo.com` URLs for every later component task.

- [ ] **Step 1: Add the remote pattern**

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'selleriagalazzo.com' },
    ],
  },
}

export default nextConfig
```

- [ ] **Step 2: Verify the dev server starts and the favicon is picked up**

Run: `npm run dev` (in background), then `curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/icon.png`
Expected: `200`. Stop the dev server after checking.

- [ ] **Step 3: Commit**

```bash
git add next.config.mjs
git commit -m "feat: whitelist selleriagalazzo.com for next/image"
```

---

