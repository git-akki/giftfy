import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReactionCapture } from '@/hooks/use-reaction-capture';
import { haptics } from '@/hooks/use-haptics';
import { triggerScreenGlow } from '@/components/experience/ScreenGlow';
import TapFireworks from '@/components/experience/TapFireworks';
import NavigationButtons from '@/components/birthday/NavigationButtons';
import confetti from 'canvas-confetti';
import { playConfettiSound, playClappingSound } from '@/components/birthday/BirthdayDecorations';

interface Props {
  recipientName: string;
  occasion: string;
  onNext?: () => void;
  onPrev?: () => void;
}

/* ── Blow Detection (same as original) ── */
const useBlowDetection = (onBlow: () => void, enabled: boolean) => {
  const [micStatus, setMicStatus] = useState<'idle' | 'requesting' | 'listening' | 'denied' | 'blown'>('idle');
  const [blowStrength, setBlowStrength] = useState(0);
  const streamRef = useRef<MediaStream | null>(null);
  const contextRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number>(0);

  const startListening = useCallback(async () => {
    if (micStatus === 'listening' || micStatus === 'blown') return;
    setMicStatus('requesting');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      });
      streamRef.current = stream;
      const ctx = new AudioContext();
      contextRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const lowPass = ctx.createBiquadFilter();
      lowPass.type = 'lowpass';
      lowPass.frequency.value = 250;
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 1024;
      analyser.smoothingTimeConstant = 0.3;
      source.connect(lowPass);
      lowPass.connect(analyser);
      const freqData = new Uint8Array(analyser.frequencyBinCount);
      let noiseFloor = 0, calibFrames = 0, sustained = 0;
      setMicStatus('listening');
      const detect = () => {
        analyser.getByteFrequencyData(freqData);
        let power = 0;
        for (let i = 0; i < freqData.length; i++) power += freqData[i];
        if (calibFrames < 30) {
          noiseFloor = calibFrames === 0 ? power : noiseFloor * 0.9 + power * 0.1;
          calibFrames++;
          rafRef.current = requestAnimationFrame(detect);
          return;
        }
        const threshold = Math.max(noiseFloor * 3, noiseFloor + 3000);
        if (power > threshold) {
          sustained++;
          setBlowStrength(Math.min((power - threshold) / (threshold * 2), 1));
          if (sustained >= 18) {
            setMicStatus('blown');
            setBlowStrength(0);
            onBlow();
            stream.getTracks().forEach((t) => t.stop());
            ctx.close();
            return;
          }
        } else {
          noiseFloor = noiseFloor * 0.995 + power * 0.005;
          sustained = Math.max(0, sustained - 2);
          setBlowStrength(0);
        }
        rafRef.current = requestAnimationFrame(detect);
      };
      rafRef.current = requestAnimationFrame(detect);
    } catch {
      setMicStatus('denied');
    }
  }, [micStatus, onBlow]);

  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      contextRef.current?.close();
    };
  }, []);

  useEffect(() => {
    if (enabled && micStatus === 'idle') {
      const t = setTimeout(startListening, 1200);
      return () => clearTimeout(t);
    }
  }, [enabled, micStatus, startListening]);

  return { micStatus, blowStrength };
};

/* ── Candle Flame ── */
const CandleFlame = ({ blown, blowStrength }: { blown: boolean; blowStrength: number }) => {
  const flicker = 1 - blowStrength * 0.65;
  if (blown) return (
    <motion.div className="relative flex flex-col items-center" style={{ width: 30, height: 50 }}>
      {[0, 1, 2].map((i) => (
        <motion.div key={i} className="absolute rounded-full"
          style={{ width: 6 + i * 2, height: 6 + i * 2, background: `hsl(0 0% ${70 + i * 8}% / ${0.4 - i * 0.1})`, filter: 'blur(2px)', left: '50%', marginLeft: -(3 + i) }}
          initial={{ y: 0, opacity: 0.5 }} animate={{ y: -(25 + i * 15), x: [(i - 1) * 8], opacity: 0, scale: [1, 2.5] }}
          transition={{ duration: 2 + i * 0.5, ease: 'easeOut' }} />
      ))}
    </motion.div>
  );
  return (
    <motion.div className="relative flex flex-col items-center" style={{ width: 30, height: 50, transformOrigin: 'bottom center' }}
      animate={{ rotate: [blowStrength * 30, blowStrength * 30 + 4, blowStrength * 30 - 3, blowStrength * 30], scaleY: [flicker, flicker * 0.92, flicker * 1.04, flicker], scaleX: [flicker, flicker * 1.05, flicker * 0.9, flicker] }}
      transition={{ duration: 0.35, repeat: Infinity, ease: 'easeInOut' }}>
      <div className="absolute rounded-full" style={{ width: 50, height: 60, top: -10, left: -10, background: 'radial-gradient(ellipse, hsl(35 100% 55% / 0.3), transparent 70%)', filter: 'blur(6px)' }} />
      <div style={{ width: 18, height: 36, background: 'linear-gradient(to top, hsl(20 100% 50%), hsl(40 100% 60%), hsl(45 100% 70% / 0.6))', borderRadius: '50% 50% 50% 50% / 65% 65% 35% 35%', filter: 'blur(0.8px)', position: 'relative' }}>
        <div style={{ position: 'absolute', width: 12, height: 26, top: 5, left: 3, background: 'linear-gradient(to top, hsl(35 100% 58%), hsl(50 100% 80% / 0.8))', borderRadius: '50% 50% 50% 50% / 65% 65% 35% 35%' }} />
        <div style={{ position: 'absolute', width: 6, height: 16, top: 12, left: 6, background: 'linear-gradient(to top, hsl(45 100% 85%), hsl(0 0% 100% / 0.9))', borderRadius: '50% 50% 50% 50% / 65% 65% 35% 35%' }} />
        <div style={{ position: 'absolute', width: 10, height: 6, bottom: 0, left: 4, background: 'radial-gradient(ellipse, hsl(220 80% 55% / 0.6), transparent)', borderRadius: '50%' }} />
      </div>
    </motion.div>
  );
};

