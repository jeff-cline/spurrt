import Link from "next/link";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { getBalance } from "@/lib/ledger";

export default async function AccountDashboard() {
  const session = await auth();
  const userId = (session?.user as any)?.id as string;
  const me = await db.user.findUnique({
    where: { id: userId },
    include: { talentProfile: true },
  });
  if (!me) return null;
  const balance = await getBalance(me.id);

  return (
    <div className="space-y-10">
      <div>
        <p className="text-sm uppercase tracking-widest text-gold mb-2">Welcome back</p>
        <h1 className="font-display text-4xl text-cream">{me.name}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card label="Your balance" value={`${balance.toLocaleString()} spurrts`} accent />
        <Card label="Email" value={me.email} />
        <Card label="Member since" value={new Date(me.createdAt).toLocaleDateString()} />
      </div>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {me.isTalent && (
          <ActionCard
            title="Your talent profile"
            body={me.talentProfile ? "Edit your profile, headline, and skills." : "You haven't set up your profile yet — start now."}
            href="/account/profile"
            cta={me.talentProfile ? "Edit profile" : "Set up profile"}
          />
        )}
        {me.isBenefactor && (
          <ActionCard
            title="Post an opportunity"
            body="Lock spurrts in escrow and surface what you need to the talent pool."
            href="/opportunities/new"
            cta="Post opportunity"
          />
        )}
        <ActionCard
          title="Browse opportunities"
          body="See what benefactors are paying for."
          href="/opportunities"
          cta="View opportunities"
        />
        <ActionCard
          title="Browse talent"
          body="The 2% are listed here."
          href="/talent"
          cta="View talent"
        />
        <ActionCard
          title="Trade spurrts"
          body="Send spurrts directly to another member. No fee on peer transfers."
          href="/account/trade"
          cta="Trade now"
        />
        <ActionCard
          title="Lives & crypto"
          body="Your Lives token balance and crypto exchange requests."
          href="/account/lives"
          cta="View Lives"
        />
        {me.isSupplier && (
          <ActionCard
            title="Your listings"
            body="Manage and create marketplace listings."
            href="/account/listings"
            cta="Manage listings"
          />
        )}
      </section>
    </div>
  );
}

function Card({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="bg-ink-soft border border-cream/10 rounded-2xl p-6">
      <p className="text-xs uppercase tracking-widest text-cream-dim mb-2">{label}</p>
      <p className={`font-display text-2xl ${accent ? "text-gold" : "text-cream"}`}>{value}</p>
    </div>
  );
}

function ActionCard({ title, body, href, cta }: { title: string; body: string; href: string; cta: string }) {
  return (
    <Link
      href={href}
      className="block bg-ink-soft border border-cream/10 rounded-2xl p-6 hover:border-gold transition-colors"
    >
      <p className="font-display text-xl text-cream mb-2">{title}</p>
      <p className="text-cream-dim text-sm mb-4">{body}</p>
      <p className="text-gold text-sm">{cta} →</p>
    </Link>
  );
}
