import { auth } from "@/auth";
import { redirect } from "next/navigation";

export async function requireGod() {
  const session = await auth();
  const user = session?.user as
    | { id: string; isGod?: boolean; isAdmin?: boolean }
    | undefined;
  if (!user) redirect("/login?next=/admin");
  if (!user.isGod) redirect("/?error=god_only");
  return user;
}

export async function requireAdmin() {
  const session = await auth();
  const user = session?.user as
    | { id: string; isGod?: boolean; isAdmin?: boolean }
    | undefined;
  if (!user) redirect("/login?next=/admin");
  if (!user.isGod && !user.isAdmin) redirect("/?error=admin_only");
  return user;
}
