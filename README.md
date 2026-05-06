# spurrt.com

Marketing landing page for Spurrt — a micro-economy where underutilized time meets underutilized opportunity.

## Stack

- Next.js 15 (App Router) + React 18 + TypeScript
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
