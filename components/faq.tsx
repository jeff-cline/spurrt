"use client";

import { useState } from "react";

type QA = { q: string; a: string };

const items: QA[] = [
  {
    q: "What is a spurrt?",
    a: "A spurrt is the unit of value in the Spurrt micro-economy. One spurrt is worth $444 today, backed by a $10M pool. Spurrts are tradeable between members and redeemable for trips, equity, crypto, products, and services in the marketplace.",
  },
  {
    q: "Who qualifies as Talent?",
    a: "Spurrt is intentionally selective. We're looking for high-capacity people whose underutilized hours are worth more than they're paid for them — operators, advisors, builders, creatives, athletes, executives. Apply and we'll talk.",
  },
  {
    q: "Can I cash out my spurrts?",
    a: "You can redeem them in the marketplace, trade them with other members, or convert via Lives — a separate currency designed to bridge to crypto. Direct cash-out is not the goal of the platform.",
  },
  {
    q: "What's the difference between a Benefactor and a Supplier?",
    a: "Benefactors fund the marketplace itself — typically with equity, opportunities, or experiences they already control. Suppliers list specific products or services for spurrts. Both gain access to the talent pool, on different terms.",
  },
  {
    q: "What are Lives, and how do they relate to crypto?",
    a: "Lives are a sister currency to spurrts, designed to bridge the ecosystem to outside crypto markets. The full mechanics are coming with Phase 2.",
  },
  {
    q: "When does the platform open?",
    a: "Founding cohort applications are open now. The full marketplace opens in waves as we onboard benefactors, suppliers, and verified talent.",
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="py-28 px-6 lg:px-12">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-sm uppercase tracking-[0.2em] text-gold mb-6">Questions</p>
          <h2 className="font-display text-4xl lg:text-5xl text-cream">
            The short answers.
          </h2>
        </div>

        <ul className="divide-y divide-cream/10 border-y border-cream/10">
          {items.map((item, i) => {
            const isOpen = open === i;
            return (
              <li key={item.q}>
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full text-left py-6 flex justify-between items-center gap-6"
                >
                  <span className="font-display text-xl text-cream">{item.q}</span>
                  <span className="text-gold text-2xl shrink-0">{isOpen ? "−" : "+"}</span>
                </button>
                {isOpen && <p className="pb-6 text-cream-dim leading-relaxed">{item.a}</p>}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
