import CtaBanner from "@/components/marketing/CtaBanner";
import FeaturesShowcase from "@/components/marketing/FeaturesShowcase";
import Footer from "@/components/marketing/Footer";
import HeroSection from "@/components/marketing/HeroSection";
import HowItWorks from "@/components/marketing/HowItWorks";
import PricingPreview from "@/components/marketing/PricingPreview";
import SwipeDemo from "@/components/marketing/SwipeDemo";
import StatsBar from "@/components/marketing/StatsBar";
import Testimonials from "@/components/marketing/Testimonials";

export default function MarketingPage() {
  return (
    <main className="overflow-x-clip bg-background">
      <HeroSection />
      <StatsBar />
      <HowItWorks />
      <FeaturesShowcase />
      <SwipeDemo />
      <Testimonials />
      <PricingPreview />
      <CtaBanner />
      <Footer />
    </main>
  );
}
