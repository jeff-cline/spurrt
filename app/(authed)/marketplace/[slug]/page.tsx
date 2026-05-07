import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cat = await db.category.findUnique({ where: { slug } });
  if (!cat) notFound();
  const listings = await db.listing.findMany({
    where: { categoryId: cat.id, active: true },
    include: { seller: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <Link href="/marketplace" className="text-cream-dim hover:text-cream text-sm">← Marketplace</Link>
      <div>
        <p className="text-sm uppercase tracking-widest text-gold mb-2">Category</p>
        <h1 className="font-display text-4xl text-cream">{cat.emoji ? `${cat.emoji} ` : ""}{cat.name}</h1>
      </div>

      {listings.length === 0 ? (
        <p className="text-cream-dim">No active listings in this category.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {listings.map((l) => (
            <Link key={l.id} href={`/marketplace/${cat.slug}/${l.id}`} className="block bg-ink-soft border border-cream/10 rounded-2xl overflow-hidden hover:border-gold transition-colors">
              {l.imageUrl ? (
                <img src={l.imageUrl} alt={l.title} className="w-full aspect-video object-cover" />
              ) : (
                <div className={`w-full aspect-video bg-gradient-to-br ${cat.gradient ?? "from-stone-700 to-stone-900"}`} />
              )}
              <div className="p-5">
                <p className="font-display text-xl text-cream mb-1">{l.title}</p>
                <p className="text-cream-dim text-sm mb-3">by {l.seller.name}</p>
                <p className="font-display text-2xl text-gold">{l.spurrtPrice.toLocaleString()} <span className="text-sm text-cream-dim">spurrts</span></p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
