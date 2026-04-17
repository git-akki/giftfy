import { motion, AnimatePresence } from 'framer-motion';
import { useState, useCallback } from 'react';
import { haptics } from '@/hooks/use-haptics';

/**
 * Wrap a container — tapping spawns firework bursts at the tap point.
 * Used after candle blow for celebration taps.
 */

const COLORS = [
  'hsl(345 55% 65%)', 'hsl(40 90% 65%)', 'hsl(280 40% 70%)',
  'hsl(160 50% 60%)', 'hsl(20 80% 65%)', 'hsl(200 55% 65%)', 'hsl(0 0% 100%)',
];

interface Particle {
  id: number;
  x: number;
  y: number;
  angle: number;
  distance: number;
  color: string;
  size: number;
}

const TapFireworks = ({ children, enabled = true }: { children: React.ReactNode; enabled?: boolean }) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  const handleTap = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!enabled) return;

    const clientX = 'touches' in e ? e.touches[0]?.clientX || 0 : e.clientX;
    const clientY = 'touches' in e ? e.touches[0]?.clientY || 0 : e.clientY;

    haptics.tap();

    const newParticles: Particle[] = Array.from({ length: 8 }, (_, i) => ({
      id: Date.now() + i,
      x: clientX,
      y: clientY,
      angle: (i / 8) * Math.PI * 2 + (Math.random() - 0.5) * 0.5,
      distance: 30 + Math.random() * 60,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: 3 + Math.random() * 4,
    }));

    setParticles((prev) => [...prev.slice(-32), ...newParticles]);
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => !newParticles.find((n) => n.id === p.id)));
    }, 1000);
  }, [enabled]);

  return (
    <div className="relative" onClick={handleTap}>
      {children}

      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="fixed pointer-events-none z-[80] rounded-full"
            style={{
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              left: p.x,
              top: p.y,
            }}
            initial={{ scale: 0, x: 0, y: 0 }}
            animate={{
              scale: [0, 1.5, 0],
              x: Math.cos(p.angle) * p.distance,
              y: Math.sin(p.angle) * p.distance,
              opacity: [1, 1, 0],
            }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default TapFireworks;
