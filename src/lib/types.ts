export type OccasionType = 'birthday' | 'anniversary' | 'graduation' | 'congratulations' | 'custom';
export type CelebrationStatus = 'draft' | 'published' | 'archived';
export type VibeType = 'warm' | 'playful' | 'romantic' | 'minimal';
export type SlideType =
  | 'hero'
  | 'traits'
  | 'photo_wall'
  | 'chat_replay'
  | 'letter'
  | 'voice_note'
  | 'candle_blow'
  | 'gift_reveal'
  | 'thank_you';

export interface Profile {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  createdAt: string;
}

export interface Celebration {
  id: string;
  creatorId: string;
  recipientName: string;
  recipientPhotoUrl: string | null;
  occasion: OccasionType;
  occasionDate: string | null;
  customOccasion: string | null;
  slug: string;
  status: CelebrationStatus;
  vibe: VibeType;
  template: string;
  tier: 'free' | 'sweet' | 'premium' | 'deluxe';
  musicTrackId: string | null;
  customMusicUrl: string | null;
  videoUrl: string | null;
  scheduledRevealAt: string | null;
  customSlug: string | null;
  password: string | null;
  expiresAt: string | null;
  photoCount?: number;
  viewCount: number;
  uniqueViewers: number;
  firstViewedAt: string | null;
  chatAnalysis: ChatAnalysis | null;
  voiceNoteUrl: string | null;
  voiceNoteDurationMs: number | null;
  giftTitle: string | null;
  giftUrl: string | null;
  giftDescription: string | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  deletedAt: string | null;
}

export interface Slide {
  id: string;
  celebrationId: string;
  slideType: SlideType;
  sortOrder: number;
  content: Record<string, unknown>;
  interactions: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface ViewEvent {
  id: string;
  celebrationId: string;
  viewerId: string | null;
  slideId: string | null;
  eventType: string;
  durationMs: number | null;
  metadata: Record<string, unknown>;
  createdAt: string;
}

// Firestore Timestamp has `.toMillis()`; stringified writes land as ISO strings.
// Use a union so both the server-timestamp (live) and stringified (cached/API) forms type-check.
export type FirestoreTimestampLike =
  | string
  | { toMillis: () => number; toDate: () => Date }
  | null;

export interface ThankYouReply {
  id: string;
  celebrationId: string;
  replyType: 'text' | 'voice' | 'emoji';
  textContent: string | null;
  voiceUrl: string | null;
  emoji: string | null;
  createdAt: FirestoreTimestampLike;
}

export interface ChatAnalysis {
  nickname: string;
  vibe: VibeType;
  traits: { emoji: string; label: string; desc: string }[];
  messages: { from: string; text: string; time: string }[];
  insideJokes: string[];
  stats: {
    total_messages: number;
    emoji_count: number;
    top_emojis: string[];
  };
  letterDraft: string;
}

export interface CelebrationDraft {
  recipientName: string;
  recipientPhoto: File | null;
  recipientPhotoUrl: string | null;
  occasion: OccasionType;
  occasionDate: string;
  customOccasion: string;
  vibe: VibeType;
  template: string;
  tier: 'free' | 'sweet' | 'premium' | 'deluxe';
  musicTrackId: string;
  customMusicFile: File | null;
  customMusicPreview: string | null;
  videoFile: File | null;
  videoPreview: string | null;
  chatText: string;
  chatAnalysis: ChatAnalysis | null;
  photos: { file: File; preview: string; caption: string }[];
  voiceNoteBlob: Blob | null;
  voiceNoteDuration: number;
  giftTitle: string;
  giftUrl: string;
  giftDescription: string;
  slides: SlideConfig[];
}

export interface SlideConfig {
  id: string;
  type: SlideType;
  content: Record<string, unknown>;
  interactions: Record<string, unknown>;
}

export interface Payment {
  id: string;
  userId: string;
  celebrationId: string;
  tier: 'sweet' | 'premium' | 'deluxe';
  amountPaise: number;      // price × 100, INR minor units
  currency: string;          // 'INR' for now
  provider: 'razorpay' | 'demo';
  providerPaymentId: string; // razorpay_payment_id (or 'demo-pay-...')
  status: 'captured' | 'failed' | 'refunded';
  createdAt: string;
}
