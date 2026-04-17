import { useState } from 'react';
import { useBuilder } from '@/contexts/BuilderContext';
import { SLIDE_TYPES } from '@/lib/constants';
import { motion, AnimatePresence } from 'framer-motion';
import { triggerCelebration } from './MicroCelebration';
import SlideConfigPanel from './SlideConfigPanel';
import type { SlideType } from '@/lib/types';

const SlidesStep = () => {
  const { draft, addSlide, removeSlide, reorderSlides, setStep } = useBuilder();
  const [editingSlide, setEditingSlide] = useState<string | null>(null);

  const moveSlide = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= draft.slides.length) return;
    reorderSlides(index, newIndex);
  };

  const getSlideInfo = (type: SlideType) => SLIDE_TYPES.find((s) => s.type === type);
  const editTarget = draft.slides.find((s) => s.id === editingSlide);

  const handleAddSlide = (type: SlideType) => {
    addSlide(type);
    triggerCelebration('sparkle', `${getSlideInfo(type)?.label} added! ✨`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display font-bold text-foreground text-lg mb-1">Your slides</h2>
        <p className="font-body text-muted-foreground text-xs">Tap to edit · drag to reorder</p>
      </div>

      {/* Slide list */}
      <div className="space-y-2">
        {draft.slides.map((slide, i) => {
          const info = getSlideInfo(slide.type);
          const hasContent = Object.keys(slide.content).length > 0;

          return (
            <motion.div
              key={slide.id}
              layout
              whileHover={{ scale: 1.01 }}
              className="flex items-center gap-2 p-3 rounded-xl cursor-pointer transition-all active:scale-[0.98]"
              style={{
                background: 'hsl(0 0% 100%)',
                boxShadow: '0 1px 4px hsl(0 0% 0% / 0.04), 0 0 0 1px hsl(0 0% 0% / 0.03)',
              }}
              onClick={() => setEditingSlide(slide.id)}
            >
              {/* Order buttons */}
              <div className="flex flex-col gap-0.5" onClick={(e) => e.stopPropagation()}>
                <button onClick={() => moveSlide(i, -1)} disabled={i === 0}
                  className="text-[10px] text-muted-foreground disabled:opacity-20 hover:text-foreground">▲</button>
                <button onClick={() => moveSlide(i, 1)} disabled={i === draft.slides.length - 1}
                  className="text-[10px] text-muted-foreground disabled:opacity-20 hover:text-foreground">▼</button>
              </div>

              {/* Slide info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-base">{info?.emoji}</span>
                  <p className="font-body font-bold text-foreground text-xs">{info?.label}</p>
                  {hasContent && (
                    <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'hsl(150 50% 50%)' }} />
                  )}
                </div>
                <p className="font-body text-muted-foreground text-[9px] mt-0.5">{info?.desc}</p>
              </div>

              {/* Edit hint */}
              <span className="font-body text-muted-foreground/30 text-[9px]">✏️</span>

              {/* Number */}
              <span className="font-body text-muted-foreground/30 text-xs font-bold">{i + 1}</span>

              {/* Remove */}
              <button
                onClick={(e) => { e.stopPropagation(); removeSlide(slide.id); }}
                className="text-muted-foreground/40 hover:text-red-500 text-sm transition-colors"
              >×</button>
            </motion.div>
          );
        })}
      </div>

      {/* Add slide */}
      <div>
        <p className="font-body text-foreground/70 text-xs font-semibold mb-2">+ Add a slide</p>
        <div className="grid grid-cols-3 gap-1.5">
          {SLIDE_TYPES.map((s) => (
            <motion.button key={s.type} onClick={() => handleAddSlide(s.type)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex flex-col items-center gap-0.5 py-2.5 rounded-xl transition-all hover:shadow-sm"
              style={{ background: 'hsl(0 0% 98%)', border: '1px solid hsl(0 0% 92%)' }}>
              <span className="text-lg">{s.emoji}</span>
              <span className="font-body text-[8px] text-muted-foreground font-semibold">{s.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-2">
        <motion.button onClick={() => setStep(1)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="font-body font-semibold text-xs px-5 py-3 rounded-full"
          style={{ background: 'hsl(0 0% 95%)', color: 'hsl(0 0% 40%)' }}>
          ← Back
        </motion.button>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={() => { setStep(3); triggerCelebration('confetti', 'Almost there! 🎉'); }}
          disabled={draft.slides.length === 0}
          className="flex-1 font-body font-semibold text-sm py-3 rounded-full text-white disabled:opacity-40"
          style={{
            background: 'linear-gradient(135deg, hsl(345 55% 62%), hsl(330 45% 58%))',
            boxShadow: draft.slides.length > 0 ? '0 3px 12px hsl(345 55% 60% / 0.25)' : 'none',
          }}>
          Preview →
        </motion.button>
      </div>

      {/* Config panel (bottom sheet) */}
      <AnimatePresence>
        {editTarget && (
          <SlideConfigPanel slide={editTarget} onClose={() => setEditingSlide(null)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default SlidesStep;
