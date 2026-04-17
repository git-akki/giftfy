import { motion } from "framer-motion";
import { useMemo } from "react";

/* ═══════════════════════════════════════════
   Fairy String Lights — TWO rows, top + bottom
   ═══════════════════════════════════════════ */
export const FairyLights = () => {
  const topBulbs = useMemo(
    () =>
      Array.from({ length: 16 }, (_, i) => ({
        id: i,
        color: ["hsl(40 90% 70%)", "hsl(345 55% 70%)", "hsl(280 40% 70%)", "hsl(160 50% 65%)", "hsl(20 80% 70%)", "hsl(200 60% 65%)"][i % 6],
        x: 2 + i * 6.2,
        sag: Math.sin((i / 15) * Math.PI) * 16,
        delay: i * 0.1,
      })),
    []
  );

  const bottomBulbs = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        id: i + 100,
        color: ["hsl(345 55% 70%)", "hsl(40 90% 70%)", "hsl(160 50% 65%)", "hsl(280 40% 70%)", "hsl(20 80% 70%)"][i % 5],
        x: 5 + i * 6.8,
        sag: Math.sin((i / 13) * Math.PI) * 12,
        delay: i * 0.12 + 0.5,
      })),
    []
  );

  const renderRow = (bulbs: typeof topBulbs, yOffset: number, wireD: string) => (
    <div className="fixed left-0 right-0 h-16 pointer-events-none z-40" style={{ top: yOffset }}>
      <svg className="absolute top-2 left-0 w-full h-12" viewBox="0 0 100 16" preserveAspectRatio="none">
        <path d={wireD} fill="none" stroke="hsl(0 0% 30% / 0.12)" strokeWidth="0.2" />
      </svg>
      {bulbs.map((b) => (
        <motion.div key={b.id} className="absolute" style={{ left: `${b.x}%`, top: 10 + b.sag }}>
          {/* Glow halo */}
          <motion.div
            className="absolute rounded-full"
            style={{ width: 16, height: 16, top: -6, left: -6, background: `radial-gradient(circle, ${b.color}50, transparent 70%)`, filter: "blur(3px)" }}
            animate={{ opacity: [0.3, 1, 0.3], scale: [0.7, 1.3, 0.7] }}
            transition={{ duration: 1 + Math.random() * 0.8, repeat: Infinity, delay: b.delay }}
          />
          {/* Bulb */}
          <motion.div
            className="w-2 h-2.5 rounded-full"
            style={{
              background: `radial-gradient(circle at 35% 25%, hsl(0 0% 100% / 0.6), ${b.color})`,
              boxShadow: `0 0 6px ${b.color}, 0 0 12px ${b.color}40`,
            }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1 + Math.random() * 0.8, repeat: Infinity, delay: b.delay }}
          />
        </motion.div>
      ))}
    </div>
  );

  return (
    <>
      {renderRow(topBulbs, 0, "M 0,3 Q 8,15 20,7 Q 32,0 44,11 Q 56,18 68,6 Q 80,0 92,9 Q 96,12 100,8")}
      {renderRow(bottomBulbs, 28, "M 0,8 Q 14,0 28,10 Q 42,18 56,5 Q 70,0 84,12 Q 92,16 100,6")}
    </>
  );
};

/* ═══════════════════════════════════════════
   Side Bunting / Triangle Flags
   ═══════════════════════════════════════════ */
export const Bunting = () => {
  const flags = useMemo(
    () =>
      Array.from({ length: 8 }, (_, i) => ({
        id: i,
        color: ["hsl(345 55% 65%)", "hsl(40 85% 65%)", "hsl(280 40% 68%)", "hsl(160 45% 60%)", "hsl(20 75% 65%)", "hsl(200 55% 62%)"][i % 6],
        y: 80 + i * 55,
        side: i % 2 === 0 ? "left" : "right",
        rotate: i % 2 === 0 ? 15 : -15,
        delay: i * 0.15,
      })),
    []
  );

  return (
    <>
      {flags.map((f) => (
        <motion.div
          key={f.id}
          className="fixed pointer-events-none z-30"
          style={{
            [f.side as string]: -4,
            top: f.y,
            transform: `rotate(${f.rotate}deg)`,
          }}
          animate={{ rotate: [f.rotate, f.rotate + 3, f.rotate - 2, f.rotate] }}
          transition={{ duration: 3, repeat: Infinity, delay: f.delay }}
        >
          <div
            style={{
              width: 0,
              height: 0,
              borderLeft: "14px solid transparent",
              borderRight: "14px solid transparent",
              borderTop: `22px solid ${f.color}`,
              opacity: 0.7,
            }}
          />
        </motion.div>
      ))}
    </>
  );
};

