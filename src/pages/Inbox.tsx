import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getAllMyReplies, type InboxReply } from '@/services/thank-you';
import { getSeenIds, markSeen } from '@/lib/inbox-storage';

type Filter = 'all' | 'text' | 'voice' | 'emoji';

const OCCASION_EMOJI: Record<string, string> = {
  birthday: '🎂',
  anniversary: '💍',
  graduation: '🎓',
  congratulations: '🎉',
  custom: '✨',
};

const Inbox = () => {
  const navigate = useNavigate();
  const [replies, setReplies] = useState<InboxReply[]>([]);
  const [loading, setLoading] = useState(true);
  const [seenAtLoad, setSeenAtLoad] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<Filter>('all');

  useEffect(() => {
    setSeenAtLoad(getSeenIds());
    getAllMyReplies()
      .then((data) => {
        setReplies(data);
        markSeen(data.map((r) => r.id));
      })
      .catch((err) => {
        console.error('Failed to load replies:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (filter === 'all') return replies;
    return replies.filter((r) => r.replyType === filter);
  }, [replies, filter]);

  const counts = useMemo(() => {
    const c = { all: replies.length, text: 0, voice: 0, emoji: 0 };
    for (const r of replies) c[r.replyType] += 1;
    return c;
  }, [replies]);

  const unreadCount = replies.filter((r) => !seenAtLoad.has(r.id)).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div
        className="sticky top-0 z-30 backdrop-blur-md border-b border-border/30"
        style={{ background: 'hsl(350 30% 100% / 0.85)' }}
      >
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/dashboard')}
            className="font-body text-muted-foreground text-xs"
          >
            ← Dashboard
          </motion.button>
          <h1 className="font-display text-lg text-gradient-giftfy">💌 Inbox</h1>
          <div className="w-16 text-right">
            {unreadCount > 0 && (
              <span
                className="font-body text-[10px] font-semibold px-2 py-0.5 rounded-full text-white"
                style={{ background: 'hsl(345 55% 62%)' }}
              >
                {unreadCount} new
              </span>
            )}
          </div>
        </div>

        {/* Filter tabs */}
        <div className="max-w-lg mx-auto px-4 pb-3 flex gap-1.5">
          {(['all', 'text', 'emoji', 'voice'] as Filter[]).map((f) => {
            const active = filter === f;
            const label = f === 'all' ? 'All' : f === 'text' ? 'Text' : f === 'emoji' ? 'Emoji' : 'Voice';
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="font-body text-[11px] font-semibold px-3 py-1 rounded-full transition-colors"
                style={{
                  background: active ? 'hsl(345 55% 92%)' : 'hsl(0 0% 96%)',
                  color: active ? 'hsl(345 55% 45%)' : 'hsl(0 0% 50%)',
                }}
              >
                {label} <span className="opacity-60">{counts[f]}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">
        {loading ? (
          <div className="space-y-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ background: 'hsl(0 0% 96%)' }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">💌</div>
            <p className="font-display font-bold text-gradient-giftfy text-base mb-1">
              {replies.length === 0 ? 'No replies yet' : 'Nothing in this filter'}
            </p>
            <p className="font-body text-muted-foreground text-xs max-w-xs mx-auto">
              {replies.length === 0
                ? 'When your recipients send thank-you messages, they’ll show up here.'
                : 'Try a different filter to see more replies.'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {filtered.map((reply, index) => {
                const isNew = !seenAtLoad.has(reply.id);
                const emoji = OCCASION_EMOJI[reply.occasion] || '🎁';
                return (
                  <motion.div
                    key={reply.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(index * 0.04, 0.4) }}
                    className="rounded-2xl p-4 relative"
                    style={{
                      background: 'hsl(0 0% 100%)',
                      boxShadow: isNew
                        ? '0 0 0 1.5px hsl(345 55% 75%), 0 2px 10px hsl(345 55% 60% / 0.12)'
                        : '0 1px 4px hsl(0 0% 0% / 0.04), 0 0 0 1px hsl(0 0% 0% / 0.03)',
                    }}
                  >
                    {isNew && (
                      <span
                        className="absolute top-3 right-3 font-body text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white"
                        style={{ background: 'hsl(345 55% 62%)' }}
                      >
                        NEW
                      </span>
                    )}

                    {/* Header */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-body font-bold text-foreground text-xs truncate">
                          From {reply.recipientName}'s gift
                        </p>
                        <p className="font-body text-muted-foreground text-[10px]">
                          {formatRelative(reply)}
                        </p>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="rounded-xl p-3" style={{ background: 'hsl(345 40% 97%)' }}>
                      {reply.replyType === 'emoji' && (
                        <span className="text-3xl">{reply.emoji}</span>
                      )}
                      {reply.replyType === 'text' && reply.textContent && (
                        <p className="font-body text-foreground text-sm leading-relaxed whitespace-pre-wrap">
                          “{reply.textContent}”
                        </p>
                      )}
                      {reply.replyType === 'voice' && reply.voiceUrl && (
                        <audio controls src={reply.voiceUrl} className="w-full h-9" />
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => navigate(`/insights/${reply.celebrationId}`)}
                        className="font-body text-[10px] font-semibold text-muted-foreground hover:text-foreground transition-colors"
                      >
                        View insights →
                      </button>
                      <button
                        onClick={() => navigate(`/c/${reply.celebrationSlug}`)}
                        className="font-body text-[10px] font-semibold text-muted-foreground hover:text-foreground transition-colors ml-auto"
                      >
                        Open gift
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

function formatRelative(reply: InboxReply): string {
  const raw = reply.createdAt as unknown;
  let ts = 0;
  if (raw && typeof raw === 'object' && 'toMillis' in raw) {
    ts = (raw as { toMillis: () => number }).toMillis();
  } else if (typeof raw === 'string') {
    ts = new Date(raw).getTime();
  }
  if (!ts) return 'just now';
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(ts).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export default Inbox;
