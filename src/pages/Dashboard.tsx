import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { getMyCreations } from '@/services/celebrations';
import { getAllMyReplies } from '@/services/thank-you';
import { getSeenIds } from '@/lib/inbox-storage';
import CelebrationCard from '@/components/dashboard/CelebrationCard';
import ApiKeyManager from '@/components/dashboard/ApiKeyManager';
import SubscriptionPanel from '@/components/dashboard/SubscriptionPanel';
import LovePointsPanel from '@/components/dashboard/LovePointsPanel';
import RemindersWidget from '@/components/dashboard/RemindersWidget';
import type { Celebration, ThankYouReply } from '@/lib/types';

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [celebrations, setCelebrations] = useState<Celebration[]>([]);
  const [replies, setReplies] = useState<ThankYouReply[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadReplies, setUnreadReplies] = useState(0);

  useEffect(() => {
    getMyCreations()
      .then((data) => {
        console.log('Celebrations loaded:', data.length, data);
        setCelebrations(data);
      })
      .catch((err) => {
        console.error('Failed to load celebrations:', err);
        if (err?.message?.includes('index')) {
          console.error('Create the index by visiting the URL in the error above');
        }
      })
      .finally(() => setLoading(false));
  }, []);

  // Reply count: reload on mount, when the user refocuses the tab, and on
  // pathname change — so returning from /inbox clears the unread badge.
  useEffect(() => {
    let cancelled = false;

    const refresh = () => {
      getAllMyReplies()
        .then((data) => {
          if (cancelled) return;
          setReplies(data);
          const seen = getSeenIds();
          setUnreadReplies(data.filter((r) => !seen.has(r.id)).length);
        })
        .catch(() => {});
    };

    refresh();
    const onFocus = () => refresh();
    window.addEventListener('focus', onFocus);
    return () => {
      cancelled = true;
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  // Recompute unread when user returns from /inbox (same effect; Dashboard
  // only remounts if the route tree unmounts it, so we also check on focus).
  useEffect(() => {
    const seen = getSeenIds();
    setUnreadReplies(replies.filter((r) => !seen.has(r.id)).length);
  }, [replies]);

  const userName = user?.displayName || user?.email?.split('@')[0] || 'there';
  const avatarUrl = user?.photoURL;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-30 backdrop-blur-md border-b border-border/30"
        style={{ background: 'hsl(350 30% 100% / 0.85)' }}>
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="font-display text-xl text-gradient-giftfy">Giftfy</h1>
          <div className="flex items-center gap-3">
            <motion.button
              onClick={() => navigate('/inbox')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative font-body text-xs"
              title="Inbox"
            >
              <span className="text-base">💌</span>
              {unreadReplies > 0 && (
                <span
                  className="absolute -top-1 -right-1 font-body text-[8px] font-bold px-1 py-0.5 rounded-full text-white min-w-[14px] text-center"
                  style={{ background: 'hsl(345 55% 62%)' }}
                >
                  {unreadReplies > 99 ? '99+' : unreadReplies}
                </span>
              )}
            </motion.button>
            {avatarUrl && (
              <img src={avatarUrl} alt="" className="w-7 h-7 rounded-full" referrerPolicy="no-referrer" />
            )}
            <motion.button
              onClick={signOut}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="font-body text-muted-foreground text-[10px] hover:text-foreground transition-colors"
            >
              Sign out
            </motion.button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="font-display text-foreground text-base font-bold">Hey {userName} 👋</p>
            <p className="font-body text-muted-foreground text-xs">Your celebrations</p>
          </div>
          <motion.button
            onClick={() => navigate('/builder')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="font-body font-semibold text-xs px-4 py-2 rounded-full text-white transition-all"
            style={{
              background: 'linear-gradient(135deg, hsl(345 55% 62%), hsl(330 45% 58%))',
              boxShadow: '0 2px 8px hsl(345 55% 60% / 0.2)',
            }}
          >
            + Create
          </motion.button>
        </div>

        {!loading && celebrations.length > 0 && (
          <RemindersWidget celebrations={celebrations} />
        )}

        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ background: 'hsl(0 0% 96%)' }} />
            ))}
          </div>
        ) : celebrations.length === 0 ? (
          /* Empty state */
          <div className="text-center py-16">
            <div className="text-5xl mb-4 animate-gentle-float">🎁</div>
            <p className="font-display font-bold text-gradient-giftfy text-base mb-1">No celebrations yet</p>
            <p className="font-body text-muted-foreground text-xs mb-6 max-w-xs mx-auto">
              Create your first digital birthday experience — it takes under 5 minutes
            </p>
            <button
              onClick={() => navigate('/builder')}
              className="font-body font-semibold text-sm px-6 py-3 rounded-full text-white"
              style={{
                background: 'linear-gradient(135deg, hsl(345 55% 62%), hsl(330 45% 58%))',
                boxShadow: '0 3px 12px hsl(345 55% 60% / 0.25)',
              }}
            >
              Create Your First 🎂
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {celebrations.map((c, index) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
              >
                <CelebrationCard celebration={c} />
              </motion.div>
            ))}
          </div>
        )}

        <LovePointsPanel celebrations={celebrations} replies={replies} />

        <SubscriptionPanel celebrations={celebrations} />

        <ApiKeyManager />
      </div>
    </div>
  );
};

export default Dashboard;
