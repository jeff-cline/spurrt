import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PlatformNav } from "@/components/platform-nav";

export default async function AuthedLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return (
    <div className="min-h-screen bg-ink text-cream">
      <PlatformNav />
      <main className="max-w-7xl mx-auto px-6 lg:px-12 py-10">{children}</main>
    </div>
  );
}
