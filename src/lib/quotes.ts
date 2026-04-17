import type { SlideType, VibeType } from './types';

type QuoteMap = Record<SlideType, string>;

const QUOTES: Record<VibeType, Partial<QuoteMap>> = {
  warm: {
    traits: "Let me tell you what makes you, you...",
    photo_wall: "Some moments I never want to forget...",
    chat_replay: "Remember when we...",
    letter: "I've been wanting to say this...",
    candle_blow: "Close your eyes. Make a wish.",
    gift_reveal: "Oh wait, one more thing...",
    thank_you: "Now it's your turn 💖",
    voice_note: "Listen carefully...",
  },
  romantic: {
    traits: "Every little thing about you...",
    photo_wall: "Moments I keep replaying in my head...",
    chat_replay: "Our words. Our world.",
    letter: "If I could write you a thousand letters...",
    candle_blow: "In the dark, I still see you.",
    gift_reveal: "This is for the one who has everything...\nexcept this.",
    thank_you: "Tell me how you feel 💖",
    voice_note: "My voice, just for you...",
  },
  playful: {
    traits: "Exposing you in 3... 2... 1... 😂",
    photo_wall: "Evidence. Collected over time. 📸",
    chat_replay: "The texts that made me LOL at 3am",
    letter: "Okay getting serious for a sec...",
    candle_blow: "BLOW BLOW BLOW 🌬️",
    gift_reveal: "Surprise surprise 🎁",
    thank_you: "Your turn bestie 😤💖",
    voice_note: "Press play. Trust me.",
  },
  minimal: {
    traits: "About you.",
    photo_wall: "Memories.",
    chat_replay: "Us.",
    letter: "A letter.",
    candle_blow: "Make a wish.",
    gift_reveal: "For you.",
    thank_you: "Your turn.",
    voice_note: "Listen.",
  },
};

export function getQuote(slideType: SlideType, vibe: VibeType): string | null {
  // Hero and first slide don't need a quote before them
  if (slideType === 'hero') return null;
  return QUOTES[vibe]?.[slideType] || QUOTES.warm[slideType] || null;
}
