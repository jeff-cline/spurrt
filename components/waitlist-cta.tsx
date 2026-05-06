"use client";

import { useState } from "react";
import { WaitlistForm } from "@/components/waitlist-form";
import type { WaitlistRole } from "@/lib/waitlist-schema";

export function WaitlistCta() {
  const [activeRole, setActiveRole] = useState<WaitlistRole | null>(null);

  return (
    <section id="waitlist" className="py-28 px-6 lg:px-12 bg-ink-soft border-y border-cream/5">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-sm uppercase tracking-[0.2em] text-gold mb-6">Founding cohort</p>
          <h2 className="font-display text-4xl lg:text-5xl text-cream mb-6">
            Pick your seat at the table.
          </h2>
          <p className="text-cream-dim max-w-xl mx-auto">
            The first cohort is small and intentional. Tell us who you are and we&rsquo;ll let you know when it opens.
          </p>
        </div>

        {activeRole ? (
          <div className="max-w-xl mx-auto bg-ink rounded-2xl border border-cream/10 p-8">
            <p className="font-display text-2xl text-cream mb-6 capitalize">
              {activeRole === "benefactor" ? "Become a Benefactor" : activeRole === "supplier" ? "Become a Supplier" : "Apply as Talent"}
            </p>
            <WaitlistForm role={activeRole} onClose={() => setActiveRole(null)} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <RoleButton role="talent" label="Apply as Talent" onClick={setActiveRole} primary />
            <RoleButton role="benefactor" label="Become a Benefactor" onClick={setActiveRole} />
            <RoleButton role="supplier" label="Become a Supplier" onClick={setActiveRole} />
          </div>
        )}
      </div>
    </section>
  );
}

function RoleButton({
  role,
  label,
  onClick,
  primary,
}: {
  role: WaitlistRole;
  label: string;
  onClick: (role: WaitlistRole) => void;
  primary?: boolean;
}) {
  const cls = primary
    ? "bg-gold text-ink hover:bg-cream"
    : "border border-cream/20 text-cream hover:border-gold hover:text-gold";
  return (
    <button
      onClick={() => onClick(role)}
      className={`px-6 py-5 rounded-xl font-medium transition-colors ${cls}`}
    >
      {label}
    </button>
  );
}
