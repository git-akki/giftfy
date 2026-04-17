import { useState, useRef } from 'react';
import { useBuilder } from '@/contexts/BuilderContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { createCelebration, updateCelebration, getCelebration, deleteCelebration } from '@/services/celebrations';
import { createSlides } from '@/services/slides';
import { createPaymentRecord } from '@/services/payments';
import { uploadPhoto, uploadVoiceNote, uploadMusic } from '@/services/storage';
import { motion } from 'framer-motion';
import { triggerCelebration } from './MicroCelebration';
import { getTierConfig, TIERS } from '@/lib/tiers';
import { initiatePayment } from '@/lib/razorpay';
import { LP_RULES } from '@/lib/gamification';
import { hashPassword } from '@/lib/password';
import QRCodeModal from '@/components/shared/QRCodeModal';
import ScheduleReveal from './ScheduleReveal';
import CustomSlugInput from './CustomSlugInput';

// Compress image client-side before upload (1MB → ~200KB)
async function compressImage(file: File, maxWidth = 1200): Promise<Blob> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ratio = Math.min(maxWidth / img.width, 1);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => resolve(blob || file),
        'image/webp',
        0.8
      );
    };
    img.onerror = () => resolve(file); // fallback to original
    img.src = URL.createObjectURL(file);
  });
}

