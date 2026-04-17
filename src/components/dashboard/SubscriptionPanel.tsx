import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { TIERS, type TierName, isExpired } from '@/lib/tiers';
import type { Celebration } from '@/lib/types';

interface Props {
  celebrations: Celebration[];
}

const TIER_ORDER: TierName[] = ['free', 'sweet', 'premium', 'deluxe'];
const TIER_COLOR: Record<TierName, string> = {
  free: 'hsl(0 0% 70%)',
  sweet: 'hsl(345 55% 65%)',
  premium: 'hsl(280 45% 60%)',
  deluxe: 'hsl(40 75% 55%)',
};

const SubscriptionPanel = ({ celebrations }: Props) => {
  const navigate = useNavigate();

  const stats = useMemo(() => {
    const byTier: Record<TierName, number> = { free: 0, sweet: 0, premium: 0, deluxe: 0 };
    let spent = 0;
    let expiringSoon = 0;
    let expired = 0;

    for (const c of celebrations) {
      const tier = (c.tier as TierName) || 'free';
      byTier[tier] = (byTier[tier] ?? 0) + 1;
      spent += TIERS[tier].price;

      if (tier === 'free' && c.publishedAt) {
        if (isExpired(tier, c.publishedAt)) {
          expired += 1;
        } else {
          const published = new Date(c.publishedAt).getTime();
          const daysElapsed = Math.floor((Date.now() - published) / (1000 * 60 * 60 * 24));
          const daysLeft = TIERS.free.expiresInDays - daysElapsed;
          if (daysLeft <= 2 && daysLeft >= 0) expiringSoon += 1;
        }
      }
    }

    const topTier = TIER_ORDER.reduce<TierName>(
      (acc, t) => (byTier[t] > 0 ? t : acc),
      'free',
    );

    return { byTier, spent, expiringSoon, expired, topTier, total: celebrations.length };
  }, [celebrations]);

  if (celebrations.length === 0) return null;

  const topTierConfig = TIERS[stats.topTier];

  return (
    <div
      className="rounded-2xl p-4 mt-6"
      style={{
        background: 'linear-gradient(135deg, hsl(345 55% 98%), hsl(280 45% 98%))',
        boxShadow: '0 1px 4px hsl(0 0% 0% / 0.04), 0 0 0 1px hsl(345 55% 90% / 0.3)',
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-body font-bold text-foreground text-sm">Your plans</p>
          <p className="font-body text-muted-foreground text-[10px]">
            Highest used: <span className="font-semibold" style={{ color: TIER_COLOR[stats.topTier] }}>{topTierConfig.label}</span>
            {' · '}Total spent: <span className="font-semibold">₹{stats.spent}</span>
          </p>
        </div>
        <motion.button
          onClick={() => navigate('/pricing')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="font-body font-semibold text-[10px] px-3 py-1.5 rounded-full text-white"
          style={{ background: 'linear-gradient(135deg, hsl(345 55% 62%), hsl(330 45% 58%))' }}
        >
          Compare plans
        </motion.button>
      </div>

      {/* Breakdown */}
      <div className="grid grid-cols-4 gap-2 mb-3">
        {TIER_ORDER.map((t) => {
          const count = stats.byTier[t];
          const config = TIERS[t];
          return (
            <div
              key={t}
              className="rounded-xl p-2 text-center"
              style={{
                background: count > 0 ? 'hsl(0 0% 100%)' : 'hsl(0 0% 97%)',
                boxShadow: count > 0 ? `0 0 0 1px ${TIER_COLOR[t]}30` : '0 0 0 1px hsl(0 0% 92%)',
              }}
            >
              <p
                className="font-display font-bold text-base"
                style={{ color: count > 0 ? TIER_COLOR[t] : 'hsl(0 0% 80%)' }}
              >
                {count}
              </p>
              <p className="font-body text-[9px] font-semibold text-muted-foreground">
                {config.label}
              </p>
              <p className="font-body text-[8px] text-muted-foreground/70">
                {config.price === 0 ? 'Free' : `₹${config.price}`}
              </p>
            </div>
          );
        })}
      </div>

      {/* Alerts */}
      {(stats.expiringSoon > 0 || stats.expired > 0) && (
        <div className="space-y-1.5">
          {stats.expiringSoon > 0 && (
            <div
              className="rounded-lg px-3 py-2 flex items-center gap-2"
              style={{ background: 'hsl(40 90% 95%)', border: '1px solid hsl(40 90% 80%)' }}
            >
              <span className="text-sm">⏰</span>
              <p className="font-body text-[10px] text-foreground flex-1">
                <span className="font-semibold">{stats.expiringSoon}</span> free gift{stats.expiringSoon > 1 ? 's' : ''} expiring within 2 days
              </p>
              <button
                onClick={() => navigate('/pricing')}
                className="font-body text-[10px] font-semibold underline"
                style={{ color: 'hsl(30 80% 40%)' }}
              >
                Upgrade
              </button>
            </div>
          )}
          {stats.expired > 0 && (
            <div
              className="rounded-lg px-3 py-2 flex items-center gap-2"
              style={{ background: 'hsl(0 50% 96%)', border: '1px solid hsl(0 50% 85%)' }}
            >
              <span className="text-sm">💔</span>
              <p className="font-body text-[10px] text-foreground flex-1">
                <span className="font-semibold">{stats.expired}</span> free gift{stats.expired > 1 ? 's have' : ' has'} expired
              </p>
            </div>
          )}
        </div>
      )}

      {/* Top tier features */}
      {stats.topTier !== 'deluxe' && (
        <div
          className="mt-3 rounded-lg px-3 py-2"
          style={{ background: 'hsl(345 30% 98%)', border: '1px solid hsl(345 30% 92%)' }}
        >
          <p className="font-body text-[10px] text-muted-foreground">
            <span className="font-semibold text-foreground">Next tier unlocks:</span>{' '}
            {nextTierPerks(stats.topTier)}
          </p>
        </div>
      )}
    </div>
  );
};

function nextTierPerks(current: TierName): string {
  const next: Record<TierName, string> = {
    free: 'music library, 10 photos, never-expires — upgrade to Sweet (₹79)',
    sweet: 'video, custom music, QR codes, scheduled reveal — upgrade to Premium (₹199)',
    premium: 'custom URL, password protection, analytics — upgrade to Deluxe (₹399)',
    deluxe: '',
  };
  return next[current];
}

export default SubscriptionPanel;
