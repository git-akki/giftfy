import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useCallback } from 'react';
import { haptics } from '@/hooks/use-haptics';

/**
 * Wrap any text/content — long press to spawn a floating heart.
 * The content gently lifts and glows when pressed.
 */
const TouchLove = ({ children }: { children: React.ReactNode }) => {
  const [hearts, setHearts] = useState<{ id: number; x: number; y: number }[]>([]);
  const [pressing, setPressing] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const containerRef = useRef<HTMLDivElement>(null);

  const handleStart = useCallback((clientX: number, clientY: number) => {
    timerRef.current = setTimeout(() => {
      setPressing(true);
      haptics.heartbeat();

      const rect = containerRef.current?.getBoundingClientRect();
      const x = clientX - (rect?.left || 0);
      const y = clientY - (rect?.top || 0);
      const id = Date.now();

      setHearts((prev) => [...prev.slice(-5), { id, x, y }]);
      setTimeout(() => setHearts((prev) => prev.filter((h) => h.id !== id)), 1500);
      setTimeout(() => setPressing(false), 400);
    }, 500); // 500ms long press
  }, []);

  const handleEnd = useCallback(() => {
    clearTimeout(timerRef.current);
    setPressing(false);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative select-none"
      onTouchStart={(e) => handleStart(e.touches[0].clientX, e.touches[0].clientY)}
      onTouchEnd={handleEnd}
      onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
    >
      {/* Content with glow effect on press */}
      <motion.div
        animate={pressing ? {
          scale: 1.02,
          filter: 'brightness(1.05)',
        } : {
          scale: 1,
          filter: 'brightness(1)',
        }}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.div>

      {/* Floating hearts */}
      <AnimatePresence>
        {hearts.map((h) => (
          <motion.div
            key={h.id}
            className="absolute pointer-events-none z-50"
            style={{ left: h.x - 8, top: h.y - 8 }}
            initial={{ opacity: 1, scale: 0, y: 0 }}
            animate={{ opacity: 0, scale: 1.2, y: -50 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          >
            <span className="text-lg">💖</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default TouchLove;
