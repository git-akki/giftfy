import { motion, AnimatePresence } from 'framer-motion';
import { useState, useCallback } from 'react';
import { haptics } from '@/hooks/use-haptics';

interface Particle {
  id: number;
  x: number;
  y: number;
  emoji: string;
  angle: number;
  distance: number;
}

// Global trigger function
let triggerFn: ((type: string, message?: string) => void) | null = null;

export function triggerCelebration(type: 'sparkle' | 'confetti' | 'success' | 'lp', message?: string) {
  triggerFn?.(type, message);
}

const EMOJIS: Record<string, string[]> = {
  sparkle: ['✨', '⭐', '💫'],
  confetti: ['🎉', '🎊', '💖', '✨', '🎀'],
  success: ['🎉', '💖', '✨', '🥳'],
  lp: ['💖', '✨'],
};

const MicroCelebration = () => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false });

  const trigger = useCallback((type: string, message?: string) => {
    haptics.pulse();
    const emojis = EMOJIS[type] || EMOJIS.sparkle;

    // Create particles
    const newParticles: Particle[] = Array.from({ length: type === 'confetti' ? 12 : 6 }, (_, i) => ({
      id: Date.now() + i,
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
      angle: (i / (type === 'confetti' ? 12 : 6)) * Math.PI * 2,
      distance: 60 + Math.random() * 80,
    }));

    setParticles(newParticles);
    setTimeout(() => setParticles([]), 1200);

    // Show toast message
    if (message) {
      setToast({ message, visible: true });
      setTimeout(() => setToast({ message: '', visible: false }), 2000);
    }
  }, []);

  // Register global trigger
  triggerFn = trigger;

  return (
    <>
      {/* Particles */}
      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="fixed pointer-events-none z-[100] text-lg"
            initial={{ x: p.x, y: p.y, opacity: 1, scale: 0 }}
            animate={{
              x: p.x + Math.cos(p.angle) * p.distance,
              y: p.y + Math.sin(p.angle) * p.distance,
              opacity: 0,
              scale: [0, 1.5, 0.5],
              rotate: Math.random() * 360,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            {p.emoji}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast.visible && (
          <motion.div
            className="fixed top-20 left-1/2 z-[100] pointer-events-none"
            initial={{ opacity: 0, y: -10, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -10, x: '-50%' }}
          >
            <div
              className="font-body font-bold text-xs px-4 py-2 rounded-full text-white whitespace-nowrap"
              style={{
                background: 'linear-gradient(135deg, hsl(345 55% 55%), hsl(330 50% 50%))',
                boxShadow: '0 4px 16px hsl(345 55% 50% / 0.3)',
              }}
            >
              {toast.message}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MicroCelebration;
