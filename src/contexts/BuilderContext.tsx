import { createContext, useContext, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { nanoid } from 'nanoid';
import type { CelebrationDraft, SlideConfig, ChatAnalysis, OccasionType, VibeType } from '@/lib/types';
import { TEMPLATES } from '@/lib/constants';
import type { TierName } from '@/lib/tiers';

const VALID_TIERS: TierName[] = ['free', 'sweet', 'premium', 'deluxe'];
const VALID_OCCASIONS: OccasionType[] = [
  'birthday',
  'anniversary',
  'graduation',
  'congratulations',
  'custom',
];

function parseTier(raw: string | null): TierName {
  return VALID_TIERS.includes(raw as TierName) ? (raw as TierName) : 'free';
}

function parseOccasion(raw: string | null): OccasionType | null {
  return VALID_OCCASIONS.includes(raw as OccasionType) ? (raw as OccasionType) : null;
}

interface BuilderState {
  draft: CelebrationDraft;
  step: number;
  setStep: (s: number) => void;
  updateDraft: (updates: Partial<CelebrationDraft>) => void;
  setChatAnalysis: (analysis: ChatAnalysis) => void;
  addPhoto: (file: File) => void;
  removePhoto: (index: number) => void;
  applyTemplate: (template: string) => void;
  addSlide: (type: SlideConfig['type']) => void;
  removeSlide: (id: string) => void;
  reorderSlides: (fromIndex: number, toIndex: number) => void;
  updateSlideContent: (id: string, content: Record<string, unknown>) => void;
  resetDraft: () => void;
}

const emptyDraft: CelebrationDraft = {
  recipientName: '',
  recipientPhoto: null,
  recipientPhotoUrl: null,
  occasion: 'birthday',
  occasionDate: '',
  customOccasion: '',
  vibe: 'warm',
  template: 'classic',
  tier: 'free' as const,
  musicTrackId: '',
  customMusicFile: null,
  customMusicPreview: null,
  videoFile: null,
  videoPreview: null,
  chatText: '',
  chatAnalysis: null,
  photos: [],
  voiceNoteBlob: null,
  voiceNoteDuration: 0,
  giftTitle: '',
  giftUrl: '',
  giftDescription: '',
  slides: [],
};

const BuilderContext = createContext<BuilderState>({} as BuilderState);

export const useBuilder = () => useContext(BuilderContext);

export const BuilderProvider = ({ children }: { children: React.ReactNode }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [draft, setDraft] = useState<CelebrationDraft>(() => {
    const occasion = parseOccasion(searchParams.get('occasion'));
    const name = (searchParams.get('name') || '').slice(0, 50);
    return {
      ...emptyDraft,
      tier: parseTier(searchParams.get('tier')),
      ...(occasion ? { occasion } : {}),
      ...(name ? { recipientName: name } : {}),
    };
  });
  const [step, setStep] = useState(0);

  const updateDraft = (updates: Partial<CelebrationDraft>) => {
    setDraft((prev) => ({ ...prev, ...updates }));
    if (updates.tier && updates.tier !== searchParams.get('tier')) {
      const next = new URLSearchParams(searchParams);
      if (updates.tier === 'free') next.delete('tier');
      else next.set('tier', updates.tier);
      setSearchParams(next, { replace: true });
    }
  };

  const setChatAnalysis = (analysis: ChatAnalysis) => {
    updateDraft({ chatAnalysis: analysis });

    // Auto-populate slides from analysis
    const template = TEMPLATES[draft.template] || TEMPLATES.classic;
    const slides: SlideConfig[] = template.slides.map((type) => {
      const config: SlideConfig = { id: nanoid(8), type, content: {}, interactions: {} };

      if (type === 'traits' && analysis.traits.length > 0) {
        config.content = { items: analysis.traits, cameraEnabled: true };
      }
      if (type === 'chat_replay' && analysis.messages.length > 0) {
        config.content = { messages: analysis.messages, headerTitle: `${draft.recipientName} & Me` };
      }
      if (type === 'letter' && analysis.letterDraft) {
        config.content = { paragraphs: [analysis.letterDraft], signature: '' };
      }
      if (type === 'hero') {
        config.content = {
          title: draft.occasion === 'birthday' ? `Happy Birthday!` : 'Happy Anniversary!',
          subtitle: analysis.nickname || draft.recipientName,
        };
      }

      return config;
    });

    updateDraft({ slides, chatAnalysis: analysis });
  };

  const addPhoto = (file: File) => {
    const preview = URL.createObjectURL(file);
    setDraft((prev) => ({
      ...prev,
      photos: [...prev.photos, { file, preview, caption: '' }],
    }));
  };

  const removePhoto = (index: number) => {
    setDraft((prev) => {
      const photos = [...prev.photos];
      URL.revokeObjectURL(photos[index].preview);
      photos.splice(index, 1);
      return { ...prev, photos };
    });
  };

  const applyTemplate = (template: string) => {
    const tmpl = TEMPLATES[template];
    if (!tmpl) return;

    const slides: SlideConfig[] = tmpl.slides.map((type) => ({
      id: nanoid(8),
      type,
      content: {},
      interactions: {},
    }));

    updateDraft({ template, slides });
  };

  const addSlide = (type: SlideConfig['type']) => {
    setDraft((prev) => ({
      ...prev,
      slides: [...prev.slides, { id: nanoid(8), type, content: {}, interactions: {} }],
    }));
  };

  const removeSlide = (id: string) => {
    setDraft((prev) => ({
      ...prev,
      slides: prev.slides.filter((s) => s.id !== id),
    }));
  };

  const reorderSlides = (fromIndex: number, toIndex: number) => {
    setDraft((prev) => {
      const slides = [...prev.slides];
      const [moved] = slides.splice(fromIndex, 1);
      slides.splice(toIndex, 0, moved);
      return { ...prev, slides };
    });
  };

  const updateSlideContent = (id: string, content: Record<string, unknown>) => {
    setDraft((prev) => ({
      ...prev,
      slides: prev.slides.map((s) => (s.id === id ? { ...s, content: { ...s.content, ...content } } : s)),
    }));
  };

  const resetDraft = () => {
    setDraft({ ...emptyDraft });
    setStep(0);
  };

  return (
    <BuilderContext.Provider
      value={{
        draft, step, setStep, updateDraft, setChatAnalysis,
        addPhoto, removePhoto, applyTemplate, addSlide, removeSlide,
        reorderSlides, updateSlideContent, resetDraft,
      }}
    >
      {children}
    </BuilderContext.Provider>
  );
};
