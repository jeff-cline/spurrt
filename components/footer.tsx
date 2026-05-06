export function Footer() {
  return (
    <footer className="border-t border-cream/10 px-6 lg:px-12 py-16">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-10">
        <div>
          <p className="font-display text-3xl text-cream mb-2">Spurrt</p>
          <p className="text-cream-dim max-w-sm">
            A micro-economy where underutilized time meets underutilized opportunity.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-8 text-sm text-cream-dim">
          <div className="flex gap-6">
            <a href="#" className="hover:text-cream">X</a>
            <a href="#" className="hover:text-cream">LinkedIn</a>
            <a href="#" className="hover:text-cream">Instagram</a>
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-cream">Privacy</a>
            <a href="#" className="hover:text-cream">Terms</a>
          </div>
        </div>
      </div>

      <p className="max-w-7xl mx-auto text-xs text-cream-dim/60 mt-12">
        © {new Date().getFullYear()} Spurrt. All rights reserved.
      </p>
    </footer>
  );
}
