import Link from "next/link";
import { db } from "@/lib/db";
import { getBalance } from "@/lib/ledger";

export default async function UsersPage() {
  const users = await db.user.findMany({
    where: { email: { not: "system@spurrt.com" } },
    orderBy: { createdAt: "desc" },
  });

  const withBalances = await Promise.all(
    users.map(async (u) => ({ ...u, balance: await getBalance(u.id) })),
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-4xl text-cream">Users</h1>
        <Link
          href="/admin/users/new"
          className="px-4 py-2 bg-gold text-ink font-medium rounded-full hover:bg-cream transition-colors text-sm"
        >
          New user
        </Link>
      </div>

      <div className="bg-ink-soft border border-cream/10 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-ink/50 text-cream-dim text-xs uppercase tracking-widest">
            <tr>
              <th className="text-left p-4">Name</th>
              <th className="text-left p-4">Email</th>
              <th className="text-left p-4">Roles</th>
              <th className="text-right p-4">Balance</th>
              <th className="text-right p-4">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cream/10">
            {withBalances.map((u) => (
              <tr key={u.id} className="hover:bg-ink/30">
                <td className="p-4">
                  <Link href={`/admin/users/${u.id}`} className="text-cream hover:text-gold">
                    {u.name}
                  </Link>
                </td>
                <td className="p-4 text-cream-dim">{u.email}</td>
                <td className="p-4 text-cream-dim text-xs">
                  {[
                    u.isGod && "God",
                    u.isAdmin && "Admin",
                    u.isTalent && "Talent",
                    u.isBenefactor && "Benefactor",
                    u.isSupplier && "Supplier",
                    u.isContributor && "Contributor",
                  ].filter(Boolean).join(", ") || "—"}
                </td>
                <td className="p-4 text-right text-cream font-mono">
                  {u.balance.toLocaleString()} <span className="text-cream-dim text-xs">spurrts</span>
                </td>
                <td className="p-4 text-right text-cream-dim text-xs">
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {withBalances.length === 0 && (
              <tr><td colSpan={5} className="p-8 text-center text-cream-dim">No users yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
