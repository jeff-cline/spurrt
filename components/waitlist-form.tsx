"use client";

import { useState } from "react";
import type { WaitlistRole } from "@/lib/waitlist-schema";

type Status = "idle" | "submitting" | "success" | "error";

export function WaitlistForm({ role, onClose }: { role: WaitlistRole; onClose: () => void }) {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    const formData = new FormData(e.currentTarget);
    const payload: Record<string, unknown> = { role };
    formData.forEach((value, key) => {
      payload[key] = value;
    });

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Request failed (${res.status})`);
      }
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  if (status === "success") {
    return (
      <div className="text-center space-y-4">
        <p className="font-display text-2xl text-cream">You&rsquo;re on the list.</p>
        <p className="text-cream-dim">We&rsquo;ll be in touch when the cohort opens.</p>
        <button onClick={onClose} className="text-gold hover:text-cream transition-colors">
          Close
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Field name="name" label="Name" required />
      <Field name="email" label="Email" type="email" required />

      {role === "talent" && (
        <>
          <Field name="primarySkill" label="Primary skill" required />
          <Field name="availability" label="Availability (optional)" textarea />
        </>
      )}

      {role === "benefactor" && (
        <>
          <Field name="organization" label="Organization" required />
          <Field name="contribution" label="What you'd contribute (optional)" textarea />
        </>
      )}

      {role === "supplier" && (
        <>
          <Field name="product" label="Product or service" required />
          <SelectField
            name="feeModel"
            label="Fee model preference"
            options={[
              { value: "", label: "—" },
              { value: "monthly", label: "Monthly" },
              { value: "success", label: "Success-based" },
              { value: "hybrid", label: "Hybrid" },
            ]}
          />
        </>
      )}

      {errorMessage && <p className="text-red-400 text-sm">{errorMessage}</p>}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={status === "submitting"}
          className="px-6 py-3 bg-gold text-ink font-medium rounded-full hover:bg-cream transition-colors disabled:opacity-50"
        >
          {status === "submitting" ? "Sending…" : "Submit"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-3 text-cream-dim hover:text-cream transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function Field({
  name,
  label,
  type = "text",
  required,
  textarea,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  textarea?: boolean;
}) {
  const baseClasses =
    "w-full px-4 py-3 bg-ink border border-cream/20 rounded-lg text-cream placeholder-cream-dim focus:border-gold focus:outline-none transition-colors";
  return (
    <label className="block">
      <span className="block text-sm text-cream-dim mb-2">{label}</span>
      {textarea ? (
        <textarea name={name} rows={3} className={baseClasses} />
      ) : (
        <input name={name} type={type} required={required} className={baseClasses} />
      )}
    </label>
  );
}

function SelectField({
  name,
  label,
  options,
}: {
  name: string;
  label: string;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="block">
      <span className="block text-sm text-cream-dim mb-2">{label}</span>
      <select
        name={name}
        className="w-full px-4 py-3 bg-ink border border-cream/20 rounded-lg text-cream focus:border-gold focus:outline-none"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}
