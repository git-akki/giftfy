import { collection, addDoc, getDocs, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { nanoid } from 'nanoid';

const VIEWER_KEY = 'giftfy_viewer_id';

function getViewerId(): string {
  let id = localStorage.getItem(VIEWER_KEY);
  if (!id) {
    id = nanoid(16);
    localStorage.setItem(VIEWER_KEY, id);
  }
  return id;
}

function eventsRef(celebrationId: string) {
  return collection(db, 'celebrations', celebrationId, 'viewEvents');
}

export async function trackPageView(celebrationId: string): Promise<void> {
  await addDoc(eventsRef(celebrationId), {
    viewerId: getViewerId(),
    eventType: 'page_view',
    createdAt: serverTimestamp(),
  });
}

export async function trackSlideEnter(celebrationId: string, slideId: string): Promise<void> {
  await addDoc(eventsRef(celebrationId), {
    viewerId: getViewerId(),
    slideId,
    eventType: 'slide_enter',
    createdAt: serverTimestamp(),
  });
}

export async function trackSlideExit(celebrationId: string, slideId: string, durationMs: number): Promise<void> {
  await addDoc(eventsRef(celebrationId), {
    viewerId: getViewerId(),
    slideId,
    eventType: 'slide_exit',
    durationMs,
    createdAt: serverTimestamp(),
  });
}

export async function trackInteraction(celebrationId: string, slideId: string, action: string): Promise<void> {
  await addDoc(eventsRef(celebrationId), {
    viewerId: getViewerId(),
    slideId,
    eventType: 'interaction',
    action,
    createdAt: serverTimestamp(),
  });
}

export async function getInsights(celebrationId: string) {
  const q = query(eventsRef(celebrationId), orderBy('createdAt', 'asc'));
  const snap = await getDocs(q);
  const events = snap.docs.map((d) => d.data());

  const pageViews = events.filter((e) => e.eventType === 'page_view').length;
  const uniqueViewers = new Set(events.map((e) => e.viewerId)).size;
  const firstView = events.find((e) => e.eventType === 'page_view')?.createdAt;

  const slideExits = events.filter((e) => e.eventType === 'slide_exit' && e.slideId && e.durationMs);
  const timePerSlide: Record<string, number> = {};
  for (const evt of slideExits) {
    timePerSlide[evt.slideId] = (timePerSlide[evt.slideId] || 0) + evt.durationMs;
  }

  const interactions = events.filter((e) => e.eventType === 'interaction');

  return { pageViews, uniqueViewers, firstView, timePerSlide, interactions };
}
