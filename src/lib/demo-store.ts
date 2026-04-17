import { nanoid } from 'nanoid';
import type {
  Celebration,
  Slide,
  SlideConfig,
  ThankYouReply,
  OccasionType,
  VibeType,
  CelebrationStatus,
  Payment,
} from './types';
import { generateSlug } from './constants';

const CELEBRATIONS_KEY = 'giftfy_demo_celebrations';
const SLIDES_KEY = 'giftfy_demo_slides';
const REPLIES_KEY = 'giftfy_demo_replies';
const PAYMENTS_KEY = 'giftfy_demo_payments';
const SEEDED_KEY = 'giftfy_demo_seeded';

type CelebMap = Record<string, Celebration>;
type SlideMap = Record<string, Slide[]>; // key = celebrationId
type ReplyMap = Record<string, ThankYouReply[]>; // key = celebrationId
type PaymentList = Payment[];

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // quota or privacy-mode — silently ignore
  }
}

function readCelebs(): CelebMap {
  return read<CelebMap>(CELEBRATIONS_KEY, {});
}

function readSlides(): SlideMap {
  return read<SlideMap>(SLIDES_KEY, {});
}

function readReplies(): ReplyMap {
  return read<ReplyMap>(REPLIES_KEY, {});
}

function readPayments(): PaymentList {
  return read<PaymentList>(PAYMENTS_KEY, []);
}

// ─── Celebration CRUD ───────────────────────────────────────────────

