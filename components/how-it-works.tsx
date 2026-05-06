type Step = { label: string; body: string };

const talentSteps: Step[] = [
  { label: "Get matched", body: "Benefactors and suppliers post opportunities you actually want." },
  { label: "Deliver", body: "You bring underutilized capacity. Real work. Real outcomes." },
  { label: "Earn spurrts", body: "Locked in escrow upfront. Released as milestones complete." },
];

const benefactorSteps: Step[] = [
  { label: "Fund the pool", body: "Contribute equity, products, trips, services. Receive spurrts in return." },
  { label: "Post opportunity", body: "List what you need from the top 2%. Set the spurrts you'll pay." },
  { label: "Access talent", body: "Approved applicants accept. Escrow protects both sides." },
];

export function HowItWorks() {
  return (
    <section className="py-28 px-6 lg:px-12 bg-ink-soft border-y border-cream/5">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <p className="text-sm uppercase tracking-[0.2em] text-gold mb-6">How it works</p>
          <h2 className="font-display text-4xl lg:text-5xl text-cream max-w-2xl mx-auto">
            Two sides. One marketplace. Both win.
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
          <Rail title="Talent" steps={talentSteps} accentLeft />
          <Rail title="Benefactors" steps={benefactorSteps} />
        </div>

        <div className="mt-20 text-center">
          <div className="inline-block px-6 py-3 border border-gold rounded-full text-gold font-medium">
            &darr; they meet here &darr;
          </div>
          <p className="font-display text-3xl lg:text-4xl text-cream mt-6">The Marketplace</p>
        </div>
      </div>
    </section>
  );
}

function Rail({ title, steps, accentLeft }: { title: string; steps: Step[]; accentLeft?: boolean }) {
  return (
    <div className={accentLeft ? "lg:border-r lg:border-cream/10 lg:pr-16" : ""}>
      <p className="font-display text-2xl text-gold mb-10">{title}</p>
      <ol className="space-y-10">
        {steps.map((step, i) => (
          <li key={step.label} className="flex gap-5">
            <span className="font-display text-3xl text-cream-dim w-10 shrink-0">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div>
              <p className="font-display text-xl text-cream mb-2">{step.label}</p>
              <p className="text-cream-dim">{step.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
