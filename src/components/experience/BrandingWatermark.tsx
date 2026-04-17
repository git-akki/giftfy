import { motion } from 'framer-motion';

const BrandingWatermark = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 2 }}
    className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 pointer-events-none"
  >
    <div className="font-body text-xs text-white/60 bg-black/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
      Made with 💝 <span className="font-semibold">Giftfy</span>
    </div>
  </motion.div>
);

export default BrandingWatermark;
