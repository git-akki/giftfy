import { motion } from "framer-motion";
import { Shield, CreditCard, Smartphone } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import PricingSection from "@/components/landing/PricingSection";
import FAQSection from "@/components/landing/FAQSection";
import FinalCTA from "@/components/landing/FinalCTA";
import Footer from "@/components/landing/Footer";
import { PRICING_FAQ, PRICING_TIERS } from "@/data/giftfy";

const FeatureComparisonTable = () => {
  const allFeatures = [
    "Photos",
    "Custom message",
    "No branding",
    "Never expires",
    "Music library",
    "Custom music upload",
    "Video support",
    "Premium templates",
    "QR code",
    "Scheduled reveal",
    "Custom URL",
    "Password protection",
    "Story mode",
    "View analytics",
  ];

  const featureValues: Record<string, string[]> = {
    "Photos": ["3", "10", "Unlimited", "Unlimited"],
    "Custom message": ["1", "✓", "✓", "✓"],
    "No branding": ["✗", "✓", "✓", "✓"],
    "Never expires": ["7 days", "✓", "✓", "✓"],
    "Music library": ["✗", "✓", "✓", "✓"],
    "Custom music upload": ["✗", "✗", "✓", "✓"],
    "Video support": ["✗", "✗", "✓", "✓"],
    "Premium templates": ["✗", "✗", "✓", "✓"],
    "QR code": ["✗", "✗", "✓", "✓"],
    "Scheduled reveal": ["✗", "✗", "✓", "✓"],
    "Custom URL": ["✗", "✗", "✗", "✓"],
    "Password protection": ["✗", "✗", "✗", "✓"],
    "Story mode": ["✗", "✗", "✗", "✓"],
    "View analytics": ["✗", "✗", "✗", "✓"],
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <h3 className="font-display text-3xl font-bold text-center text-gradient-giftfy mb-8">
        Full Feature Comparison
      </h3>
      <div className="overflow-x-auto rounded-2xl border border-pink-100">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-pink-50">
              <th className="font-body font-bold text-left text-gray-700 p-4">Feature</th>
              {PRICING_TIERS.map((tier) => (
                <th key={tier.name} className="font-body font-bold text-center text-gray-700 p-4">
                  {tier.name}
                  <br />
                  <span className="text-pink-500 font-normal text-xs">{tier.priceLabel}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {allFeatures.map((feature, i) => (
              <tr key={feature} className={i % 2 === 0 ? "bg-white" : "bg-pink-50/30"}>
                <td className="font-body text-gray-700 p-4 border-t border-pink-50">{feature}</td>
                {featureValues[feature].map((val, j) => (
                  <td key={j} className="text-center p-4 border-t border-pink-50">
                    <span className={`font-body ${
                      val === "✓" ? "text-pink-500 font-bold" :
                      val === "✗" ? "text-gray-300" :
                      "text-gray-700 font-medium"
                    }`}>
                      {val}
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const Pricing = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-28 pb-8 px-4 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-5xl sm:text-6xl font-bold text-gradient-giftfy mb-4"
        >
          Simple pricing. No surprises. 💰
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="font-body text-lg text-gray-400 max-w-lg mx-auto"
        >
          Pay once, your gift page is yours forever. All prices include taxes.
        </motion.p>
      </div>

      <PricingSection compact={false} />

      <FeatureComparisonTable />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 py-6 px-6 rounded-2xl bg-green-50 border border-green-100"
        >
          <div className="flex items-center gap-2 text-green-700">
            <Shield className="w-5 h-5" />
            <span className="font-body text-sm font-medium">Secure payments via Razorpay</span>
          </div>
          <div className="flex items-center gap-2 text-green-700">
            <Smartphone className="w-5 h-5" />
            <span className="font-body text-sm font-medium">UPI / Cards / Wallets</span>
          </div>
          <div className="flex items-center gap-2 text-green-700">
            <CreditCard className="w-5 h-5" />
            <span className="font-body text-sm font-medium">Net Banking supported</span>
          </div>
        </motion.div>
      </div>

      <FAQSection
        items={PRICING_FAQ}
        title="Pricing FAQ 💬"
        subtitle="Questions about payments and plans"
      />

      <FinalCTA />
      <Footer />
    </div>
  );
};

export default Pricing;
