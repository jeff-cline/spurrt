# Spurrt Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a production-quality marketing landing page for spurrt.com that explains the Spurrt micro-economy, captures segmented waitlist signups (Talent / Benefactor / Supplier), and establishes the brand voice the future platform will inherit.

**Architecture:** A single Next.js 15 (App Router) page composed of focused presentational React components, each in its own file under `components/`. One serverless API route (`app/api/waitlist/route.ts`) accepts form submissions, validates with Zod, and sends a notification email via Resend. No database. No auth. No CMS. Designed to deploy to Vercel with zero config.

**Tech Stack:** Next.js 15.x, React 19.x, TypeScript 5.x, Tailwind CSS 4.x, Zod (form validation), Resend (transactional email), Vitest + @testing-library (unit tests for API logic). Fonts via `next/font/google` (Fraunces for headings, Inter for body). Hosted on Vercel.

---

## Brand naming reminders (do not violate)

- **Spurrt** (capitalized) — brand. Used as a proper noun.
- **spurrt / spurrts** (lowercase) — currency unit. Like "dollar / dollars."
- **Spurrts to Success** (Title Case) — feature name only.
- The acronym **SPURTT** does not appear anywhere in code, copy, identifiers, or comments.

If any task in this plan accidentally surfaces "SPURRT" or "SPURTT" in copy, fix it before committing.

---

## File Structure

```
spurrt.com/
├── app/
│   ├── layout.tsx                  # root layout, fonts, metadata
│   ├── page.tsx                    # landing page (assembles sections)
│   ├── globals.css                 # Tailwind + CSS vars for brand colors
│   └── api/
│       └── waitlist/
│           └── route.ts            # POST handler: validate + send email
├── components/
│   ├── nav.tsx                     # top navigation bar
│   ├── hero-split.tsx              # split-screen hero (Talent | Benefactor)
│   ├── currency-explainer.tsx      # "1 spurrt = $444 today"
│   ├── how-it-works.tsx            # two parallel rails meet at marketplace
│   ├── marketplace-preview.tsx     # 6 tiles: trips/vacations/etc.
│   ├── success-pool.tsx            # Spurrts to Success retention pool
│   ├── manifesto.tsx               # two pull quotes, large type
│   ├── waitlist-form.tsx           # generic form (Talent | Benefactor | Supplier)
│   ├── waitlist-cta.tsx            # three buttons + active form
│   ├── faq.tsx                     # six collapsible questions
│   └── footer.tsx                  # logo, social, legal
├── lib/
│   ├── waitlist-schema.ts          # Zod schemas + TS types for 3 form variants
│   └── resend-client.ts            # Resend SDK wrapper with no-key fallback
├── tests/
│   └── api/
│       └── waitlist.test.ts        # API route validation + success tests
├── public/
│   ├── favicon.ico
│   └── og-image.png                # 1200×630 social share image
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.mjs
├── next.config.ts
├── vitest.config.ts
├── .env.example
├── .gitignore                      # already exists
└── README.md
```

**Boundary discipline:** every component is purely presentational and accepts no props beyond static content; the only stateful component is `waitlist-form.tsx` (manages its own form state and fetch). The API route is the only server-side logic. This keeps each file under ~150 lines and individually reviewable.

---

## Task 1: Scaffold the Next.js project

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.ts`
- Create: `postcss.config.mjs`
- Create: `app/layout.tsx`
- Create: `app/page.tsx`
- Create: `app/globals.css`

- [ ] **Step 1: Initialize package.json with dependencies**

Write `package.json`:

```json
{
  "name": "spurrt-com",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest run"
  },
  "dependencies": {
    "next": "15.0.3",
    "react": "19.0.0",
    "react-dom": "19.0.0",
    "zod": "^3.23.8",
    "resend": "^4.0.1"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4.0.0",
    "@testing-library/react": "^16.1.0",
    "@types/node": "^22.10.1",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@vitejs/plugin-react": "^4.3.4",
    "jsdom": "^25.0.1",
    "tailwindcss": "^4.0.0",
    "typescript": "^5.7.2",
    "vitest": "^2.1.8"
  }
}
```

- [ ] **Step 2: Install dependencies**

Run: `npm install`
Expected: completes with no errors, creates `node_modules/` and `package-lock.json`.

- [ ] **Step 3: Write tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 4: Write next.config.ts**

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
};

export default nextConfig;
```

- [ ] **Step 5: Write postcss.config.mjs**

```js
export default {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
```

- [ ] **Step 6: Write minimal app/layout.tsx (will be expanded in Task 2)**

```tsx
import "./globals.css";

export const metadata = {
  title: "Spurrt",
  description: "A micro-economy for underutilized talent and opportunity.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 7: Write minimal app/page.tsx**

```tsx
export default function Home() {
  return (
    <main className="min-h-screen bg-ink text-cream">
      <p className="p-8">Spurrt — coming online.</p>
    </main>
  );
}
```

- [ ] **Step 8: Write minimal app/globals.css (Tailwind v4 import)**

```css
@import "tailwindcss";

@theme {
  --color-ink: #0a0a0b;
  --color-cream: #f5f0e6;
  --color-gold: #c9a96a;
}
```

- [ ] **Step 9: Verify dev server boots**

Run: `npm run dev`
Expected: prints `Local: http://localhost:3000`. Open in browser → should display "Spurrt — coming online." in cream text on near-black background.
Stop the dev server (Ctrl+C) before proceeding.

- [ ] **Step 10: Commit**

```bash
git add package.json package-lock.json tsconfig.json next.config.ts postcss.config.mjs app/
git commit -m "chore: scaffold Next.js 15 + Tailwind 4 project"
```

---

## Task 2: Brand tokens, fonts, and root layout

**Files:**
- Modify: `app/globals.css`
- Modify: `app/layout.tsx`
- Create: `tailwind.config.ts`

- [ ] **Step 1: Write tailwind.config.ts**

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
};

export default config;
```

(Tailwind v4 reads most config from `@theme` in CSS, so this file stays minimal — it exists only so editors and Next.js detect Tailwind.)

- [ ] **Step 2: Expand app/globals.css with full brand tokens**

```css
@import "tailwindcss";

