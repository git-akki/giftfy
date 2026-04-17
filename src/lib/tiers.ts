export type TierName = 'free' | 'sweet' | 'premium' | 'deluxe';

export interface TierConfig {
  name: TierName;
  label: string;
  price: number;
  maxPhotos: number;
  hasBranding: boolean;
  expiresInDays: number;
  hasMusicLibrary: boolean;
  hasCustomMusic: boolean;
  hasVideo: boolean;
  hasPremiumTemplates: boolean;
  hasQRCode: boolean;
  hasScheduledReveal: boolean;
  hasCustomSlug: boolean;
  hasPasswordProtection: boolean;
  hasAnalytics: boolean;
}

export const TIERS: Record<TierName, TierConfig> = {
  free: {
    name: 'free', label: 'Free', price: 0, maxPhotos: 3, hasBranding: true, expiresInDays: 7,
    hasMusicLibrary: false, hasCustomMusic: false, hasVideo: false, hasPremiumTemplates: false,
    hasQRCode: false, hasScheduledReveal: false, hasCustomSlug: false, hasPasswordProtection: false, hasAnalytics: false,
  },
  sweet: {
    name: 'sweet', label: 'Sweet', price: 79, maxPhotos: 10, hasBranding: false, expiresInDays: 0,
    hasMusicLibrary: true, hasCustomMusic: false, hasVideo: false, hasPremiumTemplates: false,
    hasQRCode: false, hasScheduledReveal: false, hasCustomSlug: false, hasPasswordProtection: false, hasAnalytics: false,
  },
  premium: {
    name: 'premium', label: 'Premium', price: 199, maxPhotos: -1, hasBranding: false, expiresInDays: 0,
    hasMusicLibrary: true, hasCustomMusic: true, hasVideo: true, hasPremiumTemplates: true,
    hasQRCode: true, hasScheduledReveal: true, hasCustomSlug: false, hasPasswordProtection: false, hasAnalytics: false,
  },
  deluxe: {
    name: 'deluxe', label: 'Deluxe', price: 399, maxPhotos: -1, hasBranding: false, expiresInDays: 0,
    hasMusicLibrary: true, hasCustomMusic: true, hasVideo: true, hasPremiumTemplates: true,
    hasQRCode: true, hasScheduledReveal: true, hasCustomSlug: true, hasPasswordProtection: true, hasAnalytics: true,
  },
};

export function getTierConfig(tier: TierName): TierConfig {
  return TIERS[tier] || TIERS.free;
}

export function canUploadMorePhotos(tier: TierName, currentCount: number): boolean {
  const config = getTierConfig(tier);
  if (config.maxPhotos === -1) return true;
  return currentCount < config.maxPhotos;
}

export function isExpired(tier: TierName, publishedAt: string | null): boolean {
  if (!publishedAt) return false;
  const config = getTierConfig(tier);
  if (config.expiresInDays === 0) return false;
  const published = new Date(publishedAt);
  const expiresAt = new Date(published.getTime() + config.expiresInDays * 24 * 60 * 60 * 1000);
  return new Date() > expiresAt;
}

export function getMinTierForFeature(feature: keyof Omit<TierConfig, 'name' | 'label' | 'price' | 'maxPhotos' | 'expiresInDays' | 'hasBranding'>): TierName {
  const order: TierName[] = ['free', 'sweet', 'premium', 'deluxe'];
  for (const tier of order) {
    if (TIERS[tier][feature]) return tier;
  }
  return 'deluxe';
}
