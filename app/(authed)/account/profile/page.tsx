import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export default async function TalentProfileEditor() {
  const session = await auth();
  const userId = (session?.user as any)?.id as string;
  const me = await db.user.findUnique({
    where: { id: userId },
    include: { talentProfile: true },
  });
  if (!me) redirect("/login");

  async function save(formData: FormData) {
    "use server";
    const s = await auth();
    const id = (s?.user as any)?.id as string;
    if (!id) throw new Error("Not authed.");
    const headline = String(formData.get("headline") ?? "").trim();
    const bio = String(formData.get("bio") ?? "").trim();
    const skillsRaw = String(formData.get("skills") ?? "").trim();
    const visible = formData.get("visible") === "on";
    if (headline.length < 2) throw new Error("Headline required.");
    const skills = skillsRaw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    await db.talentProfile.upsert({
      where: { userId: id },
      update: {
        headline,
        bio: bio || null,
        skills: JSON.stringify(skills),
        visible,
        lastActiveAt: new Date(),
      },
      create: {
        userId: id,
        headline,
        bio: bio || null,
        skills: JSON.stringify(skills),
        visible,
      },
    });
    redirect("/account");
  }

  const tp = me.talentProfile;
  const skillsCsv = tp ? (JSON.parse(tp.skills) as string[]).join(", ") : "";

  return (
    <div className="max-w-2xl space-y-8">
      <h1 className="font-display text-4xl text-cream">Your profile</h1>
      <p className="text-cream-dim">This is how benefactors and suppliers see you on the talent board.</p>

      <form action={save} className="bg-ink-soft border border-cream/10 rounded-2xl p-8 space-y-5">
        <Field name="headline" label="Headline" required defaultValue={tp?.headline ?? ""} placeholder="Fractional CFO • ex-Stripe" />
        <Field name="bio" label="Bio" textarea defaultValue={tp?.bio ?? ""} />
        <Field name="skills" label="Skills (comma-separated)" defaultValue={skillsCsv} placeholder="finance, fundraising, ops" />
        <label className="flex items-center gap-3 text-cream">
          <input type="checkbox" name="visible" defaultChecked={tp?.visible ?? true} className="accent-gold" />
          <span>Visible on the public talent board</span>
        </label>
        <button className="px-6 py-3 bg-gold text-ink font-medium rounded-full hover:bg-cream">Save</button>
      </form>
    </div>
  );
}

function Field({ name, label, defaultValue, placeholder, required, textarea }: { name: string; label: string; defaultValue?: string; placeholder?: string; required?: boolean; textarea?: boolean }) {
  return (
    <label className="block">
      <span className="block text-sm text-cream-dim mb-2">{label}</span>
      {textarea ? (
        <textarea name={name} defaultValue={defaultValue} placeholder={placeholder} rows={4} className="w-full px-4 py-3 bg-ink border border-cream/20 rounded-lg text-cream focus:border-gold focus:outline-none" />
      ) : (
        <input name={name} defaultValue={defaultValue} placeholder={placeholder} required={required} className="w-full px-4 py-3 bg-ink border border-cream/20 rounded-lg text-cream focus:border-gold focus:outline-none" />
      )}
    </label>
  );
}