/* ── Main Component ── */
const CandleBlowSlide = ({ recipientName, onNext, onPrev }: Props) => {
  const [candlesBlown, setCandlesBlown] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [showReaction, setShowReaction] = useState<'capturing' | 'showing' | null>(null);
  const { cameraReady, capturedPhoto, startCamera, capturePhoto, stopCamera } = useReactionCapture();

  // Silently start camera in background when slide loads
  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const blowCandles = useCallback(() => {
    if (candlesBlown) return;
    setCandlesBlown(true);
    haptics.celebration();
    playConfettiSound();

    const d = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };
    confetti({ ...d, particleCount: 50, origin: { x: 0.1, y: 0.6 } });
    confetti({ ...d, particleCount: 50, origin: { x: 0.9, y: 0.6 } });
    confetti({ ...d, particleCount: 40, origin: { x: 0.5, y: 0.3 } });

    setTimeout(() => {
      confetti({ particleCount: 80, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#e8a0bf', '#ffd1dc', '#FFD700'], zIndex: 100 });
      confetti({ particleCount: 80, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#e8a0bf', '#ffd1dc', '#FFD700'], zIndex: 100 });
    }, 400);

    setTimeout(() => { playClappingSound(); haptics.success(); }, 1800);

    // Capture reaction photo 1.5s after blow (peak surprise face)
    setTimeout(() => {
      if (cameraReady) {
        setShowReaction('capturing');
        capturePhoto();
        setTimeout(() => setShowReaction('showing'), 500);
      }
    }, 1500);

    setTimeout(() => setShowMessage(true), 3000);
    setTimeout(() => triggerScreenGlow(), 2000);
  }, [candlesBlown, cameraReady, capturePhoto]);

  const { micStatus, blowStrength } = useBlowDetection(blowCandles, !candlesBlown);
  const glowSize = candlesBlown ? 0 : 45 - blowStrength * 20;

  return (
    <TapFireworks enabled={candlesBlown}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative z-10 overflow-hidden">

        {/* Dark room */}
        <motion.div className="absolute inset-0 z-0"
          animate={{ background: candlesBlown ? 'hsl(350 30% 97%)' : 'hsl(0 0% 5%)' }}
          transition={{ duration: candlesBlown ? 1.5 : 0.3 }} />

        {/* Candle glow */}
        {!candlesBlown && (
          <motion.div className="absolute pointer-events-none z-[1]" style={{ width: '100%', height: '100%' }}
            animate={{ background: `radial-gradient(ellipse ${glowSize}% ${glowSize}% at 50% 42%, hsl(35 80% 55% / 0.25) 0%, hsl(25 70% 40% / 0.08) 40%, transparent 70%)` }}
            transition={{ duration: 0.1 }} />
        )}

        {/* Title */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-center mb-8 relative z-10">
          <motion.h2 className="font-display text-3xl sm:text-4xl mb-1"
            animate={{ color: candlesBlown ? 'hsl(345 55% 55%)' : 'hsl(40 60% 75%)' }} transition={{ duration: 1 }}>
            {candlesBlown ? 'Happy Birthday! 🎊' : 'Make a Wish...'}
          </motion.h2>
          <motion.p className="font-handwritten text-base"
            animate={!candlesBlown && micStatus === 'listening' ? {
              color: 'hsl(40 30% 55%)', x: [0, -3, 3, -2, 2, 0], scale: [1, 1.03, 1],
            } : { color: candlesBlown ? 'hsl(340 15% 50%)' : 'hsl(40 30% 55%)' }}
            transition={!candlesBlown && micStatus === 'listening' ? { duration: 0.5, repeat: Infinity, repeatDelay: 1.5 } : { duration: 1 }}>
            {candlesBlown ? 'you did it! 🥳'
              : micStatus === 'listening' ? '👉 blow into your mic now! 🌬️'
              : micStatus === 'requesting' ? 'allow mic access...'
              : micStatus === 'denied' ? 'mic access needed to blow 🎤'
              : 'close your eyes...'}
          </motion.p>
        </motion.div>

        {/* Cake + candle */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="relative z-10">
          <div className="flex flex-col items-center">
            <div className="flex justify-center mb-0.5 relative z-10">
              <div className="flex flex-col items-center">
                <CandleFlame blown={candlesBlown} blowStrength={blowStrength} />
                <div className="w-[3px] rounded-full" style={{ height: 10, backgroundColor: 'hsl(30 20% 30%)' }} />
                <div style={{ width: 10, height: 40, background: 'linear-gradient(to bottom, hsl(345 55% 70%), hsl(345 50% 55%))', borderRadius: '3px 3px 2px 2px', boxShadow: 'inset 2px 0 3px hsl(0 0% 100% / 0.3)' }} />
              </div>
            </div>
            {/* Simple cake */}
            <div className="flex flex-col items-center">
              <div style={{ width: 'min(240px, 65vw)', height: 16, borderRadius: '50% 50% 0 0', background: 'linear-gradient(135deg, hsl(345 55% 80%), hsl(345 50% 70%))' }} />
              <div style={{ width: 'min(240px, 65vw)', height: 45, background: 'linear-gradient(170deg, hsl(35 55% 75%), hsl(30 50% 65%))' }} />
              <div style={{ width: 'min(240px, 65vw)', height: 6, background: 'linear-gradient(to bottom, hsl(45 60% 88%), hsl(40 50% 82%))' }} />
              <div style={{ width: 'min(240px, 65vw)', height: 40, background: 'linear-gradient(170deg, hsl(345 48% 72%), hsl(345 40% 52%))', borderRadius: '0 0 10px 10px' }} />
              <div style={{ width: 'min(270px, 72vw)', height: 10, background: 'linear-gradient(to bottom, hsl(0 0% 95%), hsl(0 0% 85%))', borderRadius: '0 0 50% 50% / 0 0 100% 100%' }} />
            </div>
          </div>
        </motion.div>

        {/* ═══ REACTION PHOTO CAPTURE ═══ */}
        <AnimatePresence>
          {showReaction === 'capturing' && (
            <motion.div className="fixed inset-0 z-50 pointer-events-none"
              initial={{ opacity: 1 }} animate={{ opacity: 0 }} transition={{ duration: 0.3 }}
              style={{ background: 'white' }} />
          )}
          {showReaction === 'showing' && capturedPhoto && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center px-8"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="absolute inset-0" style={{ background: 'hsl(0 0% 0% / 0.5)', backdropFilter: 'blur(8px)' }}
                onClick={() => setShowReaction(null)} />
              <motion.div
                className="relative z-10"
                initial={{ scale: 0.5, rotate: -10 }}
                animate={{ scale: 1, rotate: 3 }}
                transition={{ type: 'spring', damping: 15 }}
              >
                {/* Polaroid frame */}
                <div style={{ background: 'white', padding: '8px 8px 32px 8px', borderRadius: 8, boxShadow: '0 12px 40px hsl(0 0% 0% / 0.3)', maxWidth: 240 }}>
                  <img src={capturedPhoto} alt="Your reaction!" className="w-full rounded" style={{ aspectRatio: '3/4', objectFit: 'cover' }} />
                  <p className="font-handwritten text-center text-foreground/60 text-sm mt-2">
                    The birthday face! 🎂😂
                  </p>
                </div>
                <motion.p className="font-body text-white/60 text-[10px] text-center mt-3"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
                  tap anywhere to continue
                </motion.p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Birthday message */}
        <AnimatePresence>
          {showMessage && !showReaction && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}
              className="mt-8 text-center max-w-md px-4 relative z-10">
              <motion.p className="font-display text-3xl sm:text-4xl text-gradient-romantic mb-2"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                Happy Birthday {recipientName}! 🎂
              </motion.p>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}>
                <NavigationButtons onNext={onNext} onPrev={onPrev} nextLabel="One More Thing" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {!showMessage && !candlesBlown && (
          <div className="relative z-10 mt-4">
            <NavigationButtons onPrev={onPrev} />
          </div>
        )}
      </motion.div>
    </TapFireworks>
  );
};

export default CandleBlowSlide;
