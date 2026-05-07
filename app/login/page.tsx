import Link from "next/link";

export const metadata = {
  title: "Log in — Spurrt",
  description: "Login opens with the founding cohort.",
};

export default function LoginPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-24">
      <div className="max-w-md w-full text-center space-y-8">
        <Link href="/" className="font-display text-3xl text-cream tracking-tight">
          Spurrt
        </Link>

        <div className="space-y-4">
          <p className="text-sm uppercase tracking-[0.2em] text-gold">Login</p>
          <h1 className="font-display text-4xl text-cream leading-tight">
            The platform opens with the founding cohort.
          </h1>
          <p className="text-cream-dim">
            Sign-in goes live alongside the first wave of approved members. Until
            then, the door in is the waitlist.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Link
            href="/#waitlist"
            className="px-6 py-3 bg-gold text-ink font-medium rounded-full hover:bg-cream transition-colors"
          >
            Join the waitlist
          </Link>
          <Link
            href="/"
            className="px-6 py-3 text-cream-dim hover:text-cream transition-colors"
          >
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
