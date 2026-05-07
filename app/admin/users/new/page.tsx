import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { requireGod } from "@/lib/auth-helpers";

export default async function NewUserPage() {
  await requireGod();

  async function createUser(formData: FormData) {
    "use server";
    await requireGod();
    const email = String(formData.get("email") ?? "").toLowerCase().trim();
    const name = String(formData.get("name") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const roles = formData.getAll("roles").map(String);
    if (!email || !name || password.length < 6) throw new Error("Missing fields or short password.");
    const hash = await bcrypt.hash(password, 12);
    const u = await db.user.create({
      data: {
        email,
        name,
        passwordHash: hash,
        isAdmin: roles.includes("admin"),
        isTalent: roles.includes("talent"),
        isSupplier: roles.includes("supplier"),
        isBenefactor: roles.includes("benefactor"),
        isContributor: roles.includes("contributor"),
      },
    });
    redirect(`/admin/users/${u.id}`);
  }

  return (
    <div className="max-w-xl space-y-8">
      <h1 className="font-display text-4xl text-cream">New user</h1>
      <form action={createUser} className="space-y-5 bg-ink-soft border border-cream/10 rounded-2xl p-8">
        <Field name="name" label="Name" required />
        <Field name="email" label="Email" type="email" required />
        <Field name="password" label="Password (min 6)" type="password" required />
        <fieldset>
          <legend className="block text-sm text-cream-dim mb-2">Roles</legend>
          <div className="grid grid-cols-2 gap-2">
            {["admin", "talent", "benefactor", "supplier", "contributor"].map((r) => (
              <label key={r} className="flex items-center gap-2 text-cream text-sm capitalize">
                <input type="checkbox" name="roles" value={r} className="accent-gold" />
                {r}
              </label>
            ))}
          </div>
        </fieldset>
        <button className="px-6 py-3 bg-gold text-ink rounded-full hover:bg-cream transition-colors font-medium">
          Create user
        </button>
      </form>
    </div>
  );
}

function Field({ name, label, type = "text", required }: { name: string; label: string; type?: string; required?: boolean }) {
  return (
    <label className="block">
      <span className="block text-sm text-cream-dim mb-2">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        className="w-full px-4 py-3 bg-ink border border-cream/20 rounded-lg text-cream focus:border-gold focus:outline-none"
      />
    </label>
  );
}
