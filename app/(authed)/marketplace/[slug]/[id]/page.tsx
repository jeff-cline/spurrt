import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { getBalance } from "@/lib/ledger";
import { purchaseListing } from "@/lib/marketplace";

export default async function ListingDetail({ params }: { params: Promise<{ slug: string; id: string }> }) {
  const { slug, id } = await params;
  const session = await auth();
  const meId = (session?.user as any)?.id as string | undefined;

  const listing = await db.listing.findUnique({
    where: { id },
    include: { seller: true, category: true },
  });
  if (!listing || listing.category.slug !== slug) notFound();

  const myBalance = meId ? await getBalance(meId) : 0;

  async function buy() {
    "use server";
    const s = await auth();
    const uid = (s?.user as any)?.id as string;
    if (!uid) throw new Error("Not authed.");
    await purchaseListing({ buyerId: uid, listingId: id });
    redirect(`/account?purchased=${id}`);
  }

  return (
    <div className="max-w-3xl space-y-8">
      <Link href={`/marketplace/${slug}`} className="text-cream-dim hover:text-cream text-sm">← {listing.category.name}</Link>

      {listing.imageUrl ? (
        <img src={listing.imageUrl} alt={listing.title} className="w-full rounded-2xl object-cover" />
      ) : (
        <div className={`w-full aspect-video rounded-2xl bg-gradient-to-br ${listing.category.gradient ?? "from-stone-700 to-stone-900"}`} />
      )}

      <div className="space-y-4">
        <h1 className="font-display text-4xl text-cream">{listing.title}</h1>
        <p className="text-cream-dim">Sold by {listing.seller.name}</p>
        <p className="font-display text-3xl text-gold">{listing.spurrtPrice.toLocaleString()} spurrts</p>
      </div>

      <p className="text-cream whitespace-pre-wrap leading-relaxed">{listing.description}</p>

      <div className="bg-ink-soft border border-cream/10 rounded-2xl p-6">
        <p className="text-sm text-cream-dim mb-4">
          Your balance: <span className="text-cream font-mono">{myBalance.toLocaleString()} spurrts</span>
        </p>
        {!meId ? (
          <Link href="/login" className="text-gold">Log in to purchase →</Link>
        ) : meId === listing.sellerId ? (
          <p className="text-cream-dim">You created this listing.</p>
        ) : !listing.active ? (
          <p className="text-cream-dim">This listing is no longer active.</p>
        ) : myBalance < listing.spurrtPrice ? (
          <p className="text-rose-400 text-sm">Insufficient balance.</p>
        ) : (
          <form action={buy}>
            <button className="px-6 py-3 bg-gold text-ink rounded-full font-medium hover:bg-cream">
              Buy now for {listing.spurrtPrice.toLocaleString()} spurrts
            </button>
          </form>
        )}
        <p className="text-xs text-cream-dim mt-3">Seller receives 90%. 5% to platform, 5% to Spurrts to Success pool.</p>
      </div>
    </div>
  );
}
