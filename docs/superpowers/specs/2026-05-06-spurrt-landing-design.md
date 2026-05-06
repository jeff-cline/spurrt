# Spurrt Landing Page — Design Spec

**Date:** 2026-05-06
**Status:** Draft → awaiting user review
**Phase:** 1 of 5 (standalone, no backend dependencies)

## What we're building

A marketing landing page for **spurrt.com** — a single-page site that explains the Spurrt micro-economy to two audiences (talent and benefactors), captures email signups for each, and seeds a founding cohort waitlist. No backend, no auth, no payments. Just a beautiful, honest pitch with a working email capture.

## Goals

- Explain the Spurrt concept clearly enough that a smart person decides "I want in" within 30 seconds.
- Speak to **two audiences in parallel** without diluting either: high-capacity talent (the "2%") and benefactors (orgs, businesses, startups).
- Capture qualified emails segmented by role: Talent / Benefactor / Supplier.
- Establish brand voice and visual identity that the future platform will inherit.
- Be deployable today.

## Non-goals (explicitly out of scope for Phase 1)

- No user accounts, login, or roles.
- No actual spurrt ledger, escrow, or transactions.
- No marketplace browsing, talent board, or opportunities flow.
- No crypto integration, Lives currency, or valuation engine.
- No admin panel.
- No CMS — content is in code; we'll move to a CMS only if updates become frequent.

These are Phases 2–5; each gets its own spec.

## Brand naming (locked)

- **Spurrt** (capitalized) — the company / platform / brand. Used as a proper noun.
- **spurrt / spurrts** (lowercase) — the currency unit. Treated like "dollar / dollars." Lowercase even mid-sentence; only capitalize at sentence start.
- **Spurrts to Success** (Title Case) — the product feature name for the retention pool.
- The acronym **SPURTT** (two T's) is dropped from all public-facing copy. It does not match the domain `spurrt.com` (two R's, one T) and creates confusion. If a backronym is ever needed internally, it can be reconstructed to fit S-P-U-R-R-T, but Phase 1 doesn't surface one.
- All copy, code identifiers, env vars, and content authoring must follow these rules.

## Audience & message

The hero speaks to both audiences simultaneously via a split-screen layout. Below the hero, content is unified — both sides converge on the marketplace.

**Talent voice:** "You're undercompensated for what you're capable of. Spurrt turns underutilized capacity into a currency you can actually spend."

**Benefactor voice:** "The top 2% won't take meetings on a job board. Fund the marketplace with what you already have — equity, products, experiences — and they'll come."

**Unifying line (under the split):** *A micro-economy where underutilized time meets underutilized opportunity.*

## Page structure (top to bottom)

1. **Nav.** Logo (Spurrt wordmark) · Talent · Benefactors · Marketplace (anchor) · FAQ · *Apply* button (primary).

2. **Hero — split-screen.**
   - Left panel: talent-facing headline, one-sentence subhead, **Apply as Talent** CTA.
   - Right panel: benefactor-facing headline, one-sentence subhead, **Become a Benefactor** CTA.
   - Unifying tagline ribbon spans the full width below both panels.

3. **What is a spurrt? (currency explainer).**
   - One enormous number: **1 spurrt = $444 today.**
   - Three pills underneath: *Backed by a $10M pool* · *Redeemable for trips, equity, crypto, products* · *Tradeable between members.*
   - Tone: confident, simple, no jargon.

4. **How it works — two parallel rails.**
   - Talent rail: *Get matched → Deliver → Earn spurrts.*
   - Benefactor rail: *Fund the pool → Post opportunity → Access talent.*
   - The two rails visually meet at a central node labeled **The Marketplace**.

5. **Marketplace preview.**
   - Six tiles, photographic: Trips · Vacations · Stocks · Crypto · Real Estate · Boats.
   - Each tile shows a "Coming online" badge.
   - Click any tile → email capture modal scoped to that category interest.

6. **Spurrts to Success (retention kicker).**
   - Headline: *Hold spurrts, earn more spurrts.*
   - Body: 50% of marketplace spurrts are deposited into the Success Pool. At the end of each goal period, every active holder gets a proportional payout. Then the pool resets.
   - One supporting line: *Why this exists — to reward the people who stay in the ecosystem, not just transact through it.*

