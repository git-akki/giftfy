import { motion } from 'framer-motion';
import { useState } from 'react';
import { submitTextReply, submitEmojiReply } from '@/services/thank-you';
import NavigationButtons from '@/components/birthday/NavigationButtons';

interface Props {
  celebrationId: string;
  creatorName: string;
  onNext?: () => void;
  onPrev?: () => void;
}

const emojis = ['🥰', '😭', '💖', '🫂', '🎉', '😍'];

const ThankYouSlide = ({ celebrationId, creatorName, onPrev }: Props) => {
  const [sent, setSent] = useState(false);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  const handleSendText = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      await submitTextReply(celebrationId, text.trim());
      setSent(true);
    } catch (e) {
      console.error(e);
    }
    setSending(false);
  };

  const handleSendEmoji = async (emoji: string) => {
    setSending(true);
    try {
      await submitEmojiReply(celebrationId, emoji);
      setSent(true);
    } catch (e) {
      console.error(e);
    }
    setSending(false);
  };

  if (sent) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="min-h-screen flex flex-col items-center justify-center px-4">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 12 }}
          className="text-center">
          <div className="text-6xl mb-4">💝</div>
          <h2 className="font-display text-3xl text-gradient-romantic mb-2">Thank you sent!</h2>
          <p className="font-body text-muted-foreground text-sm">They'll love hearing from you 💖</p>
        </motion.div>
        <NavigationButtons onPrev={onPrev} />
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col items-center justify-center px-4 py-16 relative z-10">
      <div className="text-center max-w-sm">
        <div className="text-5xl mb-3">💌</div>
        <h2 className="font-display text-3xl text-gradient-romantic mb-2">Send a Thank You</h2>
        <p className="font-body text-muted-foreground text-sm mb-6">
          Let {creatorName} know how you felt 💖
        </p>

        {/* Quick emoji reactions */}
        <div className="flex justify-center gap-2 mb-6">
          {emojis.map((emoji) => (
            <motion.button key={emoji} whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}
              onClick={() => handleSendEmoji(emoji)} disabled={sending}
              className="text-2xl w-11 h-11 rounded-full flex items-center justify-center"
              style={{ background: 'hsl(0 0% 97%)', border: '1px solid hsl(0 0% 90%)' }}>
              {emoji}
            </motion.button>
          ))}
        </div>

        {/* Text reply */}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write something sweet..."
          maxLength={500}
          className="w-full font-body text-sm px-4 py-3 rounded-xl border border-border/50 bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none mb-1"
          rows={3}
        />
        <p className="font-body text-[10px] text-muted-foreground text-right mb-3">
          {text.length}/500
        </p>

        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={handleSendText} disabled={!text.trim() || sending}
          className="w-full font-body font-semibold text-sm py-3 rounded-full text-white disabled:opacity-40"
          style={{ background: 'linear-gradient(135deg, hsl(345 55% 62%), hsl(330 45% 58%))' }}>
          {sending ? 'Sending...' : 'Send Reply 💖'}
        </motion.button>
      </div>

      <NavigationButtons onPrev={onPrev} />
    </motion.div>
  );
};

export default ThankYouSlide;
