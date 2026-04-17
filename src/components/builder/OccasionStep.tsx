import { useBuilder } from '@/contexts/BuilderContext';
import { OCCASIONS, TEMPLATES } from '@/lib/constants';
import { getTierConfig } from '@/lib/tiers';
import { motion } from 'framer-motion';
import type { OccasionType } from '@/lib/types';
import TierSelector from './TierSelector';

const OccasionStep = () => {
  const { draft, updateDraft, applyTemplate, setStep } = useBuilder();

  const canProceed = draft.recipientName.trim().length > 0;
  const canUsePremium = getTierConfig(draft.tier).hasPremiumTemplates;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display font-bold text-foreground text-lg mb-1">Who's this for?</h2>
        <p className="font-body text-muted-foreground text-xs">The basics about your celebration</p>
      </div>

      {/* Recipient name */}
      <div>
        <label className="font-body text-foreground/70 text-xs font-semibold mb-1.5 block">Their name</label>
        <input
          type="text"
          value={draft.recipientName}
          onChange={(e) => updateDraft({ recipientName: e.target.value })}
          placeholder="e.g. Moli"
          className="w-full font-body text-sm px-4 py-3 rounded-xl border border-border/50 bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
        />
      </div>

      {/* Occasion */}
      <div>
        <label className="font-body text-foreground/70 text-xs font-semibold mb-2 block">Occasion</label>
        <div className="grid grid-cols-3 gap-2">
          {OCCASIONS.map((o) => (
            <motion.button
              key={o.value}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => updateDraft({ occasion: o.value as OccasionType })}
              className="flex flex-col items-center gap-1 py-3 rounded-xl transition-all text-center"
              style={{
                background: draft.occasion === o.value ? 'hsl(345 55% 95%)' : 'hsl(0 0% 98%)',
                boxShadow: draft.occasion === o.value
                  ? '0 0 0 2px hsl(345 55% 65%), 0 2px 8px hsl(345 55% 60% / 0.1)'
                  : '0 0 0 1px hsl(0 0% 90%)',
              }}
            >
              <span className="text-xl">{o.emoji}</span>
              <span className="font-body text-[10px] font-semibold" style={{
                color: draft.occasion === o.value ? 'hsl(345 55% 50%)' : 'hsl(0 0% 50%)',
              }}>
                {o.label}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Date */}
      <div>
        <label className="font-body text-foreground/70 text-xs font-semibold mb-1.5 block">Date (optional)</label>
        <input
          type="date"
          value={draft.occasionDate}
          onChange={(e) => updateDraft({ occasionDate: e.target.value })}
          className="w-full font-body text-sm px-4 py-3 rounded-xl border border-border/50 bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Template */}
      <div>
        <label className="font-body text-foreground/70 text-xs font-semibold mb-2 block">Pick a template</label>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(TEMPLATES).map(([key, tmpl]) => {
            const isLocked = tmpl.premium && !canUsePremium;
            return (
              <motion.button
                key={key}
                whileHover={{ scale: isLocked ? 1 : 1.02, y: isLocked ? 0 : -2 }}
                whileTap={{ scale: isLocked ? 1 : 0.98 }}
                onClick={() => {
                  if (isLocked) return;
                  applyTemplate(key);
                }}
                className={`text-left p-3 rounded-xl transition-all${isLocked ? ' opacity-50 cursor-not-allowed' : ''}`}
                style={{
                  background: draft.template === key ? 'hsl(345 55% 95%)' : 'hsl(0 0% 98%)',
                  boxShadow: draft.template === key
                    ? '0 0 0 2px hsl(345 55% 65%), 0 2px 8px hsl(345 55% 60% / 0.1)'
                    : '0 0 0 1px hsl(0 0% 90%)',
                }}
              >
                <p className="font-body font-bold text-foreground text-xs flex items-center gap-1">
                  {tmpl.name}
                  {isLocked && <span className="text-xs">🔒</span>}
                </p>
                <p className="font-body text-muted-foreground text-[10px] mt-0.5">{tmpl.desc}</p>
                <p className="font-body text-muted-foreground/50 text-[9px] mt-1">{tmpl.slides.length} slides</p>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Tier */}
      <TierSelector value={draft.tier} onChange={(tier) => updateDraft({ tier })} />

      {/* Next button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => {
          if (!draft.slides.length) applyTemplate(draft.template);
          setStep(1);
        }}
        disabled={!canProceed}
        className="w-full font-body font-semibold text-sm py-3 rounded-full text-white transition-all disabled:opacity-40"
        style={{
          background: 'linear-gradient(135deg, hsl(345 55% 62%), hsl(330 45% 58%))',
          boxShadow: canProceed ? '0 3px 12px hsl(345 55% 60% / 0.25)' : 'none',
        }}
      >
        Next: Add Content →
      </motion.button>
    </div>
  );
};

export default OccasionStep;
