import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getCelebrationBySlug, incrementViewCount } from '@/services/celebrations';
import { getSlides } from '@/services/slides';
import ExperienceEngine from '@/components/experience/ExperienceEngine';
import PasswordGate from '@/components/experience/PasswordGate';
import type { Celebration, Slide } from '@/lib/types';
import { isExpired } from '@/lib/tiers';
import { motion } from 'framer-motion';

const CelebrationView = () => {
  const { slug } = useParams<{ slug: string }>();
  const [celebration, setCelebration] = useState<Celebration | null>(null);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    if (!slug) return;

    const load = async () => {
      try {
        const celeb = await getCelebrationBySlug(slug);
        if (!celeb) {
          setError('This celebration was not found or is no longer available.');
          setLoading(false);
          return;
        }

        if (celeb.scheduledRevealAt && new Date(celeb.scheduledRevealAt) > new Date()) {
          setError(`This gift will be revealed on ${new Date(celeb.scheduledRevealAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })} ⏰`);
          setLoading(false);
          return;
        }

        if (isExpired(celeb.tier, celeb.publishedAt)) {
          setError('This free gift has expired. The sender can upgrade to a paid plan to make it permanent.');
          setLoading(false);
          return;
        }

        const slideData = await getSlides(celeb.id);
        setCelebration(celeb);
        setSlides(slideData);

        incrementViewCount(celeb.id).catch(() => {});
      } catch {
        setError('Something went wrong loading this celebration.');
      }
      setLoading(false);
    };

    load();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-pink-50 to-white">
        <div className="text-center">
          <div className="text-4xl mb-3 animate-heartbeat">🎂</div>
          <p className="font-body text-gray-400 text-sm">Loading your surprise...</p>
        </div>
      </div>
    );
  }

  if (error || !celebration) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-pink-50 to-white px-4">
        <motion.div
          className="text-center max-w-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-4xl mb-3">😢</div>
          <p className="font-display text-gradient-giftfy font-bold text-base mb-1">Oops!</p>
          <p className="font-body text-muted-foreground text-sm mb-4">{error || 'Celebration not found.'}</p>
          <a href="/" className="gradient-btn text-white rounded-full px-6 py-2.5 inline-block font-body text-sm font-semibold">
            Back to Home
          </a>
        </motion.div>
      </div>
    );
  }

  if (celebration.password && !unlocked) {
    return (
      <PasswordGate
        correctPassword={celebration.password}
        onUnlock={() => setUnlocked(true)}
        recipientName={celebration.recipientName}
      />
    );
  }

  return <ExperienceEngine celebration={celebration} slides={slides} />;
};

export default CelebrationView;