/* ═══════════════════════════════════════════
   Warm Bokeh — more, brighter
   ═══════════════════════════════════════════ */
export const WarmBokeh = () => {
  const dots = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 30 + Math.random() * 100,
        dur: 4 + Math.random() * 6,
        delay: Math.random() * 5,
        color: [
          "hsl(345 55% 70% / 0.07)",
          "hsl(40 80% 65% / 0.06)",
          "hsl(280 30% 70% / 0.05)",
          "hsl(20 70% 70% / 0.06)",
          "hsl(160 40% 65% / 0.04)",
          "hsl(200 50% 65% / 0.05)",
        ][i % 6],
      })),
    []
  );

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {dots.map((d) => (
        <motion.div
          key={d.id}
          className="absolute rounded-full"
          style={{
            width: d.size,
            height: d.size,
            left: `${d.x}%`,
            top: `${d.y}%`,
            background: `radial-gradient(circle, ${d.color}, transparent 70%)`,
          }}
          animate={{
            y: [0, -20, 0],
            x: [0, 10, -8, 0],
            opacity: [0.3, 0.9, 0.3],
            scale: [0.85, 1.15, 0.85],
          }}
          transition={{ duration: d.dur, repeat: Infinity, delay: d.delay, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
};

/* ═══════════════════════════════════════════
   Sparkle Stars — twinkling tiny stars
   ═══════════════════════════════════════════ */
export const SparkleStars = () => {
  const stars = useMemo(
    () =>
      Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 2 + Math.random() * 3,
        dur: 1.5 + Math.random() * 2,
        delay: Math.random() * 4,
      })),
    []
  );

  return (
    <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
      {stars.map((s) => (
        <motion.div
          key={s.id}
          className="absolute"
          style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.size, height: s.size }}
          animate={{ opacity: [0, 1, 0], scale: [0.5, 1.5, 0.5], rotate: [0, 180, 360] }}
          transition={{ duration: s.dur, repeat: Infinity, delay: s.delay, ease: "easeInOut" }}
        >
          {/* 4-point star shape */}
          <div
            style={{
              width: "100%",
              height: "100%",
              background: "hsl(40 90% 75%)",
              clipPath: "polygon(50% 0%, 60% 40%, 100% 50%, 60% 60%, 50% 100%, 40% 60%, 0% 50%, 40% 40%)",
            }}
          />
        </motion.div>
      ))}
    </div>
  );
};

/* ═══════════════════════════════════════════
   Corner Balloons
   ═══════════════════════════════════════════ */
export const CornerBalloons = () => {
  const balloons = useMemo(
    () => [
      { x: 3, y: 12, color: "hsl(345 55% 65%)", size: 28, delay: 0 },
      { x: 8, y: 20, color: "hsl(280 40% 70%)", size: 22, delay: 0.3 },
      { x: 88, y: 14, color: "hsl(40 90% 65%)", size: 26, delay: 0.5 },
      { x: 93, y: 22, color: "hsl(160 45% 60%)", size: 20, delay: 0.2 },
      { x: 5, y: 75, color: "hsl(20 75% 65%)", size: 24, delay: 0.4 },
      { x: 91, y: 72, color: "hsl(345 60% 72%)", size: 22, delay: 0.6 },
    ],
    []
  );

  return (
    <>
      {balloons.map((b, i) => (
        <motion.div
          key={i}
          className="fixed pointer-events-none z-20"
          style={{ left: `${b.x}%`, top: `${b.y}%` }}
          animate={{ y: [0, -6, 0], x: [0, 2, -1, 0], rotate: [0, 3, -2, 0] }}
          transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, delay: b.delay, ease: "easeInOut" }}
        >
          {/* String */}
          <div
            className="absolute left-1/2 -translate-x-1/2"
            style={{ top: b.size * 1.2 - 2, width: 1, height: 25, background: "hsl(0 0% 60% / 0.2)" }}
          />
          {/* Balloon */}
          <div
            style={{
              width: b.size,
              height: b.size * 1.2,
              background: `radial-gradient(ellipse at 35% 25%, hsl(0 0% 100% / 0.35), ${b.color} 50%)`,
              borderRadius: "50% 50% 50% 50% / 45% 45% 55% 55%",
              boxShadow: `inset -2px -3px 6px ${b.color}80, 0 3px 8px ${b.color}20`,
              opacity: 0.7,
            }}
          />
          {/* Knot */}
          <div
            className="mx-auto"
            style={{ width: 4, height: 4, backgroundColor: b.color, clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)", marginTop: -1, opacity: 0.7 }}
          />
        </motion.div>
      ))}
    </>
  );
};

