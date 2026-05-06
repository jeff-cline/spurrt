export function HeroSplit() {
  return (
    <section id="hero" className="relative">
      <div className="grid grid-cols-1 md:grid-cols-2 min-h-[80vh]">
        <div
          id="talent"
          className="flex flex-col justify-center px-8 lg:px-20 py-20 border-b md:border-b-0 md:border-r border-cream/10 bg-ink"
        >
          <p className="text-sm uppercase tracking-[0.2em] text-gold mb-6">For the 2%</p>
          <h1 className="font-display text-5xl lg:text-6xl leading-[1.05] text-cream mb-6">
            You&rsquo;re undercompensated for what you&rsquo;re capable of.
          </h1>
          <p className="text-lg text-cream-dim max-w-md mb-10">
            Spurrt turns your underutilized time and talent into a currency you can actually spend &mdash; on trips, equity, crypto, or anything else in the marketplace.
          </p>
          <a
            href="#waitlist"
            className="inline-flex items-center w-fit px-7 py-3 bg-cream text-ink font-medium rounded-full hover:bg-gold transition-colors"
          >
            Apply as Talent &rarr;
          </a>
        </div>

        <div
          id="benefactors"
          className="flex flex-col justify-center px-8 lg:px-20 py-20 bg-ink-soft"
        >
          <p className="text-sm uppercase tracking-[0.2em] text-gold mb-6">For Benefactors</p>
          <h1 className="font-display text-5xl lg:text-6xl leading-[1.05] text-cream mb-6">
            The top 2% won&rsquo;t take meetings on a job board.
          </h1>
          <p className="text-lg text-cream-dim max-w-md mb-10">
            Fund the marketplace with what you already have &mdash; equity, products, experiences, opportunities &mdash; and the people who move the needle will find you.
          </p>
          <a
            href="#waitlist"
            className="inline-flex items-center w-fit px-7 py-3 bg-gold text-ink font-medium rounded-full hover:bg-cream transition-colors"
          >
            Become a Benefactor &rarr;
          </a>
        </div>
      </div>

      <div className="border-t border-b border-cream/10 bg-ink py-6 px-6">
        <p className="text-center font-display italic text-xl lg:text-2xl text-cream-dim max-w-3xl mx-auto">
          A micro-economy where underutilized time meets underutilized opportunity.
        </p>
      </div>
    </section>
  );
}
