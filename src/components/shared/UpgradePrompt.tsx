import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { type TierName, getMinTierForFeature, TIERS } from '@/lib/tiers';

interface UpgradePromptProps {
  open: boolean;
  onClose: () => void;
  feature: string;
  currentTier: TierName;
}

const FEATURE_LABELS: Record<string, string> = {
  hasMusicLibrary: 'Music Library',
  hasCustomMusic: 'Custom Music Upload',
  hasVideo: 'Video Support',
  hasPremiumTemplates: 'Premium Templates',
  hasQRCode: 'QR Code',
  hasScheduledReveal: 'Scheduled Reveal',
  hasCustomSlug: 'Custom URL',
  hasPasswordProtection: 'Password Protection',
  hasAnalytics: 'View Analytics',
};

const UpgradePrompt = ({ open, onClose, feature, currentTier }: UpgradePromptProps) => {
  const navigate = useNavigate();
  const minTier = getMinTierForFeature(feature as any);
  const tierConfig = TIERS[minTier];
  const label = FEATURE_LABELS[feature] || feature;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-xl relative"
          >
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>

            <div className="text-center">
              <div className="text-4xl mb-3">✨</div>
              <h3 className="font-display text-2xl font-bold text-gradient-giftfy mb-2">
                Unlock {label}
              </h3>
              <p className="font-body text-sm text-gray-500 mb-6">
                This feature is available on the <strong>{tierConfig.label}</strong> plan
                {tierConfig.price > 0 ? ` (₹${tierConfig.price})` : ''}.
              </p>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => { onClose(); navigate('/pricing'); }}
                className="w-full gradient-btn text-white font-body font-bold text-sm py-3 rounded-full shadow-md mb-3"
              >
                View Plans 💖
              </motion.button>

              <button onClick={onClose} className="font-body text-sm text-gray-400 hover:text-gray-600">
                Maybe later
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UpgradePrompt;