/* ═══════════════════════════════════════════
   Confetti Drizzle — light continuous confetti
   ═══════════════════════════════════════════ */
export const ConfettiDrizzle = () => {
  const pieces = useMemo(
    () =>
      Array.from({ length: 25 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        size: 4 + Math.random() * 5,
        color: [
          "hsl(345 55% 65%)",
          "hsl(40 90% 65%)",
          "hsl(280 40% 70%)",
          "hsl(160 45% 60%)",
          "hsl(20 80% 70%)",
          "hsl(200 55% 65%)",
          "hsl(0 0% 100%)",
        ][Math.floor(Math.random() * 7)],
        delay: Math.random() * 8,
        duration: 6 + Math.random() * 6,
        wobble: (Math.random() - 0.5) * 60,
        shape: Math.random() > 0.5 ? "circle" : "rect",
      })),
    []
  );

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-5">
      {pieces.map((p) => (
        <motion.div
          key={p.id}
          className="absolute"
          style={{
            left: `${p.x}%`,
            width: p.shape === "rect" ? p.size * 0.5 : p.size,
            height: p.shape === "rect" ? p.size * 1.4 : p.size,
            backgroundColor: p.color,
            borderRadius: p.shape === "circle" ? "50%" : "1px",
            opacity: 0.6,
          }}
          animate={{
            y: ["-5vh", "105vh"],
            x: [0, p.wobble, -p.wobble * 0.5],
            rotate: [0, 360, 720],
          }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "linear" }}
        />
      ))}
    </div>
  );
};

/* ═══════════════════════════════════════════
   Sounds — preloaded for mobile compatibility
   Mobile browsers block audio unless unlocked
   by a user gesture. We preload + unlock on
   first tap anywhere, then play() works later.
   ═══════════════════════════════════════════ */
const preloadedSounds: Record<string, HTMLAudioElement> = {};
let audioUnlocked = false;

const preload = (key: string, src: string, volume: number) => {
  if (preloadedSounds[key]) return;
  const audio = new Audio(src);
  audio.volume = volume;
  audio.preload = "auto";
  preloadedSounds[key] = audio;
};

// Preload all sounds immediately
preload("balloon", "/sounds/balloon-pop.mp3", 0.8);
preload("clapping", "/sounds/clapping.mp3", 0.6);

// Unlock audio on first user interaction (tap/click)
const unlockAudio = () => {
  if (audioUnlocked) return;
  audioUnlocked = true;
  // Play + pause each sound silently to unlock
  Object.values(preloadedSounds).forEach((audio) => {
    audio.play().then(() => { audio.pause(); audio.currentTime = 0; }).catch(() => {});
  });
  document.removeEventListener("touchstart", unlockAudio);
  document.removeEventListener("click", unlockAudio);
};
document.addEventListener("touchstart", unlockAudio, { once: true });
document.addEventListener("click", unlockAudio, { once: true });

const playSound = (key: string) => {
  const audio = preloadedSounds[key];
  if (!audio) return;
  audio.currentTime = 0;
  audio.play().catch(() => {});
};

export const playConfettiSound = () => playSound("balloon");
export const playClappingSound = () => playSound("clapping");
