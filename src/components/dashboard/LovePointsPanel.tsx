import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Celebration, ThankYouReply } from '@/lib/types';
import { computeStats, RARITY_COLOR, BADGES, pointsPerLevel } from '@/lib/gamification';

interface Props {
  celebrations: Celebration[];
  replies: ThankYouReply[];
}

const LovePointsPanel = ({ celebrations, replies }: Props) => {
  const [showAllBadges, setShowAllBadges] = useState(false);
  const stats = useMemo(() => computeStats(celebrations, replies), [celebrations, replies]);

  const progressPct = (stats.progressToNext / pointsPerLevel()) * 100;
  const shownBadges = showAllBadges
    ? BADGES
    : stats.unlockedBadges.length > 0
      ? stats.unlockedBadges
      : BADGES.slice(0, 4);

  return (
    <div
      className="rounded-2xl p-4 mt-6"
      style={{
        background: 'linear-gradient(135deg, hsl(345 55% 99%), hsl(40 90% 98%))',
        boxShadow: '0 1px 4px hsl(0 0% 0% / 0.04), 0 0 0 1px hsl(40 85% 80% / 0.3)',
      }}
    >
      {/* Level + LP header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <p className="font-display font-bold text-foreground text-sm">
              Level {stats.level}
            </p>
            <span
              className="font-body text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white"
              style={{ background: 'linear-gradient(135deg, hsl(345 55% 62%), hsl(40 85% 55%))' }}
            >
              💖 {stats.totalPoints.toLocaleString()} LP
            </span>
          </div>
          <p className="font-body text-muted-foreground text-[10px]">
            {stats.level >= 10 ? 'You are a Giftfy master 🏆' : `${pointsPerLevel() - stats.progressToNext} LP to Level ${stats.level + 1}`}
          </p>
        </div>
        <div className="text-right">
          <p className="font-body font-bold text-foreground text-xs">
            {stats.unlockedBadges.length}/{BADGES.length}
          </p>
          <p className="font-body text-muted-foreground text-[9px]">Badges</p>
        </div>
      </div>

      {/* Progress bar */}
      <div
        className="h-2 w-full rounded-full overflow-hidden mb-4"
        style={{ background: 'hsl(0 0% 92%)' }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progressPct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{
            background: 'linear-gradient(90deg, hsl(345 55% 62%), hsl(40 85% 55%))',
          }}
        />
      </div>

      {/* Stat chips */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {[
          { label: 'Gifts', value: stats.totalGifts, emoji: '🎁' },
          { label: 'Views', value: stats.totalViews, emoji: '👀' },
          { label: 'Replies', value: stats.totalReplies, emoji: '💌' },
          { label: 'Photos', value: stats.totalPhotos, emoji: '📸' },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl p-2 text-center"
            style={{ background: 'hsl(0 0% 100%)', boxShadow: '0 0 0 1px hsl(0 0% 92%)' }}
          >
            <p className="text-sm">{s.emoji}</p>
            <p className="font-display font-bold text-foreground text-sm">{s.value}</p>
            <p className="font-body text-muted-foreground text-[9px]">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Badges */}
      <div className="flex items-center justify-between mb-2">
        <p className="font-body font-bold text-foreground text-xs">Badges</p>
        <button
          onClick={() => setShowAllBadges((v) => !v)}
          className="font-body text-[10px] font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          {showAllBadges ? 'Show unlocked' : 'Show all'}
        </button>
      </div>

      <div className="grid grid-cols-5 gap-2">
        <AnimatePresence>
          {shownBadges.map((badge) => {
            const unlocked = stats.unlockedBadges.some((b) => b.id === badge.id);
            return (
              <motion.div
                key={badge.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileHover={{ y: -2, scale: 1.05 }}
                className="rounded-xl p-2 text-center cursor-default"
                style={{
                  background: unlocked ? 'hsl(0 0% 100%)' : 'hsl(0 0% 96%)',
                  boxShadow: unlocked
                    ? `0 0 0 1px ${RARITY_COLOR[badge.rarity]}40`
                    : '0 0 0 1px hsl(0 0% 90%)',
                  opacity: unlocked ? 1 : 0.45,
                }}
                title={`${badge.label} — ${badge.description}`}
              >
                <p className="text-lg">{unlocked ? badge.emoji : '🔒'}</p>
                <p
                  className="font-body text-[8px] font-semibold mt-0.5 leading-tight"
                  style={{ color: unlocked ? RARITY_COLOR[badge.rarity] : 'hsl(0 0% 60%)' }}
                >
                  {badge.label}
                </p>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {stats.unlockedBadges.length === 0 && !showAllBadges && (
        <p className="font-body text-[10px] text-muted-foreground text-center mt-3">
          Publish your first gift to unlock 🐣 <span className="font-semibold">First Giftfy</span>
        </p>
      )}
    </div>
  );
};

export default LovePointsPanel;
