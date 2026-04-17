import { useState } from 'react';
import { type TierName, getTierConfig, canUploadMorePhotos } from '@/lib/tiers';

interface TierAccess {
  tier: TierName;
  setTier: (tier: TierName) => void;
  config: ReturnType<typeof getTierConfig>;
  canUploadPhoto: (currentCount: number) => boolean;
  hasFeature: (feature: string) => boolean;
  showUpgrade: boolean;
  setShowUpgrade: (show: boolean) => void;
  upgradeFeature: string;
  requestUpgrade: (feature: string) => void;
}

export function useTierAccess(initialTier: TierName = 'free'): TierAccess {
  const [tier, setTier] = useState<TierName>(initialTier);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState('');

  const config = getTierConfig(tier);

  const hasFeature = (feature: string): boolean => {
    return (config as Record<string, unknown>)[feature] === true;
  };

  const canUploadPhoto = (currentCount: number): boolean => {
    return canUploadMorePhotos(tier, currentCount);
  };

  const requestUpgrade = (feature: string) => {
    setUpgradeFeature(feature);
    setShowUpgrade(true);
  };

  return { tier, setTier, config, canUploadPhoto, hasFeature, showUpgrade, setShowUpgrade, upgradeFeature, requestUpgrade };
}
