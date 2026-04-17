import { motion } from 'framer-motion';
import NavigationButtons from '@/components/birthday/NavigationButtons';

interface Props {
  recipientName: string;
  recipientPhotoUrl: string | null;
  title: string;
  subtitle: string;
  occasion: string;
  onNext?: () => void;
  onPrev?: () => void;
}

const HeroSlide = ({ recipientName, recipientPhotoUrl, title, subtitle, onNext, onPrev }: Props) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    className="min-h-screen flex flex-col items-center justify-center px-4 text-center relative z-10">
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
      className="relative overflow-hidden w-full"
      style={{ maxWidth: 'min(380px, 90vw)', aspectRatio: '9 / 14', borderRadius: 28,
        boxShadow: '0 8px 40px hsl(345 40% 40% / 0.15)' }}>

      {recipientPhotoUrl ? (
        <img src={recipientPhotoUrl} alt={recipientName} className="absolute inset-0 w-full h-full object-cover" />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-8xl"
          style={{ background: 'linear-gradient(135deg, hsl(345 55% 92%), hsl(330 40% 88%))' }}>
          🎂
        </div>
      )}

      <div className="absolute inset-0" style={{
        background: 'linear-gradient(to bottom, hsl(345 30% 15% / 0.1) 0%, hsl(345 25% 10% / 0.55) 60%, hsl(345 20% 8% / 0.85) 100%)',
      }} />

      <div className="absolute inset-x-0 bottom-0 px-5 pb-5 z-10">
        <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="font-display text-3xl sm:text-4xl mb-1 leading-tight drop-shadow-lg"
          style={{ color: 'hsl(345 55% 75%)' }}>
          {title}
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
          className="font-handwritten text-base sm:text-lg mt-1 drop-shadow"
          style={{ color: 'hsl(345 55% 80%)' }}>
          {subtitle} ✨
        </motion.p>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }} className="mt-4">
          <NavigationButtons onNext={onNext} onPrev={onPrev} nextLabel="Let's Begin" />
        </motion.div>
      </div>
    </motion.div>
  </motion.div>
);

export default HeroSlide;
