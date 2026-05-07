import { describe, it, expect, vi, beforeEach } from "vitest";

const t = vi.hoisted(() => ({
  user: { findUnique: vi.fn() },
  ledgerEntry: { aggregate: vi.fn() },
}));

vi.mock("@/lib/db", () => ({
  db: {
    user: t.user,
    ledgerEntry: t.ledgerEntry,
    valuation: { update: vi.fn() },
    $transaction: (ops: unknown[]) => Promise.all(ops.map((op) => Promise.resolve(op))),
  },
}));

const transferMock = vi.hoisted(() => vi.fn().mockResolvedValue("t-id"));
vi.mock("@/lib/ledger", () => ({
  transfer: transferMock,
}));

import { lockEscrow, releaseMilestone, refundEscrow, PLATFORM_FEE_PERCENT } from "@/lib/escrow";

describe("escrow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    t.user.findUnique.mockImplementation(({ where }: any) => {
      if (where.email === "escrow@spurrt.com") return Promise.resolve({ id: "escrow-id" });
      if (where.email === "fees@spurrt.com") return Promise.resolve({ id: "fees-id" });
      return Promise.resolve(null);
    });
  });

  it("PLATFORM_FEE_PERCENT is 10", () => {
    expect(PLATFORM_FEE_PERCENT).toBe(10);
  });

  it("lockEscrow transfers from benefactor to escrow user", async () => {
    await lockEscrow({ fromUserId: "b1", opportunityId: "op1", amount: 1000 });
    expect(transferMock).toHaveBeenCalledWith(expect.objectContaining({
      fromUserId: "b1",
      toUserId: "escrow-id",
      amount: 1000,
      category: "escrow_lock",
    }));
  });

  it("releaseMilestone splits 90/10 between talent and fees", async () => {
    const result = await releaseMilestone({ opportunityId: "op1", toUserId: "talent1", amount: 1000, milestoneId: "m1" });
    expect(result.talentShare).toBe(900);
    expect(result.platformFee).toBe(100);
    expect(transferMock).toHaveBeenCalledTimes(2);
  });

  it("releaseMilestone with amount 1 (rounding) gives talent everything", async () => {
    const result = await releaseMilestone({ opportunityId: "op1", toUserId: "talent1", amount: 1, milestoneId: "m1" });
    expect(result.platformFee).toBe(0);
    expect(result.talentShare).toBe(1);
  });

  it("refundEscrow transfers from escrow back to original benefactor", async () => {
    await refundEscrow({ toUserId: "b1", amount: 500, opportunityId: "op1" });
    expect(transferMock).toHaveBeenCalledWith(expect.objectContaining({
      fromUserId: "escrow-id",
      toUserId: "b1",
      amount: 500,
      category: "escrow_release",
    }));
  });
});
