import type { OccasionType, SlideType, SlideConfig } from './types';
import { nanoid } from 'nanoid';

export const OCCASIONS: { value: OccasionType; label: string; emoji: string }[] = [
  { value: 'birthday', label: 'Birthday', emoji: '🎂' },
  { value: 'anniversary', label: 'Anniversary', emoji: '💍' },
  { value: 'graduation', label: 'Graduation', emoji: '🎓' },
  { value: 'congratulations', label: 'Congratulations', emoji: '🎉' },
  { value: 'custom', label: 'Custom', emoji: '✨' },
];

export const SLIDE_TYPES: { type: SlideType; label: string; emoji: string; desc: string }[] = [
  { type: 'hero', label: 'Hero Card', emoji: '🎬', desc: 'Name, photo, and greeting' },
  { type: 'traits', label: 'Personality Cards', emoji: '📂', desc: 'Fun traits about them' },
  { type: 'photo_wall', label: 'Memory Wall', emoji: '📸', desc: 'Photo pinboard' },
  { type: 'chat_replay', label: 'Chat Replay', emoji: '💬', desc: 'Animated messages' },
  { type: 'letter', label: 'The Letter', emoji: '💌', desc: 'Personal message' },
  { type: 'voice_note', label: 'Voice Note', emoji: '🎤', desc: 'Audio message' },
  { type: 'candle_blow', label: 'Candle Blow', emoji: '🕯️', desc: 'Blow to wish' },
  { type: 'gift_reveal', label: 'Gift Reveal', emoji: '🎁', desc: 'Unwrap a gift' },
  { type: 'thank_you', label: 'Thank You', emoji: '💝', desc: 'Recipient reply' },
];

export const TEMPLATES: Record<string, { name: string; desc: string; slides: SlideType[]; premium: boolean }> = {
  classic: {
    name: 'The Classic',
    desc: 'Perfect for a best friend',
    slides: ['hero', 'traits', 'photo_wall', 'chat_replay', 'letter', 'candle_blow', 'gift_reveal', 'thank_you'],
    premium: false,
  },
  romantic: {
    name: 'The Romantic',
    desc: 'For your special someone',
    slides: ['hero', 'letter', 'photo_wall', 'voice_note', 'chat_replay', 'candle_blow', 'gift_reveal', 'thank_you'],
    premium: false,
  },
  fun: {
    name: 'The Fun One',
    desc: 'For the funny friend',
    slides: ['hero', 'traits', 'chat_replay', 'photo_wall', 'candle_blow', 'gift_reveal', 'thank_you'],
    premium: true,
  },
  minimal: {
    name: 'Quick & Heartfelt',
    desc: 'Short but meaningful',
    slides: ['hero', 'letter', 'voice_note', 'candle_blow', 'thank_you'],
    premium: true,
  },
};

export function generateSlug(name: string): string {
  const clean = name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 10);
  return `${clean}-${nanoid(6)}`;
}

export function createDefaultSlides(template: string): SlideConfig[] {
  const tmpl = TEMPLATES[template] || TEMPLATES.classic;
  return tmpl.slides.map((type, i) => ({
    id: nanoid(8),
    type,
    content: {},
    interactions: {},
  }));
}
