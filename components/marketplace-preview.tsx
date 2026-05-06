type Tile = { name: string; gradient: string; emoji: string };

const tiles: Tile[] = [
  { name: "Trips", gradient: "from-amber-700 to-rose-900", emoji: "🌅" },
  { name: "Vacations", gradient: "from-sky-700 to-emerald-900", emoji: "🏝" },
  { name: "Stocks", gradient: "from-emerald-700 to-emerald-950", emoji: "📈" },
  { name: "Crypto", gradient: "from-violet-700 to-indigo-950", emoji: "◇" },
  { name: "Real Estate", gradient: "from-stone-600 to-stone-900", emoji: "🏛" },
  { name: "Boats", gradient: "from-cyan-700 to-blue-950", emoji: "⛵" },
];

export function MarketplacePreview() {
  return (
    <section id="marketplace" className="py-28 px-6 lg:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-sm uppercase tracking-[0.2em] text-gold mb-6">The Marketplace</p>
          <h2 className="font-display text-4xl lg:text-5xl text-cream mb-4">
            Spend your spurrts on what you actually want.
          </h2>
          <p className="text-cream-dim max-w-xl mx-auto">
            Categories light up as benefactors and suppliers add inventory. These are coming online first.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {tiles.map((tile) => (
            <a
              key={tile.name}
              href="#waitlist"
              className={`group relative aspect-[4/5] rounded-2xl overflow-hidden bg-gradient-to-br ${tile.gradient} flex flex-col justify-between p-6 hover:scale-[1.02] transition-transform`}
            >
              <span className="text-5xl">{tile.emoji}</span>
              <div>
                <p className="font-display text-2xl text-cream mb-1">{tile.name}</p>
                <p className="text-xs uppercase tracking-wider text-cream/70">Coming online</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
