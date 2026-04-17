import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { Link } from "react-router-dom";
import { PRICING_TIERS, type PricingTier } from "@/data/giftfy";
import { useCreateGift } from "@/hooks/use-create-gift";

interface PricingSectionProps {
  compact?: boolean;
}

const TierCard = ({ tier, index, onSelect }: { tier: PricingTier; index: number; onSelect: (options?: { tier?: string }) => void }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.4, delay: index * 0.1 }}
    className="relative"
  >
    {tier.badge && (
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
        <span className="font-body text-xs font-bold text-white bg-gradient-to-r from-pink-500 to-purple-500 px-4 py-1 rounded-full shadow-md whitespace-nowrap">
          {tier.badge}
        </span>
      </div>
    )}

    <motion.div
      whileHover={{ y: -4 }}
      className={`h-full rounded-3xl p-6 sm:p-7 border-2 transition-all ${
        tier.highlighted
          ? "border-pink-400 bg-gradient-to-b from-pink-50 to-white shadow-lg shadow-pink-100/50"
          : "border-gray-100 bg-white hover:border-pink-200"
      }`}
    >
      <div className="text-center mb-5">
        <h3 className="font-display text-2xl font-bold text-gray-800 mb-1">
          {tier.name}
        </h3>
        <div className="flex items-baseline justify-center gap-1">
          <span className="font-body text-4xl font-bold text-gradient-giftfy">
            {tier.priceLabel}
          </span>
          {tier.price > 0 && (
            <span className="font-body text-sm text-gray-400">/gift</span>
          )}
        </div>
      </div>

      <ul className="space-y-3 mb-6">
        {tier.features.map((feature) => (
          <li key={feature.text} className="flex items-center gap-2.5">
            {feature.included ? (
              <Check className="w-4 h-4 text-pink-500 flex-shrink-0" />
            ) : (
              <X className="w-4 h-4 text-gray-300 flex-shrink-0" />
            )}
            <span
              className={`font-body text-sm ${
                feature.included ? "text-gray-700" : "text-gray-300"
              }`}
            >
              {feature.text}
            </span>
          </li>
        ))}
      </ul>

      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => onSelect({ tier: tier.name.toLowerCase() })}
        className={`w-full font-body font-bold text-sm py-3 rounded-full transition-all ${
          tier.highlighted
            ? "gradient-btn text-white shadow-md"
            : tier.price === 0
              ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
              : "bg-pink-50 text-pink-600 hover:bg-pink-100 border border-pink-200"
        }`}
      >
        {tier.cta} {tier.price > 0 ? "🎁" : ""}
      </motion.button>
    </motion.div>
  </motion.div>
);

const PricingSection = ({ compact = true }: PricingSectionProps) => {
  const createGift = useCreateGift();
  return (
    <section id="pricing" className="py-20 px-4 sm:px-6 bg-gradient-to-b from-white to-pink-50/30">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-gradient-giftfy mb-4">
            {compact ? "Less than a coffee ☕" : "Simple pricing. No surprises. 💰"}
          </h2>
          <p className="font-body text-lg text-gray-400 max-w-md mx-auto">
            {compact
              ? "One-time payment. No subscriptions. No hidden fees."
              : "Pay once, your gift is yours forever. All prices include taxes."}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PRICING_TIERS.map((tier, i) => (
            <TierCard key={tier.name} tier={tier} index={i} onSelect={createGift} />
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-8 font-body text-sm text-gray-400"
        >
          Prices include all taxes. One-time payment. No subscriptions.
          {compact && (
            <>
              {" "}
              <Link to="/pricing" className="text-pink-500 hover:text-pink-600 font-semibold underline underline-offset-4">
                See full comparison →
              </Link>
            </>
          )}
        </motion.p>
      </div>
    </section>
  );
};

export default PricingSection;
