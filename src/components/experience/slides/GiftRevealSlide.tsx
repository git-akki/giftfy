import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useShake } from '@/hooks/use-shake';
import { haptics } from '@/hooks/use-haptics';
import NavigationButtons from '@/components/birthday/NavigationButtons';

interface Props {
  giftTitle: string;
  giftUrl: string;
  giftDescription: string;
  recipientName: string;
  onNext?: () => void;
  onPrev?: () => void;
}

const GiftRevealSlide = ({ giftTitle, giftUrl, giftDescription, recipientName, onNext, onPrev }: Props) => {
  const [opened, setOpened] = useState(false);
  const [shakeProgress, setShakeProgress] = useState(0);

  const handleOpen = () => {
    haptics.success();
    setOpened(true);
  };

  // Shake to unwrap (mobile)
  const { supported: shakeSupported, permissionGranted, requestPermission } = useShake({
    onShake: () => {
      if (opened) return;
      haptics.tap();
      setShakeProgress((p) => {
        const next = p + 1;
        if (next >= 3) {
          setTimeout(handleOpen, 100);
          return 3;
        }
        return next;
      });
    },
    enabled: !opened,
  });

  // Request shake permission on iOS Safari (needs tap)
  const [askedPermission, setAskedPermission] = useState(false);
  useEffect(() => {
    if (shakeSupported && !permissionGranted && !askedPermission) {
      // Will be requested on first tap
    }
  }, [shakeSupported, permissionGranted, askedPermission]);

  const handleEnvelopeTap = async () => {
    // If shake is supported but permission not granted (iOS), request it
    if (shakeSupported && !permissionGranted && !askedPermission) {
      await requestPermission();
      setAskedPermission(true);
      return; // Don't open yet — let them try shaking
    }
    // If no shake support (desktop), just open on tap
    if (!shakeSupported) {
      handleOpen();
    }
    // If shake is supported and granted, they should shake — but 2 taps = force open
    setShakeProgress((p) => {
      if (p >= 1) {
        setTimeout(handleOpen, 100);
        return 3;
      }
      return p + 1;
    });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative z-10">

      <motion.p className="font-display text-3xl sm:text-4xl text-gradient-romantic mb-3 text-center"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
        One more thing... 🎁
      </motion.p>

      <motion.p className="font-handwritten text-muted-foreground text-base mb-8 text-center max-w-xs"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
        There's a gift for you, {recipientName}
      </motion.p>

      <AnimatePresence mode="wait">
        {!opened ? (
          <motion.div key="envelope" className="relative cursor-pointer" style={{ width: 'min(200px, 55vw)' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}
            exit={{ scale: 0.5, opacity: 0, rotate: 15 }}
            onClick={handleEnvelopeTap}
            whileTap={{ scale: 0.95 }}
          >
            {/* Shake progress ring */}
            {shakeSupported && permissionGranted && shakeProgress > 0 && shakeProgress < 3 && (
              <motion.div className="absolute -inset-4 rounded-3xl pointer-events-none"
                animate={{
                  boxShadow: `0 0 0 ${shakeProgress * 3}px hsl(345 55% 65% / ${0.15 * shakeProgress})`,
                }}
              />
            )}

            <motion.div
              animate={shakeProgress > 0 && shakeProgress < 3 ? { rotate: [0, -3, 3, -2, 2, 0] } : {}}
              transition={{ duration: 0.4 }}
            >
              <div className="relative" style={{ height: 130 }}>
                <div style={{ position: 'absolute', inset: 0,
                  background: 'linear-gradient(135deg, hsl(345 45% 72%), hsl(340 40% 65%))',
                  borderRadius: 14, boxShadow: '0 6px 20px hsl(345 40% 40% / 0.15)' }} />
                <motion.div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 65,
                  background: 'linear-gradient(135deg, hsl(345 50% 68%), hsl(340 45% 60%))',
                  clipPath: 'polygon(0 0, 100% 0, 50% 100%)', transformOrigin: 'top center', zIndex: 5 }}
                  animate={{ rotateX: [0, 8, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }} />
                <div className="absolute top-[32px] left-1/2 -translate-x-1/2 text-xl z-10">💌</div>
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 70,
                  background: 'linear-gradient(to bottom, hsl(345 40% 75%), hsl(340 38% 70%))',
                  borderRadius: '0 0 14px 14px' }} />
              </div>
            </motion.div>

            <motion.p className="font-body text-xs text-foreground/40 text-center mt-4"
              animate={{ opacity: [0.3, 0.8, 0.3] }} transition={{ duration: 1.5, repeat: Infinity }}>
              {shakeSupported && permissionGranted
                ? '📱 shake your phone to open!'
                : 'tap to open'}
            </motion.p>
          </motion.div>
        ) : (
          <motion.div key="gift" className="w-full flex flex-col items-center"
            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', damping: 20, stiffness: 120 }}>

            <motion.a href={giftUrl} target="_blank" rel="noopener noreferrer"
              className="w-full block" style={{ maxWidth: 'min(360px, 90vw)' }}
              whileHover={{ y: -3 }}>
              <div className="overflow-hidden" style={{ borderRadius: 20, background: '#fff',
                boxShadow: '0 8px 30px hsl(0 0% 0% / 0.06), 0 0 0 1px hsl(0 0% 0% / 0.04)' }}>
                <div className="px-5 py-4 flex items-center gap-3"
                  style={{ background: 'linear-gradient(135deg, hsl(345 55% 62%), hsl(330 50% 58%))' }}>
                  <div className="text-3xl">🎁</div>
                  <div>
                    <p className="font-body font-bold text-white text-sm leading-tight">
                      {giftTitle || 'Your Gift'}
                    </p>
                    <p className="font-body text-white/60 text-[10px] mt-0.5">Tap to open</p>
                  </div>
                </div>
                <div className="px-5 py-4">
                  {giftDescription && (
                    <p className="font-body text-foreground/55 text-xs leading-relaxed mb-3">{giftDescription}</p>
                  )}
                  <p className="font-body text-foreground/30 text-[10px] break-all">{giftUrl}</p>
                  <div className="mt-3 text-center py-2.5 rounded-xl font-body font-semibold text-xs text-white"
                    style={{ background: 'linear-gradient(135deg, hsl(345 55% 62%), hsl(330 50% 58%))' }}>
                    Open Gift →
                  </div>
                </div>
              </div>
            </motion.a>

            <NavigationButtons onNext={onNext} onPrev={onPrev} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default GiftRevealSlide;