@theme {
  --color-ink: #0a0a0b;
  --color-ink-soft: #15151a;
  --color-cream: #f5f0e6;
  --color-cream-dim: #b8b3a8;
  --color-gold: #c9a96a;
  --color-gold-soft: #8a7344;

  --font-display: var(--font-fraunces), Georgia, serif;
  --font-body: var(--font-inter), -apple-system, BlinkMacSystemFont, sans-serif;
}

html,
body {
  background-color: var(--color-ink);
  color: var(--color-cream);
  font-family: var(--font-body);
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

h1, h2, h3, h4 {
  font-family: var(--font-display);
  font-weight: 400;
  letter-spacing: -0.01em;
}

::selection {
  background-color: var(--color-gold);
  color: var(--color-ink);
}
```

- [ ] **Step 3: Wire fonts in app/layout.tsx**

```tsx
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["400", "500", "600"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata = {
  title: "Spurrt — A micro-economy for underutilized talent",
  description:
    "Spurrt turns the underutilized time of high-capacity people and the underutilized resources of organizations into a marketplace where both win.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 4: Verify fonts load**

Run: `npm run dev`
Open http://localhost:3000 → text should render in Inter (clean sans). View page source and confirm `<link rel="preload"` for Fraunces and Inter is present.
Stop the dev server.

- [ ] **Step 5: Commit**

```bash
git add tailwind.config.ts app/globals.css app/layout.tsx
git commit -m "feat: add brand tokens (ink/cream/gold) and Fraunces+Inter fonts"
```

---

## Task 3: Nav component

**Files:**
- Create: `components/nav.tsx`

- [ ] **Step 1: Write components/nav.tsx**

```tsx
export function Nav() {
  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-ink/80 border-b border-cream/5">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 h-16 flex items-center justify-between">
        <a href="#top" className="font-display text-2xl tracking-tight text-cream">
          Spurrt
        </a>
        <div className="hidden md:flex items-center gap-10 text-sm text-cream-dim">
          <a href="#talent" className="hover:text-cream transition-colors">Talent</a>
          <a href="#benefactors" className="hover:text-cream transition-colors">Benefactors</a>
          <a href="#marketplace" className="hover:text-cream transition-colors">Marketplace</a>
          <a href="#faq" className="hover:text-cream transition-colors">FAQ</a>
        </div>
        <a
          href="#waitlist"
          className="inline-flex items-center px-5 py-2 bg-gold text-ink font-medium rounded-full hover:bg-gold-soft transition-colors"
        >
          Apply
        </a>
      </div>
    </nav>
  );
}
```

- [ ] **Step 2: Render in app/page.tsx (temporary, will assemble fully in Task 15)**

Replace the `<main>` in `app/page.tsx` with:

```tsx
import { Nav } from "@/components/nav";

export default function Home() {
  return (
    <>
      <Nav />
      <main id="top" className="min-h-screen">
        <div className="p-8">Sections coming next.</div>
      </main>
    </>
  );
}
```

- [ ] **Step 3: Visual check**

Run: `npm run dev`. Confirm: sticky nav at top, "Spurrt" wordmark left, four anchor links center (hidden on narrow viewports), gold "Apply" pill right. Hover states change text color. Stop dev server.

- [ ] **Step 4: Commit**

```bash
git add components/nav.tsx app/page.tsx
git commit -m "feat: add sticky nav with brand wordmark and Apply CTA"
```

---

## Task 4: Hero split component

**Files:**
- Create: `components/hero-split.tsx`

- [ ] **Step 1: Write components/hero-split.tsx**

```tsx
export function HeroSplit() {
  return (
    <section id="hero" className="relative">
      <div className="grid grid-cols-1 md:grid-cols-2 min-h-[80vh]">
        {/* Talent side */}
        <div
          id="talent"
          className="flex flex-col justify-center px-8 lg:px-20 py-20 border-b md:border-b-0 md:border-r border-cream/10 bg-ink"
        >
          <p className="text-sm uppercase tracking-[0.2em] text-gold mb-6">For the 2%</p>
          <h1 className="font-display text-5xl lg:text-6xl leading-[1.05] text-cream mb-6">
            You&rsquo;re undercompensated for what you&rsquo;re capable of.
          </h1>
          <p className="text-lg text-cream-dim max-w-md mb-10">
            Spurrt turns your underutilized time and talent into a currency you can actually spend — on trips, equity, crypto, or anything else in the marketplace.
          </p>
          <a
            href="#waitlist"
            className="inline-flex items-center w-fit px-7 py-3 bg-cream text-ink font-medium rounded-full hover:bg-gold transition-colors"
          >
            Apply as Talent →
          </a>
        </div>

        {/* Benefactor side */}
        <div
          id="benefactors"
          className="flex flex-col justify-center px-8 lg:px-20 py-20 bg-ink-soft"
        >
          <p className="text-sm uppercase tracking-[0.2em] text-gold mb-6">For Benefactors</p>
          <h1 className="font-display text-5xl lg:text-6xl leading-[1.05] text-cream mb-6">
            The top 2% won&rsquo;t take meetings on a job board.
          </h1>
          <p className="text-lg text-cream-dim max-w-md mb-10">
            Fund the marketplace with what you already have — equity, products, experiences, opportunities — and the people who move the needle will find you.
          </p>
          <a
            href="#waitlist"
            className="inline-flex items-center w-fit px-7 py-3 bg-gold text-ink font-medium rounded-full hover:bg-cream transition-colors"
          >
            Become a Benefactor →
          </a>
        </div>
      </div>

      {/* Unifying tagline ribbon */}
      <div className="border-t border-b border-cream/10 bg-ink py-6 px-6">
        <p className="text-center font-display italic text-xl lg:text-2xl text-cream-dim max-w-3xl mx-auto">
          A micro-economy where underutilized time meets underutilized opportunity.
        </p>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Wire into page.tsx**

Update `app/page.tsx`:

```tsx
import { Nav } from "@/components/nav";
import { HeroSplit } from "@/components/hero-split";

export default function Home() {
  return (
    <>
      <Nav />
      <main id="top">
        <HeroSplit />
      </main>
    </>
  );
}
```

- [ ] **Step 3: Visual check**

Run: `npm run dev`. Confirm: two-column hero on desktop, stacks vertically on mobile (resize window), distinct backgrounds (ink vs ink-soft), gold accent labels, two CTAs with different fills, tagline ribbon below. Stop dev server.

- [ ] **Step 4: Commit**

```bash
git add components/hero-split.tsx app/page.tsx
git commit -m "feat: add split-screen hero for Talent and Benefactor audiences"
```

---

## Task 5: Currency explainer component

**Files:**
- Create: `components/currency-explainer.tsx`

- [ ] **Step 1: Write components/currency-explainer.tsx**

```tsx
export function CurrencyExplainer() {
  return (
    <section className="py-28 px-6 lg:px-12">
      <div className="max-w-5xl mx-auto text-center">
        <p className="text-sm uppercase tracking-[0.2em] text-gold mb-8">The Currency</p>
        <h2 className="font-display text-4xl lg:text-5xl text-cream mb-12">
          What is a spurrt?
        </h2>

        <div className="font-display text-7xl lg:text-9xl text-cream mb-4 leading-none">
          1 spurrt = <span className="text-gold">$444</span>
        </div>
        <p className="text-cream-dim mb-16">today</p>

        <div className="flex flex-col md:flex-row gap-4 md:gap-6 justify-center">
          <Pill>Backed by a $10M pool</Pill>
          <Pill>Redeemable for trips, equity, crypto, products</Pill>
          <Pill>Tradeable between members</Pill>
        </div>
      </div>
    </section>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="px-5 py-3 rounded-full border border-cream/20 text-cream text-sm">
      {children}
    </span>
  );
}
```

- [ ] **Step 2: Wire into page.tsx**

Add import and section to `app/page.tsx`:

```tsx
import { Nav } from "@/components/nav";
import { HeroSplit } from "@/components/hero-split";
import { CurrencyExplainer } from "@/components/currency-explainer";

export default function Home() {
  return (
    <>
      <Nav />
      <main id="top">
        <HeroSplit />
        <CurrencyExplainer />
      </main>
    </>
  );
}
```

- [ ] **Step 3: Visual check**

Run: `npm run dev`. Confirm: massive "1 spurrt = $444" with gold dollar amount, three pill chips below. Stop dev server.

- [ ] **Step 4: Commit**

```bash
git add components/currency-explainer.tsx app/page.tsx
git commit -m "feat: add currency explainer with hero number and value pills"
```

---

## Task 6: How It Works component

**Files:**
- Create: `components/how-it-works.tsx`

- [ ] **Step 1: Write components/how-it-works.tsx**

```tsx
type Step = { label: string; body: string };

const talentSteps: Step[] = [
  { label: "Get matched", body: "Benefactors and suppliers post opportunities you actually want." },
  { label: "Deliver", body: "You bring underutilized capacity. Real work. Real outcomes." },
  { label: "Earn spurrts", body: "Locked in escrow upfront. Released as milestones complete." },
];

const benefactorSteps: Step[] = [
  { label: "Fund the pool", body: "Contribute equity, products, trips, services. Receive spurrts in return." },
  { label: "Post opportunity", body: "List what you need from the top 2%. Set the spurrts you'll pay." },
  { label: "Access talent", body: "Approved applicants accept. Escrow protects both sides." },
];

export function HowItWorks() {
  return (
    <section className="py-28 px-6 lg:px-12 bg-ink-soft border-y border-cream/5">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <p className="text-sm uppercase tracking-[0.2em] text-gold mb-6">How it works</p>
          <h2 className="font-display text-4xl lg:text-5xl text-cream max-w-2xl mx-auto">
            Two sides. One marketplace. Both win.
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
          <Rail title="Talent" steps={talentSteps} accentLeft />
          <Rail title="Benefactors" steps={benefactorSteps} />
        </div>

        <div className="mt-20 text-center">
          <div className="inline-block px-6 py-3 border border-gold rounded-full text-gold font-medium">
            ↓ they meet here ↓
          </div>
          <p className="font-display text-3xl lg:text-4xl text-cream mt-6">The Marketplace</p>
        </div>
      </div>
    </section>
  );
}

function Rail({ title, steps, accentLeft }: { title: string; steps: Step[]; accentLeft?: boolean }) {
  return (
    <div className={accentLeft ? "lg:border-r lg:border-cream/10 lg:pr-16" : ""}>
      <p className="font-display text-2xl text-gold mb-10">{title}</p>
      <ol className="space-y-10">
        {steps.map((step, i) => (
          <li key={step.label} className="flex gap-5">
            <span className="font-display text-3xl text-cream-dim w-10 shrink-0">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div>
              <p className="font-display text-xl text-cream mb-2">{step.label}</p>
              <p className="text-cream-dim">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
```

- [ ] **Step 2: Wire into page.tsx**

Add `import { HowItWorks } from "@/components/how-it-works";` and place `<HowItWorks />` after `<CurrencyExplainer />`.

- [ ] **Step 3: Visual check**

Run dev server, confirm two columns of three numbered steps each, stacked on mobile, "↓ they meet here ↓" pill, "The Marketplace" callout below. Stop dev server.

- [ ] **Step 4: Commit**

```bash
git add components/how-it-works.tsx app/page.tsx
git commit -m "feat: add How It Works with parallel Talent/Benefactor rails"
```

---

## Task 7: Marketplace preview component

**Files:**
- Create: `components/marketplace-preview.tsx`

- [ ] **Step 1: Write components/marketplace-preview.tsx**

```tsx
type Tile = { name: string; gradient: string; emoji: string };

const tiles: Tile[] = [
  { name: "Trips", gradient: "from-amber-700 to-rose-900", emoji: "🌅" },
  { name: "Vacations", gradient: "from-sky-700 to-emerald-900", emoji: "🏝" },
  { name: "Stocks", gradient: "from-emerald-700 to-emerald-950", emoji: "📈" },
  { name: "Crypto", gradient: "from-violet-700 to-indigo-950", emoji: "◇" },
  { name: "Real Estate", gradient: "from-stone-600 to-stone-900", emoji: "🏛" },
  { name: "Boats", gradient: "from-cyan-700 to-blue-950", emoji: "⛵" },
];

export function MarketplacePreview() {
  return (
    <section id="marketplace" className="py-28 px-6 lg:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-sm uppercase tracking-[0.2em] text-gold mb-6">The Marketplace</p>
          <h2 className="font-display text-4xl lg:text-5xl text-cream mb-4">
            Spend your spurrts on what you actually want.
          </h2>
          <p className="text-cream-dim max-w-xl mx-auto">
            Categories light up as benefactors and suppliers add inventory. These are coming online first.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {tiles.map((tile) => (
            <a
              key={tile.name}
              href="#waitlist"
              className={`group relative aspect-[4/5] rounded-2xl overflow-hidden bg-gradient-to-br ${tile.gradient} flex flex-col justify-between p-6 hover:scale-[1.02] transition-transform`}
            >
              <span className="text-5xl">{tile.emoji}</span>
              <div>
                <p className="font-display text-2xl text-cream mb-1">{tile.name}</p>
                <p className="text-xs uppercase tracking-wider text-cream/70">Coming online</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Wire into page.tsx**

Add `import { MarketplacePreview } from "@/components/marketplace-preview";` and `<MarketplacePreview />` after `<HowItWorks />`.

- [ ] **Step 3: Visual check**

Run dev server. Confirm: 6 gradient tiles in a responsive grid (3 cols desktop, 2 mobile), emoji upper-left, name + "Coming online" lower-left, hover scales up. Stop dev server.

- [ ] **Step 4: Commit**

```bash
git add components/marketplace-preview.tsx app/page.tsx
git commit -m "feat: add marketplace preview with six gradient category tiles"
```

---

## Task 8: Spurrts to Success component

**Files:**
- Create: `components/success-pool.tsx`

- [ ] **Step 1: Write components/success-pool.tsx**

```tsx
export function SuccessPool() {
  return (
    <section className="py-28 px-6 lg:px-12 bg-ink-soft border-y border-cream/5">
      <div className="max-w-4xl mx-auto text-center">
        <p className="text-sm uppercase tracking-[0.2em] text-gold mb-6">Spurrts to Success</p>
        <h2 className="font-display text-4xl lg:text-6xl text-cream mb-10 leading-tight">
          Hold spurrts. <br className="hidden md:block" />
          Earn more spurrts.
        </h2>
        <p className="text-lg text-cream-dim mb-6 max-w-2xl mx-auto">
          50% of every marketplace transaction flows into the Spurrts to Success pool. At the end of each goal period, every active holder gets a proportional payout. Then the pool resets.
        </p>
        <p className="text-cream/60 italic max-w-xl mx-auto">
          Built to reward the people who stay in the ecosystem — not just the ones who transact through it.
        </p>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Wire into page.tsx**

Add import and `<SuccessPool />` after `<MarketplacePreview />`.

- [ ] **Step 3: Visual check**

Run dev server. Confirm large "Hold spurrts. Earn more spurrts." headline, supporting copy, italic kicker. Stop dev server.

- [ ] **Step 4: Commit**

```bash
git add components/success-pool.tsx app/page.tsx
git commit -m "feat: add Spurrts to Success retention pool section"
```

---

## Task 9: Manifesto component

**Files:**
- Create: `components/manifesto.tsx`

- [ ] **Step 1: Write components/manifesto.tsx**

```tsx
export function Manifesto() {
  return (
    <section className="py-32 px-6 lg:px-12">
      <div className="max-w-4xl mx-auto space-y-20">
        <blockquote className="font-display text-4xl lg:text-6xl text-cream leading-tight">
          &ldquo;A rising tide lifts all boats.&rdquo;
        </blockquote>

        <blockquote className="font-display text-4xl lg:text-6xl text-cream leading-tight text-right">
          &ldquo;This energy is yours to use. <br className="hidden md:block" />
          You are held and protected.&rdquo;
        </blockquote>

        <div className="pt-12 border-t border-cream/10">
          <p className="text-cream-dim text-lg max-w-2xl">
            Talent and capital have always been mispriced. The most capable people give away their best hours for fixed wages, and the organizations that need them never reach them. Spurrt is a correction — a private, intentional economy where underutilized value finds its match.
          </p>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Wire into page.tsx**

Add import and `<Manifesto />` after `<SuccessPool />`.

- [ ] **Step 3: Visual check**

Run dev server. Confirm two large pull quotes with generous whitespace, alignment alternating left/right, positioning paragraph below. Stop dev server.

- [ ] **Step 4: Commit**

```bash
git add components/manifesto.tsx app/page.tsx
git commit -m "feat: add manifesto section with two pull quotes"
```

---

## Task 10: Waitlist Zod schema and types

**Files:**
- Create: `lib/waitlist-schema.ts`

- [ ] **Step 1: Write lib/waitlist-schema.ts**

```ts
import { z } from "zod";

export const TalentSchema = z.object({
  role: z.literal("talent"),
  name: z.string().min(2).max(120),
  email: z.string().email(),
  primarySkill: z.string().min(2).max(200),
  availability: z.string().max(500).optional(),
});

export const BenefactorSchema = z.object({
  role: z.literal("benefactor"),
  name: z.string().min(2).max(120),
  email: z.string().email(),
  organization: z.string().min(2).max(200),
  contribution: z.string().max(500).optional(),
});

export const SupplierSchema = z.object({
  role: z.literal("supplier"),
  name: z.string().min(2).max(120),
  email: z.string().email(),
  product: z.string().min(2).max(200),
  feeModel: z.enum(["monthly", "success", "hybrid"]).optional(),
});

export const WaitlistSchema = z.discriminatedUnion("role", [
  TalentSchema,
  BenefactorSchema,
  SupplierSchema,
]);

export type WaitlistSubmission = z.infer<typeof WaitlistSchema>;
export type WaitlistRole = WaitlistSubmission["role"];
```

- [ ] **Step 2: Commit**

```bash
git add lib/waitlist-schema.ts
git commit -m "feat: add Zod schemas and types for waitlist submissions"
```

---

## Task 11: Waitlist form component

**Files:**
- Create: `components/waitlist-form.tsx`

- [ ] **Step 1: Write components/waitlist-form.tsx**

```tsx
"use client";

import { useState } from "react";
import type { WaitlistRole } from "@/lib/waitlist-schema";

type Status = "idle" | "submitting" | "success" | "error";

export function WaitlistForm({ role, onClose }: { role: WaitlistRole; onClose: () => void }) {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    const formData = new FormData(e.currentTarget);
    const payload: Record<string, unknown> = { role };
    formData.forEach((value, key) => {
      payload[key] = value;
    });

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Request failed (${res.status})`);
      }
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  if (status === "success") {
    return (
      <div className="text-center space-y-4">
        <p className="font-display text-2xl text-cream">You&rsquo;re on the list.</p>
        <p className="text-cream-dim">We&rsquo;ll be in touch when the cohort opens.</p>
        <button onClick={onClose} className="text-gold hover:text-cream transition-colors">
          Close
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Field name="name" label="Name" required />
      <Field name="email" label="Email" type="email" required />

      {role === "talent" && (
        <>
          <Field name="primarySkill" label="Primary skill" required />
          <Field name="availability" label="Availability (optional)" textarea />
        </>
      )}

      {role === "benefactor" && (
        <>
          <Field name="organization" label="Organization" required />
          <Field name="contribution" label="What you'd contribute (optional)" textarea />
        </>
      )}

      {role === "supplier" && (
        <>
          <Field name="product" label="Product or service" required />
          <SelectField
            name="feeModel"
            label="Fee model preference"
            options={[
              { value: "", label: "—" },
              { value: "monthly", label: "Monthly" },
              { value: "success", label: "Success-based" },
              { value: "hybrid", label: "Hybrid" },
            ]}
          />
        </>
      )}

      {errorMessage && <p className="text-red-400 text-sm">{errorMessage}</p>}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={status === "submitting"}
          className="px-6 py-3 bg-gold text-ink font-medium rounded-full hover:bg-cream transition-colors disabled:opacity-50"
        >
          {status === "submitting" ? "Sending…" : "Submit"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-3 text-cream-dim hover:text-cream transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function Field({
  name,
  label,
  type = "text",
  required,
  textarea,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  textarea?: boolean;
}) {
  const baseClasses =
    "w-full px-4 py-3 bg-ink border border-cream/20 rounded-lg text-cream placeholder-cream-dim focus:border-gold focus:outline-none transition-colors";
  return (
    <label className="block">
      <span className="block text-sm text-cream-dim mb-2">{label}</span>
      {textarea ? (
        <textarea name={name} rows={3} className={baseClasses} />
      ) : (
        <input name={name} type={type} required={required} className={baseClasses} />
      )}
    </label>
  );
}

function SelectField({
  name,
  label,
  options,
}: {
  name: string;
  label: string;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="block">
      <span className="block text-sm text-cream-dim mb-2">{label}</span>
      <select
        name={name}
        className="w-full px-4 py-3 bg-ink border border-cream/20 rounded-lg text-cream focus:border-gold focus:outline-none"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/waitlist-form.tsx
git commit -m "feat: add waitlist form component with role-specific fields"
```

---

## Task 12: Waitlist CTA section

**Files:**
- Create: `components/waitlist-cta.tsx`

- [ ] **Step 1: Write components/waitlist-cta.tsx**

```tsx
"use client";

import { useState } from "react";
import { WaitlistForm } from "@/components/waitlist-form";
import type { WaitlistRole } from "@/lib/waitlist-schema";

export function WaitlistCta() {
  const [activeRole, setActiveRole] = useState<WaitlistRole | null>(null);

  return (
    <section id="waitlist" className="py-28 px-6 lg:px-12 bg-ink-soft border-y border-cream/5">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-sm uppercase tracking-[0.2em] text-gold mb-6">Founding cohort</p>
          <h2 className="font-display text-4xl lg:text-5xl text-cream mb-6">
            Pick your seat at the table.
          </h2>
          <p className="text-cream-dim max-w-xl mx-auto">
            The first cohort is small and intentional. Tell us who you are and we&rsquo;ll let you know when it opens.
          </p>
        </div>

        {activeRole ? (
          <div className="max-w-xl mx-auto bg-ink rounded-2xl border border-cream/10 p-8">
            <p className="font-display text-2xl text-cream mb-6 capitalize">
              {activeRole === "benefactor" ? "Become a Benefactor" : activeRole === "supplier" ? "Become a Supplier" : "Apply as Talent"}
            </p>
            <WaitlistForm role={activeRole} onClose={() => setActiveRole(null)} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <RoleButton role="talent" label="Apply as Talent" onClick={setActiveRole} primary />
            <RoleButton role="benefactor" label="Become a Benefactor" onClick={setActiveRole} />
            <RoleButton role="supplier" label="Become a Supplier" onClick={setActiveRole} />
          </div>
        )}
      </div>
    </section>
  );
}

function RoleButton({
  role,
  label,
  onClick,
  primary,
}: {
  role: WaitlistRole;
  label: string;
  onClick: (role: WaitlistRole) => void;
  primary?: boolean;
}) {
  const cls = primary
    ? "bg-gold text-ink hover:bg-cream"
    : "border border-cream/20 text-cream hover:border-gold hover:text-gold";
  return (
    <button
      onClick={() => onClick(role)}
      className={`px-6 py-5 rounded-xl font-medium transition-colors ${cls}`}
    >
      {label}
    </button>
  );
}
```

- [ ] **Step 2: Wire into page.tsx**

Add `import { WaitlistCta } from "@/components/waitlist-cta";` and `<WaitlistCta />` after `<Manifesto />`.

- [ ] **Step 3: Visual check**

Run dev server. Click each of the three buttons → should reveal the appropriate form below with role-specific fields. Submit a form → expect a network error in console (API not built yet) — this is fine and will be fixed in Task 17. Stop dev server.

- [ ] **Step 4: Commit**

```bash
git add components/waitlist-cta.tsx app/page.tsx
git commit -m "feat: add waitlist CTA with three role buttons and inline form"
```

---

## Task 13: FAQ component

**Files:**
- Create: `components/faq.tsx`

- [ ] **Step 1: Write components/faq.tsx**

```tsx
"use client";

import { useState } from "react";

type QA = { q: string; a: string };

const items: QA[] = [
  {
    q: "What is a spurrt?",
    a: "A spurrt is the unit of value in the Spurrt micro-economy. One spurrt is worth $444 today, backed by a $10M pool. Spurrts are tradeable between members and redeemable for trips, equity, crypto, products, and services in the marketplace.",
  },
  {
    q: "Who qualifies as Talent?",
    a: "Spurrt is intentionally selective. We're looking for high-capacity people whose underutilized hours are worth more than they're paid for them — operators, advisors, builders, creatives, athletes, executives. Apply and we'll talk.",
  },
  {
    q: "Can I cash out my spurrts?",
    a: "You can redeem them in the marketplace, trade them with other members, or convert via Lives — a separate currency designed to bridge to crypto. Direct cash-out is not the goal of the platform.",
  },
  {
    q: "What's the difference between a Benefactor and a Supplier?",
    a: "Benefactors fund the marketplace itself — typically with equity, opportunities, or experiences they already control. Suppliers list specific products or services for spurrts. Both gain access to the talent pool, on different terms.",
  },
  {
    q: "What are Lives, and how do they relate to crypto?",
    a: "Lives are a sister currency to spurrts, designed to bridge the ecosystem to outside crypto markets. The full mechanics are coming with Phase 2.",
  },
  {
    q: "When does the platform open?",
    a: "Founding cohort applications are open now. The full marketplace opens in waves as we onboard benefactors, suppliers, and verified talent.",
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="py-28 px-6 lg:px-12">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-sm uppercase tracking-[0.2em] text-gold mb-6">Questions</p>
          <h2 className="font-display text-4xl lg:text-5xl text-cream">
            The short answers.
          </h2>
        </div>

        <ul className="divide-y divide-cream/10 border-y border-cream/10">
          {items.map((item, i) => {
            const isOpen = open === i;
            return (
              <li key={item.q}>
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full text-left py-6 flex justify-between items-center gap-6"
                >
                  <span className="font-display text-xl text-cream">{item.q}</span>
                  <span className="text-gold text-2xl shrink-0">{isOpen ? "−" : "+"}</span>
                </button>
                {isOpen && <p className="pb-6 text-cream-dim leading-relaxed">{item.a}</p>}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Wire into page.tsx**

Add `import { Faq } from "@/components/faq";` and `<Faq />` after `<WaitlistCta />`.

- [ ] **Step 3: Visual check**

Run dev server. First FAQ open by default. Click each Q → toggle. Stop dev server.

- [ ] **Step 4: Commit**

```bash
git add components/faq.tsx app/page.tsx
git commit -m "feat: add FAQ section with six expandable questions"
```

---

## Task 14: Footer component

**Files:**
- Create: `components/footer.tsx`

- [ ] **Step 1: Write components/footer.tsx**

```tsx
export function Footer() {
  return (
    <footer className="border-t border-cream/10 px-6 lg:px-12 py-16">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-10">
        <div>
          <p className="font-display text-3xl text-cream mb-2">Spurrt</p>
          <p className="text-cream-dim max-w-sm">
            A micro-economy where underutilized time meets underutilized opportunity.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-8 text-sm text-cream-dim">
          <div className="flex gap-6">
            <a href="#" className="hover:text-cream">X</a>
            <a href="#" className="hover:text-cream">LinkedIn</a>
            <a href="#" className="hover:text-cream">Instagram</a>
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-cream">Privacy</a>
            <a href="#" className="hover:text-cream">Terms</a>
          </div>
        </div>
      </div>

      <p className="max-w-7xl mx-auto text-xs text-cream-dim/60 mt-12">
        © {new Date().getFullYear()} Spurrt. All rights reserved.
      </p>
    </footer>
  );
}
```

- [ ] **Step 2: Wire into page.tsx**

Add `import { Footer } from "@/components/footer";` and `<Footer />` after the closing `</main>` tag (footer lives outside main).

- [ ] **Step 3: Visual check**

Run dev server. Scroll to bottom. Confirm logo, tagline, social/legal links, copyright. Stop dev server.

- [ ] **Step 4: Commit**

```bash
git add components/footer.tsx app/page.tsx
git commit -m "feat: add footer with logo, social, and legal placeholders"
```

---

## Task 15: Final page assembly + smooth scrolling

**Files:**
- Modify: `app/page.tsx`
- Modify: `app/globals.css`

- [ ] **Step 1: Final app/page.tsx (canonical version)**

```tsx
import { Nav } from "@/components/nav";
import { HeroSplit } from "@/components/hero-split";
import { CurrencyExplainer } from "@/components/currency-explainer";
import { HowItWorks } from "@/components/how-it-works";
import { MarketplacePreview } from "@/components/marketplace-preview";
import { SuccessPool } from "@/components/success-pool";
import { Manifesto } from "@/components/manifesto";
import { WaitlistCta } from "@/components/waitlist-cta";
import { Faq } from "@/components/faq";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <>
      <Nav />
      <main id="top">
        <HeroSplit />
        <CurrencyExplainer />
        <HowItWorks />
        <MarketplacePreview />
        <SuccessPool />
        <Manifesto />
        <WaitlistCta />
        <Faq />
      </main>
      <Footer />
    </>
  );
}
```

- [ ] **Step 2: Add smooth scrolling to globals.css**

Append to `app/globals.css`:

```css
html {
  scroll-behavior: smooth;
  scroll-padding-top: 4rem;
}
```

- [ ] **Step 3: Visual check — full page review**

Run dev server. Scroll the entire page top to bottom. Click each nav anchor and confirm smooth scroll lands at the right section. Resize to mobile width and confirm everything stacks correctly. Stop dev server.

- [ ] **Step 4: Commit**

```bash
git add app/page.tsx app/globals.css
git commit -m "feat: assemble landing page with all sections + smooth anchor scroll"
```

---

## Task 16: Vitest configuration

**Files:**
- Create: `vitest.config.ts`

- [ ] **Step 1: Write vitest.config.ts**

```ts
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
```

- [ ] **Step 2: Verify vitest runs (will report "no test files" — that's fine)**

Run: `npm test`
Expected: exits 0 (or non-zero with "No test files found" — acceptable; we add tests next).

- [ ] **Step 3: Commit**

```bash
git add vitest.config.ts
git commit -m "chore: add Vitest config with @ alias and node environment"
```

---

## Task 17: Waitlist API tests (TDD — write tests first)

**Files:**
- Create: `tests/api/waitlist.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/resend-client", () => ({
  sendWaitlistNotification: vi.fn().mockResolvedValue({ ok: true }),
}));

import { POST } from "@/app/api/waitlist/route";
import { sendWaitlistNotification } from "@/lib/resend-client";

function makeRequest(body: unknown) {
  return new Request("http://localhost/api/waitlist", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/waitlist", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects requests with no role", async () => {
    const res = await POST(makeRequest({ name: "Alice", email: "a@b.com" }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBeDefined();
  });

  it("rejects an invalid email", async () => {
    const res = await POST(
      makeRequest({ role: "talent", name: "Alice", email: "not-an-email", primarySkill: "ops" }),
    );
    expect(res.status).toBe(400);
  });

  it("accepts a valid talent submission and triggers a notification", async () => {
    const res = await POST(
      makeRequest({
        role: "talent",
        name: "Alice",
        email: "alice@example.com",
        primarySkill: "fractional CFO",
        availability: "10 hrs/week",
      }),
    );
    expect(res.status).toBe(200);
    expect(sendWaitlistNotification).toHaveBeenCalledOnce();
    expect(sendWaitlistNotification).toHaveBeenCalledWith(
      expect.objectContaining({ role: "talent", email: "alice@example.com" }),
    );
  });

  it("accepts a valid benefactor submission", async () => {
    const res = await POST(
      makeRequest({
        role: "benefactor",
        name: "Acme Co",
        email: "founder@acme.com",
        organization: "Acme",
        contribution: "early-stage equity",
      }),
    );
    expect(res.status).toBe(200);
  });

  it("accepts a valid supplier submission", async () => {
    const res = await POST(
      makeRequest({
        role: "supplier",
        name: "Tess",
        email: "tess@boats.com",
        product: "yacht charters",
        feeModel: "success",
      }),
    );
    expect(res.status).toBe(200);
  });

  it("rejects malformed JSON", async () => {
    const req = new Request("http://localhost/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not-json",
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});
```

- [ ] **Step 2: Run tests — expect them to fail**

Run: `npm test`
Expected: fails with module-not-found or import errors for `@/app/api/waitlist/route` and `@/lib/resend-client` — those don't exist yet.

- [ ] **Step 3: Commit the failing tests**

```bash
git add tests/api/waitlist.test.ts
git commit -m "test: add failing tests for waitlist API route"
```

---

## Task 18: Resend client + waitlist API route (make tests pass)

**Files:**
- Create: `lib/resend-client.ts`
- Create: `app/api/waitlist/route.ts`
- Create: `.env.example`

- [ ] **Step 1: Write lib/resend-client.ts**

```ts
import { Resend } from "resend";
import type { WaitlistSubmission } from "@/lib/waitlist-schema";

const NOTIFY_TO = "jeff.cline@me.com";
const NOTIFY_FROM = "Spurrt Waitlist <waitlist@spurrt.com>";

export async function sendWaitlistNotification(
  submission: WaitlistSubmission,
): Promise<{ ok: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.log("[waitlist] RESEND_API_KEY not set; submission logged only:", submission);
    return { ok: true };
  }

  const resend = new Resend(apiKey);
  const subject = `Spurrt waitlist: new ${submission.role} — ${submission.name}`;
  const lines = Object.entries(submission)
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");

  try {
    const { error } = await resend.emails.send({
      from: NOTIFY_FROM,
      to: [NOTIFY_TO],
      subject,
      text: lines,
    });
    if (error) {
      console.error("[waitlist] resend error:", error);
      return { ok: false, error: error.message };
    }
    return { ok: true };
  } catch (err) {
    console.error("[waitlist] unexpected resend exception:", err);
    return { ok: false, error: err instanceof Error ? err.message : "unknown" };
  }
}
```

- [ ] **Step 2: Write app/api/waitlist/route.ts**

```ts
import { NextResponse } from "next/server";
import { WaitlistSchema } from "@/lib/waitlist-schema";
import { sendWaitlistNotification } from "@/lib/resend-client";

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = WaitlistSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const result = await sendWaitlistNotification(parsed.data);
  if (!result.ok) {
    return NextResponse.json({ error: result.error || "Notification failed" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 3: Write .env.example**

```
# Set in Vercel project settings (or .env.local for local dev).
# When unset, waitlist submissions are logged to the runtime console
# and the API still returns 200 — see lib/resend-client.ts.
RESEND_API_KEY=
```

- [ ] **Step 4: Run tests**

Run: `npm test`
Expected: all 6 tests pass.

- [ ] **Step 5: Commit**

```bash
git add lib/resend-client.ts app/api/waitlist/route.ts .env.example
git commit -m "feat: add waitlist API route with Zod validation and Resend delivery"
```

---

## Task 19: End-to-end form submission verification

**Files:** none modified — manual verification only.

- [ ] **Step 1: Run dev server**

Run: `npm run dev`

- [ ] **Step 2: Submit one of each form variant**

For each of Talent, Benefactor, Supplier:
1. Open http://localhost:3000
2. Click the relevant CTA button
3. Fill the form with realistic test data
4. Submit
5. Confirm UI shows "You're on the list."
6. Confirm the terminal running `npm run dev` prints `[waitlist] RESEND_API_KEY not set; submission logged only:` followed by the payload (since you almost certainly haven't set the key locally — that's expected)

- [ ] **Step 3: Submit invalid data and confirm graceful error**

Try submitting an obviously-invalid form (e.g., open browser devtools, edit the email input value to remove the `@`, submit by clicking the button). Expect a visible error message under the form and a 400 in the network tab.

- [ ] **Step 4: Stop dev server. No commit needed (no file changes).**

---

## Task 20: Metadata, OG image, favicon

**Files:**
- Modify: `app/layout.tsx`
- Create: `public/og-image.png`
- Create: `public/favicon.ico`

- [ ] **Step 1: Generate a placeholder favicon**

If a designed favicon is not yet available, create a simple gold-on-ink "S" favicon. Easiest method: use https://favicon.io/favicon-generator/ with text "S", background `#0a0a0b`, font color `#c9a96a`, font Fraunces. Download the .ico and save to `public/favicon.ico`.

If you cannot generate one in this environment, copy a 1x1 transparent PNG to `public/favicon.ico` as a placeholder so the build doesn't 404 — and leave a TODO in the README for design follow-up.

- [ ] **Step 2: Generate a placeholder OG image (1200×630)**

Same approach: use a static image generator (e.g., https://og-playground.vercel.app/) or a saved screenshot of the hero. Save as `public/og-image.png`. Acceptable placeholder for v1: a 1200×630 ink-colored PNG with the word "Spurrt" in cream Fraunces, gold underline.

- [ ] **Step 3: Expand metadata in app/layout.tsx**

Replace the existing `metadata` export with:

```tsx
export const metadata = {
  title: "Spurrt — A micro-economy for underutilized talent",
  description:
    "Spurrt turns the underutilized time of high-capacity people and the underutilized resources of organizations into a marketplace where both win.",
  metadataBase: new URL("https://spurrt.com"),
  openGraph: {
    title: "Spurrt",
    description: "A micro-economy where underutilized time meets underutilized opportunity.",
    url: "https://spurrt.com",
    siteName: "Spurrt",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Spurrt",
    description: "A micro-economy where underutilized time meets underutilized opportunity.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
  },
};
```

- [ ] **Step 4: Verify**

Run `npm run dev`. View page source. Confirm `<meta property="og:title">`, `<meta property="og:image">`, `<link rel="icon">` are present. Stop dev server.

- [ ] **Step 5: Commit**

```bash
git add app/layout.tsx public/favicon.ico public/og-image.png
git commit -m "feat: add OG metadata, favicon, and social share image"
```

---

## Task 21: README with deploy instructions

**Files:**
- Create: `README.md`

- [ ] **Step 1: Write README.md**

````markdown
# spurrt.com

Marketing landing page for Spurrt — a micro-economy where underutilized time meets underutilized opportunity.

## Stack

- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind CSS 4
- Zod (form validation)
- Resend (transactional email — waitlist notifications)
- Vitest (API route tests)
- Deployed on Vercel

## Local development

```bash
npm install
npm run dev
# open http://localhost:3000
```

## Tests

```bash
npm test
```

## Environment variables

Copy `.env.example` to `.env.local` and fill in:

```
RESEND_API_KEY=<your_resend_api_key>
```

If `RESEND_API_KEY` is unset, waitlist submissions still return 200 and are logged to the runtime console — useful for local dev.

## Deploying to Vercel

1. Push to `git@github.com:jeff-cline/spurrt.git` (the connected remote).
2. In Vercel, import the repo and accept the Next.js defaults.
3. Add `RESEND_API_KEY` under Project Settings → Environment Variables.
4. Add `spurrt.com` as the production domain.

## Brand naming

- **Spurrt** (capitalized) — the brand and platform.
- **spurrt / spurrts** (lowercase) — the currency unit, treated like "dollar / dollars."
- **Spurrts to Success** (Title Case) — feature name for the retention pool.
- The acronym **SPURTT** is not used in public copy.

## Design spec & implementation plan

- Spec: [`docs/superpowers/specs/2026-05-06-spurrt-landing-design.md`](docs/superpowers/specs/2026-05-06-spurrt-landing-design.md)
- Plan: [`docs/superpowers/plans/2026-05-06-spurrt-landing-page.md`](docs/superpowers/plans/2026-05-06-spurrt-landing-page.md)

## Roadmap

This repo is Phase 1 of a five-phase build:

1. ✅ Marketing landing page (this)
2. Auth + role system + spurrt ledger + valuation engine
3. Talent Board + Opportunities + Escrow
4. Goods Marketplace + Suppliers
5. Trading + Lives↔crypto + Spurrts to Success payouts
````

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: add README with stack, dev setup, and deploy instructions"
```

---

## Task 22: Production build verification

**Files:** none modified.

- [ ] **Step 1: Run production build**

Run: `npm run build`
Expected: completes with no errors, prints route summary including `/` (static or SSG) and `/api/waitlist` (function).

- [ ] **Step 2: Run production server**

Run: `npm run start`
Expected: server boots on http://localhost:3000.

- [ ] **Step 3: Smoke test the production build**

In a browser:
1. Load the page — sections render top to bottom.
2. Click each nav anchor — smooth-scrolls correctly.
3. Submit each waitlist form — confirms "You're on the list."
4. View page source — confirm OG tags and favicon link present.
5. Test mobile viewport in devtools — hero stacks vertically, marketplace tiles go to 2-up.

- [ ] **Step 4: Run tests one more time**

Run: `npm test`
Expected: all tests pass.

- [ ] **Step 5: Stop server. Final commit if any docs changed during smoke test, otherwise none needed.**

---

## Final handoff

After Task 22 completes, the local repo has a fully working, production-ready landing page. The next step (outside this plan) is:

1. **Push to GitHub:** `git push origin main` — deploys via your existing GitHub→server agent.
2. **Set `RESEND_API_KEY`** in Vercel/server env to enable real notification emails.
3. **Replace placeholder OG image and favicon** with designed versions (Task 20 noted this as a follow-up).
4. **Move to Phase 2** — invoke the brainstorming skill on the auth + ledger + valuation subsystem.

---

## Self-review checklist (run before declaring this plan ready)

**Spec coverage:**
- ✅ Two-audience hero — Task 4
- ✅ Currency explainer with $444 — Task 5
- ✅ Two-rail How It Works — Task 6
- ✅ Six-tile marketplace preview — Task 7
- ✅ Spurrts to Success retention pool — Task 8
- ✅ Manifesto with two pull quotes — Task 9
- ✅ Three-form waitlist (Talent / Benefactor / Supplier) — Tasks 10–12
- ✅ Six-question FAQ — Task 13
- ✅ Footer — Task 14
- ✅ Resend-backed email capture with no-key fallback — Tasks 17–18
- ✅ Brand voice (dark mode, gold accent, editorial serif) — Tasks 1–2
- ✅ Mobile responsive — verified throughout
- ✅ OG/favicon/metadata — Task 20

**Naming consistency:** All references to the currency use lowercase `spurrt`/`spurrts`. Brand uses capitalized `Spurrt`. Feature name uses Title Case `Spurrts to Success`. The string `SPURTT` does not appear in any code or copy.

**Type consistency:** `WaitlistSubmission` and `WaitlistRole` are defined in Task 10 and consumed unchanged in Tasks 11, 12, 17, 18. `sendWaitlistNotification` signature matches between client (Task 18) and test mock (Task 17).

**No placeholders:** Every step has the actual code or command an engineer needs to execute. The two image placeholders in Task 20 are explicitly called out as "designed versions to follow" and have a fallback that doesn't break the build.
