import Link from "next/link";
import { auth, signOut } from "@/auth";

export async function PlatformNav() {
  const session = await auth();
  const user = session?.user as
    | { id: string; name?: string | null; email?: string | null; isGod?: boolean; isAdmin?: boolean }
    | undefined;
  if (!user) return null;

  async function logout() {
    "use server";
    await signOut({ redirectTo: "/" });
  }

  return (
    <header className="sticky top-0 z-40 border-b border-cream/10 bg-ink/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 h-14 flex items-center justify-between text-sm">
        <div className="flex items-center gap-8">
          <Link href="/" className="font-display text-lg text-cream">Spurrt</Link>
          <nav className="hidden md:flex gap-6 text-cream-dim">
            <Link href="/account" className="hover:text-cream">Dashboard</Link>
            <Link href="/talent" className="hover:text-cream">Talent</Link>
            <Link href="/opportunities" className="hover:text-cream">Opportunities</Link>
            <Link href="/marketplace" className="hover:text-cream">Marketplace</Link>
            <Link href="/account/trade" className="hover:text-cream">Trade</Link>
            <Link href="/account/lives" className="hover:text-cream">Lives</Link>
            {(user.isGod || user.isAdmin) && (
              <Link href="/admin" className="text-gold hover:text-cream">Admin</Link>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-4 text-cream-dim">
          <span className="hidden sm:inline">{user.name || user.email}</span>
          <form action={logout}>
            <button className="hover:text-cream">Sign out</button>
          </form>
        </div>
      </div>
    </header>
  );
}
