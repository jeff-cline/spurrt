import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-helpers";

export default async function CategoriesAdmin() {
  await requireAdmin();
  const cats = await db.category.findMany({ orderBy: { order: "asc" } });

  async function create(formData: FormData) {
    "use server";
    await requireAdmin();
    const name = String(formData.get("name") ?? "").trim();
    const slug = String(formData.get("slug") ?? "").trim().toLowerCase();
    const emoji = String(formData.get("emoji") ?? "").trim() || null;
    const gradient = String(formData.get("gradient") ?? "").trim() || null;
    const order = Number(formData.get("order")) || 0;
    if (!name || !slug) throw new Error("Name and slug required.");
    await db.category.create({ data: { name, slug, emoji, gradient, order } });
    redirect("/admin/categories");
  }

  async function toggle(formData: FormData) {
    "use server";
    await requireAdmin();
    const id = String(formData.get("id"));
    const cat = await db.category.findUnique({ where: { id } });
    if (!cat) throw new Error("Bad id.");
    await db.category.update({ where: { id }, data: { active: !cat.active } });
    redirect("/admin/categories");
  }

  return (
    <div className="space-y-10">
      <h1 className="font-display text-4xl text-cream">Categories</h1>

      <form action={create} className="bg-ink-soft border border-cream/10 rounded-2xl p-6 grid grid-cols-1 md:grid-cols-5 gap-3">
        <input name="name" placeholder="Name" required className="px-3 py-2 bg-ink border border-cream/20 rounded text-cream" />
        <input name="slug" placeholder="slug" required className="px-3 py-2 bg-ink border border-cream/20 rounded text-cream" />
        <input name="emoji" placeholder="emoji" className="px-3 py-2 bg-ink border border-cream/20 rounded text-cream" />
        <input name="gradient" placeholder="from-x-700 to-y-900" className="px-3 py-2 bg-ink border border-cream/20 rounded text-cream font-mono text-sm" />
        <input name="order" type="number" placeholder="order" className="px-3 py-2 bg-ink border border-cream/20 rounded text-cream" />
        <button className="md:col-span-5 px-5 py-2 bg-gold text-ink rounded-full font-medium hover:bg-cream text-sm">Add category</button>
      </form>

      <div className="bg-ink-soft border border-cream/10 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-ink/50 text-cream-dim text-xs uppercase tracking-widest">
            <tr>
              <th className="text-left p-3">Order</th>
              <th className="text-left p-3">Name</th>
              <th className="text-left p-3">Slug</th>
              <th className="text-left p-3">Emoji</th>
              <th className="text-left p-3">Active</th>
              <th></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cream/10">
            {cats.map((c) => (
              <tr key={c.id}>
                <td className="p-3 text-cream-dim">{c.order}</td>
                <td className="p-3 text-cream">{c.name}</td>
                <td className="p-3 text-cream-dim font-mono text-xs">{c.slug}</td>
                <td className="p-3 text-cream">{c.emoji}</td>
                <td className="p-3">{c.active ? <span className="text-emerald-400">on</span> : <span className="text-cream-dim">off</span>}</td>
                <td className="p-3 text-right">
                  <form action={toggle}>
                    <input type="hidden" name="id" value={c.id} />
                    <button className="text-gold hover:text-cream text-xs">{c.active ? "Disable" : "Enable"}</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
