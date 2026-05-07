import { describe, it, expect, vi, beforeEach } from "vitest";

const t = vi.hoisted(() => ({
  user: { findUnique: vi.fn(), findMany: vi.fn() },
  listing: { findUnique: vi.fn() },
  purchase: { create: vi.fn() },
  ledgerEntry: { aggregate: vi.fn() },
  successPoolDistribution: { create: vi.fn().mockResolvedValue({}) },
}));

vi.mock("@/lib/db", () => ({
  db: {
    user: t.user,
    listing: t.listing,
    purchase: t.purchase,
    ledgerEntry: t.ledgerEntry,
    successPoolDistribution: t.successPoolDistribution,
  },
}));

const transferMock = vi.hoisted(() => vi.fn().mockResolvedValue("t-id"));
vi.mock("@/lib/ledger", () => ({
  transfer: transferMock,
}));

import { purchaseListing, distributeSuccessPool } from "@/lib/marketplace";

describe("marketplace.purchaseListing", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    t.user.findUnique.mockImplementation(({ where }: any) => {
      if (where.email === "fees@spurrt.com") return Promise.resolve({ id: "fees-id" });
      if (where.email === "success@spurrt.com") return Promise.resolve({ id: "success-id" });
      return Promise.resolve(null);
    });
    t.purchase.create.mockResolvedValue({ id: "p1" });
  });

  it("splits 1000-spurrt purchase: 900 seller, 50 fee, 50 pool", async () => {
    t.listing.findUnique.mockResolvedValue({ id: "l1", sellerId: "seller", spurrtPrice: 1000, active: true, title: "X" });
    const r = await purchaseListing({ buyerId: "buyer", listingId: "l1" });
    expect(r.sellerShare).toBe(900);
    expect(r.fee).toBe(50);
    expect(r.poolShare).toBe(50);
    expect(transferMock).toHaveBeenCalledTimes(3);
  });

  it("rejects buying own listing", async () => {
    t.listing.findUnique.mockResolvedValue({ id: "l1", sellerId: "buyer", spurrtPrice: 1000, active: true, title: "X" });
    await expect(purchaseListing({ buyerId: "buyer", listingId: "l1" })).rejects.toThrow();
  });

  it("rejects inactive listing", async () => {
    t.listing.findUnique.mockResolvedValue({ id: "l1", sellerId: "seller", spurrtPrice: 1000, active: false, title: "X" });
    await expect(purchaseListing({ buyerId: "buyer", listingId: "l1" })).rejects.toThrow();
  });
});

describe("marketplace.distributeSuccessPool", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    t.user.findUnique.mockResolvedValue({ id: "success-id" });
    t.user.findMany.mockResolvedValue([
      { id: "u1" },
      { id: "u2" },
    ]);
  });

  it("returns zero when pool empty", async () => {
    t.ledgerEntry.aggregate.mockResolvedValue({ _sum: { amount: 0 } });
    const r = await distributeSuccessPool({ triggeredById: "g" });
    expect(r.totalDistributed).toBe(0);
  });

  it("splits pool proportionally between two holders", async () => {
    // First: pool credits=1000, debits=0 → pool balance = 1000
    // Then: u1 credits=300, debits=0
    //       u1 balance = 300
    //       u2 credits=700, debits=0
    //       u2 balance = 700
    let call = 0;
    t.ledgerEntry.aggregate.mockImplementation(() => {
      call++;
      // call 1: pool credits, 2: pool debits, 3: u1 credits, 4: u1 debits, 5: u2 credits, 6: u2 debits
      const map = [1000, 0, 300, 0, 700, 0];
      return Promise.resolve({ _sum: { amount: map[call - 1] ?? 0 } });
    });
    const r = await distributeSuccessPool({ triggeredById: "g" });
    expect(r.totalSpurrtsHeld).toBe(1000);
    expect(r.recipientCount).toBe(2);
    expect(r.totalDistributed).toBe(1000);
    // u1 should get 300/1000 * 1000 = 300, u2 700
    const calls = transferMock.mock.calls.map((c) => c[0]);
    const u1 = calls.find((c: any) => c.toUserId === "u1");
    const u2 = calls.find((c: any) => c.toUserId === "u2");
    expect(u1?.amount).toBe(300);
    expect(u2?.amount).toBe(700);
  });
});
