import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireGod } from "@/lib/auth-helpers";
import { distributeSuccessPool } from "@/lib/marketplace";

export default async function SuccessPoolAdmin() {
  const me = await requireGod();
  const success = await db.user.findUnique({ where: { email: "success@spurrt.com" }, select: { id: true } });
  let poolBalance = 0;
  if (success) {
    const c = await db.ledgerEntry.aggregate({ _sum: { amount: true }, where: { userId: success.id, direction: "credit" } });
    const d = await db.ledgerEntry.aggregate({ _sum: { amount: true }, where: { userId: success.id, direction: "debit" } });
    poolBalance = (c._sum.amount ?? 0) - (d._sum.amount ?? 0);
  }
  const distributions = await db.successPoolDistribution.findMany({ orderBy: { createdAt: "desc" }, take: 10 });

  async function distribute() {
    "use server";
    const u = await requireGod();
    await distributeSuccessPool({ triggeredById: u.id });
    redirect("/admin/success-pool");
  }

  return (
    <div className="max-w-3xl space-y-10">
      <div>
        <p className="text-sm uppercase tracking-widest text-gold mb-2">Periodic distribution</p>
        <h1 className="font-display text-4xl text-cream">Spurrts to Success</h1>
      </div>

      <div className="bg-ink-soft border border-cream/10 rounded-2xl p-6">
        <p className="text-xs uppercase tracking-widest text-cream-dim mb-2">Pool balance</p>
        <p className="font-display text-4xl text-gold mb-4">{poolBalance.toLocaleString()} spurrts</p>
        <form action={distribute}>
          <button disabled={poolBalance <= 0} className="px-6 py-3 bg-gold text-ink rounded-full font-medium hover:bg-cream disabled:opacity-50">
            Distribute proportionally to all holders
          </button>
        </form>
        <p className="text-xs text-cream-dim mt-3">
          Each non-system user with a positive spurrt balance receives a share proportional to their balance. The pool drains to zero.
        </p>
      </div>

      <section>
        <h3 className="font-display text-xl text-cream mb-4">Recent distributions</h3>
        <ul className="divide-y divide-cream/10 border-y border-cream/10">
          {distributions.map((d) => (
            <li key={d.id} className="py-4 flex justify-between text-sm">
              <span className="text-cream-dim">{new Date(d.createdAt).toLocaleString()}</span>
              <span className="text-cream">
                {d.totalDistributed.toLocaleString()} spurrts → {d.recipientCount} holders
              </span>
            </li>
          ))}
          {distributions.length === 0 && <li className="py-6 text-center text-cream-dim">No distributions yet.</li>}
        </ul>
      </section>
    </div>
  );
}