7. **The Manifesto.**
   - Two pull quotes from the founder brief, large type, generous whitespace:
     - *"A rising tide lifts all boats."*
     - *"This energy is yours to use. You are held and protected."*
   - Below: a short positioning paragraph — talent and capital have always been mispriced; Spurrt is the correction.

8. **Founding cohort / waitlist.**
   - Three primary buttons, each opens a tailored email capture form:
     - **Apply as Talent** (asks: name, email, primary skill, brief on availability)
     - **Become a Benefactor** (asks: name, email, org, what you'd contribute)
     - **Become a Supplier** (asks: name, email, what you sell, fee model preference)
   - Above the buttons: counter ("X talent, Y benefactors on the waitlist") — fakeable for launch, real once we have data.

9. **FAQ.** Six questions:
   - What is a spurrt?
   - Who qualifies as Talent?
   - Can I cash out my spurrts?
   - What's the difference between a Benefactor and a Supplier?
   - What are Lives, and how do they relate to crypto?
   - When does the platform open?

10. **Footer.** Logo, brief tagline repeat, social placeholders (X, LinkedIn, Instagram), Privacy / Terms placeholders, copyright.

## Tone & visual direction

- **Mode:** dark primary (near-black `#0A0A0B`), warm cream text (`#F5F0E6`), single accent (gold `#C9A96A`).
- **Type:** large editorial serif for headlines (e.g., Fraunces or similar), clean geometric sans for body (e.g., Inter).
- **Density:** generous whitespace — this is a private-club aesthetic, not a SaaS landing page.
- **Motion:** subtle. Fade-up on scroll, gentle parallax on the hero. Never bouncy.
- **Imagery:** photographic for marketplace tiles (trips, boats, etc.); abstract texture or none elsewhere.
- **Voice:** confident, direct, never breathless. Closer to a Patek Philippe ad than a fintech.

## Tech stack

- **Framework:** Next.js 15 (App Router) + React 19.
- **Styling:** Tailwind CSS 4.
- **Hosting:** Vercel (the same project will grow into the platform later).
- **Email capture:** Form posts to a serverless route (`/api/waitlist`) that does two things: (1) sends a notification email to `jeff.cline@me.com` with the application details via Resend, and (2) logs the submission to Vercel's runtime logs. Phase 2 will add proper persistence (Vercel KV or Postgres). Vercel's filesystem is ephemeral, so we are explicitly NOT writing to a JSON file — every signup must hit a durable destination at submit time.
- **Analytics:** Vercel Analytics (privacy-friendly, no cookie banner needed).
- **Repo:** `git@github.com:jeff-cline/spurrt.git`. Pushes require explicit user sign-off per push.

## File structure

```
spurrt.com/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                # the landing page
│   ├── api/waitlist/route.ts   # email capture endpoint
│   └── globals.css
├── components/
│   ├── nav.tsx
│   ├── hero-split.tsx
│   ├── currency-explainer.tsx
│   ├── how-it-works.tsx
│   ├── marketplace-preview.tsx
│   ├── success-pool.tsx
│   ├── manifesto.tsx
│   ├── waitlist-cta.tsx
│   ├── faq.tsx
│   └── footer.tsx
├── lib/
│   └── resend-client.ts        # Resend SDK wrapper for waitlist notifications
├── public/
│   └── (marketplace tile imagery, favicon, og image)
├── docs/superpowers/specs/
│   └── 2026-05-06-spurrt-landing-design.md
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
└── README.md
```

## Success criteria

- Page loads in under 1.5s on a cold visit (Lighthouse perf ≥ 95).
- Email capture successfully delivers a notification to `jeff.cline@me.com` for every submission (verified by sending a test from each form on a deployed preview).
- Visually distinguishable from any standard SaaS template at a glance.
- Mobile-first responsive — hero split becomes vertical-stacked on mobile.

## Open decisions deferred to Phase 2+

- Whether the spurrt value ($444) and the $10M pool size are displayed as live values (admin-controlled) or hardcoded for the marketing site. Phase 1: hardcoded. Phase 2: pull from an admin-controlled source.
- Talent application flow beyond email capture (what's the next touch — auto-reply? application form? Calendly?).
- Whether the marketplace category tiles link anywhere or stay as previews.

## Next step

After user review and approval of this spec → invoke writing-plans skill to produce a step-by-step implementation plan.
