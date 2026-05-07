import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export default async function NewListing() {
  const session = await auth();
  const uid = (session?.user as any)?.id as string;
  if (!uid) redirect("/login");
  const cats = await db.category.findMany({ where: { active: true }, orderBy: { order: "asc" } });

  async function create(formData: FormData) {
    "use server";
    const s = await auth();
    const sellerId = (s?.user as any)?.id as string;
    if (!sellerId) throw new Error("Not authed.");
    const title = String(formData.get("title") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();
    const spurrtPrice = Number(formData.get("spurrtPrice"));
    const categoryId = String(formData.get("categoryId"));
    const imageUrl = String(formData.get("imageUrl") ?? "").trim() || null;
    if (title.length < 3) throw new Error("Title required.");
    if (!Number.isFinite(spurrtPrice) || spurrtPrice <= 0) throw new Error("Price must be positive.");
    if (!categoryId) throw new Error("Category required.");
    await db.listing.create({
      data: { sellerId, title, description, spurrtPrice, categoryId, imageUrl },
    });
    redirect(`/account/listings`);
  }

  return (
    <div className="max-w-2xl space-y-8">
      <h1 className="font-display text-4xl text-cream">New listing</h1>
      <form action={create} className="bg-ink-soft border border-cream/10 rounded-2xl p-8 space-y-5">
        <Field name="title" label="Title" required />
        <Field name="description" label="Description" textarea required />
        <Field name="spurrtPrice" label="Price (spurrts)" type="number" required />
        <Field name="imageUrl" label="Image URL (optional)" />
        <label className="block">
          <span className="block text-sm text-cream-dim mb-2">Category</span>
          <select name="categoryId" required className="w-full px-4 py-3 bg-ink border border-cream/20 rounded-lg text-cream focus:border-gold focus:outline-none">
            <option value="">—</option>
            {cats.map((c) => <option key={c.id} value={c.id}>{c.emoji ? `${c.emoji} ` : ""}{c.name}</option>)}
          </select>
        </label>
        <button className="px-6 py-3 bg-gold text-ink rounded-full font-medium hover:bg-cream">Create listing</button>
      </form>
    </div>
  );
}

function Field({ name, label, type = "text", required, textarea }: { name: string; label: string; type?: string; required?: boolean; textarea?: boolean }) {
  return (
    <label className="block">
      <span className="block text-sm text-cream-dim mb-2">{label}</span>
      {textarea ? (
        <textarea name={name} required={required} rows={4} className="w-full px-4 py-3 bg-ink border border-cream/20 rounded-lg text-cream focus:border-gold focus:outline-none" />
      ) : (
        <input name={name} type={type} required={required} className="w-full px-4 py-3 bg-ink border border-cream/20 rounded-lg text-cream focus:border-gold focus:outline-none" />
      )}
    </label>
  );
}
