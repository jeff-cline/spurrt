import { db } from "@/lib/db";
import { getValuation } from "@/lib/ledger";

export default async function AdminDashboard() {
  const [userCount, ledgerCount, v] = await Promise.all([
    db.user.count({ where: { email: { not: "system@spurrt.com" } } }),
    db.ledgerEntry.count(),
    getValuation(),
  ]);

  const dollars = (cents: number) => `$${(cents / 100).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

  return (
    <div className="space-y-10">
      <h1 className="font-display text-4xl text-cream">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Users" value={userCount.toLocaleString()} />
        <Stat label="1 spurrt =" value={dollars(v.spurrtCents)} accent />
        <Stat label="Profit pool" value={dollars(v.poolCents)} />
        <Stat label="Spurrts in circulation" value={v.totalIssued.toLocaleString()} />
      </div>

      <div className="text-sm text-cream-dim">
        Ledger entries: {ledgerCount.toLocaleString()}
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="bg-ink-soft border border-cream/10 rounded-2xl p-6">
      <p className="text-xs uppercase tracking-widest text-cream-dim mb-3">{label}</p>
      <p className={`font-display text-3xl ${accent ? "text-gold" : "text-cream"}`}>{value}</p>
    </div>
  );
}
