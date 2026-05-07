import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireGod } from "@/lib/auth-helpers";
import { getValuation } from "@/lib/ledger";

export default async function ValuationPage() {
  const me = await requireGod();
  const v = await getValuation();

  async function update(formData: FormData) {
    "use server";
    const u = await requireGod();
    const spurrtDollars = Number(formData.get("spurrt"));
    const poolDollars = Number(formData.get("pool"));
    if (!Number.isFinite(spurrtDollars) || spurrtDollars < 0) throw new Error("Bad spurrt value.");
    if (!Number.isFinite(poolDollars) || poolDollars < 0) throw new Error("Bad pool value.");
    await db.valuation.update({
      where: { id: 1 },
      data: {
        spurrtCents: Math.round(spurrtDollars * 100),
        poolCents: Math.round(poolDollars * 100),
        updatedById: u.id,
      },
    });
    redirect("/admin/valuation");
  }

  return (
    <div className="max-w-2xl space-y-8">
      <h1 className="font-display text-4xl text-cream">Valuation</h1>
      <p className="text-cream-dim">
        Set the current dollar value of one spurrt and the size of the profit pool. Talent and benefactors see the spurrt value across the platform; the pool size feeds the Spurrts to Success calculation.
      </p>

      <form action={update} className="bg-ink-soft border border-cream/10 rounded-2xl p-8 space-y-6">
        <label className="block">
          <span className="block text-sm text-cream-dim mb-2">1 spurrt = $</span>
          <input
            name="spurrt"
            type="number"
            min="0"
            step="0.01"
            defaultValue={(v.spurrtCents / 100).toFixed(2)}
            className="w-full px-4 py-3 bg-ink border border-cream/20 rounded-lg text-cream focus:border-gold focus:outline-none font-mono"
          />
        </label>
        <label className="block">
          <span className="block text-sm text-cream-dim mb-2">Profit pool ($)</span>
          <input
            name="pool"
            type="number"
            min="0"
            step="1"
            defaultValue={(v.poolCents / 100).toFixed(0)}
            className="w-full px-4 py-3 bg-ink border border-cream/20 rounded-lg text-cream focus:border-gold focus:outline-none font-mono"
          />
        </label>
        <p className="text-xs text-cream-dim">
          Last updated {new Date(v.updatedAt).toLocaleString()}
          {v.updatedById ? " by an admin" : ""}.
        </p>
        <button className="px-6 py-3 bg-gold text-ink rounded-full hover:bg-cream font-medium">
          Save
        </button>
      </form>
    </div>
  );
}
