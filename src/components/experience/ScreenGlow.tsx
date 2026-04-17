import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';

/**
 * Screen edge glow effect — triggers a warm pink glow on the edges
 * when a sweet/emotional moment happens.
 */

let triggerGlowFn: (() => void) | null = null;

export function triggerScreenGlow() {
  triggerGlowFn?.();
}

const ScreenGlow = () => {
  const [active, setActive] = useState(false);

  const trigger = useCallback(() => {
    setActive(true);
    setTimeout(() => setActive(false), 1200);
  }, []);

  triggerGlowFn = trigger;

  // Prevent stacking
  useEffect(() => {
    return () => { triggerGlowFn = null; };
  }, []);

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          className="fixed inset-0 pointer-events-none z-[90]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Top edge */}
          <div className="absolute top-0 left-0 right-0 h-24"
            style={{ background: 'linear-gradient(to bottom, hsl(345 55% 70% / 0.12), transparent)' }} />
          {/* Bottom edge */}
          <div className="absolute bottom-0 left-0 right-0 h-24"
            style={{ background: 'linear-gradient(to top, hsl(345 55% 70% / 0.12), transparent)' }} />
          {/* Left edge */}
          <div className="absolute top-0 bottom-0 left-0 w-16"
            style={{ background: 'linear-gradient(to right, hsl(345 55% 70% / 0.1), transparent)' }} />
          {/* Right edge */}
          <div className="absolute top-0 bottom-0 right-0 w-16"
            style={{ background: 'linear-gradient(to left, hsl(345 55% 70% / 0.1), transparent)' }} />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ScreenGlow;
