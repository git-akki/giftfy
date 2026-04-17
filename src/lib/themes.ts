export interface GiftfyTheme {
  id: string;
  name: string;
  emoji: string;
  desc: string;
  colors: {
    primary: string;
    primaryLight: string;
    primaryGlow: string;
    accent: string;
    bg: string;
    cardBg: string;
    text: string;
    textMuted: string;
  };
  fonts: {
    display: string;
    body: string;
    handwritten: string;
  };
  decorations: 'full' | 'moderate' | 'minimal';
  sounds: 'party' | 'soft' | 'fun' | 'silent';
}

export const THEMES: Record<string, GiftfyTheme> = {
  warm: {
    id: 'warm',
    name: 'Soft & Warm',
    emoji: '🌸',
    desc: 'Gentle, cozy, heartfelt',
    colors: {
      primary: 'hsl(345 55% 60%)',
      primaryLight: 'hsl(345 55% 92%)',
      primaryGlow: 'hsl(345 55% 60% / 0.2)',
      accent: 'hsl(40 80% 65%)',
      bg: 'hsl(350 30% 97%)',
      cardBg: 'hsl(0 0% 100%)',
      text: 'hsl(340 30% 18%)',
      textMuted: 'hsl(340 15% 50%)',
    },
    fonts: { display: 'Dancing Script', body: 'Quicksand', handwritten: 'Caveat' },
    decorations: 'full',
    sounds: 'party',
  },
  playful: {
    id: 'playful',
    name: 'Fun & Playful',
    emoji: '🎉',
    desc: 'Bouncy, colorful, energetic',
    colors: {
      primary: 'hsl(280 55% 58%)',
      primaryLight: 'hsl(280 50% 93%)',
      primaryGlow: 'hsl(280 55% 58% / 0.2)',
      accent: 'hsl(45 90% 60%)',
      bg: 'hsl(270 30% 97%)',
      cardBg: 'hsl(0 0% 100%)',
      text: 'hsl(270 30% 15%)',
      textMuted: 'hsl(270 15% 50%)',
    },
    fonts: { display: 'Baloo 2', body: 'Quicksand', handwritten: 'Patrick Hand' },
    decorations: 'full',
    sounds: 'fun',
  },
  romantic: {
    id: 'romantic',
    name: 'Romantic',
    emoji: '💖',
    desc: 'Deep, intimate, dreamy',
    colors: {
      primary: 'hsl(330 50% 50%)',
      primaryLight: 'hsl(330 45% 92%)',
      primaryGlow: 'hsl(330 50% 50% / 0.2)',
      accent: 'hsl(350 60% 70%)',
      bg: 'hsl(330 25% 96%)',
      cardBg: 'hsl(0 0% 100%)',
      text: 'hsl(330 35% 15%)',
      textMuted: 'hsl(330 15% 48%)',
    },
    fonts: { display: 'Dancing Script', body: 'Quicksand', handwritten: 'Caveat' },
    decorations: 'moderate',
    sounds: 'soft',
  },
  minimal: {
    id: 'minimal',
    name: 'Bold & Minimal',
    emoji: '⚡',
    desc: 'Clean, modern, sharp',
    colors: {
      primary: 'hsl(0 0% 15%)',
      primaryLight: 'hsl(0 0% 95%)',
      primaryGlow: 'hsl(0 0% 15% / 0.1)',
      accent: 'hsl(45 90% 55%)',
      bg: 'hsl(0 0% 100%)',
      cardBg: 'hsl(0 0% 98%)',
      text: 'hsl(0 0% 10%)',
      textMuted: 'hsl(0 0% 50%)',
    },
    fonts: { display: 'Outfit', body: 'Inter', handwritten: 'Caveat' },
    decorations: 'minimal',
    sounds: 'soft',
  },
  coral: {
    id: 'coral',
    name: 'Sunset Coral',
    emoji: '🧡',
    desc: 'Warm sunset vibes',
    colors: {
      primary: 'hsl(15 75% 58%)',
      primaryLight: 'hsl(15 70% 93%)',
      primaryGlow: 'hsl(15 75% 58% / 0.2)',
      accent: 'hsl(40 85% 60%)',
      bg: 'hsl(20 30% 97%)',
      cardBg: 'hsl(0 0% 100%)',
      text: 'hsl(15 30% 18%)',
      textMuted: 'hsl(15 15% 50%)',
    },
    fonts: { display: 'Dancing Script', body: 'Quicksand', handwritten: 'Caveat' },
    decorations: 'moderate',
    sounds: 'party',
  },
  sage: {
    id: 'sage',
    name: 'Sage Green',
    emoji: '💚',
    desc: 'Calm, natural, grounded',
    colors: {
      primary: 'hsl(150 35% 45%)',
      primaryLight: 'hsl(150 30% 93%)',
      primaryGlow: 'hsl(150 35% 45% / 0.2)',
      accent: 'hsl(45 60% 60%)',
      bg: 'hsl(140 20% 97%)',
      cardBg: 'hsl(0 0% 100%)',
      text: 'hsl(150 25% 15%)',
      textMuted: 'hsl(150 10% 48%)',
    },
    fonts: { display: 'Dancing Script', body: 'Quicksand', handwritten: 'Caveat' },
    decorations: 'moderate',
    sounds: 'soft',
  },
  sky: {
    id: 'sky',
    name: 'Sky Blue',
    emoji: '🩵',
    desc: 'Fresh, open, cheerful',
    colors: {
      primary: 'hsl(200 65% 52%)',
      primaryLight: 'hsl(200 55% 93%)',
      primaryGlow: 'hsl(200 65% 52% / 0.2)',
      accent: 'hsl(40 80% 60%)',
      bg: 'hsl(200 25% 97%)',
      cardBg: 'hsl(0 0% 100%)',
      text: 'hsl(200 30% 15%)',
      textMuted: 'hsl(200 15% 48%)',
    },
    fonts: { display: 'Dancing Script', body: 'Quicksand', handwritten: 'Caveat' },
    decorations: 'full',
    sounds: 'party',
  },
  midnight: {
    id: 'midnight',
    name: 'Midnight',
    emoji: '🖤',
    desc: 'Dark, elegant, premium',
    colors: {
      primary: 'hsl(260 40% 55%)',
      primaryLight: 'hsl(260 30% 20%)',
      primaryGlow: 'hsl(260 40% 55% / 0.3)',
      accent: 'hsl(45 80% 65%)',
      bg: 'hsl(260 15% 8%)',
      cardBg: 'hsl(260 10% 14%)',
      text: 'hsl(0 0% 92%)',
      textMuted: 'hsl(260 10% 55%)',
    },
    fonts: { display: 'Dancing Script', body: 'Quicksand', handwritten: 'Caveat' },
    decorations: 'moderate',
    sounds: 'soft',
  },
};

export function getTheme(id: string): GiftfyTheme {
  return THEMES[id] || THEMES.warm;
}
