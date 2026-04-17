import { useRef } from 'react';
import { motion } from 'framer-motion';

interface VideoPickerProps {
  videoPreview: string | null;
  onSelect: (file: File) => void;
  onRemove: () => void;
}

const VideoPicker = ({ videoPreview, onSelect, onRemove }: VideoPickerProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-2">
      <p className="font-display text-base font-bold text-gray-800">Add a video 🎬</p>
      {videoPreview ? (
        <div className="relative rounded-xl overflow-hidden">
          <video src={videoPreview} controls className="w-full rounded-xl max-h-48 object-cover" />
          <button onClick={onRemove}
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 text-white text-xs flex items-center justify-center">
            ✕
          </button>
        </div>
      ) : (
        <motion.label
          whileHover={{ scale: 1.01 }}
          className="block p-6 rounded-xl border-2 border-dashed border-pink-200 text-center cursor-pointer hover:bg-pink-50/50 transition-colors"
        >
          <input ref={inputRef} type="file" accept="video/*" className="hidden"
            onChange={(e) => e.target.files?.[0] && onSelect(e.target.files[0])} />
          <span className="text-2xl block mb-1">🎬</span>
          <span className="font-body text-sm text-gray-400">Tap to upload a short video</span>
          <span className="font-body text-xs text-gray-300 block mt-1">MP4, MOV · Max 50MB</span>
        </motion.label>
      )}
    </div>
  );
};

export default VideoPicker;
