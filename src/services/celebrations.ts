import {
  collection, doc, addDoc, getDoc, getDocs, updateDoc,
  query, where, orderBy, serverTimestamp, increment,
} from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { generateSlug } from '@/lib/constants';
import type { Celebration } from '@/lib/types';
import { isDemoMode, DEMO_USER } from '@/lib/demo-mode';
import {
  demoGetMyCreations,
  demoGetCelebration,
  demoGetCelebrationBySlug,
  demoCreateCelebration,
  demoUpdateCelebration,
  demoDeleteCelebration,
  demoIncrementViewCount,
  demoIsSlugAvailable,
} from '@/lib/demo-store';

const celebrationsRef = collection(db, 'celebrations');

export async function getMyCreations(): Promise<Celebration[]> {
  if (isDemoMode()) return demoGetMyCreations(DEMO_USER.uid);

  const uid = auth.currentUser?.uid;
  if (!uid) return [];

  const q = query(celebrationsRef, where('creatorId', '==', uid), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  // Filter soft-deleted client-side: adding a Firestore `where` clause here
  // would require a new composite index. See db/README.md.
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() } as Celebration))
    .filter((c) => !c.deletedAt);
}

export async function getCelebration(id: string): Promise<Celebration | null> {
  if (isDemoMode()) return demoGetCelebration(id);
  const snap = await getDoc(doc(db, 'celebrations', id));
  if (!snap.exists()) return null;
  if (snap.data().deletedAt) return null;
  return { id: snap.id, ...snap.data() } as Celebration;
}

export async function getCelebrationBySlug(slug: string): Promise<Celebration | null> {
  if (isDemoMode()) return demoGetCelebrationBySlug(slug);
  const q = query(celebrationsRef, where('slug', '==', slug), where('status', '==', 'published'));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  const celeb = { id: d.id, ...d.data() } as Celebration;
  if (celeb.deletedAt) return null;
  if (celeb.expiresAt && new Date(celeb.expiresAt) < new Date()) {
    return null;
  }
  return celeb;
}

export async function createCelebration(
  recipientName: string,
  occasion: string,
  template: string,
  tier: string = 'free'
): Promise<string> {
  if (isDemoMode()) {
    return demoCreateCelebration(DEMO_USER.uid, recipientName, occasion, template, tier);
  }

  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Not authenticated');

  const slug = generateSlug(recipientName);

  const docRef = await addDoc(celebrationsRef, {
    creatorId: uid,
    recipientName,
    recipientPhotoUrl: null,
    occasion,
    occasionDate: null,
    customOccasion: null,
    slug,
    status: 'draft',
    vibe: 'warm',
    template,
    tier,
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
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    publishedAt: null,
  });

  return docRef.id;
}

export async function updateCelebration(id: string, updates: Partial<Record<string, unknown>>): Promise<void> {
  if (isDemoMode()) return demoUpdateCelebration(id, updates);
  await updateDoc(doc(db, 'celebrations', id), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

export async function publishCelebration(id: string): Promise<string> {
  if (isDemoMode()) {
    demoUpdateCelebration(id, { status: 'published', publishedAt: new Date().toISOString() });
    return demoGetCelebration(id)?.slug || '';
  }
  const celebDoc = doc(db, 'celebrations', id);
  await updateDoc(celebDoc, {
    status: 'published',
    publishedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  const snap = await getDoc(celebDoc);
  return snap.data()?.slug;
}

export async function deleteCelebration(id: string): Promise<void> {
  // Soft-delete: we tag the row with `deletedAt` and leave it in Firestore so
  // a future restore / GDPR export can still find it. Read paths filter it out.
  if (isDemoMode()) return demoDeleteCelebration(id);
  await updateCelebration(id, { deletedAt: new Date().toISOString() });
}

export async function incrementViewCount(id: string): Promise<void> {
  if (isDemoMode()) return demoIncrementViewCount(id);
  // Defensive guard: don't increment a tombstoned doc. Callers today route
  // through getCelebrationBySlug (which already filters), but that chain
  // could change.
  const snap = await getDoc(doc(db, 'celebrations', id));
  if (!snap.exists() || snap.data().deletedAt) return;
  await updateDoc(doc(db, 'celebrations', id), {
    viewCount: increment(1),
    firstViewedAt: snap.data()?.firstViewedAt || serverTimestamp(),
  });
}

export async function isSlugAvailable(slug: string): Promise<boolean> {
  if (isDemoMode()) return demoIsSlugAvailable(slug);
  // Intentionally counts soft-deleted rows too — a deleted gift still "holds"
  // its slug during the retention window so restores don't collide.
  const q = query(celebrationsRef, where('slug', '==', slug));
  const snap = await getDocs(q);
  return snap.empty;
}
