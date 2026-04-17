import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MUSIC_LIBRARY, type MusicTrack } from '@/data/music-library';

interface MusicPickerProps {
  selectedTrackId: string | null;
  onSelect: (trackId: string | null) => void;
  canUseCustom: boolean;
  customPreview?: string | null;
  onCustomUpload?: (file: File) => void;
  onCustomRemove?: () => void;
  onUpgradeRequest?: () => void;
}

const MusicPicker = ({
  selectedTrackId,
  onSelect,
  canUseCustom,
  customPreview,
  onCustomUpload,
  onCustomRemove,
  onUpgradeRequest,
}: MusicPickerProps) => {
  const [playing, setPlaying] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  const togglePreview = (src: string, id: string) => {
    if (playing === id) {
      audioRef.current?.pause();
      setPlaying(null);
      return;
    }
    audioRef.current?.pause();
    audioRef.current = new Audio(src);
    audioRef.current.volume = 0.4;
    audioRef.current.play().catch(() => {
      setError('Could not play preview.');
    });
    audioRef.current.onended = () => setPlaying(null);
    setPlaying(id);
  };

  const handleFile = (file: File) => {
    setError(null);
    if (!file.type.startsWith('audio/')) {
      setError('Please pick an audio file (mp3, m4a, wav).');
      return;
    }
    // 8 MB cap — data URL blows up localStorage quota past this in demo mode
    if (file.size > 8 * 1024 * 1024) {
      setError('File too large. Max 8 MB.');
      return;
    }
    onCustomUpload?.(file);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="font-display text-base font-bold text-gray-800">Pick a song 🎵</p>
        {canUseCustom ? (
          <label className="font-body text-xs text-pink-500 cursor-pointer hover:text-pink-600">
            Upload your own
            <input
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
                // clear so same file can be re-picked
                e.target.value = '';
              }}
            />
          </label>
        ) : (
          <button onClick={onUpgradeRequest} className="font-body text-xs text-gray-400 hover:text-pink-500">
            Upload your own ✨
          </button>
        )}
      </div>

      {error && (
        <p className="font-body text-[11px] text-red-500 bg-red-50 rounded-lg px-3 py-1.5">{error}</p>
      )}

      {/* Custom uploaded track */}
      {customPreview && (
        <div
          className="flex items-center gap-3 p-3 rounded-xl"
          style={{ background: 'hsl(345 55% 96%)', border: '2px solid hsl(345 55% 75%)' }}
        >
          <span className="text-xl">🎶</span>
          <div className="flex-1 min-w-0">
            <p className="font-body font-semibold text-sm text-gray-800 truncate">Your upload</p>
            <p className="font-body text-xs text-muted-foreground">Custom track</p>
          </div>
          <button
            onClick={() => togglePreview(customPreview, 'custom')}
            className="text-sm w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center"
            aria-label="Preview uploaded track"
          >
            {playing === 'custom' ? '⏸' : '▶️'}
          </button>
          <button
            onClick={onCustomRemove}
            className="font-body text-[11px] text-muted-foreground hover:text-red-500 px-2"
            aria-label="Remove uploaded track"
          >
            ✕
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
        {MUSIC_LIBRARY.map((track) => {
          const selected = !customPreview && selectedTrackId === track.id;
          return (
            <motion.button
              key={track.id}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => onSelect(selected ? null : track.id)}
              className={`flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                selected
                  ? 'bg-pink-50 border-2 border-pink-300'
                  : 'bg-gray-50 border-2 border-transparent hover:border-pink-100'
              }`}
            >
              <span className="text-xl">{track.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="font-body font-semibold text-sm text-gray-800 truncate">{track.title}</p>
                <p className="font-body text-xs text-gray-400">{track.artist} · {track.duration}</p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  togglePreview(track.url, track.id);
                }}
                className="text-sm w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center"
                aria-label={`Preview ${track.title}`}
              >
                {playing === track.id ? '⏸' : '▶️'}
              </button>
            </motion.button>
          );
        })}
      </div>

      {customPreview ? (
        <p className="font-body text-xs text-pink-500">🎵 Selected: your uploaded track</p>
      ) : selectedTrackId ? (
        <p className="font-body text-xs text-pink-500">
          🎵 Selected: {MUSIC_LIBRARY.find((t) => t.id === selectedTrackId)?.title}
        </p>
      ) : null}
    </div>
  );
};

export default MusicPicker;
