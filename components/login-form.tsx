"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/admin";
  const initialError = (() => {
    const e = params.get("error");
    if (!e) return null;
    if (e === "Configuration") return "Server is missing required configuration (AUTH_SECRET, DATABASE_URL). Check server env.";
    if (e === "CredentialsSignin") return "Invalid email or password.";
    return `Authentication error: ${e}`;
  })();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(initialError);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setSubmitting(false);
    if (res?.error) {
      setError("Invalid email or password.");
      return;
    }
    router.push(next);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5 bg-ink-soft rounded-2xl border border-cream/10 p-8">
      <label className="block">
        <span className="block text-sm text-cream-dim mb-2">Email</span>
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 bg-ink border border-cream/20 rounded-lg text-cream focus:border-gold focus:outline-none"
        />
      </label>
      <label className="block">
        <span className="block text-sm text-cream-dim mb-2">Password</span>
        <input
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 bg-ink border border-cream/20 rounded-lg text-cream focus:border-gold focus:outline-none"
        />
      </label>
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="w-full px-6 py-3 bg-gold text-ink font-medium rounded-full hover:bg-cream transition-colors disabled:opacity-50"
      >
        {submitting ? "Logging in..." : "Log in"}
      </button>
    </form>
  );
}
