import CtaBanner from "@/components/marketing/CtaBanner";
import FeaturesShowcase from "@/components/marketing/FeaturesShowcase";
import Footer from "@/components/marketing/Footer";
import HeroSection from "@/components/marketing/HeroSection";
import HowItWorks from "@/components/marketing/HowItWorks";
import PricingPreview from "@/components/marketing/PricingPreview";
import StatsBar from "@/components/marketing/StatsBar";
import SwipeDemo from "@/components/marketing/SwipeDemo";
import Testimonials from "@/components/marketing/Testimonials";

export default function MarketingPage() {
  return (
    <main>
      <HeroSection />
      <StatsBar />
      <FeaturesShowcase />
      <HowItWorks />
      <SwipeDemo />
      <PricingPreview />
      <Testimonials />
      <CtaBanner />
      <Footer />
    </main>
  );
}