const PreviewStep = () => {
  const { draft, setStep } = useBuilder();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [publishing, setPublishing] = useState(false);
  const [publishStep, setPublishStep] = useState('');
  const [publishedSlug, setPublishedSlug] = useState('');
  const [error, setError] = useState('');
  const [showQR, setShowQR] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [customSlug, setCustomSlug] = useState('');
  const [password, setPassword] = useState('');
  const cancelledRef = useRef(false);

  const cleanup = () => {
    setPublishing(false);
    setPublishStep('');
  };

  const handleCancel = () => {
    cancelledRef.current = true;
    cleanup();
  };

  const handlePublish = async () => {
    if (!user || publishing) return;
    setPublishing(true);
    cancelledRef.current = false;
    setError('');

    try {
      // ─── Phase 1: CLIENT-SIDE PREP (no server cost, cancellable) ───
      setPublishStep('Preparing photos...');

      // Compress photos client-side before uploading
      const compressedPhotos: { blob: Blob; caption: string }[] = [];
      for (const photo of draft.photos) {
        if (cancelledRef.current) return cleanup();
        const compressed = await compressImage(photo.file);
        compressedPhotos.push({ blob: compressed, caption: photo.caption });
      }

      if (cancelledRef.current) return cleanup();

      // Build final slide data (without URLs yet — we'll inject after upload)
      const finalSlides = draft.slides.map((slide) => {
        if (slide.type === 'gift_reveal' && draft.giftUrl) {
          return { ...slide, content: { ...slide.content, giftTitle: draft.giftTitle, giftUrl: draft.giftUrl } };
        }
        return slide;
      });

      if (cancelledRef.current) return cleanup();

      // ─── Phase 2: Create celebration (as draft) BEFORE payment ───
      // This lets us pass a real celebrationId to Razorpay in `notes`, so the
      // Razorpay dashboard breadcrumb lines up with our local `payments` row
      // for reconciliation. If payment fails, we soft-delete the draft.
      setPublishStep('Creating gift...');
      const celebrationId = await createCelebration(draft.recipientName, draft.occasion, draft.template, draft.tier);

      if (cancelledRef.current) {
        await deleteCelebration(celebrationId).catch(() => {});
        return cleanup();
      }

      // Payment for paid tiers (with the real celebrationId as Razorpay note)
      if (draft.tier !== 'free') {
        setPublishStep('Processing payment...');
        const payment = await initiatePayment(draft.tier, celebrationId);
        if (!payment.success) {
          setError(payment.error || 'Payment failed. Please try again.');
          // Payment failed → soft-delete the draft so it doesn't linger.
          await deleteCelebration(celebrationId).catch(() => {});
          setPublishing(false);
          return;
        }

        // ─── Reconciliation record ───
        // `payment.orderId` is the razorpay_payment_id in the current
        // client-only flow (see src/lib/razorpay.ts). When the server-side
        // order+signature flow lands, wire this to the verified payment ID
        // returned by the backend. Best-effort: never blocks publish.
        const paidOrderId = payment.orderId || '';
        const provider: 'razorpay' | 'demo' = paidOrderId.startsWith('demo-pay-') ? 'demo' : 'razorpay';
        await createPaymentRecord({
          userId: user.uid,
          celebrationId,
          tier: draft.tier,
          amountPaise: TIERS[draft.tier].price * 100,
          providerPaymentId: paidOrderId,
          provider,
        }).catch((e) => {
          // Non-fatal: publish must still succeed even if the audit write fails.
          // SQL-side UNIQUE + Firestore deterministic doc IDs mean retries
          // won't duplicate the row if the caller eventually succeeds.
          console.error('createPaymentRecord failed', e);
        });
      }

      if (cancelledRef.current) {
        await deleteCelebration(celebrationId).catch(() => {});
        return cleanup();
      }

      // ─── Phase 3: Upload files IN PARALLEL ───
      setPublishStep(`Uploading ${compressedPhotos.length} photo${compressedPhotos.length !== 1 ? 's' : ''}...`);

      const [photoUrls, voiceNoteUrl, customMusicUrl] = await Promise.all([
        Promise.all(compressedPhotos.map((p) =>
          uploadPhoto(celebrationId, new File([p.blob], 'photo.webp', { type: 'image/webp' }))
            .catch(() => '') // skip failed uploads
        )),
        draft.voiceNoteBlob
          ? uploadVoiceNote(celebrationId, draft.voiceNoteBlob).catch(() => null)
          : Promise.resolve(null),
        draft.customMusicFile
          ? uploadMusic(celebrationId, draft.customMusicFile).catch(() => null)
          : Promise.resolve(null),
      ]);

      if (cancelledRef.current) {
        await deleteCelebration(celebrationId).catch(() => {});
        return cleanup();
      }

      // ─── Phase 4: Inject URLs + write slides + update + publish (parallel) ───
      setPublishStep('Publishing...');

      const slidesWithPhotos = finalSlides.map((slide) => {
        if (slide.type === 'photo_wall') {
          return { ...slide, content: { ...slide.content, photos: photoUrls.filter(Boolean).map((url, i) => ({ url, caption: compressedPhotos[i]?.caption || '' })) } };
        }
        if (slide.type === 'hero') {
          return { ...slide, content: { ...slide.content, recipientPhotoUrl: photoUrls[0] || null } };
        }
        return slide;
      });

      // Drop slides the user never gave content for. The recipient view
      // already skips these via isSlideEmpty, but we also strip them here so
      // they never hit the database — keeps /c/:slug tidy and saves writes.
      // hero / candle_blow / thank_you are always kept (they work without
      // user content).
      const publishedSlides = slidesWithPhotos.filter((slide) => {
        const content = slide.content as Record<string, unknown>;
        switch (slide.type) {
          case 'traits':
            return Array.isArray(content.items) && content.items.length > 0;
          case 'photo_wall':
            return Array.isArray(content.photos) && content.photos.length > 0;
          case 'chat_replay':
            return Array.isArray(content.messages) && content.messages.length > 0;
          case 'letter': {
            const paras = (content.paragraphs as string[] | undefined)
              ?? (typeof content.body === 'string' ? [content.body] : []);
            return paras.some((p) => typeof p === 'string' && p.trim().length > 0);
          }
          case 'gift_reveal':
            return Boolean(content.giftUrl || draft.giftUrl);
          case 'voice_note':
            return Boolean(voiceNoteUrl);
          default:
            return true; // hero, candle_blow, thank_you
        }
      });

      const tierConfig = getTierConfig(draft.tier || 'free');
      const expiresAt = tierConfig.expiresInDays > 0
        ? new Date(Date.now() + tierConfig.expiresInDays * 24 * 60 * 60 * 1000).toISOString()
        : null;

      const successfulPhotoCount = photoUrls.filter(Boolean).length;

      if (cancelledRef.current) {
        await deleteCelebration(celebrationId).catch(() => {});
        return cleanup();
      }

      // Hash the password (if any) before writing. Empty → null (no password).
      const hashedPassword = password ? await hashPassword(password) : null;

      if (cancelledRef.current) {
        await deleteCelebration(celebrationId).catch(() => {});
        return cleanup();
      }

      await Promise.all([
        updateCelebration(celebrationId, {
          recipientPhotoUrl: photoUrls[0] || null,
          photoCount: successfulPhotoCount,
          occasionDate: draft.occasionDate || null,
          customOccasion: draft.customOccasion || null,
          vibe: draft.vibe,
          chatAnalysis: draft.chatAnalysis,
          voiceNoteUrl,
          voiceNoteDurationMs: draft.voiceNoteDuration || null,
          musicTrackId: draft.musicTrackId || null,
          customMusicUrl,
          giftTitle: draft.giftTitle || null,
          giftUrl: draft.giftUrl || null,
          giftDescription: draft.giftDescription || null,
          tier: draft.tier || 'free',
          expiresAt,
          scheduledRevealAt: scheduledDate ? new Date(scheduledDate).toISOString() : null,
          ...(customSlug ? { slug: customSlug, customSlug } : {}),
          password: hashedPassword,
          status: 'published',
          publishedAt: new Date().toISOString(),
        }),
        createSlides(celebrationId, publishedSlides),
      ]);

      if (cancelledRef.current) {
        await deleteCelebration(celebrationId).catch(() => {});
        return cleanup();
      }

      // Get slug for sharing
      const celeb = await getCelebration(celebrationId);
      setPublishedSlug(celeb?.slug || '');

      // Calculate LP earned from this gift
      let lpEarned = LP_RULES.createGift + LP_RULES.publishGift;
      lpEarned += (photoUrls.filter(Boolean).length) * LP_RULES.perPhoto;
      if (voiceNoteUrl) lpEarned += LP_RULES.voiceNote;
      if (draft.chatAnalysis) lpEarned += LP_RULES.chatAnalysis;
      if (draft.giftUrl) lpEarned += LP_RULES.giftLink;
      if (draft.tier === 'premium') lpEarned += LP_RULES.premiumPublish;
      if (draft.tier === 'deluxe') lpEarned += LP_RULES.deluxePublish;

      triggerCelebration('confetti', `🎉 Published! +${lpEarned} LP`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    }
    setPublishing(false);
  };

  const shareUrl = `${window.location.origin}/c/${publishedSlug}`;

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: `Happy ${draft.occasion}!`, url: shareUrl }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareUrl);
    }
  };

  // Published state
  if (publishedSlug) {
    return (
      <div className="text-center py-8">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 12 }}>
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="font-display text-3xl text-gradient-giftfy mb-2">It's Live!</h2>
          <p className="font-body text-muted-foreground text-sm mb-6">
            Your gift for <strong>{draft.recipientName}</strong> is ready to share
          </p>

          <div className="rounded-xl p-4 mb-4" style={{ background: 'hsl(0 0% 97%)', border: '1px solid hsl(0 0% 90%)' }}>
            <p className="font-body text-foreground text-xs font-mono break-all">{shareUrl}</p>
          </div>

          <div className="flex gap-2 justify-center flex-wrap">
            <motion.button onClick={handleShare}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="font-body font-semibold text-sm px-6 py-3 rounded-full text-white"
              style={{ background: 'linear-gradient(135deg, #ec4899, #f472b6)' }}>
              📤 Share
            </motion.button>
            <motion.button onClick={() => navigator.clipboard.writeText(shareUrl)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="font-body font-semibold text-sm px-6 py-3 rounded-full"
              style={{ background: 'hsl(0 0% 95%)', color: 'hsl(0 0% 40%)' }}>
              📋 Copy Link
            </motion.button>
            {getTierConfig(draft.tier).hasQRCode && (
              <>
                <motion.button onClick={() => setShowQR(true)}
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  className="font-body font-semibold text-sm px-6 py-3 rounded-full"
                  style={{ background: 'hsl(0 0% 95%)', color: 'hsl(0 0% 40%)' }}>
                  📱 QR Code
                </motion.button>
                <QRCodeModal open={showQR} onClose={() => setShowQR(false)} url={shareUrl} recipientName={draft.recipientName} />
              </>
            )}
          </div>

          <button onClick={() => navigate('/dashboard')}
            className="font-body text-muted-foreground text-xs mt-6 underline">
            Go to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display font-bold text-gradient-giftfy text-lg mb-1">Review & Publish</h2>
        <p className="font-body text-muted-foreground text-xs">Everything looks good?</p>
      </div>

      {/* Summary */}
      <div className="space-y-3">
        <div className="p-4 rounded-xl" style={{ background: 'hsl(0 0% 98%)', border: '1px solid hsl(0 0% 93%)' }}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">{draft.occasion === 'birthday' ? '🎂' : '🎉'}</span>
            <div>
              <p className="font-body font-bold text-foreground text-sm">{draft.recipientName}</p>
              <p className="font-body text-muted-foreground text-[10px]">
                {draft.occasion} · {draft.slides.length} slides · {draft.photos.length} photos
                {draft.chatAnalysis ? ' · AI analyzed' : ''}
                {draft.giftUrl ? ' · Gift included' : ''}
                {draft.tier !== 'free' ? ` · ${TIERS[draft.tier]?.label || draft.tier} (₹${TIERS[draft.tier]?.price || 0})` : ' · Free tier'}
              </p>
            </div>
          </div>
        </div>

        {/* Slide order preview */}
        <div className="flex gap-1.5 overflow-x-auto pb-2">
          {draft.slides.map((slide, i) => {
            const info = { hero: '🎬', traits: '📂', photo_wall: '📸', chat_replay: '💬', letter: '💌', voice_note: '🎤', candle_blow: '🕯️', gift_reveal: '🎁', thank_you: '💝' };
            return (
              <div key={slide.id} className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-base"
                style={{ background: 'hsl(345 40% 95%)', border: '1px solid hsl(345 30% 90%)' }}>
                {info[slide.type] || '📄'}
              </div>
            );
          })}
        </div>
      </div>

      {error && (
        <p className="font-body text-xs p-3 rounded-xl"
          style={{ background: 'hsl(350 60% 96%)', color: 'hsl(350 50% 40%)' }}>
          {error}
        </p>
      )}

      {getTierConfig(draft.tier).hasScheduledReveal && (
        <ScheduleReveal scheduledDate={scheduledDate} onChange={setScheduledDate} />
      )}

      {getTierConfig(draft.tier).hasCustomSlug && (
        <CustomSlugInput value={customSlug} onChange={setCustomSlug} />
      )}

      {getTierConfig(draft.tier).hasPasswordProtection && (
        <div className="p-4 rounded-xl bg-purple-50 border border-purple-100">
          <p className="font-display text-base font-bold text-gray-800 mb-2">Password protect 🔒</p>
          <p className="font-body text-xs text-gray-500 mb-3">Leave empty for no password</p>
          <input
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Set a password (optional)"
            className="w-full font-body text-sm px-4 py-3 rounded-xl border border-purple-200 focus:outline-none focus:ring-2 focus:ring-pink-200"
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        {publishing ? (
          <>
            <button onClick={handleCancel}
              className="font-body font-semibold text-xs px-5 py-3 rounded-full"
              style={{ background: 'hsl(0 80% 95%)', color: 'hsl(0 70% 45%)' }}>
              Cancel
            </button>
            <div className="flex-1 font-body font-semibold text-sm py-3 rounded-full text-white text-center"
              style={{ background: 'linear-gradient(135deg, hsl(345 55% 62%), hsl(330 45% 58%))', opacity: 0.7 }}>
              <motion.span animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.2, repeat: Infinity }}>
                {publishStep}
              </motion.span>
            </div>
          </>
        ) : (
          <>
            <motion.button onClick={() => setStep(2)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="font-body font-semibold text-xs px-5 py-3 rounded-full"
              style={{ background: 'hsl(0 0% 95%)', color: 'hsl(0 0% 40%)' }}>
              ← Edit
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handlePublish}
              className="flex-1 font-body font-semibold text-sm py-3 rounded-full text-white"
              style={{
                background: 'linear-gradient(135deg, hsl(345 55% 62%), hsl(330 45% 58%))',
                boxShadow: '0 3px 12px hsl(345 55% 60% / 0.25)',
              }}
            >
              Publish & Get Link 🚀
            </motion.button>
          </>
        )}
      </div>
    </div>
  );
};

export default PreviewStep;
