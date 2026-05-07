import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  const email = process.env.GOD_ADMIN_EMAIL?.toLowerCase().trim();
  const password = process.env.GOD_ADMIN_PASSWORD;

  if (!email || !password) {
    console.warn(
      "[seed] GOD_ADMIN_EMAIL or GOD_ADMIN_PASSWORD not set in env. Skipping God seed.",
    );
  } else {
    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      console.log(`[seed] God user already exists: ${email}. Skipping.`);
    } else {
      const passwordHash = await bcrypt.hash(password, 12);
      await db.user.create({
        data: {
          email,
          name: "God",
          passwordHash,
          isGod: true,
          isAdmin: true,
          isTalent: true,
          isSupplier: true,
          isBenefactor: true,
          isContributor: true,
        },
      });
      console.log(`[seed] Created God user: ${email}`);
    }
  }

  // Ensure valuation row exists (id = 1)
  const v = await db.valuation.findUnique({ where: { id: 1 } });
  if (!v) {
    await db.valuation.create({
      data: { id: 1, spurrtCents: 44400, poolCents: 1_000_000_000 },
    });
    console.log("[seed] Created initial Valuation: 1 spurrt = $444, pool = $10M");
  } else {
    console.log("[seed] Valuation already initialized.");
  }

  await db.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
