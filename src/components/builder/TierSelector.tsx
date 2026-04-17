import { motion } from 'framer-motion';
import { TIERS, type TierName } from '@/lib/tiers';

interface Props {
  value: TierName;
  onChange: (tier: TierName) => void;
}

const TIER_SUMMARY: Record<TierName, { tag: string; perks: string[] }> = {
  free: {
    tag: 'Try it out',
    perks: ['3 photos', '7-day expiry', 'Giftfy watermark'],
  },
  sweet: {
    tag: 'Most loved 💕',
    perks: ['10 photos', 'Never expires', 'Music library'],
  },
  premium: {
    tag: 'Full experience',
    perks: ['Unlimited photos', 'Video + custom music', 'QR code', 'Scheduled reveal'],
  },
  deluxe: {
    tag: 'Everything',
    perks: ['All Premium features', 'Custom URL slug', 'Password protection', 'Analytics'],
  },
};

const ORDER: TierName[] = ['free', 'sweet', 'premium', 'deluxe'];

const TierSelector = ({ value, onChange }: Props) => {
  return (
    <div>
      <label className="font-body text-foreground/70 text-xs font-semibold mb-2 block">
        Choose a plan
      </label>
      <div className="grid grid-cols-2 gap-2">
        {ORDER.map((key) => {
          const tier = TIERS[key];
          const summary = TIER_SUMMARY[key];
          const selected = value === key;
          return (
            <motion.button
              key={key}
              type="button"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onChange(key)}
              className="text-left p-3 rounded-xl transition-all"
              style={{
                background: selected ? 'hsl(345 55% 95%)' : 'hsl(0 0% 98%)',
                boxShadow: selected
                  ? '0 0 0 2px hsl(345 55% 65%), 0 2px 8px hsl(345 55% 60% / 0.1)'
                  : '0 0 0 1px hsl(0 0% 90%)',
              }}
            >
              <div className="flex items-baseline justify-between">
                <p
                  className="font-body font-bold text-xs"
                  style={{ color: selected ? 'hsl(345 55% 45%)' : 'hsl(0 0% 25%)' }}
                >
                  {tier.label}
                </p>
                <p
                  className="font-body font-bold text-[11px]"
                  style={{ color: selected ? 'hsl(345 55% 45%)' : 'hsl(0 0% 40%)' }}
                >
                  {tier.price === 0 ? 'Free' : `₹${tier.price}`}
                </p>
              </div>
              <p className="font-body text-[9px] text-muted-foreground mt-0.5">{summary.tag}</p>
              <ul className="mt-2 space-y-0.5">
                {summary.perks.map((perk) => (
                  <li key={perk} className="font-body text-[10px] text-muted-foreground flex items-start gap-1">
                    <span className="text-[10px] leading-none mt-0.5">✓</span>
                    <span>{perk}</span>
                  </li>
                ))}
              </ul>
            </motion.button>
          );
        })}
      </div>
      {value !== 'free' && (
        <p className="font-body text-[10px] text-muted-foreground mt-2">
          Payment (sandbox ₹{TIERS[value].price}) processes at publish time.
        </p>
      )}
    </div>
  );
};

export default TierSelector;
