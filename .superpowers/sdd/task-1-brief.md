### Task 1: Project Scaffold

**Files:**
- Create: `package.json` (via npx)
- Create: `tailwind.config.ts`
- Create: `app/globals.css`
- Create: `next.config.ts`
- Create: `jest.config.ts`
- Create: `jest.setup.ts`

- [ ] **Step 1: Init Next.js project**

```bash
cd "/Users/leonardoantinucci/claude_code/Sellerie Galazzo Mock Up"
npx create-next-app@14 . --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*" --yes
```

Expected: project files created, `npm run dev` works.

- [ ] **Step 2: Install dependencies**

```bash
npm install framer-motion zustand lucide-react
npm install -D jest jest-environment-jsdom @testing-library/react @testing-library/jest-dom @types/jest ts-jest
```

- [ ] **Step 3: Install Google Fonts**

```bash
npm install @next/font
```

- [ ] **Step 4: Configure Tailwind**

Replace `tailwind.config.ts` with:

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        red: { DEFAULT: '#CC0000', dark: '#8B0000' },
        sand: '#C4A882',
        black: '#1A1A1A',
        'gray-light': '#F4F4F4',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
    },
  },
  plugins: [],
}
export default config
```

- [ ] **Step 5: Configure app/globals.css**

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply font-sans text-black bg-white;
  }
}

@layer utilities {
  .marquee {
    animation: marquee 30s linear infinite;
  }
  @keyframes marquee {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
}
```

- [ ] **Step 6: Configure Jest**

Create `jest.config.ts`:

```typescript
import type { Config } from 'jest'
const config: Config = {
  testEnvironment: 'jsdom',
  setupFilesAfterFramework: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/$1' },
  transform: { '^.+\\.tsx?$': ['ts-jest', { tsconfig: { jsx: 'react-jsx' } }] },
}
export default config
```

Create `jest.setup.ts`:

```typescript
import '@testing-library/jest-dom'
```

- [ ] **Step 7: Verify dev server**

```bash
npm run dev
```

Expected: `http://localhost:3000` loads Next.js default page.

- [ ] **Step 8: Commit**

```bash
git init
git add .
git commit -m "feat: scaffold Next.js 14 project with Tailwind, Zustand, Framer Motion"
```

---

