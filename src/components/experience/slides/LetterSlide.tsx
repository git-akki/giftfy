import { motion } from 'framer-motion';
import { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { prepareWithSegments, layoutWithLines } from '@chenglou/pretext';
import { haptics } from '@/hooks/use-haptics';
import { triggerScreenGlow } from '@/components/experience/ScreenGlow';
import TouchLove from '@/components/experience/TouchLove';
import NavigationButtons from '@/components/birthday/NavigationButtons';

interface Props {
  paragraphs: string[];
  signature: string;
  recipientName: string;
  onNext?: () => void;
  onPrev?: () => void;
}

const FONT = '20px Caveat';
const LINE_HEIGHT = 30;
const PADDING = 28;
const CURSOR_BLINK_MS = 530;

const LetterSlide = ({ paragraphs, signature, recipientName, onNext, onPrev }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasWidth, setCanvasWidth] = useState(320);
  const [visibleLines, setVisibleLines] = useState(0);
  const [cursorVisible, setCursorVisible] = useState(true);
  const [done, setDone] = useState(false);

  // Build full letter text
  const fullText = useMemo(() => {
    const parts = [`Dear ${recipientName},\n\n`];
    parts.push(...paragraphs.map((p) => p + '\n\n'));
    if (signature) parts.push(`— ${signature}`);
    return parts.join('');
  }, [paragraphs, signature, recipientName]);

  // Measure container width
  useEffect(() => {
    const measure = () => {
      if (containerRef.current) {
        setCanvasWidth(Math.min(containerRef.current.offsetWidth, 400));
      }
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  // Prepare text with Pretext
  const prepared = useMemo(() => {
    try {
      return prepareWithSegments(fullText, FONT, { whiteSpace: 'pre-wrap' });
    } catch {
      return null;
    }
  }, [fullText]);

  // Layout lines
  const lines = useMemo(() => {
    if (!prepared) return [];
    try {
      const result = layoutWithLines(prepared, canvasWidth - PADDING * 2, LINE_HEIGHT);
      return result.lines;
    } catch {
      return [];
    }
  }, [prepared, canvasWidth]);

  const totalLines = lines.length;
  const canvasHeight = totalLines * LINE_HEIGHT + PADDING * 2 + 20;

  // Reveal lines one by one
  useEffect(() => {
    if (visibleLines >= totalLines) {
      setDone(true);
      haptics.heartbeat();
      triggerScreenGlow();
      return;
    }
    const delay = visibleLines === 0 ? 1000 : 400 + Math.random() * 300;
    const timer = setTimeout(() => {
      setVisibleLines((v) => v + 1);
      haptics.tap();
    }, delay);
    return () => clearTimeout(timer);
  }, [visibleLines, totalLines]);

  // Cursor blink
  useEffect(() => {
    if (done) return;
    const interval = setInterval(() => setCursorVisible((v) => !v), CURSOR_BLINK_MS);
    return () => clearInterval(interval);
  }, [done]);

  // Draw on canvas
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || lines.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvasWidth * dpr;
    canvas.height = canvasHeight * dpr;
    ctx.scale(dpr, dpr);

    // Paper background
    ctx.fillStyle = 'hsl(35, 30%, 96%)';
    ctx.beginPath();
    ctx.roundRect(0, 0, canvasWidth, canvasHeight, 16);
    ctx.fill();

    // Subtle paper texture lines
    ctx.strokeStyle = 'hsl(35, 20%, 90%)';
    ctx.lineWidth = 0.5;
    for (let y = PADDING + LINE_HEIGHT; y < canvasHeight - PADDING; y += LINE_HEIGHT) {
      ctx.beginPath();
      ctx.moveTo(PADDING - 4, y);
      ctx.lineTo(canvasWidth - PADDING + 4, y);
      ctx.stroke();
    }

    // Left margin line (red)
    ctx.strokeStyle = 'hsl(0, 50%, 80%)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(PADDING - 8, PADDING - 10);
    ctx.lineTo(PADDING - 8, canvasHeight - PADDING + 10);
    ctx.stroke();

    // Draw visible lines
    ctx.font = FONT;
    ctx.fillStyle = 'hsl(340, 25%, 22%)';
    ctx.textBaseline = 'top';

    for (let i = 0; i < visibleLines && i < lines.length; i++) {
      const line = lines[i];
      const x = PADDING;
      const y = PADDING + i * LINE_HEIGHT;

      // Slight hand wobble
      const wobbleX = Math.sin(i * 1.3) * 0.8;
      const wobbleY = Math.sin(i * 0.9 + 0.5) * 1.2;

      // Signature in different color
      if (signature && line.text.includes(signature)) {
        ctx.fillStyle = 'hsl(345, 55%, 50%)';
        ctx.font = `italic ${FONT}`;
      } else if (line.text.startsWith('Dear')) {
        ctx.fillStyle = 'hsl(345, 45%, 35%)';
        ctx.font = FONT;
      } else {
        ctx.fillStyle = 'hsl(340, 25%, 22%)';
        ctx.font = FONT;
      }

      ctx.fillText(line.text, x + wobbleX, y + wobbleY);
    }

    // Blinking cursor
    if (!done && cursorVisible && visibleLines > 0 && visibleLines <= lines.length) {
      const cursorLineIdx = visibleLines - 1;
      const cursorLine = lines[cursorLineIdx];
      if (cursorLine) {
        const cursorX = PADDING + cursorLine.width + 3;
        const cursorY = PADDING + cursorLineIdx * LINE_HEIGHT + 4;
        ctx.fillStyle = 'hsl(345, 55%, 55%)';
        ctx.fillRect(cursorX, cursorY, 2, LINE_HEIGHT - 8);
      }
    }

    // "Letter" watermark at bottom
    if (done) {
      ctx.font = '11px Quicksand';
      ctx.fillStyle = 'hsl(340, 20%, 75%)';
      ctx.textAlign = 'center';
      ctx.fillText('💌', canvasWidth / 2, canvasHeight - 14);
      ctx.textAlign = 'start';
    }
  }, [lines, visibleLines, cursorVisible, done, canvasWidth, canvasHeight, signature]);

  useEffect(() => {
    draw();
  }, [draw]);

  // Fallback if Pretext fails
  if (!prepared || lines.length === 0) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="min-h-screen flex flex-col items-center justify-center px-4 py-16 relative z-10">
        <div className="bg-blush/30 backdrop-blur-sm rounded-3xl p-6 sm:p-10 max-w-lg text-center"
          style={{ boxShadow: '0 12px 40px hsl(345 30% 60% / 0.1)' }}>
          <div className="text-5xl mb-4">💌</div>
          <h2 className="font-display text-3xl text-gradient-romantic mb-5">A Letter For You</h2>
          <div className="font-body text-foreground/75 text-sm leading-relaxed space-y-4 text-left">
            <p>Dear {recipientName},</p>
            {paragraphs.map((p, i) => <p key={i}>{p}</p>)}
            {signature && <p className="text-right text-muted-foreground/60 italic">— {signature}</p>}
          </div>
          <NavigationButtons onNext={onNext} onPrev={onPrev} />
        </div>
      </motion.div>
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
        className="font-display text-3xl text-gradient-romantic mb-4 text-center"
      >
        A Letter For You 💌
      </motion.h2>

      <div ref={containerRef} className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mx-auto"
          style={{
            width: canvasWidth,
            filter: 'drop-shadow(0 8px 24px hsl(30 20% 40% / 0.1))',
          }}
        >
          <canvas
            ref={canvasRef}
            style={{
              width: canvasWidth,
              height: canvasHeight,
              borderRadius: 16,
            }}
          />
        </motion.div>
      </div>

      {/* Progress */}
      {!done && (
        <motion.p
          className="font-body text-muted-foreground/30 text-[10px] mt-4"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          writing...
        </motion.p>
      )}

      {done && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          <NavigationButtons onNext={onNext} onPrev={onPrev} />
        </motion.div>
      )}
    </motion.div>
  );
};

export default LetterSlide;
