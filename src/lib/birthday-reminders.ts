import type { Celebration, OccasionType } from './types';

export interface UpcomingReminder {
  celebrationId: string;
  slug: string;
  recipientName: string;
  occasion: OccasionType;
  customOccasion: string | null;
  nextDate: Date;
  daysUntil: number;
  yearsSince: number | null;
}

const MS_PER_DAY = 1000 * 60 * 60 * 24;

export function computeUpcoming(
  celebrations: Celebration[],
  withinDays = 30,
): UpcomingReminder[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const cutoff = new Date(today.getTime() + withinDays * MS_PER_DAY);
  const seenByRecipient = new Map<string, UpcomingReminder>();

  for (const c of celebrations) {
    if (!c.occasionDate) continue;
    const original = new Date(c.occasionDate);
    if (Number.isNaN(original.getTime())) continue;

    const nextDate = nextOccurrence(original, today);
    if (nextDate > cutoff) continue;

    const daysUntil = Math.round((nextDate.getTime() - today.getTime()) / MS_PER_DAY);
    const yearsSince =
      nextDate.getFullYear() > original.getFullYear()
        ? nextDate.getFullYear() - original.getFullYear()
        : null;

    const reminder: UpcomingReminder = {
      celebrationId: c.id,
      slug: c.slug,
      recipientName: c.recipientName,
      occasion: c.occasion,
      customOccasion: c.customOccasion ?? null,
      nextDate,
      daysUntil,
      yearsSince,
    };

    // De-dupe by recipient name (case-insensitive) — keep the most recent gift.
    const key = c.recipientName.trim().toLowerCase();
    const existing = seenByRecipient.get(key);
    if (!existing || new Date(c.createdAt).getTime() > new Date(celebrations.find((x) => x.id === existing.celebrationId)?.createdAt || 0).getTime()) {
      seenByRecipient.set(key, reminder);
    }
  }

  return Array.from(seenByRecipient.values()).sort((a, b) => a.daysUntil - b.daysUntil);
}

function nextOccurrence(original: Date, today: Date): Date {
  const month = original.getMonth();
  const day = original.getDate();
  const thisYear = new Date(today.getFullYear(), month, day);
  if (thisYear >= today) return thisYear;
  return new Date(today.getFullYear() + 1, month, day);
}

export function urgencyLabel(daysUntil: number): string {
  if (daysUntil === 0) return 'Today! 🎉';
  if (daysUntil === 1) return 'Tomorrow';
  if (daysUntil <= 7) return `In ${daysUntil} days`;
  if (daysUntil <= 14) return `In ${daysUntil} days`;
  return `In ${daysUntil} days`;
}

export const OCCASION_EMOJI: Record<OccasionType, string> = {
  birthday: '🎂',
  anniversary: '💍',
  graduation: '🎓',
  congratulations: '🎉',
  custom: '✨',
};

export const OCCASION_LABEL: Record<OccasionType, string> = {
  birthday: 'Birthday',
  anniversary: 'Anniversary',
  graduation: 'Graduation',
  congratulations: 'Celebration',
  custom: 'Occasion',
};
