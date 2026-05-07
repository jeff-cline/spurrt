import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { getBalance, godGrant, godDeduct } from "@/lib/ledger";
import { requireGod } from "@/lib/auth-helpers";

export default async function UserDrillIn({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireGod();

  const user = await db.user.findUnique({ where: { id } });
  if (!user) notFound();

  const balance = await getBalance(user.id);
  const recent = await db.ledgerEntry.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 25,
  });

  async function grant(formData: FormData) {
    "use server";
    await requireGod();
    const amount = Number(formData.get("amount"));
    const notes = String(formData.get("notes") ?? "") || undefined;
    if (!Number.isFinite(amount) || amount <= 0) throw new Error("Invalid amount.");
    await godGrant({ toUserId: id, amount, notes });
    redirect(`/admin/users/${id}`);
  }

  async function deduct(formData: FormData) {
    "use server";
    await requireGod();
    const amount = Number(formData.get("amount"));
    const notes = String(formData.get("notes") ?? "") || undefined;
    if (!Number.isFinite(amount) || amount <= 0) throw new Error("Invalid amount.");
    await godDeduct({ fromUserId: id, amount, notes });
    redirect(`/admin/users/${id}`);
  }

  async function toggleRole(formData: FormData) {
    "use server";
    await requireGod();
    const role = String(formData.get("role"));
    const allowed = ["isAdmin", "isTalent", "isBenefactor", "isSupplier", "isContributor"];
    if (!allowed.includes(role)) throw new Error("Bad role.");
    const target = await db.user.findUnique({ where: { id }, select: { [role]: true } as any });
    const current = (target as any)?.[role] ?? false;
    await db.user.update({ where: { id }, data: { [role]: !current } as any });
    redirect(`/admin/users/${id}`);
  }

  const roleList = [
    { key: "isAdmin", label: "Admin", value: user.isAdmin },
    { key: "isTalent", label: "Talent", value: user.isTalent },
    { key: "isBenefactor", label: "Benefactor", value: user.isBenefactor },
    { key: "isSupplier", label: "Supplier", value: user.isSupplier },
    { key: "isContributor", label: "Contributor", value: user.isContributor },
  ];

  return (
    <div className="space-y-10">
      <div>
        <Link href="/admin/users" className="text-cream-dim hover:text-cream text-sm">← Users</Link>
        <h1 className="font-display text-4xl text-cream mt-3">{user.name}</h1>
        <p className="text-cream-dim">{user.email}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-ink-soft border border-cream/10 rounded-2xl p-6">
          <p className="text-xs uppercase tracking-widest text-cream-dim mb-3">Balance</p>
          <p className="font-display text-3xl text-gold">{balance.toLocaleString()} <span className="text-base text-cream-dim">spurrts</span></p>
        </div>
        <div className="bg-ink-soft border border-cream/10 rounded-2xl p-6">
          <p className="text-xs uppercase tracking-widest text-cream-dim mb-3">God</p>
          <p className="font-display text-3xl text-cream">{user.isGod ? "Yes" : "No"}</p>
        </div>
        <div className="bg-ink-soft border border-cream/10 rounded-2xl p-6">
          <p className="text-xs uppercase tracking-widest text-cream-dim mb-3">Joined</p>
          <p className="font-display text-3xl text-cream">{new Date(user.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <form action={grant} className="bg-ink-soft border border-cream/10 rounded-2xl p-6 space-y-4">
          <h3 className="font-display text-xl text-cream">Grant spurrts</h3>
          <input name="amount" type="number" min="1" step="1" placeholder="Amount" required className="w-full px-4 py-3 bg-ink border border-cream/20 rounded-lg text-cream focus:border-gold focus:outline-none" />
          <input name="notes" type="text" placeholder="Reason (optional)" className="w-full px-4 py-3 bg-ink border border-cream/20 rounded-lg text-cream focus:border-gold focus:outline-none" />
          <button className="px-5 py-2 bg-gold text-ink rounded-full hover:bg-cream font-medium">Grant</button>
        </form>

        <form action={deduct} className="bg-ink-soft border border-cream/10 rounded-2xl p-6 space-y-4">
          <h3 className="font-display text-xl text-cream">Deduct spurrts</h3>
          <input name="amount" type="number" min="1" step="1" placeholder="Amount" required className="w-full px-4 py-3 bg-ink border border-cream/20 rounded-lg text-cream focus:border-gold focus:outline-none" />
          <input name="notes" type="text" placeholder="Reason (optional)" className="w-full px-4 py-3 bg-ink border border-cream/20 rounded-lg text-cream focus:border-gold focus:outline-none" />
          <button className="px-5 py-2 border border-cream/20 text-cream rounded-full hover:border-gold hover:text-gold">Deduct</button>
        </form>
      </section>

      <section>
        <h3 className="font-display text-xl text-cream mb-4">Roles</h3>
        <div className="flex flex-wrap gap-3">
          {roleList.map((r) => (
            <form action={toggleRole} key={r.key}>
              <input type="hidden" name="role" value={r.key} />
              <button className={`px-4 py-2 rounded-full text-sm transition-colors ${r.value ? "bg-gold text-ink" : "border border-cream/20 text-cream-dim hover:text-cream"}`}>
                {r.label} {r.value ? "✓" : ""}
              </button>
            </form>
          ))}
        </div>
      </section>

      <section>
        <h3 className="font-display text-xl text-cream mb-4">Recent ledger</h3>
        <div className="bg-ink-soft border border-cream/10 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-ink/50 text-cream-dim text-xs uppercase tracking-widest">
              <tr>
                <th className="text-left p-3">When</th>
                <th className="text-left p-3">Direction</th>
                <th className="text-left p-3">Category</th>
                <th className="text-right p-3">Amount</th>
                <th className="text-left p-3">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream/10">
              {recent.map((e) => (
                <tr key={e.id}>
                  <td className="p-3 text-cream-dim text-xs">{new Date(e.createdAt).toLocaleString()}</td>
                  <td className={`p-3 ${e.direction === "credit" ? "text-emerald-400" : "text-rose-400"}`}>
                    {e.direction}
                  </td>
                  <td className="p-3 text-cream-dim">{e.category}</td>
                  <td className="p-3 text-right font-mono text-cream">{e.amount.toLocaleString()}</td>
                  <td className="p-3 text-cream-dim text-xs">{e.notes ?? ""}</td>
                </tr>
              ))}
              {recent.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-cream-dim">No ledger entries.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
