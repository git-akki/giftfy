import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import OccasionCards from "@/components/landing/OccasionCards";
import HowItWorks from "@/components/landing/HowItWorks";
import LiveDemo from "@/components/landing/LiveDemo";
import PricingSection from "@/components/landing/PricingSection";
import SocialProof from "@/components/landing/SocialProof";
import FAQSection from "@/components/landing/FAQSection";
import FinalCTA from "@/components/landing/FinalCTA";
import Footer from "@/components/landing/Footer";
import FloatingCreateButton from "@/components/landing/FloatingCreateButton";
import { LANDING_FAQ } from "@/data/giftfy";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <OccasionCards />
      <HowItWorks />
      <LiveDemo />
      <PricingSection compact />
      <SocialProof />
      <FAQSection items={LANDING_FAQ} />
      <FinalCTA />
      <Footer />
      <FloatingCreateButton />
    </div>
  );
};

export default Index;
