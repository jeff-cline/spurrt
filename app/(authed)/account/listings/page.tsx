import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export default async function MyListings() {
  const session = await auth();
  const uid = (session?.user as any)?.id as string;
  if (!uid) redirect("/login?next=/account/listings");
  const me = await db.user.findUnique({ where: { id: uid } });
  if (!me) redirect("/login");

  const listings = await db.listing.findMany({
    where: { sellerId: uid },
    include: { category: true, _count: { select: { purchases: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <h1 className="font-display text-4xl text-cream">Your listings</h1>
        <Link href="/account/listings/new" className="px-5 py-2 bg-gold text-ink rounded-full font-medium hover:bg-cream text-sm">
          New listing
        </Link>
      </div>

      <div className="space-y-3">
        {listings.map((l) => (
          <Link key={l.id} href={`/marketplace/${l.category.slug}/${l.id}`} className="block bg-ink-soft border border-cream/10 rounded-2xl p-5 hover:border-gold transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-display text-xl text-cream">{l.title}</p>
                <p className="text-cream-dim text-sm">{l.category.name} · {l.active ? "Active" : "Inactive"} · {l._count.purchases} sold</p>
              </div>
              <p className="font-display text-2xl text-gold">{l.spurrtPrice.toLocaleString()}</p>
            </div>
          </Link>
        ))}
        {listings.length === 0 && (
          <div className="bg-ink-soft border border-cream/10 rounded-2xl p-10 text-center">
            <p className="text-cream-dim mb-4">You haven&apos;t listed anything yet.</p>
            <Link href="/account/listings/new" className="text-gold hover:text-cream">Create your first listing →</Link>
          </div>
        )}
      </div>
    </div>
  );
}
