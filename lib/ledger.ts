import { db } from "@/lib/db";
import { randomUUID } from "node:crypto";

export type LedgerCategory =
  | "god_grant"
  | "god_deduct"
  | "transfer"
  | "earn"
  | "redeem"
  | "escrow_lock"
  | "escrow_release"
  | "platform_fee"
  | "success_payout"
  | "trade_in"
  | "trade_out";

const SYSTEM_EMAIL = "system@spurrt.com";

async function systemUserId() {
  const u = await db.user.findUnique({ where: { email: SYSTEM_EMAIL }, select: { id: true } });
  if (!u) throw new Error("System Pool user missing — run `npm run seed`.");
  return u.id;
}

export async function getBalance(userId: string): Promise<number> {
  const credits = await db.ledgerEntry.aggregate({
    _sum: { amount: true },
    where: { userId, direction: "credit" },
  });
  const debits = await db.ledgerEntry.aggregate({
    _sum: { amount: true },
    where: { userId, direction: "debit" },
  });
  return (credits._sum.amount ?? 0) - (debits._sum.amount ?? 0);
}

export async function godGrant(opts: {
  toUserId: string;
  amount: number;
  notes?: string;
  reference?: string;
}): Promise<string> {
  if (opts.amount <= 0) throw new Error("Amount must be positive.");
  const sysId = await systemUserId();
  const transferId = randomUUID();
  await db.$transaction([
    db.ledgerEntry.create({
      data: {
        userId: opts.toUserId,
        amount: opts.amount,
        direction: "credit",
        category: "god_grant",
        notes: opts.notes,
        reference: opts.reference,
        transferId,
      },
    }),
    db.ledgerEntry.create({
      data: {
        userId: sysId,
        amount: opts.amount,
        direction: "debit",
        category: "god_grant",
        notes: opts.notes,
        reference: opts.reference,
        transferId,
      },
    }),
    db.valuation.update({
      where: { id: 1 },
      data: { totalIssued: { increment: opts.amount } },
    }),
  ]);
  return transferId;
}

export async function godDeduct(opts: {
  fromUserId: string;
  amount: number;
  notes?: string;
  reference?: string;
}): Promise<string> {
  if (opts.amount <= 0) throw new Error("Amount must be positive.");
  const balance = await getBalance(opts.fromUserId);
  if (balance < opts.amount) throw new Error(`Insufficient balance (have ${balance}).`);
  const sysId = await systemUserId();
  const transferId = randomUUID();
  await db.$transaction([
    db.ledgerEntry.create({
      data: {
        userId: opts.fromUserId,
        amount: opts.amount,
        direction: "debit",
        category: "god_deduct",
        notes: opts.notes,
        reference: opts.reference,
        transferId,
      },
    }),
    db.ledgerEntry.create({
      data: {
        userId: sysId,
        amount: opts.amount,
        direction: "credit",
        category: "god_deduct",
        notes: opts.notes,
        reference: opts.reference,
        transferId,
      },
    }),
    db.valuation.update({
      where: { id: 1 },
      data: { totalIssued: { decrement: opts.amount } },
    }),
  ]);
  return transferId;
}

export async function transfer(opts: {
  fromUserId: string;
  toUserId: string;
  amount: number;
  category?: LedgerCategory;
  notes?: string;
  reference?: string;
}): Promise<string> {
  if (opts.amount <= 0) throw new Error("Amount must be positive.");
  if (opts.fromUserId === opts.toUserId) throw new Error("Cannot transfer to self.");
  const balance = await getBalance(opts.fromUserId);
  if (balance < opts.amount) throw new Error(`Insufficient balance (have ${balance}).`);
  const transferId = randomUUID();
  const cat = opts.category ?? "transfer";
  await db.$transaction([
    db.ledgerEntry.create({
      data: {
        userId: opts.fromUserId,
        amount: opts.amount,
        direction: "debit",
        category: cat,
        notes: opts.notes,
        reference: opts.reference,
        transferId,
      },
    }),
    db.ledgerEntry.create({
      data: {
        userId: opts.toUserId,
        amount: opts.amount,
        direction: "credit",
        category: cat,
        notes: opts.notes,
        reference: opts.reference,
        transferId,
      },
    }),
  ]);
  return transferId;
}

export async function getValuation() {
  const v = await db.valuation.findUnique({ where: { id: 1 } });
  if (!v) throw new Error("Valuation row missing — run `npm run seed`.");
  return v;
}