export function demoGetMyCreations(userId: string): Celebration[] {
  const all = Object.values(readCelebs());
  return all
    .filter((c) => c.creatorId === userId && !c.deletedAt)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function demoGetCelebration(id: string): Celebration | null {
  const celeb = readCelebs()[id];
  if (!celeb) return null;
  if (celeb.deletedAt) return null;
  return celeb;
}

export function demoGetCelebrationBySlug(slug: string): Celebration | null {
  const all = Object.values(readCelebs());
  const celeb = all.find((c) => c.slug === slug && c.status === 'published' && !c.deletedAt);
  if (!celeb) return null;
  if (celeb.expiresAt && new Date(celeb.expiresAt) < new Date()) return null;
  return celeb;
}

export function demoCreateCelebration(
  userId: string,
  recipientName: string,
  occasion: string,
  template: string,
  tier: string,
): string {
  const id = `demo-${nanoid(10)}`;
  const slug = generateSlug(recipientName);
  const celeb: Celebration = {
    id,
    creatorId: userId,
    recipientName,
    recipientPhotoUrl: null,
    occasion: occasion as OccasionType,
    occasionDate: null,
    customOccasion: null,
    slug,
    status: 'draft',
    vibe: 'warm',
    template,
    tier: tier as Celebration['tier'],
    musicTrackId: null,
    customMusicUrl: null,
    videoUrl: null,
    scheduledRevealAt: null,
    customSlug: null,
    password: null,
    expiresAt: null,
    viewCount: 0,
    uniqueViewers: 0,
    firstViewedAt: null,
    chatAnalysis: null,
    voiceNoteUrl: null,
    voiceNoteDurationMs: null,
    giftTitle: null,
    giftUrl: null,
    giftDescription: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    publishedAt: null,
    deletedAt: null,
  };

  const celebs = readCelebs();
  celebs[id] = celeb;
  write(CELEBRATIONS_KEY, celebs);
  return id;
}

export function demoUpdateCelebration(
  id: string,
  updates: Partial<Record<string, unknown>>,
): void {
  const celebs = readCelebs();
  if (!celebs[id]) return;
  celebs[id] = {
    ...celebs[id],
    ...(updates as Partial<Celebration>),
    updatedAt: new Date().toISOString(),
  };
  write(CELEBRATIONS_KEY, celebs);
}

export function demoDeleteCelebration(id: string): void {
  // Soft-delete: mark the celebration row with `deletedAt`. Slides + replies
  // are left untouched — they're joined from the parent, so the filter on
  // the celebration hides them too. A future restore flow can revive everything.
  const celebs = readCelebs();
  if (!celebs[id]) return;
  celebs[id] = {
    ...celebs[id],
    deletedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  write(CELEBRATIONS_KEY, celebs);
}

export function demoIncrementViewCount(id: string): void {
  const celebs = readCelebs();
  if (!celebs[id]) return;
  celebs[id] = {
    ...celebs[id],
    viewCount: (celebs[id].viewCount || 0) + 1,
    firstViewedAt: celebs[id].firstViewedAt || new Date().toISOString(),
  };
  write(CELEBRATIONS_KEY, celebs);
}

export function demoIsSlugAvailable(slug: string): boolean {
  // Intentionally does NOT filter out soft-deleted rows — a slug held by a
  // deleted celebration is still "taken" during the retention window so we
  // don't give it out and risk collisions on restore.
  const all = Object.values(readCelebs());
  return !all.some((c) => c.slug === slug);
}

// ─── Slide CRUD ─────────────────────────────────────────────────────

export function demoGetSlides(celebrationId: string): Slide[] {
  const slides = readSlides()[celebrationId] ?? [];
  return [...slides].sort((a, b) => a.sortOrder - b.sortOrder);
}

export function demoCreateSlides(celebrationId: string, configs: SlideConfig[]): void {
  const nowIso = new Date().toISOString();
  const newSlides: Slide[] = configs.map((c, i) => ({
    id: `slide-${nanoid(8)}`,
    celebrationId,
    slideType: c.type,
    sortOrder: i,
    content: c.content,
    interactions: c.interactions,
    createdAt: nowIso,
    updatedAt: nowIso,
  }));
  const all = readSlides();
  all[celebrationId] = newSlides;
  write(SLIDES_KEY, all);
}

// ─── Reply CRUD ─────────────────────────────────────────────────────

export function demoSubmitReply(
  celebrationId: string,
  reply: Omit<ThankYouReply, 'id' | 'celebrationId' | 'createdAt'>,
): void {
  const all = readReplies();
  const existing = all[celebrationId] || [];
  const newReply: ThankYouReply = {
    id: `reply-${nanoid(8)}`,
    celebrationId,
    createdAt: new Date().toISOString(),
    ...reply,
  };
  all[celebrationId] = [newReply, ...existing];
  write(REPLIES_KEY, all);
}

export function demoGetReplies(celebrationId: string): ThankYouReply[] {
  const all = readReplies()[celebrationId] ?? [];
  return [...all].sort(
    (a, b) => replyTs(b as ThankYouReply) - replyTs(a as ThankYouReply),
  );
}

function replyTs(r: ThankYouReply): number {
  if (!r.createdAt) return 0;
  if (typeof r.createdAt === 'string') return new Date(r.createdAt).getTime();
  if (typeof r.createdAt === 'object' && 'toMillis' in r.createdAt) {
    return r.createdAt.toMillis();
  }
  return 0;
}

// ─── Payment CRUD ───────────────────────────────────────────────────

export function demoCreatePayment(payment: Payment): void {
  const all = readPayments();
  all.push(payment);
  write(PAYMENTS_KEY, all);
}

export function demoGetMyPayments(userId: string): Payment[] {
  const all = readPayments();
  return all
    .filter((p) => p.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

// ─── Storage stub (data URLs) ───────────────────────────────────────

export async function demoUploadAsDataUrl(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

// ─── Seed data on first load ────────────────────────────────────────

export function maybeSeedDemoData(userId: string): void {
  if (localStorage.getItem(SEEDED_KEY)) return;

  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  const iso = (ms: number) => new Date(ms).toISOString();

  const moli: Celebration = makeCeleb({
    id: 'demo-moli-birthday',
    userId,
    name: 'Moli',
    occasion: 'birthday',
    tier: 'premium',
    vibe: 'romantic',
    slug: 'moli-birthday',
    status: 'published',
    createdAt: iso(now - 20 * day),
    publishedAt: iso(now - 18 * day),
    occasionDate: iso(now - 365 * day + 5 * day), // anniversary date ~5 days from today's equivalent
    views: 47,
    giftTitle: 'Agentic AI Course',
    giftUrl: 'https://example.com/course',
  });

  const arjun: Celebration = makeCeleb({
    id: 'demo-arjun-birthday',
    userId,
    name: 'Arjun',
    occasion: 'birthday',
    tier: 'free',
    vibe: 'warm',
    slug: 'arjun-birthday',
    status: 'published',
    createdAt: iso(now - 2 * day),
    publishedAt: iso(now - 2 * day),
    occasionDate: iso(now - 30 * day),
    views: 8,
  });

  const priya: Celebration = makeCeleb({
    id: 'demo-priya-anniv',
    userId,
    name: 'Priya',
    occasion: 'anniversary',
    tier: 'sweet',
    vibe: 'playful',
    slug: 'priya-anniversary',
    status: 'published',
    createdAt: iso(now - 90 * day),
    publishedAt: iso(now - 88 * day),
    occasionDate: iso(now - 365 * day + 2 * day),
    views: 24,
  });

  const rahul: Celebration = makeCeleb({
    id: 'demo-rahul-grad',
    userId,
    name: 'Rahul',
    occasion: 'graduation',
    tier: 'deluxe',
    vibe: 'warm',
    slug: 'rahul-graduation',
    status: 'draft',
    createdAt: iso(now - 1 * day),
    publishedAt: null,
    occasionDate: iso(now - 365 * day + 20 * day),
    views: 0,
  });

  const celebs: CelebMap = {
    [moli.id]: moli,
    [arjun.id]: arjun,
    [priya.id]: priya,
    [rahul.id]: rahul,
  };
  write(CELEBRATIONS_KEY, celebs);

  // Seed replies for Moli + Priya
  const replies: ReplyMap = {
    [moli.id]: [
      {
        id: 'reply-1',
        celebrationId: moli.id,
        replyType: 'text',
        textContent: 'This made me cry happy tears 🥺 You remembered everything.',
        voiceUrl: null,
        emoji: null,
        createdAt: iso(now - 2 * 60 * 60 * 1000),
      },
      {
        id: 'reply-2',
        celebrationId: moli.id,
        replyType: 'emoji',
        textContent: null,
        voiceUrl: null,
        emoji: '🥰',
        createdAt: iso(now - 5 * 60 * 60 * 1000),
      },
      {
        id: 'reply-3',
        celebrationId: moli.id,
        replyType: 'text',
        textContent: 'Best gift ever, you absolute legend 💖',
        voiceUrl: null,
        emoji: null,
        createdAt: iso(now - 17 * day),
      },
    ],
    [priya.id]: [
      {
        id: 'reply-4',
        celebrationId: priya.id,
        replyType: 'emoji',
        textContent: null,
        voiceUrl: null,
        emoji: '😭',
        createdAt: iso(now - 85 * day),
      },
    ],
  };
  write(REPLIES_KEY, replies);

  // Seed payments for the two paid-tier celebrations so the audit panel has
  // something to show. Moli = premium (₹199), Priya = sweet (₹79).
  const payments: PaymentList = [
    {
      id: 'pay-demo-moli',
      userId,
      celebrationId: moli.id,
      tier: 'premium',
      amountPaise: 199 * 100,
      currency: 'INR',
      provider: 'demo',
      providerPaymentId: 'demo-pay-moli-seed',
      status: 'captured',
      createdAt: iso(now - 18 * day),
    },
    {
      id: 'pay-demo-priya',
      userId,
      celebrationId: priya.id,
      tier: 'sweet',
      amountPaise: 79 * 100,
      currency: 'INR',
      provider: 'demo',
      providerPaymentId: 'demo-pay-priya-seed',
      status: 'captured',
      createdAt: iso(now - 88 * day),
    },
  ];
  write(PAYMENTS_KEY, payments);

  localStorage.setItem(SEEDED_KEY, '1');
}

interface MakeCelebArgs {
  id: string;
  userId: string;
  name: string;
  occasion: OccasionType;
  tier: Celebration['tier'];
  vibe: VibeType;
  slug: string;
  status: CelebrationStatus;
  createdAt: string;
  publishedAt: string | null;
  occasionDate: string | null;
  views: number;
  giftTitle?: string;
  giftUrl?: string;
}

function makeCeleb(args: MakeCelebArgs): Celebration {
  return {
    id: args.id,
    creatorId: args.userId,
    recipientName: args.name,
    recipientPhotoUrl: null,
    occasion: args.occasion,
    occasionDate: args.occasionDate,
    customOccasion: null,
    slug: args.slug,
    status: args.status,
    vibe: args.vibe,
    template: 'classic',
    tier: args.tier,
    musicTrackId: null,
    customMusicUrl: null,
    videoUrl: null,
    scheduledRevealAt: null,
    customSlug: null,
    password: null,
    expiresAt: null,
    photoCount: args.tier === 'free' ? 3 : args.tier === 'deluxe' ? 10 : 6,
    viewCount: args.views,
    uniqueViewers: Math.floor(args.views * 0.7),
    firstViewedAt: args.publishedAt,
    chatAnalysis: null,
    voiceNoteUrl: null,
    voiceNoteDurationMs: null,
    giftTitle: args.giftTitle || null,
    giftUrl: args.giftUrl || null,
    giftDescription: null,
    createdAt: args.createdAt,
    updatedAt: args.createdAt,
    publishedAt: args.publishedAt,
    deletedAt: null,
  };
}

export function resetDemoData(): void {
  localStorage.removeItem(CELEBRATIONS_KEY);
  localStorage.removeItem(SLIDES_KEY);
  localStorage.removeItem(REPLIES_KEY);
  localStorage.removeItem(PAYMENTS_KEY);
  localStorage.removeItem(SEEDED_KEY);
}
