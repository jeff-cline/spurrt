import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";

export default async function TalentDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await db.user.findUnique({
    where: { id },
    include: { talentProfile: true },
  });
  if (!user || !user.talentProfile || !user.talentProfile.visible || !user.isTalent) notFound();

  const tp = user.talentProfile;
  const skills = JSON.parse(tp.skills) as string[];

  return (
    <div className="max-w-3xl space-y-8">
      <Link href="/talent" className="text-cream-dim hover:text-cream text-sm">← All talent</Link>

      <div className="space-y-4">
        <h1 className="font-display text-5xl text-cream">{user.name}</h1>
        <p className="text-gold text-lg">{tp.headline}</p>
      </div>

      {tp.bio && <p className="text-cream-dim leading-relaxed text-lg">{tp.bio}</p>}

      <div className="flex flex-wrap gap-2">
        {skills.map((s) => (
          <span key={s} className="px-3 py-1 text-sm rounded-full border border-cream/15 text-cream-dim">{s}</span>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4 max-w-md">
        <Stat label="Jobs" value={tp.jobsCompleted.toLocaleString()} />
        <Stat label="Earned" value={tp.spurrtsEarned.toLocaleString()} />
        <Stat label="Active" value={new Date(tp.lastActiveAt).toLocaleDateString()} />
      </div>

      <div className="pt-4">
        <Link href={`/opportunities/new?invite=${user.id}`} className="inline-block px-6 py-3 bg-gold text-ink rounded-full font-medium hover:bg-cream">
          Offer this talent an opportunity →
        </Link>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-ink-soft border border-cream/10 rounded-xl p-4">
      <p className="text-xs uppercase tracking-widest text-cream-dim mb-1">{label}</p>
      <p className="font-display text-xl text-cream">{value}</p>
    </div>
  );
}
