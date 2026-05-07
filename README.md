# spurrt.com

The Spurrt platform — a micro-economy where underutilized time meets underutilized opportunity.

## Stack

- Next.js 15 (App Router) + React 18 + TypeScript
- Tailwind CSS 4
- Auth.js v5 (credentials, JWT sessions, bcrypt password hashing)
- Prisma + SQLite (swap to Postgres by changing the `provider` in `prisma/schema.prisma`)
- Zod (form validation)
- Resend (waitlist notification emails)
- Vitest (unit tests)

## Local development

```bash
npm install
cp .env.example .env.local
# fill in AUTH_SECRET, GOD_ADMIN_EMAIL, GOD_ADMIN_PASSWORD, DATABASE_URL
npx prisma db push
npm run seed
npm run dev
# open http://localhost:3000
```

`npm run seed` is **idempotent** — safe to re-run. It creates the God admin, system users, and default marketplace categories the first time and skips them after.

## Tests

```bash
npm test
```

21 tests across waitlist API, ledger, escrow, and marketplace logic.

## Environment variables

All set in `.env.local` for local development, and on the production server for deploys. Never commit `.env.local`.

| Variable | Required | Purpose |
|---|---|---|
| `AUTH_SECRET` | yes | Auth.js JWT signing. Generate with `openssl rand -base64 32`. |
| `DATABASE_URL` | yes | `file:./dev.db` for SQLite, or a Postgres connection string. |
| `GOD_ADMIN_EMAIL` | yes (first boot) | Read once by the seed to create the God admin. |
| `GOD_ADMIN_PASSWORD` | yes (first boot) | Hashed by the seed; ignored after God user exists. |
| `RESEND_API_KEY` | optional | Without it, waitlist submissions log to console. |

## Deployment

Whatever your deploy mechanism — Vercel, a VPS, Docker, anything — the server side needs four steps after the code lands:

```bash
npm ci
npx prisma generate
npx prisma db push          # creates / migrates the DB
npm run seed                # creates God admin + system users + default categories
npm run build
npm run start               # or whatever your supervisor uses
```

A wrapper script that does all of this is at `scripts/bootstrap.sh`. Run it on the server after every deploy:

```bash
./scripts/bootstrap.sh
```

The script:
- verifies all required env vars are present (fails loudly if not)
- installs deps if missing
- generates the Prisma client
- applies the DB schema (idempotent)
- runs the seed (idempotent)
- builds the app if `.next/` is missing

### Diagnostic endpoint

After the server is running, hit `https://your-domain/healthz`. It returns JSON like:

```json
{
  "ok": true,
  "checks": [
    { "name": "AUTH_SECRET", "ok": true, "detail": "set" },
    { "name": "DATABASE_URL", "ok": true, "detail": "set (sqlite)" },
    { "name": "database", "ok": true, "detail": "DB reachable, valuation initialized (1 spurrt = $444.00)" },
    { "name": "god-admin", "ok": true, "detail": "God user present (jeff.cline@me.com)" }
  ]
}
```

If `ok` is `false`, the `checks` array tells you exactly what's missing.

### SQLite + ephemeral filesystems

If your deploy target has an ephemeral filesystem (Vercel, certain serverless setups), SQLite will lose all data on every redeploy. Use Postgres in that case: change `provider = "sqlite"` to `provider = "postgresql"` in `prisma/schema.prisma`, set `DATABASE_URL` to a Postgres connection string, and re-run `npx prisma db push`.

## Brand naming

- **Spurrt** (capitalized) — the brand and platform.
- **spurrt / spurrts** (lowercase) — the currency unit, treated like "dollar / dollars."
- **Spurrts to Success** (Title Case) — feature name for the retention pool.
- The acronym **SPURTT** is not used in public copy.

## Architecture

- **Public marketing**: `/` (landing), `/login` (credentials), `/api/waitlist` (Resend-backed)
- **Authed platform**: `/account`, `/talent`, `/opportunities`, `/marketplace`, `/account/trade`, `/account/lives`, `/account/listings`
- **God admin**: `/admin/{users,valuation,categories,lives,success-pool}`
- **Money plumbing**:
  - `lib/ledger.ts` — `getBalance`, `godGrant`, `godDeduct`, `transfer` (double-entry with paired ledger writes)
  - `lib/escrow.ts` — `lockEscrow`, `releaseMilestone`, `refundEscrow` (10% platform fee)
  - `lib/marketplace.ts` — `purchaseListing` (90% seller / 5% platform / 5% Spurrts to Success), `distributeSuccessPool`
- **System users** (created by seed, can't log in): System Pool, Escrow, Platform Fees, Spurrts to Success Pool

## Roadmap

| Phase | Status | What |
|---|---|---|
| 1 | ✅ shipped | Marketing landing page |
| 2 | ✅ shipped | Auth + role system + spurrt ledger + valuation engine + admin panel |
| 3 | ✅ shipped | Talent board + opportunities + milestone escrow |
| 4 | ✅ shipped | Marketplace (categories, listings, purchases) + supplier flow |
| 5 | ✅ shipped | Talent-to-talent trading + Lives token (manual crypto exchange stub) + Spurrts to Success distributor |
| 6 | next | Sub-account permission UI, password reset, image uploads, automated crypto exchange |

## Design spec & implementation plan

- Phase 1 spec: [`docs/superpowers/specs/2026-05-06-spurrt-landing-design.md`](docs/superpowers/specs/2026-05-06-spurrt-landing-design.md)
- Phase 1 plan: [`docs/superpowers/plans/2026-05-06-spurrt-landing-page.md`](docs/superpowers/plans/2026-05-06-spurrt-landing-page.md)
