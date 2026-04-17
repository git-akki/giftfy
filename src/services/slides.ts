import {
  collection, doc, addDoc, getDocs, updateDoc, deleteDoc, writeBatch,
  query, orderBy, serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Slide, SlideConfig } from '@/lib/types';
import { isDemoMode } from '@/lib/demo-mode';
import { demoGetSlides, demoCreateSlides } from '@/lib/demo-store';

function slidesRef(celebrationId: string) {
  return collection(db, 'celebrations', celebrationId, 'slides');
}

// Note: this does NOT filter by the parent celebration's `deletedAt`. Current
// callers always resolve the celebration first (getCelebration / getCelebrationBySlug),
// which hides soft-deleted parents — so these slides are effectively gated
// by call-site discipline. If you add a new caller that skips that chain,
// check the parent explicitly.
export async function getSlides(celebrationId: string): Promise<Slide[]> {
  if (isDemoMode()) return demoGetSlides(celebrationId);
  const q = query(slidesRef(celebrationId), orderBy('sortOrder', 'asc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Slide));
}

export async function createSlides(celebrationId: string, configs: SlideConfig[]): Promise<void> {
  if (isDemoMode()) return demoCreateSlides(celebrationId, configs);
  const batch = writeBatch(db);

  configs.forEach((config, i) => {
    const ref = doc(slidesRef(celebrationId));
    batch.set(ref, {
      slideType: config.type,
      sortOrder: i,
      content: config.content,
      interactions: config.interactions,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  });

  await batch.commit();
}

export async function updateSlide(
  celebrationId: string,
  slideId: string,
  updates: { content?: Record<string, unknown>; interactions?: Record<string, unknown> }
): Promise<void> {
  await updateDoc(doc(db, 'celebrations', celebrationId, 'slides', slideId), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

export async function reorderSlides(celebrationId: string, slideIds: string[]): Promise<void> {
  const batch = writeBatch(db);
  slideIds.forEach((id, i) => {
    batch.update(doc(db, 'celebrations', celebrationId, 'slides', id), { sortOrder: i });
  });
  await batch.commit();
}

export async function deleteSlide(celebrationId: string, slideId: string): Promise<void> {
  await deleteDoc(doc(db, 'celebrations', celebrationId, 'slides', slideId));
}
