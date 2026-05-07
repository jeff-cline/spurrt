import Link from "next/link";
import { requireAdmin } from "@/lib/auth-helpers";
import { signOut } from "@/auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();

  async function logout() {
    "use server";
    await signOut({ redirectTo: "/" });
  }

  return (
    <div className="min-h-screen bg-ink text-cream">
      <header className="border-b border-cream/10 bg-ink-soft">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/admin" className="font-display text-xl text-cream">
              Spurrt <span className="text-gold text-sm uppercase tracking-widest">Admin</span>
            </Link>
            <nav className="hidden md:flex gap-6 text-sm text-cream-dim">
              <Link href="/admin" className="hover:text-cream">Dashboard</Link>
              <Link href="/admin/users" className="hover:text-cream">Users</Link>
              <Link href="/admin/valuation" className="hover:text-cream">Valuation</Link>
              <Link href="/admin/categories" className="hover:text-cream">Categories</Link>
            </nav>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/" className="text-cream-dim hover:text-cream">View site</Link>
            <span className="text-cream-dim">{user.id ? "Signed in" : ""}</span>
            <form action={logout}>
              <button className="text-cream-dim hover:text-cream">Sign out</button>
            </form>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-6 lg:px-12 py-10">{children}</main>
    </div>
  );
}
