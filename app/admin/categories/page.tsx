import { requireAdmin } from "@/lib/auth-helpers";

export default async function CategoriesPage() {
  await requireAdmin();
  return (
    <div className="space-y-6">
      <h1 className="font-display text-4xl text-cream">Categories</h1>
      <p className="text-cream-dim">Marketplace categories will be manageable here once Phase 4 ships.</p>
    </div>
  );
}
