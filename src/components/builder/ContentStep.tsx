import { useState, useEffect } from 'react';
import { useBuilder } from '@/contexts/BuilderContext';
import { buildPrompt, openLLM, parseAnalysisResult, localChatParser } from '@/services/chat-analysis';
import { getTierConfig, canUploadMorePhotos } from '@/lib/tiers';
import { motion } from 'framer-motion';
import { triggerCelebration } from './MicroCelebration';
import MusicPicker from './MusicPicker';
import VideoPicker from './VideoPicker';

const ContentStep = () => {
  const { draft, updateDraft, setChatAnalysis, addPhoto, removePhoto, setStep } = useBuilder();
  const [chatPasted, setChatPasted] = useState(!!draft.chatText);
  const [waitingForAI, setWaitingForAI] = useState(false);
  const [aiResult, setAiResult] = useState('');
  const [aiError, setAiError] = useState('');
  const [redirectMethod, setRedirectMethod] = useState<'url' | 'clipboard'>('url');

  // Auto-show paste box when returning from AI tab
  useEffect(() => {
    if (!waitingForAI) return;
    const handler = () => {
      if (document.visibilityState === 'visible') {
        // User came back from AI tab — prompt them to paste
      }
    };
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, [waitingForAI]);

  const handleAnalyzeWithAI = (provider: 'gemini' | 'chatgpt') => {
    const prompt = buildPrompt(draft.recipientName, draft.occasion, draft.chatText);
    const result = openLLM(provider, prompt);
    setRedirectMethod(result.method);
    setWaitingForAI(true);
  };

  const handlePasteResult = () => {
    const parsed = parseAnalysisResult(aiResult);
    if (parsed) {
      setChatAnalysis(parsed);
      setWaitingForAI(false);
      setAiError('');
      triggerCelebration('confetti', 'Chat analyzed! 🧠');
    } else {
      setAiError('Could not parse the result. Make sure you copied the full JSON output.');
    }
  };

  const handleSkipAI = () => {
    if (draft.chatText) {
      const basic = localChatParser(draft.chatText, draft.recipientName);
      setChatAnalysis(basic);
    }
    setWaitingForAI(false);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    let added = 0;
    Array.from(files).forEach((file) => {
      if (!canUploadMorePhotos(draft.tier, draft.photos.length + added)) return;
      addPhoto(file);
      added++;
    });
    e.target.value = '';
    if (added > 0) {
      triggerCelebration('sparkle', `+${added} photo${added > 1 ? 's' : ''} ✨`);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display font-bold text-foreground text-lg mb-1">Add the magic ✨</h2>
        <p className="font-body text-muted-foreground text-xs">Paste a chat, upload photos, or both</p>
      </div>

      {/* Chat paste */}
      <div>
        <label className="font-body text-foreground/70 text-xs font-semibold mb-1.5 block">
          📱 Paste your chat (WhatsApp / Instagram)
        </label>
        <textarea
          value={draft.chatText}
          onChange={(e) => { updateDraft({ chatText: e.target.value }); setChatPasted(true); }}
          placeholder="Open chat → Export Chat → Paste here..."
          className="w-full font-body text-xs px-4 py-3 rounded-xl border border-border/50 bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
          rows={5}
        />
        <p className="font-body text-muted-foreground/50 text-[9px] mt-1">
          🔒 Your chat stays on your device. We never see or store it.
        </p>

        {/* AI analysis buttons */}
        {chatPasted && draft.chatText.length > 50 && !draft.chatAnalysis && !waitingForAI && (
          <div className="mt-3 space-y-2">
            <p className="font-body text-foreground/60 text-[11px] font-semibold">Analyze with AI (opens in new tab):</p>
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleAnalyzeWithAI('gemini')}
                className="flex-1 font-body font-semibold text-[11px] py-2.5 rounded-xl transition-all"
                style={{ background: 'hsl(280 60% 95%)', color: 'hsl(280 50% 40%)', boxShadow: '0 0 0 1px hsl(280 40% 88%)' }}
              >
                ✨ Gemini
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleAnalyzeWithAI('chatgpt')}
                className="flex-1 font-body font-semibold text-[11px] py-2.5 rounded-xl transition-all"
                style={{ background: 'hsl(160 40% 94%)', color: 'hsl(160 50% 30%)', boxShadow: '0 0 0 1px hsl(160 30% 85%)' }}
              >
                🤖 ChatGPT
              </motion.button>
            </div>
            <button onClick={handleSkipAI} className="font-body text-muted-foreground text-[10px] underline">
              Skip AI → use basic analysis
            </button>
          </div>
        )}

        {/* Waiting for AI result */}
        {waitingForAI && (
          <div className="mt-3 p-4 rounded-xl" style={{ background: 'hsl(40 50% 95%)', border: '1px solid hsl(40 40% 88%)' }}>
            <p className="font-body font-semibold text-foreground text-xs mb-2">
              {redirectMethod === 'clipboard'
                ? '📋 Prompt copied! Paste it in the AI chat.'
                : '⏳ AI is analyzing your chat...'}
            </p>
            <p className="font-body text-foreground/50 text-[10px] mb-3">
              Copy the JSON output and paste it below:
            </p>
            <textarea
              value={aiResult}
              onChange={(e) => setAiResult(e.target.value)}
              placeholder='Paste the JSON result here...'
              className="w-full font-body text-xs px-3 py-2.5 rounded-lg border border-border/50 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              rows={4}
            />
            {aiError && <p className="font-body text-red-500 text-[10px] mt-1">{aiError}</p>}
            <div className="flex gap-2 mt-2">
              <button onClick={handlePasteResult}
                className="flex-1 font-body font-semibold text-[11px] py-2 rounded-lg text-white"
                style={{ background: 'linear-gradient(135deg, hsl(345 55% 62%), hsl(330 45% 58%))' }}>
                Parse & Continue
              </button>
              <button onClick={handleSkipAI}
                className="font-body text-muted-foreground text-[10px] px-3">
                Skip
              </button>
            </div>
          </div>
        )}

        {/* Analysis success */}
        {draft.chatAnalysis && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-3 p-4 rounded-xl"
            style={{ background: 'hsl(150 40% 95%)', border: '1px solid hsl(150 30% 88%)' }}
          >
            <p className="font-body font-semibold text-xs mb-1" style={{ color: 'hsl(150 50% 35%)' }}>✅ Analysis complete!</p>
            <p className="font-body text-foreground/50 text-[10px]">
              Found: {draft.chatAnalysis.traits.length} traits, {draft.chatAnalysis.messages.length} messages,
              {draft.chatAnalysis.insideJokes.length} inside jokes
              {draft.chatAnalysis.nickname ? ` · Nickname: "${draft.chatAnalysis.nickname}"` : ''}
            </p>
          </motion.div>
        )}
      </div>

      {/* Photo upload */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="font-body text-foreground/70 text-xs font-semibold">
            📸 Upload photos
          </label>
          <span className="font-body text-xs text-gray-400">
            {draft.photos.length}/{getTierConfig(draft.tier).maxPhotos === -1 ? '∞' : getTierConfig(draft.tier).maxPhotos} photos
          </span>
        </div>

        {canUploadMorePhotos(draft.tier, draft.photos.length) ? (
          <motion.label
            whileHover={{ scale: 1.01 }}
            className="block w-full py-8 rounded-xl border-2 border-dashed border-border/50 text-center cursor-pointer hover:border-primary/30 transition-colors"
          >
            <input type="file" accept="image/*" multiple onChange={handlePhotoUpload} className="hidden" />
            <span className="text-2xl block mb-1">📷</span>
            <span className="font-body text-muted-foreground text-xs">Tap to upload photos</span>
          </motion.label>
        ) : (
          <div className="w-full py-4 rounded-xl border border-border/50 text-center bg-muted/30">
            <p className="font-body text-xs text-muted-foreground">
              Photo limit reached.{' '}
              <button
                onClick={() => setStep(0)}
                className="text-primary underline font-semibold"
              >
                Upgrade for more.
              </button>
            </p>
          </div>
        )}

        {draft.photos.length > 0 && (
          <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
            {draft.photos.map((photo, i) => (
              <div key={i} className="relative flex-shrink-0">
                <img src={photo.preview} alt="" className="w-16 h-16 rounded-lg object-cover" />
                <button
                  onClick={() => removePhoto(i)}
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Music picker */}
      <div>
        {getTierConfig(draft.tier).hasMusicLibrary ? (
          <MusicPicker
            selectedTrackId={draft.musicTrackId || null}
            onSelect={(id) => updateDraft({ musicTrackId: id || '' })}
            canUseCustom={getTierConfig(draft.tier).hasCustomMusic}
            customPreview={draft.customMusicPreview}
            onCustomUpload={(file) => {
              // Revoke any previous blob URL to avoid leaks
              if (draft.customMusicPreview?.startsWith('blob:')) {
                URL.revokeObjectURL(draft.customMusicPreview);
              }
              updateDraft({
                customMusicFile: file,
                customMusicPreview: URL.createObjectURL(file),
                musicTrackId: '', // custom replaces preset
              });
            }}
            onCustomRemove={() => {
              if (draft.customMusicPreview?.startsWith('blob:')) {
                URL.revokeObjectURL(draft.customMusicPreview);
              }
              updateDraft({ customMusicFile: null, customMusicPreview: null });
            }}
          />
        ) : (
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 text-center">
            <p className="font-body text-sm text-gray-400">🎵 Music available on Sweet plan and above</p>
          </div>
        )}
      </div>

      {/* Video picker */}
      {getTierConfig(draft.tier).hasVideo ? (
        <VideoPicker
          videoPreview={draft.videoPreview || null}
          onSelect={(file) => updateDraft({ videoFile: file, videoPreview: URL.createObjectURL(file) })}
          onRemove={() => updateDraft({ videoFile: null, videoPreview: null })}
        />
      ) : null}

      {/* Gift link */}
      <div>
        <label className="font-body text-foreground/70 text-xs font-semibold mb-1.5 block">
          🎁 Add a gift (optional)
        </label>
        <input
          type="url"
          value={draft.giftUrl}
          onChange={(e) => updateDraft({ giftUrl: e.target.value })}
          placeholder="Paste any link (course, wishlist, gift card...)"
          className="w-full font-body text-xs px-4 py-3 rounded-xl border border-border/50 bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        {draft.giftUrl && (
          <input
            type="text"
            value={draft.giftTitle}
            onChange={(e) => updateDraft({ giftTitle: e.target.value })}
            placeholder="Gift title (e.g. Agentic AI Course)"
            className="w-full font-body text-xs px-4 py-3 rounded-xl border border-border/50 bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 mt-2"
          />
        )}
      </div>

      {/* Navigation */}
      <div className="flex gap-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setStep(0)}
          className="font-body font-semibold text-xs px-5 py-3 rounded-full"
          style={{ background: 'hsl(0 0% 95%)', color: 'hsl(0 0% 40%)' }}
        >
          ← Back
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setStep(2)}
          className="flex-1 font-body font-semibold text-sm py-3 rounded-full text-white"
          style={{
            background: 'linear-gradient(135deg, hsl(345 55% 62%), hsl(330 45% 58%))',
            boxShadow: '0 3px 12px hsl(345 55% 60% / 0.25)',
          }}
        >
          Next: Edit Slides →
        </motion.button>
      </div>
    </div>
  );
};

export default ContentStep;
