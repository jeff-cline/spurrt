import { Nav } from "@/components/nav";
import { HeroSplit } from "@/components/hero-split";
import { CurrencyExplainer } from "@/components/currency-explainer";

export default function Home() {
  return (
    <>
      <Nav />
      <main id="top">
        <HeroSplit />
        <CurrencyExplainer />
      </main>
    </>
  );
}
