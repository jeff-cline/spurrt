import Link from "next/link";
import { db } from "@/lib/db";

export default async function MarketplaceHome() {
  // Show only categories with at least one active listing.
  const categories = await db.category.findMany({
    where: { active: true, listings: { some: { active: true } } },
    include: { _count: { select: { listings: { where: { active: true } } } } },
    orderBy: { order: "asc" },
  });

  return (
    <div className="space-y-10">
      <div>
        <p className="text-sm uppercase tracking-widest text-gold mb-2">Spend your spurrts</p>
        <h1 className="font-display text-4xl text-cream">Marketplace</h1>
        <p className="text-cream-dim mt-2 max-w-2xl">
          Categories light up here as benefactors and suppliers list inventory. Empty categories stay hidden.
        </p>
      </div>

      {categories.length === 0 ? (
        <div className="bg-ink-soft border border-cream/10 rounded-2xl p-12 text-center">
          <p className="font-display text-2xl text-cream mb-2">Nothing live yet.</p>
          <p className="text-cream-dim">Check back as the founding cohort onboards suppliers.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/marketplace/${c.slug}`}
              className={`group relative aspect-[4/5] rounded-2xl overflow-hidden bg-gradient-to-br ${c.gradient ?? "from-stone-700 to-stone-900"} flex flex-col justify-between p-6 hover:scale-[1.02] transition-transform`}
            >
              {c.emoji && <span className="text-5xl">{c.emoji}</span>}
              <div>
                <p className="font-display text-2xl text-cream mb-1">{c.name}</p>
                <p className="text-xs uppercase tracking-wider text-cream/70">{c._count.listings} live</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
