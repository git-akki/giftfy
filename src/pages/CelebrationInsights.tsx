import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCelebration } from '@/services/celebrations';
import { getSlides } from '@/services/slides';
import { getInsights } from '@/services/analytics';
import { getReplies } from '@/services/thank-you';
import { motion } from 'framer-motion';
import type { Celebration, Slide, ThankYouReply } from '@/lib/types';

interface Insights {
  pageViews: number;
  uniqueViewers: number;
  firstView: any;
  timePerSlide: Record<string, number>;
  interactions: any[];
}

const SLIDE_LABELS: Record<string, { emoji: string; label: string }> = {
  hero: { emoji: '🎬', label: 'Hero' },
  traits: { emoji: '📂', label: 'Traits' },
  photo_wall: { emoji: '📸', label: 'Photos' },
  chat_replay: { emoji: '💬', label: 'Chat' },
  letter: { emoji: '💌', label: 'Letter' },
  voice_note: { emoji: '🎤', label: 'Voice Note' },
  candle_blow: { emoji: '🕯️', label: 'Candle' },
  gift_reveal: { emoji: '🎁', label: 'Gift' },
  thank_you: { emoji: '💝', label: 'Thank You' },
};

const CelebrationInsights = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [celebration, setCelebration] = useState<Celebration | null>(null);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [insights, setInsights] = useState<Insights | null>(null);
  const [replies, setReplies] = useState<ThankYouReply[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      getCelebration(id),
      getSlides(id),
      getInsights(id),
      getReplies(id),
    ]).then(([celeb, slideData, insightData, replyData]) => {
      setCelebration(celeb);
      setSlides(slideData);
      setInsights(insightData);
      setReplies(replyData);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground text-sm">Loading insights...</div>
      </div>
    );
  }

  if (!celebration) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="font-body text-muted-foreground">Celebration not found</p>
      </div>
    );
  }

  const shareUrl = `${window.location.origin}/c/${celebration.slug}`;
  const maxTime = Math.max(...Object.values(insights?.timePerSlide || { _: 1 }), 1);

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    const s = Math.round(ms / 1000);
    return s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${s % 60}s`;
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Not yet';
    const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-30 backdrop-blur-md border-b border-border/30"
        style={{ background: 'hsl(350 30% 100% / 0.85)' }}>
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <motion.button
            onClick={() => navigate('/dashboard')}
            className="font-body text-muted-foreground text-xs"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            ← Dashboard
          </motion.button>
          <h1 className="font-display text-lg text-gradient-giftfy">Giftfy Insights</h1>
          <div className="w-16" />
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-5">

        {/* Celebration header */}
        <div className="flex items-center gap-3 p-4 rounded-2xl"
          style={{ background: 'hsl(0 0% 100%)', boxShadow: '0 1px 4px hsl(0 0% 0% / 0.04)' }}>
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
            style={{ background: 'hsl(345 40% 93%)' }}>
            {celebration.occasion === 'birthday' ? '🎂' : '🎉'}
          </div>
          <div className="flex-1">
            <p className="font-body font-bold text-foreground text-sm">{celebration.recipientName}</p>
            <p className="font-body text-muted-foreground text-[10px]">
              {celebration.occasion} · {celebration.status === 'published' ? 'Live' : 'Draft'}
            </p>
          </div>
          <motion.button
            onClick={() => { navigator.clipboard.writeText(shareUrl); }}
            className="font-body text-[10px] px-3 py-1.5 rounded-full"
            style={{ background: 'hsl(345 40% 94%)', color: 'hsl(345 50% 45%)' }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            📋 Copy Link
          </motion.button>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Views', value: insights?.pageViews || celebration.viewCount || 0, emoji: '👀' },
            { label: 'Unique', value: insights?.uniqueViewers || celebration.uniqueViewers || 0, emoji: '👤' },
            { label: 'Replies', value: replies.length, emoji: '💌' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              className="text-center py-3 rounded-xl bg-pink-50/50"
              style={{ boxShadow: '0 1px 4px hsl(0 0% 0% / 0.04)' }}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <p className="text-lg mb-0.5">{stat.emoji}</p>
              <p className="font-body font-bold text-foreground text-xl">{stat.value}</p>
              <p className="font-body text-muted-foreground text-[9px]">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* First viewed */}
        <div className="p-3 rounded-xl"
          style={{ background: 'hsl(0 0% 100%)', boxShadow: '0 1px 4px hsl(0 0% 0% / 0.04)' }}>
          <p className="font-body text-muted-foreground text-[10px] mb-0.5">First opened</p>
          <p className="font-body font-bold text-foreground text-xs">
            {formatDate(insights?.firstView || celebration.firstViewedAt)}
          </p>
        </div>

        {/* Time per slide */}
        {insights && Object.keys(insights.timePerSlide).length > 0 && (
          <div className="p-4 rounded-2xl"
            style={{ background: 'hsl(0 0% 100%)', boxShadow: '0 1px 4px hsl(0 0% 0% / 0.04)' }}>
            <p className="font-body font-bold text-foreground text-xs mb-3">⏱ Time per slide</p>
            <div className="space-y-2">
              {slides.map((slide) => {
                const timeMs = insights.timePerSlide[slide.id] || 0;
                const info = SLIDE_LABELS[slide.slideType] || { emoji: '📄', label: slide.slideType };
                const barWidth = timeMs > 0 ? Math.max((timeMs / maxTime) * 100, 5) : 0;
                const isTop = timeMs === maxTime && timeMs > 0;

                return (
                  <div key={slide.id} className="flex items-center gap-2">
                    <span className="text-sm w-6 text-center">{info.emoji}</span>
                    <span className="font-body text-[10px] text-foreground/60 w-14 truncate">{info.label}</span>
                    <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'hsl(0 0% 94%)' }}>
                      <motion.div
                        className="h-full rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${barWidth}%` }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        style={{
                          background: isTop
                            ? 'linear-gradient(90deg, hsl(345 55% 62%), hsl(330 45% 58%))'
                            : 'hsl(345 55% 70% / 0.4)',
                        }}
                      />
                    </div>
                    <span className="font-body text-[9px] text-muted-foreground w-10 text-right">
                      {timeMs > 0 ? formatDuration(timeMs) : '—'}
                    </span>
                    {isTop && <span className="text-[9px]">⭐</span>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Thank you replies */}
        {replies.length > 0 && (
          <div className="p-4 rounded-2xl"
            style={{ background: 'hsl(0 0% 100%)', boxShadow: '0 1px 4px hsl(0 0% 0% / 0.04)' }}>
            <p className="font-body font-bold text-foreground text-xs mb-3">💌 Replies</p>
            <div className="space-y-2">
              {replies.map((reply) => (
                <div key={reply.id} className="p-3 rounded-xl" style={{ background: 'hsl(345 40% 97%)' }}>
                  {reply.replyType === 'emoji' && (
                    <span className="text-2xl">{reply.emoji}</span>
                  )}
                  {reply.replyType === 'text' && (
                    <p className="font-body text-foreground/70 text-xs">{reply.textContent}</p>
                  )}
                  {reply.replyType === 'voice' && (
                    <audio controls src={reply.voiceUrl || ''} className="w-full h-8" />
                  )}
                  <p className="font-body text-muted-foreground/40 text-[8px] mt-1">
                    {formatDate(reply.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Share link */}
        <div className="p-4 rounded-2xl"
          style={{ background: 'hsl(0 0% 100%)', boxShadow: '0 1px 4px hsl(0 0% 0% / 0.04)' }}>
          <p className="font-body font-bold text-foreground text-xs mb-2">🔗 Share link</p>
          <p className="font-body text-foreground/50 text-[10px] break-all mb-3">{shareUrl}</p>
          <div className="flex gap-2">
            <motion.button
              onClick={() => navigator.clipboard.writeText(shareUrl)}
              className="flex-1 font-body font-semibold text-[11px] py-2 rounded-full"
              style={{ background: 'hsl(0 0% 95%)', color: 'hsl(0 0% 40%)' }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              📋 Copy
            </motion.button>
            <motion.button
              onClick={() => navigator.share?.({ url: shareUrl }).catch(() => {})}
              className="flex-1 font-body font-semibold text-[11px] py-2 rounded-full text-white"
              style={{ background: 'linear-gradient(135deg, #ec4899, #f472b6)' }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              📤 Share
            </motion.button>
          </div>
        </div>

        {/* View the experience */}
        <motion.button
          onClick={() => navigate(`/c/${celebration.slug}`)}
          className="w-full font-body font-semibold text-xs py-3 rounded-full"
          style={{ background: 'hsl(345 40% 94%)', color: 'hsl(345 50% 45%)' }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          👁 View Experience
        </motion.button>
      </div>
    </div>
  );
};

export default CelebrationInsights;
