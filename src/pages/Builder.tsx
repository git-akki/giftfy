import { BuilderProvider, useBuilder } from '@/contexts/BuilderContext';
import { motion, AnimatePresence } from 'framer-motion';
import OccasionStep from '@/components/builder/OccasionStep';
import ContentStep from '@/components/builder/ContentStep';
import SlidesStep from '@/components/builder/SlidesStep';
import PreviewStep from '@/components/builder/PreviewStep';
import { useNavigate } from 'react-router-dom';
import MicroCelebration from '@/components/builder/MicroCelebration';
import { TIERS } from '@/lib/tiers';

const STEPS = ['Occasion', 'Content', 'Slides', 'Preview'];

const BuilderInner = () => {
  const { draft, step } = useBuilder();
  const navigate = useNavigate();
  const tierConfig = TIERS[draft.tier];

  return (
    <div className="min-h-screen bg-background">
      <MicroCelebration />
      {/* Header */}
      <div className="sticky top-0 z-30 backdrop-blur-md border-b border-border/30"
        style={{ background: 'hsl(0 0% 100% / 0.8)' }}>
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/dashboard')}
            className="font-body text-muted-foreground text-xs"
          >
            ← Dashboard
          </motion.button>
          <h1 className="font-display text-lg text-gradient-giftfy">New Gift</h1>
          <div
            className="w-16 flex justify-end font-body text-[10px] font-semibold"
            title={`Current plan: ${tierConfig.label}${tierConfig.price > 0 ? ` · ₹${tierConfig.price}` : ''}`}
          >
            <span
              className="px-2 py-0.5 rounded-full"
              style={{
                background: draft.tier === 'free' ? 'hsl(0 0% 92%)' : 'hsl(345 55% 92%)',
                color: draft.tier === 'free' ? 'hsl(0 0% 40%)' : 'hsl(345 55% 45%)',
              }}
            >
              {tierConfig.label}
            </span>
          </div>
        </div>

        {/* Step indicator */}
        <div className="max-w-lg mx-auto px-4 pb-3 flex gap-1">
          {STEPS.map((label, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full h-1 rounded-full transition-all duration-500"
                style={{
                  background: i <= step
                    ? 'linear-gradient(90deg, hsl(345 55% 62%), hsl(330 45% 58%))'
                    : 'hsl(0 0% 90%)',
                }}
              />
              <span className="font-body text-[9px]" style={{ color: i <= step ? 'hsl(345 55% 55%)' : 'hsl(0 0% 70%)' }}>
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Step content */}
      <div className="max-w-lg mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="occasion" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <OccasionStep />
            </motion.div>
          )}
          {step === 1 && (
            <motion.div key="content" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <ContentStep />
            </motion.div>
          )}
          {step === 2 && (
            <motion.div key="slides" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <SlidesStep />
            </motion.div>
          )}
          {step === 3 && (
            <motion.div key="preview" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <PreviewStep />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const Builder = () => (
  <BuilderProvider>
    <BuilderInner />
  </BuilderProvider>
);

export default Builder;
