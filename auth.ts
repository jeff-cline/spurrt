import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(creds) {
        const email = (creds?.email as string | undefined)?.toLowerCase().trim();
        const password = creds?.password as string | undefined;
        if (!email || !password) return null;
        const user = await db.user.findUnique({ where: { email } });
        if (!user || !user.passwordHash) return null;
        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;
        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
      }
      if (token.userId) {
        const fresh = await db.user.findUnique({
          where: { id: token.userId as string },
          select: {
            id: true,
            email: true,
            name: true,
            isGod: true,
            isAdmin: true,
            isTalent: true,
            isSupplier: true,
            isBenefactor: true,
            isContributor: true,
          },
        });
        if (fresh) {
          token.email = fresh.email;
          token.name = fresh.name;
          token.isGod = fresh.isGod;
          token.isAdmin = fresh.isAdmin;
          token.isTalent = fresh.isTalent;
          token.isSupplier = fresh.isSupplier;
          token.isBenefactor = fresh.isBenefactor;
          token.isContributor = fresh.isContributor;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.userId) {
        (session.user as any).id = token.userId;
        (session.user as any).isGod = !!token.isGod;
        (session.user as any).isAdmin = !!token.isAdmin;
        (session.user as any).isTalent = !!token.isTalent;
        (session.user as any).isSupplier = !!token.isSupplier;
        (session.user as any).isBenefactor = !!token.isBenefactor;
        (session.user as any).isContributor = !!token.isContributor;
      }
      return session;
    },
  },
});
