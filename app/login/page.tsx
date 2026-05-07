import { Suspense } from "react";
import { LoginForm } from "@/components/login-form";
import Link from "next/link";

export const metadata = {
  title: "Log in — Spurrt",
};

export default function LoginPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-24">
      <div className="max-w-md w-full">
        <div className="text-center mb-12">
          <Link href="/" className="font-display text-3xl text-cream tracking-tight">
            Spurrt
          </Link>
          <p className="text-sm uppercase tracking-[0.2em] text-gold mt-6">Log in</p>
        </div>

        <Suspense>
          <LoginForm />
        </Suspense>

        <p className="text-center text-sm text-cream-dim mt-8">
          No account?{" "}
          <Link href="/#waitlist" className="text-gold hover:text-cream">
            Join the waitlist
          </Link>
        </p>
      </div>
    </main>
  );
}
