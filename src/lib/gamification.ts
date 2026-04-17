import type { Celebration, ThankYouReply } from './types';

export interface BadgeDef {
  id: string;
  emoji: string;
  label: string;
  description: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

export const BADGES: BadgeDef[] = [
  { id: 'first_gift', emoji: '🐣', label: 'First Giftfy', description: 'Created your first gift', rarity: 'common' },
  { id: 'memory_keeper', emoji: '📸', label: 'Memory Keeper', description: 'Added 10+ photos across gifts', rarity: 'common' },
  { id: 'voice_of_love', emoji: '🎤', label: 'Voice of Love', description: 'Recorded 3 voice notes', rarity: 'uncommon' },
  { id: 'chat_analyst', emoji: '💬', label: 'Chat Analyst', description: 'Analysed 5 chats with AI', rarity: 'uncommon' },
  { id: 'popular', emoji: '👀', label: 'Popular', description: 'Got 50+ total views', rarity: 'rare' },
  { id: 'heart_catcher', emoji: '💌', label: 'Heart Catcher', description: 'Received 10+ replies', rarity: 'rare' },
  { id: 'premium_picker', emoji: '✨', label: 'Premium Picker', description: 'Published a Premium or Deluxe gift', rarity: 'rare' },
  { id: 'prolific', emoji: '🔥', label: 'Prolific', description: 'Published 5 gifts', rarity: 'epic' },
  { id: 'love_magnet', emoji: '💝', label: 'Love Magnet', description: 'Received 25+ replies', rarity: 'epic' },
  { id: 'legend', emoji: '🏆', label: 'Giftfy Legend', description: 'Reached 1000 Love Points', rarity: 'legendary' },
];

export const RARITY_COLOR: Record<BadgeDef['rarity'], string> = {
  common: 'hsl(0 0% 55%)',
  uncommon: 'hsl(150 45% 45%)',
  rare: 'hsl(215 70% 55%)',
  epic: 'hsl(280 55% 55%)',
  legendary: 'hsl(40 85% 50%)',
};

export const LP_RULES = {
  createGift: 25,
  publishGift: 50,
  perPhoto: 3,
  voiceNote: 15,
  chatAnalysis: 20,
  giftLink: 10,
  perView: 2,
  perReply: 15,
  premiumPublish: 100,
  deluxePublish: 200,
} as const;

export interface Stats {
  totalPoints: number;
  level: number;
  progressToNext: number;
  totalGifts: number;
  publishedGifts: number;
  totalPhotos: number;
  voiceNotes: number;
  chatAnalyses: number;
  giftLinks: number;
  totalViews: number;
  totalReplies: number;
  premiumGifts: number;
  unlockedBadges: BadgeDef[];
  lockedBadges: BadgeDef[];
}

const POINTS_PER_LEVEL = 100;

export function computeStats(
  celebrations: Celebration[],
  replies: ThankYouReply[],
): Stats {
  let points = 0;

  const publishedGifts = celebrations.filter((c) => c.status === 'published').length;
  const totalPhotos = celebrations.reduce(
    (acc, c) => acc + (c.photoCount ?? (c.recipientPhotoUrl ? 1 : 0)),
    0,
  );
  const voiceNotes = celebrations.filter((c) => c.voiceNoteUrl).length;
  const chatAnalyses = celebrations.filter((c) => c.chatAnalysis).length;
  const giftLinks = celebrations.filter((c) => c.giftUrl).length;
  const totalViews = celebrations.reduce((acc, c) => acc + (c.viewCount || 0), 0);
  const totalReplies = replies.length;
  const premiumGifts = celebrations.filter(
    (c) => c.tier === 'premium' || c.tier === 'deluxe',
  ).length;
  const deluxeGifts = celebrations.filter((c) => c.tier === 'deluxe').length;

  points += celebrations.length * LP_RULES.createGift;
  points += publishedGifts * LP_RULES.publishGift;
  points += totalPhotos * LP_RULES.perPhoto;
  points += voiceNotes * LP_RULES.voiceNote;
  points += chatAnalyses * LP_RULES.chatAnalysis;
  points += giftLinks * LP_RULES.giftLink;
  points += totalViews * LP_RULES.perView;
  points += totalReplies * LP_RULES.perReply;
  points += (premiumGifts - deluxeGifts) * LP_RULES.premiumPublish;
  points += deluxeGifts * LP_RULES.deluxePublish;

  const level = Math.floor(points / POINTS_PER_LEVEL) + 1;
  const progressToNext = points % POINTS_PER_LEVEL;

  const unlockedIds = new Set<string>();
  if (celebrations.length >= 1) unlockedIds.add('first_gift');
  if (totalPhotos >= 10) unlockedIds.add('memory_keeper');
  if (voiceNotes >= 3) unlockedIds.add('voice_of_love');
  if (chatAnalyses >= 5) unlockedIds.add('chat_analyst');
  if (totalViews >= 50) unlockedIds.add('popular');
  if (totalReplies >= 10) unlockedIds.add('heart_catcher');
  if (premiumGifts >= 1) unlockedIds.add('premium_picker');
  if (publishedGifts >= 5) unlockedIds.add('prolific');
  if (totalReplies >= 25) unlockedIds.add('love_magnet');
  if (points >= 1000) unlockedIds.add('legend');

  const unlockedBadges = BADGES.filter((b) => unlockedIds.has(b.id));
  const lockedBadges = BADGES.filter((b) => !unlockedIds.has(b.id));

  return {
    totalPoints: points,
    level,
    progressToNext,
    totalGifts: celebrations.length,
    publishedGifts,
    totalPhotos,
    voiceNotes,
    chatAnalyses,
    giftLinks,
    totalViews,
    totalReplies,
    premiumGifts,
    unlockedBadges,
    lockedBadges,
  };
}

export function pointsPerLevel(): number {
  return POINTS_PER_LEVEL;
}

const SEEN_BADGES_KEY = 'giftfy_seen_badges';

export function getSeenBadgeIds(): Set<string> {
  try {
    const raw = localStorage.getItem(SEEN_BADGES_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

export function markBadgesSeen(ids: string[]): void {
  if (ids.length === 0) return;
  const seen = getSeenBadgeIds();
  for (const id of ids) seen.add(id);
  try {
    localStorage.setItem(SEEN_BADGES_KEY, JSON.stringify(Array.from(seen)));
  } catch {
    // ignore
  }
}
