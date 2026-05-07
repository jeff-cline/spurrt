import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { lockEscrow } from "@/lib/escrow";
import { getBalance } from "@/lib/ledger";

export default async function NewOpportunity() {
  const session = await auth();
  const userId = (session?.user as any)?.id as string;
  if (!userId) redirect("/login?next=/opportunities/new");
  const me = await db.user.findUnique({ where: { id: userId } });
  if (!me) redirect("/login");
  const balance = await getBalance(me.id);

  async function create(formData: FormData) {
    "use server";
    const s = await auth();
    const id = (s?.user as any)?.id as string;
    if (!id) throw new Error("Not authed.");
    const title = String(formData.get("title") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();
    const total = Number(formData.get("spurrts"));
    if (title.length < 3 || description.length < 10) throw new Error("Title and description required.");
    if (!Number.isFinite(total) || total <= 0) throw new Error("spurrts must be a positive number.");
    const bal = await getBalance(id);
    if (bal < total) throw new Error(`Insufficient balance (have ${bal}, need ${total}).`);

    // Single-milestone for v1 (full amount one milestone)
    const op = await db.opportunity.create({
      data: {
        posterId: id,
        title,
        description,
        spurrts: total,
        milestones: { create: { description: "Final delivery", spurrts: total, order: 0 } },
      },
    });
    await lockEscrow({ fromUserId: id, opportunityId: op.id, amount: total });
    redirect(`/opportunities/${op.id}`);
  }

  return (
    <div className="max-w-2xl space-y-8">
      <h1 className="font-display text-4xl text-cream">Post an opportunity</h1>
      <p className="text-cream-dim">
        The full spurrt amount is locked in escrow when you post. It releases to talent only when you mark milestones complete.
        Your current balance: <span className="text-gold font-mono">{balance.toLocaleString()} spurrts</span>.
      </p>

      <form action={create} className="bg-ink-soft border border-cream/10 rounded-2xl p-8 space-y-5">
        <label className="block">
          <span className="block text-sm text-cream-dim mb-2">Title</span>
          <input name="title" required className="w-full px-4 py-3 bg-ink border border-cream/20 rounded-lg text-cream focus:border-gold focus:outline-none" />
        </label>
        <label className="block">
          <span className="block text-sm text-cream-dim mb-2">Description</span>
          <textarea name="description" required rows={6} className="w-full px-4 py-3 bg-ink border border-cream/20 rounded-lg text-cream focus:border-gold focus:outline-none" />
        </label>
        <label className="block">
          <span className="block text-sm text-cream-dim mb-2">Spurrts to lock in escrow</span>
          <input name="spurrts" type="number" min="1" step="1" required className="w-full px-4 py-3 bg-ink border border-cream/20 rounded-lg text-cream focus:border-gold focus:outline-none font-mono" />
        </label>
        <button className="px-6 py-3 bg-gold text-ink rounded-full font-medium hover:bg-cream">
          Lock spurrts and post
        </button>
      </form>
    </div>
  );
}
