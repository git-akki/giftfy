import type { Celebration } from '@/lib/types';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const statusColors: Record<string, { bg: string; text: string; label: string }> = {
  draft: { bg: 'hsl(40 80% 92%)', text: 'hsl(40 60% 35%)', label: 'Draft' },
  published: { bg: 'hsl(150 50% 90%)', text: 'hsl(150 50% 30%)', label: 'Live' },
  archived: { bg: 'hsl(0 0% 92%)', text: 'hsl(0 0% 45%)', label: 'Archived' },
};

const CelebrationCard = ({ celebration }: { celebration: Celebration }) => {
  const navigate = useNavigate();
  const status = statusColors[celebration.status] || statusColors.draft;

  const formattedDate = celebration.occasionDate
    ? new Date(celebration.occasionDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
    : '';

  return (
    <motion.button
      onClick={() => navigate(celebration.status === 'draft' ? `/builder/${celebration.id}` : `/insights/${celebration.id}`)}
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ type: 'spring', stiffness: 300 }}
      className="w-full text-left rounded-2xl p-4 transition-all hover:shadow-md"
      style={{
        background: 'hsl(0 0% 100%)',
        boxShadow: '0 1px 4px hsl(0 0% 0% / 0.04), 0 0 0 1px hsl(0 0% 0% / 0.03)',
      }}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0 bg-gradient-to-br from-pink-200 to-purple-200"
        >
          {celebration.occasion === 'birthday' ? '🎂' : celebration.occasion === 'anniversary' ? '💍' : '🎉'}
        </div>

        <div className="flex-1 min-w-0">
          {/* Name + status */}
          <div className="flex items-center gap-2 mb-0.5">
            <p className="font-body font-bold text-foreground text-sm truncate">
              {celebration.recipientName}
            </p>
            <span
              className="font-body font-semibold text-[9px] px-1.5 py-0.5 rounded-full flex-shrink-0"
              style={{ background: status.bg, color: status.text }}
            >
              {status.label}
            </span>
          </div>

          {/* Occasion + date */}
          <p className="font-body text-muted-foreground text-[11px]">
            {celebration.occasion.charAt(0).toUpperCase() + celebration.occasion.slice(1)}
            {formattedDate ? ` · ${formattedDate}` : ''}
          </p>
        </div>

        {/* View count */}
        {celebration.status === 'published' && (
          <div className="flex-shrink-0 text-right">
            <p className="font-body font-bold text-foreground text-sm">{celebration.viewCount}</p>
            <p className="font-body text-muted-foreground text-xs">views</p>
          </div>
        )}
      </div>
    </motion.button>
  );
};

export default CelebrationCard;
