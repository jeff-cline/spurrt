import { db } from "@/lib/db";
import { transfer } from "@/lib/ledger";

const ESCROW_EMAIL = "escrow@spurrt.com";
const FEES_EMAIL = "fees@spurrt.com";
const PLATFORM_FEE_BPS = 1000; // 10% in basis points

async function escrowUserId() {
  const u = await db.user.findUnique({ where: { email: ESCROW_EMAIL }, select: { id: true } });
  if (!u) throw new Error("Escrow user missing — run `npm run seed`.");
  return u.id;
}
async function feesUserId() {
  const u = await db.user.findUnique({ where: { email: FEES_EMAIL }, select: { id: true } });
  if (!u) throw new Error("Fees user missing — run `npm run seed`.");
  return u.id;
}

export async function lockEscrow(opts: { fromUserId: string; opportunityId: string; amount: number }) {
  const escrow = await escrowUserId();
  return transfer({
    fromUserId: opts.fromUserId,
    toUserId: escrow,
    amount: opts.amount,
    category: "escrow_lock",
    reference: opts.opportunityId,
    notes: `Escrow lock for opportunity ${opts.opportunityId}`,
  });
}

export async function releaseMilestone(opts: { opportunityId: string; toUserId: string; amount: number; milestoneId: string }) {
  const escrow = await escrowUserId();
  const fees = await feesUserId();
  const platformFee = Math.floor((opts.amount * PLATFORM_FEE_BPS) / 10000);
  const talentShare = opts.amount - platformFee;
  await transfer({
    fromUserId: escrow,
    toUserId: opts.toUserId,
    amount: talentShare,
    category: "escrow_release",
    reference: opts.milestoneId,
    notes: `Milestone release ${opts.milestoneId} (talent share)`,
  });
  if (platformFee > 0) {
    await transfer({
      fromUserId: escrow,
      toUserId: fees,
      amount: platformFee,
      category: "platform_fee",
      reference: opts.milestoneId,
      notes: `Platform fee for milestone ${opts.milestoneId}`,
    });
  }
  return { talentShare, platformFee };
}

export async function refundEscrow(opts: { toUserId: string; amount: number; opportunityId: string; reason?: string }) {
  const escrow = await escrowUserId();
  return transfer({
    fromUserId: escrow,
    toUserId: opts.toUserId,
    amount: opts.amount,
    category: "escrow_release",
    reference: opts.opportunityId,
    notes: opts.reason ?? `Escrow refund for opportunity ${opts.opportunityId}`,
  });
}

export const PLATFORM_FEE_PERCENT = PLATFORM_FEE_BPS / 100;
