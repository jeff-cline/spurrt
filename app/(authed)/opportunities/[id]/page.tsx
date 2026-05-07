import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { releaseMilestone, refundEscrow, PLATFORM_FEE_PERCENT } from "@/lib/escrow";

export default async function OpportunityDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const meId = (session?.user as any)?.id as string | undefined;

  const op = await db.opportunity.findUnique({
    where: { id },
    include: {
      poster: true,
      accepter: true,
      milestones: { orderBy: { order: "asc" } },
      applications: { include: { applicant: { select: { id: true, name: true, email: true } } }, orderBy: { createdAt: "desc" } },
    },
  });
  if (!op) notFound();

  const isPoster = meId === op.posterId;
  const isAccepter = meId === op.accepterId;
  const myApp = op.applications.find((a) => a.applicantId === meId);

  async function apply(formData: FormData) {
    "use server";
    const s = await auth();
    const uid = (s?.user as any)?.id as string;
    if (!uid) throw new Error("Not authed.");
    const message = String(formData.get("message") ?? "").trim() || null;
    await db.opportunityApplication.upsert({
      where: { opportunityId_applicantId: { opportunityId: id, applicantId: uid } },
      update: { message: message ?? undefined },
      create: { opportunityId: id, applicantId: uid, message },
    });
    redirect(`/opportunities/${id}`);
  }

  async function acceptApp(formData: FormData) {
    "use server";
    const s = await auth();
    const uid = (s?.user as any)?.id as string;
    const appId = String(formData.get("applicationId"));
    const fresh = await db.opportunity.findUnique({ where: { id }, include: { applications: true } });
    if (!fresh) throw new Error("Not found.");
    if (fresh.posterId !== uid) throw new Error("Not the poster.");
    const application = fresh.applications.find((a) => a.id === appId);
    if (!application) throw new Error("Bad application.");
    await db.$transaction([
      db.opportunityApplication.update({ where: { id: appId }, data: { status: "accepted" } }),
      db.opportunityApplication.updateMany({ where: { opportunityId: id, NOT: { id: appId } }, data: { status: "declined" } }),
      db.opportunity.update({
        where: { id },
        data: { accepterId: application.applicantId, acceptedAt: new Date(), status: "accepted" },
      }),
    ]);
    redirect(`/opportunities/${id}`);
  }

  async function release(formData: FormData) {
    "use server";
    const s = await auth();
    const uid = (s?.user as any)?.id as string;
    const milestoneId = String(formData.get("milestoneId"));
    const fresh = await db.opportunity.findUnique({ where: { id }, include: { milestones: true } });
    if (!fresh) throw new Error("Not found.");
    if (fresh.posterId !== uid) throw new Error("Not the poster.");
    if (!fresh.accepterId) throw new Error("No accepter yet.");
    const m = fresh.milestones.find((mm) => mm.id === milestoneId);
    if (!m) throw new Error("Bad milestone.");
    if (m.released) throw new Error("Already released.");
    await releaseMilestone({
      opportunityId: id,
      toUserId: fresh.accepterId,
      amount: m.spurrts,
      milestoneId: m.id,
    });
    const remaining = fresh.milestones.filter((mm) => mm.id !== milestoneId && !mm.released).length;
    await db.$transaction([
      db.milestone.update({ where: { id: milestoneId }, data: { released: true, releasedAt: new Date() } }),
      db.talentProfile.upsert({
        where: { userId: fresh.accepterId },
        update: { spurrtsEarned: { increment: Math.floor(m.spurrts * 0.9) } },
        create: { userId: fresh.accepterId, headline: "—", skills: "[]", spurrtsEarned: Math.floor(m.spurrts * 0.9) },
      }),
      db.opportunity.update({
        where: { id },
        data: remaining === 0 ? { status: "completed", completedAt: new Date() } : { status: "in_progress" },
      }),
    ]);
    if (remaining === 0) {
      await db.talentProfile.update({
        where: { userId: fresh.accepterId },
        data: { jobsCompleted: { increment: 1 } },
      });
    }
    redirect(`/opportunities/${id}`);
  }

  async function cancel() {
    "use server";
    const s = await auth();
    const uid = (s?.user as any)?.id as string;
    const fresh = await db.opportunity.findUnique({ where: { id }, include: { milestones: true } });
    if (!fresh) throw new Error("Not found.");
    if (fresh.posterId !== uid) throw new Error("Not the poster.");
    if (fresh.status === "completed" || fresh.status === "cancelled") throw new Error("Cannot cancel.");
    const unreleased = fresh.milestones.filter((m) => !m.released).reduce((sum, m) => sum + m.spurrts, 0);
    if (unreleased > 0) {
      await refundEscrow({ toUserId: fresh.posterId, amount: unreleased, opportunityId: id, reason: "Opportunity cancelled" });
    }
    await db.opportunity.update({ where: { id }, data: { status: "cancelled", cancelledAt: new Date() } });
    redirect(`/opportunities/${id}`);
  }

  return (
    <div className="max-w-3xl space-y-10">
      <Link href="/opportunities" className="text-cream-dim hover:text-cream text-sm">← All opportunities</Link>

      <div>
        <span className={`inline-block px-3 py-1 text-xs uppercase tracking-widest rounded-full mb-4 ${
          op.status === "open" ? "bg-gold/20 text-gold" :
          op.status === "completed" ? "bg-emerald-500/20 text-emerald-300" :
          op.status === "cancelled" ? "bg-rose-500/20 text-rose-300" :
          "bg-cream/10 text-cream"
        }`}>{op.status}</span>
        <h1 className="font-display text-4xl text-cream">{op.title}</h1>
        <p className="text-cream-dim mt-2">posted by {op.poster.name}</p>
      </div>

      <div className="bg-ink-soft border border-cream/10 rounded-2xl p-6 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-cream-dim">Total</p>
          <p className="font-display text-3xl text-gold">{op.spurrts.toLocaleString()} spurrts</p>
        </div>
        <p className="text-xs text-cream-dim text-right">Platform fee: {PLATFORM_FEE_PERCENT}% on release</p>
      </div>

      <p className="text-cream whitespace-pre-wrap leading-relaxed">{op.description}</p>

      <section>
        <h3 className="font-display text-xl text-cream mb-4">Milestones</h3>
        <ul className="space-y-2">
          {op.milestones.map((m) => (
            <li key={m.id} className="bg-ink-soft border border-cream/10 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-cream">{m.description}</p>
                <p className="text-cream-dim text-sm">{m.spurrts.toLocaleString()} spurrts {m.released && <span className="text-emerald-400">· released {m.releasedAt && new Date(m.releasedAt).toLocaleDateString()}</span>}</p>
              </div>
              {isPoster && op.status === "accepted" || isPoster && op.status === "in_progress" ? (
                !m.released ? (
                  <form action={release}>
                    <input type="hidden" name="milestoneId" value={m.id} />
                    <button className="px-4 py-2 bg-gold text-ink rounded-full text-sm font-medium hover:bg-cream">Release</button>
                  </form>
                ) : null
              ) : null}
            </li>
          ))}
        </ul>
      </section>

      {op.status === "open" && !isPoster && (
        <section className="bg-ink-soft border border-cream/10 rounded-2xl p-6">
          <h3 className="font-display text-xl text-cream mb-4">Apply</h3>
          {myApp ? (
            <p className="text-cream-dim">Your application is {myApp.status}.</p>
          ) : (
            <form action={apply} className="space-y-4">
              <textarea name="message" rows={3} placeholder="Optional note to the benefactor" className="w-full px-4 py-3 bg-ink border border-cream/20 rounded-lg text-cream focus:border-gold focus:outline-none" />
              <button className="px-5 py-2 bg-gold text-ink rounded-full text-sm font-medium hover:bg-cream">Submit application</button>
            </form>
          )}
        </section>
      )}

      {isPoster && op.status === "open" && op.applications.length > 0 && (
        <section>
          <h3 className="font-display text-xl text-cream mb-4">Applications ({op.applications.length})</h3>
          <ul className="space-y-3">
            {op.applications.map((a) => (
              <li key={a.id} className="bg-ink-soft border border-cream/10 rounded-xl p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-cream">{a.applicant.name}</p>
                  <p className="text-cream-dim text-xs">{a.applicant.email}</p>
                  {a.message && <p className="text-cream-dim text-sm mt-2">{a.message}</p>}
                </div>
                <form action={acceptApp}>
                  <input type="hidden" name="applicationId" value={a.id} />
                  <button className="px-4 py-2 bg-gold text-ink rounded-full text-sm font-medium hover:bg-cream">Accept</button>
                </form>
              </li>
            ))}
          </ul>
        </section>
      )}

      {isPoster && (op.status === "open" || op.status === "accepted" || op.status === "in_progress") && (
        <form action={cancel}>
          <button className="text-rose-400 hover:text-rose-300 text-sm">Cancel opportunity (refunds unreleased spurrts)</button>
        </form>
      )}
    </div>
  );
}
