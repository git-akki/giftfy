import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBuilder } from '@/contexts/BuilderContext';
import { SLIDE_TYPES } from '@/lib/constants';
import type { SlideConfig } from '@/lib/types';

interface Props {
  slide: SlideConfig;
  onClose: () => void;
}

const SlideConfigPanel = ({ slide, onClose }: Props) => {
  const { updateSlideContent } = useBuilder();
  const info = SLIDE_TYPES.find((s) => s.type === slide.type);
  const content = slide.content as Record<string, any>;

  const update = (key: string, value: any) => {
    updateSlideContent(slide.id, { [key]: value });
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <motion.div
        className="relative z-10 w-full max-w-lg rounded-t-3xl overflow-hidden"
        style={{ background: 'hsl(0 0% 100%)', maxHeight: '80vh' }}
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full" style={{ background: 'hsl(345 30% 85%)' }} />
        </div>

        {/* Header */}
        <div className="px-5 pb-3 flex items-center justify-between border-b border-border/30">
          <div className="flex items-center gap-2">
            <span className="text-xl">{info?.emoji}</span>
            <div>
              <p className="font-display font-bold text-foreground text-sm">{info?.label}</p>
              <p className="font-body text-muted-foreground text-[10px]">{info?.desc}</p>
            </div>
          </div>
          <button onClick={onClose}
            className="font-body text-xs font-semibold px-4 py-1.5 rounded-full text-white"
            style={{ background: 'linear-gradient(135deg, #ec4899, #f472b6)' }}>
            Done
          </button>
        </div>

        {/* Content — scrollable */}
        <div className="px-5 py-4 overflow-y-auto space-y-4" style={{ maxHeight: 'calc(80vh - 80px)' }}>

          {/* ═══ HERO SLIDE ═══ */}
          {slide.type === 'hero' && (
            <>
              <Field label="Title" value={content.title || ''} onChange={(v) => update('title', v)}
                placeholder="Happy 20th Birthday!" />
              <Field label="Subtitle" value={content.subtitle || ''} onChange={(v) => update('subtitle', v)}
                placeholder="Moli ✨" />
              <SelectField label="Text Position" value={content.textPosition || 'bottom'}
                options={[{ v: 'bottom', l: 'Bottom' }, { v: 'center', l: 'Center' }, { v: 'top', l: 'Top' }]}
                onChange={(v) => update('textPosition', v)} />
              <SelectField label="Animation" value={content.animation || 'fade'}
                options={[{ v: 'fade', l: 'Fade In' }, { v: 'slide', l: 'Slide Up' }, { v: 'zoom', l: 'Zoom' }]}
                onChange={(v) => update('animation', v)} />
            </>
          )}

          {/* ═══ TRAITS SLIDE ═══ */}
          {slide.type === 'traits' && (
            <>
              <SelectField label="Card Style" value={content.cardStyle || 'swipe'}
                options={[{ v: 'swipe', l: '👆 Swipe Stack' }, { v: 'flip', l: '🔄 Flip Cards' }, { v: 'auto', l: '⏩ Auto Slide' }]}
                onChange={(v) => update('cardStyle', v)} />
              <ToggleField label="Camera Surprise at End" value={content.cameraEnabled !== false}
                onChange={(v) => update('cameraEnabled', v)} />
              <p className="font-body text-muted-foreground text-[10px]">
                Traits are auto-generated from chat analysis. Edit them below:
              </p>
              {(content.items || []).map((item: any, i: number) => (
                <div key={i} className="p-3 rounded-xl space-y-2" style={{ background: 'hsl(0 0% 98%)' }}>
                  <div className="flex items-center gap-2">
                    <input value={item.emoji} className="w-10 text-center text-lg bg-transparent focus:outline-none"
                      onChange={(e) => {
                        const items = [...(content.items || [])];
                        items[i] = { ...items[i], emoji: e.target.value };
                        update('items', items);
                      }} />
                    <input value={item.label} placeholder="Label"
                      className="flex-1 font-body text-xs font-bold bg-transparent focus:outline-none"
                      onChange={(e) => {
                        const items = [...(content.items || [])];
                        items[i] = { ...items[i], label: e.target.value };
                        update('items', items);
                      }} />
                    <button onClick={() => {
                      const items = [...(content.items || [])];
                      items.splice(i, 1);
                      update('items', items);
                    }} className="text-red-400 text-sm">×</button>
                  </div>
                  <input value={item.desc} placeholder="Description"
                    className="w-full font-body text-[11px] text-foreground/60 bg-transparent focus:outline-none"
                    onChange={(e) => {
                      const items = [...(content.items || [])];
                      items[i] = { ...items[i], desc: e.target.value };
                      update('items', items);
                    }} />
                </div>
              ))}
              <button onClick={() => {
                const items = [...(content.items || []), { emoji: '✨', label: '', desc: '' }];
                update('items', items);
              }} className="font-body text-primary text-xs font-semibold">+ Add Trait</button>
            </>
          )}

          {/* ═══ CHAT REPLAY ═══ */}
          {slide.type === 'chat_replay' && (
            <>
              <Field label="Header Title" value={content.headerTitle || ''} onChange={(v) => update('headerTitle', v)}
                placeholder="Moli & Akki" />
              <SelectField label="Typing Speed" value={content.typingSpeed || 'normal'}
                options={[{ v: 'slow', l: '🐢 Slow' }, { v: 'normal', l: '⏱ Normal' }, { v: 'fast', l: '⚡ Fast' }]}
                onChange={(v) => update('typingSpeed', v)} />
              <p className="font-body text-muted-foreground text-[10px]">Messages from chat analysis. Edit below:</p>
              {(content.messages || []).map((msg: any, i: number) => (
                <div key={i} className="flex items-start gap-2 p-2 rounded-lg" style={{ background: 'hsl(0 0% 98%)' }}>
                  <input value={msg.from} placeholder="Moli"
                    className="w-16 font-body text-[10px] font-bold bg-transparent focus:outline-none"
                    onChange={(e) => {
                      const messages = [...(content.messages || [])];
                      messages[i] = { ...messages[i], from: e.target.value };
                      update('messages', messages);
                    }} />
                  <input value={msg.text} placeholder="Message..."
                    className="flex-1 font-body text-[11px] bg-transparent focus:outline-none"
                    onChange={(e) => {
                      const messages = [...(content.messages || [])];
                      messages[i] = { ...messages[i], text: e.target.value };
                      update('messages', messages);
                    }} />
                  <button onClick={() => {
                    const messages = [...(content.messages || [])];
                    messages.splice(i, 1);
                    update('messages', messages);
                  }} className="text-red-400 text-[10px]">×</button>
                </div>
              ))}
              <button onClick={() => {
                const messages = [...(content.messages || []), { from: '', text: '', time: '' }];
                update('messages', messages);
              }} className="font-body text-primary text-xs font-semibold">+ Add Message</button>
            </>
          )}

          {/* ═══ LETTER ═══ */}
          {slide.type === 'letter' && (
            <>
              <div>
                <label className="font-body text-foreground/70 text-xs font-semibold mb-1.5 block">Letter Content</label>
                <textarea
                  value={(content.paragraphs || []).join('\n\n')}
                  onChange={(e) => update('paragraphs', e.target.value.split('\n\n').filter(Boolean))}
                  placeholder="Write your letter here... Use blank lines to separate paragraphs."
                  className="w-full font-body text-xs px-4 py-3 rounded-xl border border-border/50 bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                  rows={6}
                />
              </div>
              <Field label="Signature" value={content.signature || ''} onChange={(v) => update('signature', v)}
                placeholder="— someone who cares 🫂" />
              <SelectField label="Paper Style" value={content.paperStyle || 'lined'}
                options={[{ v: 'lined', l: '📝 Lined Paper' }, { v: 'plain', l: '📄 Plain' }, { v: 'vintage', l: '📜 Vintage' }]}
                onChange={(v) => update('paperStyle', v)} />
            </>
          )}

          {/* ═══ CANDLE BLOW ═══ */}
          {slide.type === 'candle_blow' && (
            <>
              <Field label="Message After Blowing" value={content.messageAfter || ''} onChange={(v) => update('messageAfter', v)}
                placeholder="Happy Birthday! 🎂" />
              <Field label="Signature" value={content.signature || ''} onChange={(v) => update('signature', v)}
                placeholder="— Akki 🫂" />
              <SelectField label="Background" value={content.background || 'dark'}
                options={[{ v: 'dark', l: '🌙 Dark Room' }, { v: 'warm', l: '🕯️ Warm Glow' }, { v: 'starry', l: '⭐ Starry Night' }]}
                onChange={(v) => update('background', v)} />
              <ToggleField label="Capture Reaction Photo" value={content.captureReaction !== false}
                onChange={(v) => update('captureReaction', v)} />
            </>
          )}

          {/* ═══ GIFT REVEAL ═══ */}
          {slide.type === 'gift_reveal' && (
            <>
              <Field label="Gift Title" value={content.giftTitle || ''} onChange={(v) => update('giftTitle', v)}
                placeholder="e.g. Agentic AI Course" />
              <Field label="Gift URL" value={content.giftUrl || ''} onChange={(v) => update('giftUrl', v)}
                placeholder="https://..." />
              <Field label="Description (optional)" value={content.giftDescription || ''} onChange={(v) => update('giftDescription', v)}
                placeholder="Why this gift is perfect for them" />
              <SelectField label="Reveal Style" value={content.revealStyle || 'envelope'}
                options={[{ v: 'envelope', l: '💌 Envelope' }, { v: 'shake', l: '📱 Shake to Open' }, { v: 'tap', l: '👆 Tap to Open' }]}
                onChange={(v) => update('revealStyle', v)} />
            </>
          )}

          {/* ═══ THANK YOU ═══ */}
          {slide.type === 'thank_you' && (
            <>
              <Field label="Prompt Text" value={content.promptText || ''} onChange={(v) => update('promptText', v)}
                placeholder="Send a thank you to..." />
              <ToggleField label="Allow Video Reply" value={content.allowVideo !== false}
                onChange={(v) => update('allowVideo', v)} />
              <ToggleField label="Allow Voice Reply" value={content.allowVoice !== false}
                onChange={(v) => update('allowVoice', v)} />
              <ToggleField label="Allow Text Reply" value={content.allowText !== false}
                onChange={(v) => update('allowText', v)} />
              <ToggleField label="Allow Emoji Reply" value={content.allowEmoji !== false}
                onChange={(v) => update('allowEmoji', v)} />
            </>
          )}

          {/* ═══ PHOTO WALL ═══ */}
          {slide.type === 'photo_wall' && (
            <>
              <SelectField label="Wall Style" value={content.wallStyle || 'polaroid'}
                options={[{ v: 'polaroid', l: '📷 Polaroid Pins' }, { v: 'grid', l: '⬜ Clean Grid' }, { v: 'masonry', l: '🧱 Masonry' }]}
                onChange={(v) => update('wallStyle', v)} />
              <SelectField label="Pin Color" value={content.pinColor || 'red'}
                options={[{ v: 'red', l: '🔴 Red' }, { v: 'gold', l: '🟡 Gold' }, { v: 'pink', l: '🩷 Pink' }, { v: 'none', l: '❌ No Pins' }]}
                onChange={(v) => update('pinColor', v)} />
              <p className="font-body text-muted-foreground text-[10px]">
                Photos are added in the Content step. {(content.photos || []).length} photos added.
              </p>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

// ═══ Reusable field components ═══

const Field = ({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder: string;
}) => (
  <div>
    <label className="font-body text-foreground/70 text-xs font-semibold mb-1.5 block">{label}</label>
    <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
      className="w-full font-body text-xs px-4 py-2.5 rounded-xl border border-border/50 bg-background focus:outline-none focus:ring-2 focus:ring-primary/20" />
  </div>
);

const SelectField = ({ label, value, options, onChange }: {
  label: string; value: string; options: { v: string; l: string }[]; onChange: (v: string) => void;
}) => (
  <div>
    <label className="font-body text-foreground/70 text-xs font-semibold mb-1.5 block">{label}</label>
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => (
        <motion.button key={opt.v} onClick={() => onChange(opt.v)}
          whileHover={{ scale: 1.02 }}
          className="font-body text-[10px] font-semibold px-3 py-1.5 rounded-lg transition-all"
          style={{
            background: value === opt.v ? 'hsl(345 55% 93%)' : 'hsl(0 0% 97%)',
            color: value === opt.v ? 'hsl(345 55% 45%)' : 'hsl(0 0% 50%)',
            boxShadow: value === opt.v ? '0 0 0 1.5px hsl(345 55% 65%)' : '0 0 0 1px hsl(0 0% 90%)',
          }}>
          {opt.l}
        </motion.button>
      ))}
    </div>
  </div>
);

const ToggleField = ({ label, value, onChange }: {
  label: string; value: boolean; onChange: (v: boolean) => void;
}) => (
  <button onClick={() => onChange(!value)}
    className="w-full flex items-center justify-between py-2">
    <span className="font-body text-foreground/70 text-xs font-semibold">{label}</span>
    <div className="w-10 h-5 rounded-full relative transition-all"
      style={{ background: value ? 'hsl(345 55% 60%)' : 'hsl(0 0% 85%)' }}>
      <motion.div className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm"
        animate={{ left: value ? 22 : 2 }} transition={{ type: 'spring', stiffness: 300, damping: 25 }} />
    </div>
  </button>
);

export default SlideConfigPanel;
