import Link from "next/link";
import { db } from "@/lib/db";

export default async function TalentBoard() {
  const profiles = await db.talentProfile.findMany({
    where: { visible: true, user: { isTalent: true } },
    include: { user: true },
    orderBy: { lastActiveAt: "desc" },
    take: 100,
  });

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-widest text-gold mb-2">The 2%</p>
        <h1 className="font-display text-4xl text-cream">Talent</h1>
        <p className="text-cream-dim mt-2">High-capacity people who trade underutilized hours for spurrts.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {profiles.map((p) => {
          const skills = JSON.parse(p.skills) as string[];
          return (
            <Link key={p.id} href={`/talent/${p.user.id}`} className="block bg-ink-soft border border-cream/10 rounded-2xl p-6 hover:border-gold transition-colors">
              <p className="font-display text-xl text-cream mb-1">{p.user.name}</p>
              <p className="text-gold text-sm mb-4">{p.headline}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {skills.slice(0, 4).map((s) => (
                  <span key={s} className="px-2 py-1 text-xs rounded-full border border-cream/15 text-cream-dim">{s}</span>
                ))}
              </div>
              <div className="flex gap-4 text-xs text-cream-dim">
                <span>{p.jobsCompleted} jobs</span>
                <span>{p.spurrtsEarned.toLocaleString()} spurrts earned</span>
                <span>active {timeAgo(p.lastActiveAt)}</span>
              </div>
            </Link>
          );
        })}
        {profiles.length === 0 && (
          <p className="col-span-full text-center text-cream-dim py-12">No talent profiles yet.</p>
        )}
      </div>
    </div>
  );
}

function timeAgo(d: Date): string {
  const ms = Date.now() - new Date(d).getTime();
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days}d ago`;
  return new Date(d).toLocaleDateString();
}
