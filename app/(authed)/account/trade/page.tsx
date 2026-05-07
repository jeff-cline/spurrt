import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { getBalance, transfer } from "@/lib/ledger";

export default async function TradePage() {
  const session = await auth();
  const uid = (session?.user as any)?.id as string;
  if (!uid) redirect("/login");
  const balance = await getBalance(uid);

  const recent = await db.trade.findMany({
    where: { OR: [{ fromUserId: uid }, { toUserId: uid }] },
    include: { fromUser: { select: { name: true } }, toUser: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  async function send(formData: FormData) {
    "use server";
    const s = await auth();
    const fromId = (s?.user as any)?.id as string;
    if (!fromId) throw new Error("Not authed.");
    const recipientEmail = String(formData.get("email") ?? "").toLowerCase().trim();
    const amount = Number(formData.get("amount"));
    const note = String(formData.get("note") ?? "").trim() || null;
    if (!recipientEmail) throw new Error("Recipient email required.");
    if (!Number.isFinite(amount) || amount <= 0) throw new Error("Amount must be positive.");
    const recipient = await db.user.findUnique({ where: { email: recipientEmail } });
    if (!recipient) throw new Error("Recipient not found.");
    if (recipient.id === fromId) throw new Error("Cannot trade with yourself.");
    await transfer({ fromUserId: fromId, toUserId: recipient.id, amount, category: "transfer", notes: note ?? undefined });
    await db.trade.create({
      data: { fromUserId: fromId, toUserId: recipient.id, amount, note },
    });
    redirect("/account/trade");
  }

  return (
    <div className="max-w-2xl space-y-10">
      <div>
        <h1 className="font-display text-4xl text-cream">Trade spurrts</h1>
        <p className="text-cream-dim mt-2">Send spurrts directly to another member. No fee on peer transfers.</p>
        <p className="text-cream-dim mt-1">Your balance: <span className="text-gold font-mono">{balance.toLocaleString()}</span></p>
      </div>

      <form action={send} className="bg-ink-soft border border-cream/10 rounded-2xl p-8 space-y-5">
        <Field name="email" label="Recipient email" type="email" required />
        <Field name="amount" label="Amount (spurrts)" type="number" required />
        <Field name="note" label="Note (optional)" />
        <button className="px-6 py-3 bg-gold text-ink rounded-full font-medium hover:bg-cream">Send</button>
      </form>

      <section>
        <h3 className="font-display text-xl text-cream mb-4">Recent trades</h3>
        <ul className="divide-y divide-cream/10 border-y border-cream/10">
          {recent.map((t) => {
            const sent = t.fromUserId === uid;
            const counterparty = sent ? t.toUser.name : t.fromUser.name;
            return (
              <li key={t.id} className="py-4 flex justify-between items-center text-sm">
                <div>
                  <p className="text-cream">{sent ? "→" : "←"} {counterparty}</p>
                  {t.note && <p className="text-cream-dim text-xs mt-1">{t.note}</p>}
                </div>
                <div className={`font-mono ${sent ? "text-rose-400" : "text-emerald-400"}`}>
                  {sent ? "-" : "+"}{t.amount.toLocaleString()}
                </div>
              </li>
            );
          })}
          {recent.length === 0 && <li className="py-6 text-center text-cream-dim">No trades yet.</li>}
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
