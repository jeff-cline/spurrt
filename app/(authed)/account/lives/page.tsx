import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export default async function LivesPage() {
  const session = await auth();
  const uid = (session?.user as any)?.id as string;
  if (!uid) redirect("/login");
  const balance = await db.livesBalance.upsert({
    where: { userId: uid },
    update: {},
    create: { userId: uid, amount: 0 },
  });
  const requests = await db.livesExchangeRequest.findMany({
    where: { userId: uid },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  async function requestExchange(formData: FormData) {
    "use server";
    const s = await auth();
    const id = (s?.user as any)?.id as string;
    if (!id) throw new Error("Not authed.");
    const livesAmount = Number(formData.get("livesAmount"));
    const cryptoAsset = String(formData.get("cryptoAsset") ?? "").toUpperCase().trim();
    const walletAddress = String(formData.get("walletAddress") ?? "").trim();
    if (!Number.isFinite(livesAmount) || livesAmount <= 0) throw new Error("Bad amount.");
    if (!cryptoAsset) throw new Error("Asset required.");
    if (!walletAddress) throw new Error("Wallet required.");
    const current = await db.livesBalance.findUnique({ where: { userId: id } });
    if (!current || current.amount < livesAmount) throw new Error("Insufficient Lives balance.");
    await db.$transaction([
      db.livesBalance.update({ where: { userId: id }, data: { amount: { decrement: livesAmount } } }),
      db.livesExchangeRequest.create({
        data: { userId: id, livesAmount, cryptoAsset, walletAddress, notes: "Awaiting manual fulfillment (v1 stub)." },
      }),
    ]);
    redirect("/account/lives");
  }

  return (
    <div className="max-w-2xl space-y-10">
      <div>
        <p className="text-sm uppercase tracking-widest text-gold mb-2">Lives</p>
        <h1 className="font-display text-4xl text-cream">Sister currency. Bridge to crypto.</h1>
        <p className="text-cream-dim mt-2">Lives is the rail between the Spurrt economy and outside crypto markets. v1 fulfillment is manual; the workflow becomes automated in a future phase.</p>
      </div>

      <div className="bg-ink-soft border border-cream/10 rounded-2xl p-6">
        <p className="text-xs uppercase tracking-widest text-cream-dim mb-2">Your Lives balance</p>
        <p className="font-display text-4xl text-gold">{balance.amount.toLocaleString()} <span className="text-base text-cream-dim">lives</span></p>
        <p className="text-xs text-cream-dim mt-3">Lives are issued by Spurrt admins (e.g. as part of opportunity payouts that opt into Lives). Contact admin if your balance is wrong.</p>
      </div>

      <form action={requestExchange} className="bg-ink-soft border border-cream/10 rounded-2xl p-6 space-y-4">
        <h3 className="font-display text-xl text-cream">Exchange Lives for crypto</h3>
        <p className="text-xs text-cream-dim italic">Stub — your request lands in a queue an admin processes manually until automated fulfillment ships.</p>
        <Field name="livesAmount" label="Lives to exchange" type="number" required />
        <Field name="cryptoAsset" label="Asset (BTC, ETH, USDC, ...)" required />
        <Field name="walletAddress" label="Wallet address" required />
        <button className="px-5 py-2 bg-gold text-ink rounded-full font-medium hover:bg-cream text-sm">Submit request</button>
      </form>

      <section>
        <h3 className="font-display text-xl text-cream mb-4">Your requests</h3>
        <ul className="divide-y divide-cream/10 border-y border-cream/10">
          {requests.map((r) => (
            <li key={r.id} className="py-4 flex justify-between items-center text-sm">
              <div>
                <p className="text-cream">{r.livesAmount.toLocaleString()} lives → {r.cryptoAsset}</p>
                <p className="text-cream-dim text-xs mt-1 font-mono break-all">{r.walletAddress}</p>
              </div>
              <span className={`text-xs uppercase tracking-widest ${r.status === "fulfilled" ? "text-emerald-400" : r.status === "cancelled" ? "text-rose-400" : "text-cream-dim"}`}>{r.status}</span>
            </li>
          ))}
          {requests.length === 0 && <li className="py-6 text-center text-cream-dim">No requests yet.</li>}
        </ul>
      </section>
    </div>
  );
}

function Field({ name, label, type = "text", required }: { name: string; label: string; type?: string; required?: boolean }) {
  return (
    <label className="block">
      <span className="block text-sm text-cream-dim mb-2">{label}</span>
      <input name={name} type={type} required={required} className="w-full px-4 py-3 bg-ink border border-cream/20 rounded-lg text-cream focus:border-gold focus:outline-none" />
    </label>
  );
}
