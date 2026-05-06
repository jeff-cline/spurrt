import { Nav } from "@/components/nav";
import { HeroSplit } from "@/components/hero-split";
import { CurrencyExplainer } from "@/components/currency-explainer";
import { HowItWorks } from "@/components/how-it-works";
import { MarketplacePreview } from "@/components/marketplace-preview";
import { SuccessPool } from "@/components/success-pool";
import { Manifesto } from "@/components/manifesto";
import { WaitlistCta } from "@/components/waitlist-cta";

export default function Home() {
  return (
    <>
      <Nav />
      <main id="top">
        <HeroSplit />
        <CurrencyExplainer />
        <HowItWorks />
        <MarketplacePreview />
        <SuccessPool />
        <Manifesto />
        <WaitlistCta />
      </main>
    </>
  );
}
