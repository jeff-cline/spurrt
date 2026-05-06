export function CurrencyExplainer() {
  return (
    <section className="py-28 px-6 lg:px-12">
      <div className="max-w-5xl mx-auto text-center">
        <p className="text-sm uppercase tracking-[0.2em] text-gold mb-8">The Currency</p>
        <h2 className="font-display text-4xl lg:text-5xl text-cream mb-12">
          What is a spurrt?
        </h2>

        <div className="font-display text-7xl lg:text-9xl text-cream mb-4 leading-none">
          1 spurrt = <span className="text-gold">$444</span>
        </div>
        <p className="text-cream-dim mb-16">today</p>

        <div className="flex flex-col md:flex-row gap-4 md:gap-6 justify-center">
          <Pill>Backed by a $10M pool</Pill>
          <Pill>Redeemable for trips, equity, crypto, products</Pill>
          <Pill>Tradeable between members</Pill>
        </div>
      </div>
    </section>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="px-5 py-3 rounded-full border border-cream/20 text-cream text-sm">
      {children}
    </span>
  );
}
