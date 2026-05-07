import { describe, it, expect, beforeEach, vi } from "vitest";

const { userFns, ledgerFns, valuationFns } = vi.hoisted(() => {
  const userFns = {
    findUnique: vi.fn(),
  };
  const ledgerFns = {
    aggregate: vi.fn(),
    create: vi.fn(),
  };
  const valuationFns = {
    update: vi.fn(),
  };
  return { userFns, ledgerFns, valuationFns };
});

vi.mock("@/lib/db", () => ({
  db: {
    user: userFns,
    ledgerEntry: ledgerFns,
    valuation: valuationFns,
    $transaction: (ops: unknown[]) => Promise.all(ops.map((op) => Promise.resolve(op))),
  },
}));

import { getBalance, godGrant, godDeduct, transfer } from "@/lib/ledger";

describe("ledger", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    userFns.findUnique.mockResolvedValue({ id: "system-id" });
  });

  it("getBalance returns credits minus debits", async () => {
    ledgerFns.aggregate
      .mockResolvedValueOnce({ _sum: { amount: 1000 } })
      .mockResolvedValueOnce({ _sum: { amount: 200 } });
    expect(await getBalance("u1")).toBe(800);
  });

  it("godGrant rejects non-positive amounts", async () => {
    await expect(godGrant({ toUserId: "u1", amount: 0 })).rejects.toThrow();
    await expect(godGrant({ toUserId: "u1", amount: -5 })).rejects.toThrow();
  });

  it("godDeduct rejects when balance insufficient", async () => {
    ledgerFns.aggregate
      .mockResolvedValueOnce({ _sum: { amount: 50 } })
      .mockResolvedValueOnce({ _sum: { amount: 0 } });
    await expect(godDeduct({ fromUserId: "u1", amount: 100 })).rejects.toThrow(/Insufficient/);
  });

  it("transfer rejects same-user transfers", async () => {
    await expect(transfer({ fromUserId: "u1", toUserId: "u1", amount: 1 })).rejects.toThrow();
  });

  it("transfer rejects when balance insufficient", async () => {
    ledgerFns.aggregate
      .mockResolvedValueOnce({ _sum: { amount: 10 } })
      .mockResolvedValueOnce({ _sum: { amount: 0 } });
    await expect(transfer({ fromUserId: "u1", toUserId: "u2", amount: 50 })).rejects.toThrow(/Insufficient/);
  });
});
