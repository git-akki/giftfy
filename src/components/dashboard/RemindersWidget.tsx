import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import type { Celebration } from '@/lib/types';
import {
  computeUpcoming,
  urgencyLabel,
  OCCASION_EMOJI,
  OCCASION_LABEL,
  type UpcomingReminder,
} from '@/lib/birthday-reminders';

interface Props {
  celebrations: Celebration[];
}

const RemindersWidget = ({ celebrations }: Props) => {
  const navigate = useNavigate();
  const upcoming = useMemo(() => computeUpcoming(celebrations, 30), [celebrations]);

  if (upcoming.length === 0) return null;

  const handleCreate = (r: UpcomingReminder) => {
    const params = new URLSearchParams({
      occasion: r.occasion,
      name: r.recipientName,
    });
    navigate(`/builder?${params.toString()}`);
  };

  const handleView = (slug: string) => navigate(`/c/${slug}`);

  return (
    <div
      className="rounded-2xl p-4 mb-6"
      style={{
        background: 'linear-gradient(135deg, hsl(345 55% 98%), hsl(280 45% 98%))',
        boxShadow: '0 1px 4px hsl(0 0% 0% / 0.04), 0 0 0 1px hsl(345 55% 90% / 0.4)',
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="font-body font-bold text-foreground text-sm">
            ⏰ Upcoming
          </p>
          <p className="font-body text-muted-foreground text-[10px]">
            {upcoming.length} in the next 30 days
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <AnimatePresence>
          {upcoming.slice(0, 3).map((r, i) => {
            const urgent = r.daysUntil <= 2;
            return (
              <motion.div
                key={`${r.celebrationId}-${r.nextDate.toISOString()}`}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="rounded-xl p-3 flex items-center gap-3"
                style={{
                  background: 'hsl(0 0% 100%)',
                  boxShadow: urgent
                    ? '0 0 0 1.5px hsl(345 55% 70%), 0 2px 8px hsl(345 55% 60% / 0.15)'
                    : '0 0 0 1px hsl(0 0% 92%)',
                }}
              >
                <span className="text-xl">{OCCASION_EMOJI[r.occasion]}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-body font-bold text-foreground text-xs truncate">
                    {r.recipientName}
                    {r.yearsSince && r.occasion === 'birthday' && (
                      <span className="font-normal text-muted-foreground">
                        {' '}
                        turns year {r.yearsSince}
                      </span>
                    )}
                  </p>
                  <p
                    className="font-body text-[10px] font-semibold"
                    style={{ color: urgent ? 'hsl(345 55% 50%)' : 'hsl(0 0% 45%)' }}
                  >
                    {urgencyLabel(r.daysUntil)}
                    {' · '}
                    <span className="font-normal">
                      {r.customOccasion || OCCASION_LABEL[r.occasion]}
                    </span>
                  </p>
                </div>
                <div className="flex gap-1.5 flex-shrink-0">
                  <motion.button
                    onClick={() => handleView(r.slug)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="font-body text-[10px] font-semibold px-2.5 py-1 rounded-full"
                    style={{ background: 'hsl(0 0% 95%)', color: 'hsl(0 0% 40%)' }}
                  >
                    View
                  </motion.button>
                  <motion.button
                    onClick={() => handleCreate(r)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="font-body text-[10px] font-semibold px-2.5 py-1 rounded-full text-white"
                    style={{ background: 'linear-gradient(135deg, hsl(345 55% 62%), hsl(330 45% 58%))' }}
                  >
                    Create
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {upcoming.length > 3 && (
          <p className="font-body text-[10px] text-muted-foreground text-center pt-1">
            + {upcoming.length - 3} more in the next 30 days
          </p>
        )}
      </div>
    </div>
  );
};

export default RemindersWidget;
