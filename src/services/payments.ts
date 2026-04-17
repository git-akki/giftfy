import {
  collection, doc, getDocs, setDoc,
  query, where, orderBy, serverTimestamp,
} from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import type { Payment } from '@/lib/types';
import { isDemoMode, DEMO_USER } from '@/lib/demo-mode';
import { demoCreatePayment, demoGetMyPayments } from '@/lib/demo-store';

const paymentsRef = collection(db, 'payments');

export interface CreatePaymentArgs {
  userId: string;
  celebrationId: string;
  tier: 'sweet' | 'premium' | 'deluxe';
  amountPaise: number;
  providerPaymentId: string;
  provider: 'razorpay' | 'demo';
}

/**
 * Writes an immutable reconciliation record after a paid-tier publish.
 * Keyed by `providerPaymentId` (Razorpay's payment ID) so the creator can
 * audit purchases and cross-check against Razorpay's dashboard.
 *
 * This is best-effort: callers should not fail the publish if this throws.
 */
export async function createPaymentRecord(args: CreatePaymentArgs): Promise<void> {
  // Client-side guard so we surface bad inputs before hitting the rules/CHECK.
  if (!Number.isInteger(args.amountPaise) || args.amountPaise <= 0) {
    throw new Error(`Invalid amountPaise: ${args.amountPaise}`);
  }
  if (!args.providerPaymentId) {
    throw new Error('providerPaymentId is required');
  }

  // Deterministic doc ID so a retry with the same Razorpay payment ID
  // overwrites instead of duplicating. Mirrors the SQL side's
  // UNIQUE (provider, provider_payment_id). Firestore doc IDs can't contain
  // `/`, so encode as `<provider>__<payment_id>`.
  const docId = `${args.provider}__${args.providerPaymentId}`;

  if (isDemoMode()) {
    const payment: Payment = {
      id: docId,
      userId: args.userId,
      celebrationId: args.celebrationId,
      tier: args.tier,
      amountPaise: args.amountPaise,
      currency: 'INR',
      provider: args.provider,
      providerPaymentId: args.providerPaymentId,
      status: 'captured',
      createdAt: new Date().toISOString(),
    };
    demoCreatePayment(payment);
    return;
  }

  await setDoc(doc(paymentsRef, docId), {
    userId: args.userId,
    celebrationId: args.celebrationId,
    tier: args.tier,
    amountPaise: args.amountPaise,
    currency: 'INR',
    provider: args.provider,
    providerPaymentId: args.providerPaymentId,
    status: 'captured',
    createdAt: serverTimestamp(),
  });
}

/**
 * Returns payments for the current auth user, newest first.
 * Requires the composite index on (userId ASC, createdAt DESC).
 */
export async function getMyPayments(): Promise<Payment[]> {
  if (isDemoMode()) return demoGetMyPayments(DEMO_USER.uid);

  const uid = auth.currentUser?.uid;
  if (!uid) return [];

  const q = query(
    paymentsRef,
    where('userId', '==', uid),
    orderBy('createdAt', 'desc'),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Payment));
}
