import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useTilt } from '@/hooks/use-tilt';
import { haptics } from '@/hooks/use-haptics';
import NavigationButtons from '@/components/birthday/NavigationButtons';

interface Props {
  photos: { url: string; caption: string }[];
  recipientName: string;
  onNext?: () => void;
  onPrev?: () => void;
}

// Auto positions for up to 6 photos
const positions = [
  { top: '7%', left: '3%', rotate: -4, w: '40%' },
  { top: '6%', left: '53%', rotate: 3, w: '40%' },
  { top: '38%', left: '2%', rotate: 4, w: '38%' },
  { top: '36%', left: '50%', rotate: -2, w: '44%' },
  { top: '68%', left: '25%', rotate: -3, w: '45%' },
  { top: '66%', left: '5%', rotate: 2, w: '40%' },
];

const PhotoWallSlide = ({ photos, recipientName, onNext, onPrev }: Props) => {
  const [revealed, setRevealed] = useState(0);
  const { tilt } = useTilt(revealed >= photos.length); // enable tilt after all revealed

  useEffect(() => {
    if (revealed >= photos.length) return;
    const timer = setTimeout(() => {
      setRevealed((c) => c + 1);
      haptics.tap();
    }, revealed === 0 ? 800 : 1500);
    return () => clearTimeout(timer);
  }, [revealed, photos.length]);

  if (photos.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <p className="font-body text-muted-foreground">No photos yet</p>
        <NavigationButtons onNext={onNext} onPrev={onPrev} />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative z-10">
      <h2 className="font-display text-4xl text-gradient-romantic mb-1 text-center">Memories 📸</h2>
      <p className="font-handwritten text-muted-foreground text-lg mb-5 text-center">
        {revealed >= photos.length ? `${recipientName}'s wall 💕` : 'pinning...'}
      </p>

      <div className="relative mx-auto overflow-hidden w-full"
        style={{ maxWidth: 300, aspectRatio: '9 / 16', borderRadius: 16,
          background: 'linear-gradient(145deg, hsl(28 18% 92%), hsl(25 14% 89%))',
          boxShadow: 'inset 0 2px 10px hsl(30 15% 78% / 0.5), 0 6px 24px hsl(0 0% 0% / 0.06)',
          border: '1px solid hsl(28 12% 85%)' }}>

        {/* Title watermark */}
        <div className="absolute top-0 left-0 right-0 text-center z-20 py-2"
          style={{ background: 'linear-gradient(to bottom, hsl(28 18% 92%), hsl(28 18% 92% / 0.8), transparent)' }}>
          <p className="font-display text-sm" style={{ color: 'hsl(345 40% 55%)' }}>Memories 💕</p>
        </div>

        {photos.slice(0, revealed).map((photo, i) => {
          const pos = positions[i % positions.length];
          return (
            <motion.div key={i} className="absolute" style={{
                top: pos.top, left: pos.left, width: pos.w, zIndex: i + 2,
                transform: `translate(${tilt.x * (3 + i * 2)}px, ${tilt.y * (2 + i * 1.5)}px)`,
              }}
              initial={{ scale: 0.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1, rotate: pos.rotate }}
              transition={{ type: 'spring', damping: 22, stiffness: 120 }}>
              <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 z-10">
                <div style={{ width: 10, height: 10, borderRadius: '50%',
                  background: 'radial-gradient(circle at 35% 30%, hsl(0 75% 60%), hsl(0 65% 42%))',
                  boxShadow: '0 1px 3px hsl(0 0% 0% / 0.25)' }} />
              </div>
              <div style={{ background: 'white', padding: '4px 4px 14px 4px', borderRadius: 3,
                boxShadow: '0 2px 8px hsl(0 0% 0% / 0.1)' }}>
                <div style={{ aspectRatio: '3/4', overflow: 'hidden', borderRadius: 2 }}>
                  <img src={photo.url} alt={photo.caption} className="w-full h-full object-cover" />
                </div>
                <p className="font-handwritten text-[7px] text-center mt-0.5" style={{ color: 'hsl(0 0% 45%)' }}>
                  {photo.caption}
                </p>
              </div>
            </motion.div>
          );
        })}

        <div className="absolute bottom-0 left-0 right-0 text-center z-20 py-2"
          style={{ background: 'linear-gradient(to top, hsl(28 18% 92%), transparent)' }}>
          <p className="font-handwritten text-[9px]" style={{ color: 'hsl(345 35% 55% / 0.7)' }}>
            Happy {new Date().getFullYear()} 🎂
          </p>
        </div>
      </div>

      {revealed >= photos.length && <NavigationButtons onNext={onNext} onPrev={onPrev} />}
    </motion.div>
  );
};

export default PhotoWallSlide;
