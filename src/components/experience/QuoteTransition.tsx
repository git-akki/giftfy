import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { haptics } from '@/hooks/use-haptics';

interface Props {
  quote: string;
  onComplete: () => void;
  vibe?: string;
}

const vibeGradients: Record<string, string> = {
  warm: 'radial-gradient(ellipse at 50% 50%, hsl(345 40% 94%), hsl(350 30% 97%))',
  romantic: 'radial-gradient(ellipse at 50% 50%, hsl(330 35% 93%), hsl(340 25% 96%))',
  playful: 'radial-gradient(ellipse at 50% 50%, hsl(280 35% 94%), hsl(270 25% 97%))',
  minimal: 'hsl(0 0% 98%)',
};

const vibeTextColor: Record<string, string> = {
  warm: 'hsl(345 40% 40%)',
  romantic: 'hsl(330 35% 35%)',
  playful: 'hsl(280 40% 40%)',
  minimal: 'hsl(0 0% 25%)',
};

const QuoteTransition = ({ quote, onComplete, vibe = 'warm' }: Props) => {
  const [visible, setVisible] = useState(true);
  const lines = quote.split('\n');

  useEffect(() => {
    haptics.pulse();
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onComplete, 600); // wait for exit animation
    }, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-40 flex items-center justify-center px-8"
      style={{ background: vibeGradients[vibe] || vibeGradients.warm }}
      initial={{ opacity: 0 }}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Subtle sparkle dots */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 3,
            height: 3,
            backgroundColor: vibeTextColor[vibe] || vibeTextColor.warm,
            opacity: 0.15,
            left: `${20 + Math.random() * 60}%`,
            top: `${30 + Math.random() * 40}%`,
          }}
          animate={{ opacity: [0, 0.2, 0], scale: [0.5, 1.5, 0.5] }}
          transition={{ duration: 2 + Math.random(), repeat: Infinity, delay: i * 0.4 }}
        />
      ))}

      {/* Quote text */}
      <div className="text-center max-w-sm">
        {lines.map((line, i) => (
          <motion.p
            key={i}
            className="font-handwritten leading-relaxed"
            style={{
              fontSize: line.length > 40 ? 22 : line.length > 20 ? 28 : 34,
              color: vibeTextColor[vibe] || vibeTextColor.warm,
            }}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.4, duration: 0.8 }}
          >
            {line}
          </motion.p>
        ))}
      </div>
    </motion.div>
  );
};

export default QuoteTransition;
