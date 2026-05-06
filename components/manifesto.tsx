export function Manifesto() {
  return (
    <section className="py-32 px-6 lg:px-12">
      <div className="max-w-4xl mx-auto space-y-20">
        <blockquote className="font-display text-4xl lg:text-6xl text-cream leading-tight">
          &ldquo;A rising tide lifts all boats.&rdquo;
        </blockquote>

        <blockquote className="font-display text-4xl lg:text-6xl text-cream leading-tight text-right">
          &ldquo;This energy is yours to use. <br className="hidden md:block" />
          You are held and protected.&rdquo;
        </blockquote>

        <div className="pt-12 border-t border-cream/10">
          <p className="text-cream-dim text-lg max-w-2xl">
            Talent and capital have always been mispriced. The most capable people give away their best hours for fixed wages, and the organizations that need them never reach them. Spurrt is a correction &mdash; a private, intentional economy where underutilized value finds its match.
          </p>
        </div>
      </div>
    </section>
  );
}
