import { collection, addDoc, getDocs, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { uploadThankYouVoice } from './storage';
import { getMyCreations } from './celebrations';
import type { ThankYouReply, Celebration } from '@/lib/types';
import { isDemoMode } from '@/lib/demo-mode';
import { demoSubmitReply, demoGetReplies } from '@/lib/demo-store';

function repliesRef(celebrationId: string) {
  return collection(db, 'celebrations', celebrationId, 'replies');
}

export async function submitTextReply(celebrationId: string, text: string): Promise<void> {
  if (isDemoMode()) {
    demoSubmitReply(celebrationId, {
      replyType: 'text', textContent: text, voiceUrl: null, emoji: null,
    });
    return;
  }
  await addDoc(repliesRef(celebrationId), {
    replyType: 'text',
    textContent: text,
    createdAt: serverTimestamp(),
  });
}

export async function submitVoiceReply(celebrationId: string, blob: Blob): Promise<void> {
  if (isDemoMode()) {
    const url = URL.createObjectURL(blob);
    demoSubmitReply(celebrationId, {
      replyType: 'voice', textContent: null, voiceUrl: url, emoji: null,
    });
    return;
  }
  const url = await uploadThankYouVoice(celebrationId, blob);
  await addDoc(repliesRef(celebrationId), {
    replyType: 'voice',
    voiceUrl: url,
    createdAt: serverTimestamp(),
  });
}

export async function submitEmojiReply(celebrationId: string, emoji: string): Promise<void> {
  if (isDemoMode()) {
    demoSubmitReply(celebrationId, {
      replyType: 'emoji', textContent: null, voiceUrl: null, emoji,
    });
    return;
  }
  await addDoc(repliesRef(celebrationId), {
    replyType: 'emoji',
    emoji,
    createdAt: serverTimestamp(),
  });
}

// Note: does not check the parent celebration's `deletedAt`. Callers are
// expected to resolve the celebration first. getAllMyReplies below enumerates
// via getMyCreations, which already filters soft-deleted parents.
export async function getReplies(celebrationId: string): Promise<ThankYouReply[]> {
  if (isDemoMode()) return demoGetReplies(celebrationId);
  const q = query(repliesRef(celebrationId), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as ThankYouReply));
}

export interface InboxReply extends ThankYouReply {
  celebrationId: string;
  celebrationSlug: string;
  recipientName: string;
  occasion: string;
}

export async function getAllMyReplies(): Promise<InboxReply[]> {
  const celebrations = await getMyCreations();
  if (celebrations.length === 0) return [];

  const chunks = await Promise.all(
    celebrations.map(async (celeb: Celebration) => {
      const replies = await getReplies(celeb.id).catch(() => []);
      return replies.map<InboxReply>((r) => ({
        ...r,
        celebrationId: celeb.id,
        celebrationSlug: celeb.slug,
        recipientName: celeb.recipientName,
        occasion: celeb.occasion,
      }));
    }),
  );

  const all = chunks.flat();
  all.sort((a, b) => {
    const tb = replyTs(b);
    const ta = replyTs(a);
    return tb - ta;
  });
  return all;
}

function replyTs(r: ThankYouReply): number {
  const raw = r.createdAt as unknown;
  if (!raw) return 0;
  if (typeof raw === 'object' && raw !== null && 'toMillis' in raw) {
    return (raw as { toMillis: () => number }).toMillis();
  }
  if (typeof raw === 'string') return new Date(raw).getTime();
  return 0;
}
