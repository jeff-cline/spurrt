import Link from "next/link";
import { db } from "@/lib/db";

export default async function OpportunitiesList() {
  const ops = await db.opportunity.findMany({
    where: { status: "open" },
    include: { poster: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-sm uppercase tracking-widest text-gold mb-2">For talent</p>
          <h1 className="font-display text-4xl text-cream">Opportunities</h1>
        </div>
        <Link href="/opportunities/new" className="px-5 py-2 bg-gold text-ink rounded-full font-medium hover:bg-cream text-sm">
          Post opportunity
        </Link>
      </div>

      <div className="space-y-3">
        {ops.map((op) => (
          <Link key={op.id} href={`/opportunities/${op.id}`} className="block bg-ink-soft border border-cream/10 rounded-2xl p-6 hover:border-gold transition-colors">
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="font-display text-xl text-cream mb-1">{op.title}</p>
                <p className="text-cream-dim text-sm">posted by {op.poster.name}</p>
                <p className="text-cream-dim text-sm mt-3 line-clamp-2">{op.description}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-display text-2xl text-gold">{op.spurrts.toLocaleString()}</p>
                <p className="text-xs uppercase tracking-widest text-cream-dim">spurrts</p>
              </div>
            </div>
          </Link>
        ))}
        {ops.length === 0 && <p className="text-center text-cream-dim py-12">No open opportunities.</p>}
      </div>
    </div>
  );
}
