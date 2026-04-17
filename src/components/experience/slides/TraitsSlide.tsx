import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { haptics } from '@/hooks/use-haptics';
import NavigationButtons from '@/components/birthday/NavigationButtons';

interface Props {
  items: { emoji: string; label: string; desc: string }[];
  cameraEnabled: boolean;
  onNext?: () => void;
  onPrev?: () => void;
}

const SWIPE_THRESHOLD = 80;

const SwipeCard = ({
  item,
  onSwipe,
  isTop,
}: {
  item: { emoji: string; label: string; desc: string };
  onSwipe: (direction: 'left' | 'right') => void;
  isTop: boolean;
}) => {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 0, 200], [-18, 0, 18]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 0.8, 1, 0.8, 0.5]);

  // Reaction labels
  const rightOpacity = useTransform(x, [0, 60, 120], [0, 0.5, 1]);
  const leftOpacity = useTransform(x, [-120, -60, 0], [1, 0.5, 0]);

  const handleDragEnd = (_: any, info: { offset: { x: number }; velocity: { x: number } }) => {
    const swipeForce = Math.abs(info.offset.x) + Math.abs(info.velocity.x) * 0.5;
    if (info.offset.x > SWIPE_THRESHOLD || swipeForce > 150) {
      onSwipe('right');
    } else if (info.offset.x < -SWIPE_THRESHOLD || swipeForce > 150) {
      onSwipe('left');
    }
  };

  return (
    <motion.div
      className="absolute inset-0 cursor-grab active:cursor-grabbing"
      style={{ x, rotate, opacity, zIndex: isTop ? 10 : 1 }}
      drag={isTop ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9}
      onDragEnd={handleDragEnd}
      exit={{ x: 300, opacity: 0, rotate: 20 }}
      transition={{ type: 'spring', damping: 20, stiffness: 100 }}
    >
      {/* Card */}
      <div
        className="w-full h-full overflow-hidden flex flex-col"
        style={{
          borderRadius: 24,
          background: '#fff',
          boxShadow: isTop
            ? '0 12px 40px hsl(345 40% 50% / 0.12), 0 0 0 1px hsl(0 0% 0% / 0.04)'
            : '0 4px 16px hsl(0 0% 0% / 0.06)',
        }}
      >
        {/* Emoji hero */}
        <div
          className="flex items-center justify-center relative"
          style={{
            height: '55%',
            background: 'linear-gradient(135deg, hsl(345 55% 94%), hsl(330 40% 92%), hsl(280 30% 94%))',
          }}
        >
          <motion.span
            className="text-7xl"
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.3, 1] }}
            transition={{ delay: 0.15, type: 'spring', damping: 8 }}
          >
            {item.emoji}
          </motion.span>

          {/* "So true" label (right swipe) */}
          {isTop && (
            <motion.div
              className="absolute top-5 left-5 px-3 py-1.5 rounded-lg font-body font-bold text-sm"
              style={{
                opacity: rightOpacity,
                background: 'hsl(150 60% 45%)',
                color: 'white',
                border: '2px solid hsl(150 60% 55%)',
                transform: 'rotate(-12deg)',
              }}
            >
              SO TRUE 😂
            </motion.div>
          )}

          {/* "Nah" label (left swipe) */}
          {isTop && (
            <motion.div
              className="absolute top-5 right-5 px-3 py-1.5 rounded-lg font-body font-bold text-sm"
              style={{
                opacity: leftOpacity,
                background: 'hsl(345 60% 55%)',
                color: 'white',
                border: '2px solid hsl(345 60% 65%)',
                transform: 'rotate(12deg)',
              }}
            >
              NAH 🙄
            </motion.div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col justify-center px-6 py-4">
          <motion.h3
            className="font-body font-bold text-foreground text-xl mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
          >
            {item.label}
          </motion.h3>
          <motion.p
            className="font-body text-foreground/50 text-sm leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {item.desc}
          </motion.p>
        </div>
      </div>
    </motion.div>
  );
};

const TraitsSlide = ({ items, onNext, onPrev }: Props) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [reactions, setReactions] = useState<{ index: number; direction: 'left' | 'right' }[]>([]);

  const handleSwipe = (direction: 'left' | 'right') => {
    haptics.pulse();
    setReactions((prev) => [...prev, { index: currentIndex, direction }]);
    setCurrentIndex((i) => i + 1);
  };

  const allDone = currentIndex >= items.length;
  const soTrueCount = reactions.filter((r) => r.direction === 'right').length;

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <p className="font-body text-muted-foreground">No traits to show</p>
        <NavigationButtons onNext={onNext} onPrev={onPrev} />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative z-10"
    >
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-display text-3xl sm:text-4xl text-gradient-romantic mb-1 text-center"
      >
        {allDone ? 'Results!' : 'About You 📂'}
      </motion.h2>
      <p className="font-handwritten text-muted-foreground text-base mb-6 text-center">
        {allDone
          ? `${soTrueCount} out of ${items.length} — you know yourself well!`
          : 'swipe right = so true, left = nah'}
      </p>

      {!allDone ? (
        <>
          {/* Card stack */}
          <div className="relative w-full max-w-xs" style={{ height: 380 }}>
            {/* Background card (next one) */}
            {currentIndex + 1 < items.length && (
              <motion.div
                className="absolute inset-0"
                style={{
                  borderRadius: 24,
                  background: '#fff',
                  boxShadow: '0 4px 16px hsl(0 0% 0% / 0.06)',
                  transform: 'scale(0.95) translateY(8px)',
                }}
              />
            )}

            {/* Active card */}
            <AnimatePresence>
              {currentIndex < items.length && (
                <SwipeCard
                  key={currentIndex}
                  item={items[currentIndex]}
                  onSwipe={handleSwipe}
                  isTop={true}
                />
              )}
            </AnimatePresence>
          </div>

          {/* Counter */}
          <p className="font-body text-muted-foreground/30 text-xs mt-4">
            {currentIndex + 1} of {items.length}
          </p>

          {/* Swipe hint for first card */}
          {currentIndex === 0 && (
            <motion.p
              className="font-body text-muted-foreground/40 text-[10px] mt-2"
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              ← swipe the card →
            </motion.p>
          )}
        </>
      ) : (
        /* Results */
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-xs space-y-2"
        >
          {reactions.map((r, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="flex items-center gap-3 p-3 rounded-xl"
              style={{ background: '#fff', boxShadow: '0 1px 4px hsl(0 0% 0% / 0.04)' }}
            >
              <span className="text-xl">{items[r.index].emoji}</span>
              <span className="font-body text-foreground text-xs flex-1 font-semibold">
                {items[r.index].label}
              </span>
              <span className="text-sm">
                {r.direction === 'right' ? '😂✅' : '🙄❌'}
              </span>
            </motion.div>
          ))}

          <NavigationButtons onNext={onNext} onPrev={onPrev} />
        </motion.div>
      )}
    </motion.div>
  );
};

export default TraitsSlide;
