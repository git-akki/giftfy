import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { Heart } from 'lucide-react';
import { haptics } from '@/hooks/use-haptics';
import { triggerScreenGlow } from '@/components/experience/ScreenGlow';
import TouchLove from '@/components/experience/TouchLove';
import NavigationButtons from '@/components/birthday/NavigationButtons';

interface Props {
  messages: { from: string; text: string; time: string }[];
  headerTitle: string;
  onNext?: () => void;
  onPrev?: () => void;
}

const ChatReplaySlide = ({ messages, headerTitle, onNext, onPrev }: Props) => {
  const [visibleCount, setVisibleCount] = useState(0);
  const [typing, setTyping] = useState(false);
  const [liked, setLiked] = useState<Set<number>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);

  const senders = [...new Set(messages.map((m) => m.from))];
  const firstSender = senders[0] || 'them';

  useEffect(() => {
    if (visibleCount >= messages.length) return;
    const delay = visibleCount === 0 ? 600 : 1000 + Math.random() * 600;
    const typingTimer = setTimeout(() => setTyping(true), delay - 500);
    const msgTimer = setTimeout(() => {
      setTyping(false);
      setVisibleCount((c) => c + 1);
      // Heartbeat + screen glow on sweet messages
      const msg = messages[visibleCount]?.text || '';
      if (/❤️|💖|💗|💕|🥺|love|miss|special|hamesha|thanku/i.test(msg)) {
        haptics.heartbeat();
        triggerScreenGlow();
      } else {
        haptics.tap();
      }
    }, delay);
    return () => { clearTimeout(typingTimer); clearTimeout(msgTimer); };
  }, [visibleCount, messages.length]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [visibleCount, typing]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col items-center justify-center px-4 py-16 relative z-10">

      <div className="w-full max-w-sm px-2 mb-4">
        <div className="flex items-center gap-3 px-4 py-3 rounded-t-2xl"
          style={{ background: 'linear-gradient(135deg, hsl(345 55% 62%), hsl(330 50% 58%))' }}>
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm">💬</div>
          <div>
            <p className="font-body font-bold text-white text-sm">{headerTitle}</p>
            <p className="font-body text-white/60 text-[10px]">real conversations ✨</p>
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="w-full max-w-sm rounded-b-2xl overflow-y-auto px-2 py-4 space-y-2"
        style={{ maxHeight: '55vh', background: '#fff', boxShadow: '0 4px 20px hsl(0 0% 0% / 0.06)' }}>

        <div className="text-center mb-3">
          <span className="font-body text-[10px] text-muted-foreground/50 bg-muted/50 px-3 py-0.5 rounded-full">Messages</span>
        </div>

        {messages.slice(0, visibleCount).map((msg, i) => {
          const isFirst = msg.from === firstSender;
          return (
            <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className={`flex ${isFirst ? 'justify-start' : 'justify-end'}`}>
              <TouchLove>
              <div className="relative max-w-[75%] group" onDoubleClick={() => setLiked((p) => new Set(p).add(i))}>
                <div className="px-3 py-2 text-sm font-body" style={{
                  background: isFirst ? 'hsl(0 0% 96%)' : 'linear-gradient(135deg, hsl(345 55% 62%), hsl(280 35% 60%))',
                  color: isFirst ? 'hsl(0 0% 15%)' : 'white',
                  borderRadius: isFirst ? '18px 18px 18px 4px' : '18px 18px 4px 18px',
                }}>{msg.text}</div>
                <p className={`text-[9px] text-muted-foreground/40 mt-0.5 ${isFirst ? 'ml-1' : 'text-right mr-1'}`}>
                  {msg.time} {!isFirst && '✓✓'}
                </p>
                <AnimatePresence>
                  {liked.has(i) && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                      className={`absolute -bottom-1 ${isFirst ? 'right-1' : 'left-1'} bg-white rounded-full p-0.5 shadow-sm`}>
                      <Heart className="w-3 h-3 text-red-500 fill-red-500" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              </TouchLove>
            </motion.div>
          );
        })}

        {typing && visibleCount < messages.length && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className={`flex ${messages[visibleCount]?.from === firstSender ? 'justify-start' : 'justify-end'}`}>
            <div className="px-4 py-2.5 flex gap-1" style={{
              background: messages[visibleCount]?.from === firstSender ? 'hsl(0 0% 93%)' : 'hsl(345 55% 62% / 0.5)',
              borderRadius: messages[visibleCount]?.from === firstSender ? '18px 18px 18px 4px' : '18px 18px 4px 18px',
            }}>
              {[0, 1, 2].map((i) => (
                <motion.div key={i} className="w-1.5 h-1.5 rounded-full"
                  style={{ background: messages[visibleCount]?.from === firstSender ? 'hsl(0 0% 50%)' : 'white' }}
                  animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }} />
              ))}
            </div>
          </motion.div>
        )}
      </div>

      <p className="font-body text-muted-foreground/40 text-[10px] mt-2 text-center">double-tap to ❤️</p>

      {visibleCount >= messages.length && <NavigationButtons onNext={onNext} onPrev={onPrev} />}
    </motion.div>
  );
};

export default ChatReplaySlide;
