#!/usr/bin/env bash
# scripts/bootstrap.sh
# Run this on the production server after every deploy.
# Idempotent — safe to run repeatedly. Will not overwrite the God user once it exists.

set -euo pipefail

echo "[bootstrap] Spurrt server bootstrap starting..."

# 1. Verify required env vars
required=(AUTH_SECRET DATABASE_URL GOD_ADMIN_EMAIL GOD_ADMIN_PASSWORD)
missing=()
for var in "${required[@]}"; do
  if [ -z "${!var:-}" ]; then
    missing+=("$var")
  fi
done
if [ ${#missing[@]} -gt 0 ]; then
  echo "[bootstrap] ERROR: missing required env vars: ${missing[*]}"
  echo "[bootstrap]   AUTH_SECRET:        run 'openssl rand -base64 32'"
  echo "[bootstrap]   DATABASE_URL:       'file:./dev.db' for SQLite, or a Postgres URL"
  echo "[bootstrap]   GOD_ADMIN_EMAIL:    your admin email"
  echo "[bootstrap]   GOD_ADMIN_PASSWORD: your admin password (will be hashed once)"
  exit 1
fi

# 2. Install dependencies (skips if node_modules is fresh)
if [ ! -d node_modules ]; then
  echo "[bootstrap] Installing dependencies..."
  npm ci
else
  echo "[bootstrap] node_modules present, skipping npm ci."
fi

# 3. Generate Prisma client
echo "[bootstrap] Generating Prisma client..."
npx prisma generate

# 4. Apply DB schema (creates SQLite file if needed; safe to re-run)
echo "[bootstrap] Applying DB schema..."
npx prisma db push --accept-data-loss=false

# 5. Seed God admin, system users, and default categories
echo "[bootstrap] Running seed..."
npm run seed

# 6. Build (skipped if already built — caller should usually run 'npm run build' separately)
if [ ! -d .next ]; then
  echo "[bootstrap] Building Next.js app..."
  npm run build
fi

echo "[bootstrap] Done. Start the server with 'npm run start'."
