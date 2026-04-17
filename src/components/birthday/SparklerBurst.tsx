import { motion, AnimatePresence } from "framer-motion";
import { useMemo } from "react";

interface Props {
  active: boolean;
  count?: number;
  colors?: string[];
}

const SparklerBurst = ({ active, count = 30, colors }: Props) => {
  const defaultColors = [
    "hsl(345 55% 65%)",
    "hsl(40 90% 65%)",
    "hsl(280 40% 70%)",
    "hsl(20 80% 70%)",
    "hsl(160 40% 65%)",
    "hsl(0 0% 100%)",
  ];
  const palette = colors || defaultColors;

  const particles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
        const distance = 80 + Math.random() * 160;
        return {
          id: i,
          x: Math.cos(angle) * distance,
          y: Math.sin(angle) * distance,
          size: 3 + Math.random() * 5,
          color: palette[Math.floor(Math.random() * palette.length)],
          delay: Math.random() * 0.3,
          duration: 0.8 + Math.random() * 0.6,
          shape: Math.random() > 0.5 ? "circle" : "rect",
          rotation: Math.random() * 720 - 360,
        };
      }),
    [count]
  );

  return (
    <AnimatePresence>
      {active && (
        <div className="absolute inset-0 pointer-events-none z-50 flex items-center justify-center overflow-visible">
          {particles.map((p) => (
            <motion.div
              key={p.id}
              className="absolute"
              style={{
                width: p.size,
                height: p.shape === "rect" ? p.size * 2.5 : p.size,
                backgroundColor: p.color,
                borderRadius: p.shape === "circle" ? "50%" : "1px",
              }}
              initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
              animate={{
                x: p.x,
                y: p.y,
                opacity: [1, 1, 0],
                scale: [0, 1.2, 0.3],
                rotate: p.rotation,
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: p.duration,
                delay: p.delay,
                ease: "easeOut",
              }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
};

export default SparklerBurst;
