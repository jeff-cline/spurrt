import { Nav } from "@/components/nav";
import { HeroSplit } from "@/components/hero-split";
import { CurrencyExplainer } from "@/components/currency-explainer";
import { HowItWorks } from "@/components/how-it-works";

export default function Home() {
  return (
    <>
      <Nav />
      <main id="top">
        <HeroSplit />
        <CurrencyExplainer />
        <HowItWorks />
      </main>
    </>
  );
}
