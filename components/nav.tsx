export function Nav() {
  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-ink/80 border-b border-cream/5">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 h-16 flex items-center justify-between">
        <a href="#top" className="font-display text-2xl tracking-tight text-cream">
          Spurrt
        </a>
        <div className="hidden md:flex items-center gap-10 text-sm text-cream-dim">
          <a href="#talent" className="hover:text-cream transition-colors">Talent</a>
          <a href="#benefactors" className="hover:text-cream transition-colors">Benefactors</a>
          <a href="#marketplace" className="hover:text-cream transition-colors">Marketplace</a>
          <a href="#faq" className="hover:text-cream transition-colors">FAQ</a>
        </div>
        <a
          href="#waitlist"
          className="inline-flex items-center px-5 py-2 bg-gold text-ink font-medium rounded-full hover:bg-gold-soft transition-colors"
        >
          Apply
        </a>
      </div>
    </nav>
  );
}
