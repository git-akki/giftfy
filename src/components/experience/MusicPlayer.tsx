import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getTrackById } from '@/data/music-library';

interface MusicPlayerProps {
  trackId?: string | null;
  customUrl?: string | null;
}

const MusicPlayer = ({ trackId, customUrl }: MusicPlayerProps) => {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const track = trackId ? getTrackById(trackId) : null;
  const src = customUrl || track?.url;

  useEffect(() => {
    if (!src) return;
    audioRef.current = new Audio(src);
    audioRef.current.loop = true;
    audioRef.current.volume = 0.3;
    return () => { audioRef.current?.pause(); };
  }, [src]);

  if (!src) return null;

  const toggle = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {});
    }
    setPlaying(!playing);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1 }}
      className="fixed bottom-20 right-4 z-40"
    >
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggle}
        className="w-12 h-12 rounded-full bg-white/90 backdrop-blur shadow-lg flex items-center justify-center text-lg border border-pink-100"
      >
        {playing ? '🔊' : '🎵'}
      </motion.button>
      {track && (
        <p className="font-body text-[9px] text-white/70 text-center mt-1 max-w-[60px] truncate">
          {track.title}
        </p>
      )}
    </motion.div>
  );
};

export default MusicPlayer;
