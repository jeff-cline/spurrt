import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Check = { name: string; ok: boolean; detail?: string };

export async function GET() {
  const checks: Check[] = [];

  checks.push({
    name: "AUTH_SECRET",
    ok: !!process.env.AUTH_SECRET && process.env.AUTH_SECRET.length >= 16,
    detail: process.env.AUTH_SECRET
      ? "set"
      : "MISSING — generate with `openssl rand -base64 32` and set in server env",
  });

  checks.push({
    name: "DATABASE_URL",
    ok: !!process.env.DATABASE_URL,
    detail: process.env.DATABASE_URL
      ? `set (${process.env.DATABASE_URL.startsWith("file:") ? "sqlite" : "external"})`
      : "MISSING — set DATABASE_URL in server env",
  });

  let dbOk = false;
  let dbDetail = "";
  try {
    const valuation = await db.valuation.findUnique({ where: { id: 1 } });
    if (!valuation) {
      dbDetail = "DB reachable but not seeded — run `npm run seed`";
    } else {
      dbDetail = `DB reachable, valuation initialized (1 spurrt = $${(valuation.spurrtCents / 100).toFixed(2)})`;
      dbOk = true;
    }
  } catch (err) {
    dbDetail = `DB unreachable: ${err instanceof Error ? err.message : "unknown error"}`;
  }
  checks.push({ name: "database", ok: dbOk, detail: dbDetail });

  let godOk = false;
  let godDetail = "";
  try {
    const god = await db.user.findFirst({ where: { isGod: true } });
    if (god) {
      godOk = true;
      godDetail = `God user present (${god.email})`;
    } else {
      godDetail = "No God user — set GOD_ADMIN_EMAIL/GOD_ADMIN_PASSWORD in env and run `npm run seed`";
    }
  } catch {
    godDetail = "Skipped (DB unreachable)";
  }
  checks.push({ name: "god-admin", ok: godOk, detail: godDetail });

  const allOk = checks.every((c) => c.ok);
  return NextResponse.json(
    { ok: allOk, checks },
    { status: allOk ? 200 : 503 },
  );
}
