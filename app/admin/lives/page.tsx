import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireGod } from "@/lib/auth-helpers";

export default async function LivesAdmin() {
  await requireGod();
  const requests = await db.livesExchangeRequest.findMany({
    include: { user: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  const balances = await db.livesBalance.findMany({
    include: { user: { select: { name: true, email: true } } },
    orderBy: { amount: "desc" },
    take: 50,
  });

  async function grant(formData: FormData) {
    "use server";
    await requireGod();
    const email = String(formData.get("email") ?? "").toLowerCase().trim();
    const amount = Number(formData.get("amount"));
    if (!email || !Number.isFinite(amount) || amount <= 0) throw new Error("Bad input.");
    const u = await db.user.findUnique({ where: { email } });
    if (!u) throw new Error("User not found.");
    await db.livesBalance.upsert({
      where: { userId: u.id },
      update: { amount: { increment: amount } },
      create: { userId: u.id, amount },
    });
    redirect("/admin/lives");
  }

  async function setStatus(formData: FormData) {
    "use server";
    await requireGod();
    const id = String(formData.get("id"));
    const status = String(formData.get("status"));
    if (!["fulfilled", "cancelled"].includes(status)) throw new Error("Bad status.");
    await db.livesExchangeRequest.update({ where: { id }, data: { status } });
    redirect("/admin/lives");
  }

  return (
    <div className="space-y-10">
      <h1 className="font-display text-4xl text-cream">Lives</h1>

      <form action={grant} className="bg-ink-soft border border-cream/10 rounded-2xl p-6 grid grid-cols-1 md:grid-cols-3 gap-3">
        <input name="email" placeholder="user email" required className="px-3 py-2 bg-ink border border-cream/20 rounded text-cream" />
        <input name="amount" type="number" placeholder="lives to grant" required className="px-3 py-2 bg-ink border border-cream/20 rounded text-cream" />
        <button className="px-5 py-2 bg-gold text-ink rounded-full font-medium hover:bg-cream text-sm">Grant Lives</button>
      </form>

      <section>
        <h3 className="font-display text-xl text-cream mb-4">Exchange requests</h3>
        <div className="bg-ink-soft border border-cream/10 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-ink/50 text-cream-dim text-xs uppercase tracking-widest">
              <tr>
                <th className="text-left p-3">When</th>
                <th className="text-left p-3">User</th>
                <th className="text-right p-3">Lives</th>
                <th className="text-left p-3">Asset</th>
                <th className="text-left p-3">Wallet</th>
                <th className="text-left p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream/10">
              {requests.map((r) => (
                <tr key={r.id}>
                  <td className="p-3 text-cream-dim text-xs">{new Date(r.createdAt).toLocaleString()}</td>
                  <td className="p-3 text-cream">{r.user.name} <span className="text-cream-dim text-xs">{r.user.email}</span></td>
                  <td className="p-3 text-right text-cream font-mono">{r.livesAmount.toLocaleString()}</td>
                  <td className="p-3 text-cream">{r.cryptoAsset}</td>
                  <td className="p-3 text-cream-dim font-mono text-xs break-all">{r.walletAddress}</td>
                  <td className="p-3">
                    {r.status === "pending" ? (
                      <div className="flex gap-2">
                        <form action={setStatus}>
                          <input type="hidden" name="id" value={r.id} />
                          <input type="hidden" name="status" value="fulfilled" />
                          <button className="text-emerald-400 hover:text-cream text-xs">Fulfill</button>
                        </form>
                        <form action={setStatus}>
                          <input type="hidden" name="id" value={r.id} />
                          <input type="hidden" name="status" value="cancelled" />
                          <button className="text-rose-400 hover:text-cream text-xs">Cancel</button>
                        </form>
                      </div>
                    ) : (
                      <span className={`text-xs uppercase tracking-widest ${r.status === "fulfilled" ? "text-emerald-400" : "text-rose-400"}`}>{r.status}</span>
                    )}
                  </td>
                </tr>
              ))}
              {requests.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-cream-dim">No requests.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h3 className="font-display text-xl text-cream mb-4">Top Lives balances</h3>
        <div className="bg-ink-soft border border-cream/10 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-ink/50 text-cream-dim text-xs uppercase tracking-widest">
              <tr>
                <th className="text-left p-3">User</th>
                <th className="text-right p-3">Lives</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream/10">
              {balances.map((b) => (
                <tr key={b.userId}>
                  <td className="p-3 text-cream">{b.user.name} <span className="text-cream-dim text-xs">{b.user.email}</span></td>
                  <td className="p-3 text-right text-cream font-mono">{b.amount.toLocaleString()}</td>
                </tr>
              ))}
              {balances.length === 0 && <tr><td colSpan={2} className="p-6 text-center text-cream-dim">No balances yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
