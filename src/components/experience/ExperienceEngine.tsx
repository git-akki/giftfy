import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Celebration, Slide } from '@/lib/types';
import { getQuote } from '@/lib/quotes';
import SlideRenderer from './SlideRenderer';
import QuoteTransition from './QuoteTransition';
import ScreenGlow from './ScreenGlow';
import SparklerBurst from '@/components/birthday/SparklerBurst';
import BrandingWatermark from './BrandingWatermark';
import MusicPlayer from './MusicPlayer';

interface Props {
  celebration: Celebration;
  slides: Slide[];
}

const isSlideEmpty = (slide: Slide, celebration: Celebration): boolean => {
  const content = slide.content as Record<string, any>;
  const type = slide.slideType;

  switch (type) {
    case 'traits':
      return !content.items || content.items.length === 0;
    case 'photo_wall':
      return !content.photos || content.photos.length === 0;
    case 'chat_replay':
      return !content.messages || content.messages.length === 0;
    case 'letter':
      const paras = content.paragraphs || [content.body];
      return !paras || paras.every((p: string) => !p || !p.trim());
    case 'gift_reveal':
      return !(content.giftUrl || celebration.giftUrl);
    case 'voice_note':
      return !celebration.voiceNoteUrl;
    default:
      return false;
  }
};

type Phase = 'intro' | 'quote' | 'slide';

const ExperienceEngine = ({ celebration, slides }: Props) => {
  const [started, setStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('intro');
  const [showBurst, setShowBurst] = useState(false);

  const activeSlides = slides.filter((s) => !isSlideEmpty(s, celebration));
  const vibe = celebration.vibe || 'warm';

  const handleStart = () => {
    setShowBurst(true);
    setTimeout(() => {
      setStarted(true);
      setShowBurst(false);
      // Show quote before first slide (if it has one)
      const firstQuote = getQuote(activeSlides[0]?.slideType, vibe);
      if (firstQuote) {
        setPhase('quote');
      } else {
        setPhase('slide');
      }
    }, 600);
  };

  const goToSlide = useCallback((index: number) => {
    if (index < 0 || index >= activeSlides.length) return;

    // Check if next slide has a quote
    const quote = getQuote(activeSlides[index]?.slideType, vibe);

    if (quote && index > currentIndex) {
      // Going forward — show quote transition first
      setCurrentIndex(index);
      setPhase('quote');
    } else {
      // Going backward or no quote — direct cut
      setCurrentIndex(index);
      setPhase('slide');
    }
  }, [activeSlides, currentIndex, vibe]);

  const next = useCallback(() => {
    if (currentIndex < activeSlides.length - 1) {
      goToSlide(currentIndex + 1);
    }
  }, [currentIndex, activeSlides.length, goToSlide]);

  const prev = useCallback(() => {
    if (currentIndex > 0) {
      goToSlide(currentIndex - 1);
    }
  }, [currentIndex, goToSlide]);

  const handleQuoteComplete = useCallback(() => {
    setPhase('slide');
  }, []);

  const occasionEmoji = celebration.occasion === 'birthday' ? '🎂'
    : celebration.occasion === 'anniversary' ? '💍'
    : celebration.occasion === 'graduation' ? '🎓' : '🎉';

  return (
    <div className="min-h-screen bg-background overflow-hidden relative">
      {/* Screen edge glow (triggered by sweet moments) */}
      <ScreenGlow />

      {(!celebration.tier || celebration.tier === 'free') && <BrandingWatermark />}
      <MusicPlayer trackId={celebration.musicTrackId} customUrl={celebration.customMusicUrl} />

      <AnimatePresence mode="wait">
        {/* ─── Intro Screen ─── */}
        {!started && (
          <motion.div
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen flex flex-col items-center justify-center px-4 relative"
          >
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-primary/10 blur-3xl scale-150" />
              <motion.div className="animate-heartbeat text-7xl sm:text-8xl mb-6 relative z-10">
                {occasionEmoji}
              </motion.div>
            </div>

            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="font-display text-5xl sm:text-7xl text-gradient-romantic text-center mb-3"
            >
              Hey {celebration.recipientName}! 🎀
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="font-handwritten text-xl sm:text-2xl text-muted-foreground text-center max-w-md mb-10"
            >
              Someone made something special, just for you...
            </motion.p>

            <div className="relative">
              <SparklerBurst active={showBurst} count={40} />
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                onClick={handleStart}
                className="font-body font-semibold text-lg px-10 py-4 rounded-full text-white relative z-10 transition-all"
                style={{
                  background: 'linear-gradient(135deg, hsl(345 55% 62%), hsl(330 45% 58%))',
                  boxShadow: '0 4px 16px hsl(345 55% 60% / 0.25)',
                }}
              >
                Open Your Gift 🎁
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ─── Quote Transition ─── */}
        {started && phase === 'quote' && (
          <QuoteTransition
            key={`quote-${currentIndex}`}
            quote={getQuote(activeSlides[currentIndex]?.slideType, vibe) || ''}
            onComplete={handleQuoteComplete}
            vibe={vibe}
          />
        )}

        {/* ─── Slide Content ─── */}
        {started && phase === 'slide' && activeSlides[currentIndex] && (
          <motion.div
            key={`slide-${currentIndex}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            <SlideRenderer
              slide={activeSlides[currentIndex]}
              celebration={celebration}
              slideIndex={currentIndex}
              totalSlides={activeSlides.length}
              onNext={next}
              onPrev={prev}
              isFirst={currentIndex === 0}
              isLast={currentIndex === activeSlides.length - 1}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExperienceEngine;
