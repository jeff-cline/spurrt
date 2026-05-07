import { db } from "@/lib/db";
import { transfer } from "@/lib/ledger";

const FEES_EMAIL = "fees@spurrt.com";
const SUCCESS_EMAIL = "success@spurrt.com";
const PLATFORM_FEE_BPS = 1000; // 10%
const SUCCESS_POOL_SHARE_OF_FEE_BPS = 5000; // 50% of the platform fee goes to the success pool

async function feesUserId() {
  const u = await db.user.findUnique({ where: { email: FEES_EMAIL }, select: { id: true } });
  if (!u) throw new Error("Fees user missing — run `npm run seed`.");
  return u.id;
}
async function successUserId() {
  const u = await db.user.findUnique({ where: { email: SUCCESS_EMAIL }, select: { id: true } });
  if (!u) throw new Error("Success Pool user missing — run `npm run seed`.");
  return u.id;
}

/**
 * Buyer pays full amount: seller gets 90%, fees gets 5%, success pool gets 5%.
 * Returns the breakdown.
 */
export async function purchaseListing(opts: {
  buyerId: string;
  listingId: string;
}): Promise<{ purchaseId: string; amount: number; sellerShare: number; fee: number; poolShare: number }> {
  const listing = await db.listing.findUnique({ where: { id: opts.listingId } });
  if (!listing || !listing.active) throw new Error("Listing unavailable.");
  if (listing.sellerId === opts.buyerId) throw new Error("Cannot buy your own listing.");
  const fees = await feesUserId();
  const success = await successUserId();
  const amount = listing.spurrtPrice;
  const totalFee = Math.floor((amount * PLATFORM_FEE_BPS) / 10000);
  const poolShare = Math.floor((totalFee * SUCCESS_POOL_SHARE_OF_FEE_BPS) / 10000);
  const fee = totalFee - poolShare;
  const sellerShare = amount - totalFee;

  await transfer({
    fromUserId: opts.buyerId,
    toUserId: listing.sellerId,
    amount: sellerShare,
    category: "redeem",
    reference: listing.id,
    notes: `Marketplace purchase ${listing.title} (seller share)`,
  });
  if (fee > 0) {
    await transfer({
      fromUserId: opts.buyerId,
      toUserId: fees,
      amount: fee,
      category: "platform_fee",
      reference: listing.id,
      notes: `Platform fee on ${listing.title}`,
    });
  }
  if (poolShare > 0) {
    await transfer({
      fromUserId: opts.buyerId,
      toUserId: success,
      amount: poolShare,
      category: "success_payout",
      reference: listing.id,
      notes: `Spurrts to Success pool deposit from ${listing.title}`,
    });
  }
  const purchase = await db.purchase.create({
    data: {
      listingId: listing.id,
      buyerId: opts.buyerId,
      amount,
      feeAmount: fee,
      poolAmount: poolShare,
    },
  });
  return { purchaseId: purchase.id, amount, sellerShare, fee, poolShare };
}

/**
 * Distribute the entire success pool balance proportionally to all spurrt-holders
 * (excluding system users). Returns the distribution summary.
 */
export async function distributeSuccessPool(opts: { triggeredById: string }): Promise<{
  totalDistributed: number;
  recipientCount: number;
  totalSpurrtsHeld: number;
}> {
  const successId = await successUserId();
  const successUser = await db.user.findUnique({ where: { email: SUCCESS_EMAIL }, select: { id: true } });
  if (!successUser) throw new Error("Success Pool missing.");

  // Compute success pool balance
  const credits = await db.ledgerEntry.aggregate({ _sum: { amount: true }, where: { userId: successUser.id, direction: "credit" } });
  const debits = await db.ledgerEntry.aggregate({ _sum: { amount: true }, where: { userId: successUser.id, direction: "debit" } });
  const poolBalance = (credits._sum.amount ?? 0) - (debits._sum.amount ?? 0);
  if (poolBalance <= 0) {
    return { totalDistributed: 0, recipientCount: 0, totalSpurrtsHeld: 0 };
  }

  // Find all real users with positive balance (exclude system users)
  const systemEmails = ["system@spurrt.com", "escrow@spurrt.com", "fees@spurrt.com", "success@spurrt.com"];
  const realUsers = await db.user.findMany({
    where: { email: { notIn: systemEmails } },
    select: { id: true },
  });
  const balances: { id: string; balance: number }[] = [];
  for (const u of realUsers) {
    const c = await db.ledgerEntry.aggregate({ _sum: { amount: true }, where: { userId: u.id, direction: "credit" } });
    const d = await db.ledgerEntry.aggregate({ _sum: { amount: true }, where: { userId: u.id, direction: "debit" } });
    const b = (c._sum.amount ?? 0) - (d._sum.amount ?? 0);
    if (b > 0) balances.push({ id: u.id, balance: b });
  }
  const totalHeld = balances.reduce((sum, x) => sum + x.balance, 0);
  if (totalHeld <= 0) {
    return { totalDistributed: 0, recipientCount: 0, totalSpurrtsHeld: 0 };
  }

  let distributed = 0;
  let recipientCount = 0;
  for (const u of balances) {
    const share = Math.floor((poolBalance * u.balance) / totalHeld);
    if (share > 0) {
      await transfer({
        fromUserId: successId,
        toUserId: u.id,
        amount: share,
        category: "success_payout",
        notes: "Spurrts to Success distribution",
      });
      distributed += share;
      recipientCount++;
    }
  }
  await db.successPoolDistribution.create({
    data: {
      triggeredById: opts.triggeredById,
      totalDistributed: distributed,
      totalSpurrtsHeld: totalHeld,
      recipientCount,
    },
  });
  return { totalDistributed: distributed, recipientCount, totalSpurrtsHeld: totalHeld };
}
