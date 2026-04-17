import type { TierName } from './tiers';
import { TIERS } from './tiers';
import { isDemoMode } from './demo-mode';

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number; // paise (INR × 100)
  currency: string;
  name: string;
  description: string;
  image?: string;
  order_id?: string;
  handler: (response: {
    razorpay_payment_id: string;
    razorpay_order_id?: string;
    razorpay_signature?: string;
  }) => void;
  prefill?: { name?: string; email?: string; contact?: string };
  notes?: Record<string, string>;
  theme?: { color?: string };
  modal?: { ondismiss?: () => void };
}

interface RazorpayInstance {
  open(): void;
  on(event: string, handler: (response: unknown) => void): void;
}

export interface PaymentResult {
  success: boolean;
  orderId?: string;
  error?: string;
}

/**
 * Open Razorpay Checkout for a tier upgrade.
 *
 * In test mode (rzp_test_...) this runs a full hosted checkout with a fake
 * card flow — no real money moves. Use card 4111 1111 1111 1111 / any CVV
 * / any future date to simulate success.
 *
 * Production note: Razorpay requires server-created `order_id` + signature
 * verification for real money. This client-only flow is for test-mode demos.
 */
export async function initiatePayment(
  tier: TierName,
  celebrationId: string,
): Promise<PaymentResult> {
  const config = TIERS[tier];
  if (!config || config.price === 0) {
    return { success: true, orderId: 'free' };
  }

  // Demo mode: skip Razorpay entirely, return a fake payment ID so the rest
  // of the publish flow works end-to-end without a real backend.
  if (isDemoMode()) {
    await new Promise((r) => setTimeout(r, 400));
    return { success: true, orderId: `demo-pay-${Date.now()}` };
  }

  const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID as string | undefined;
  if (!keyId) {
    return {
      success: false,
      error: 'Payment not configured — set VITE_RAZORPAY_KEY_ID in .env.local',
    };
  }

  if (typeof window === 'undefined' || !window.Razorpay) {
    return { success: false, error: 'Razorpay checkout not loaded. Reload the page and try again.' };
  }

  return new Promise<PaymentResult>((resolve) => {
    const rzp = new window.Razorpay!({
      key: keyId,
      amount: config.price * 100,
      currency: 'INR',
      name: 'Giftfy',
      description: `${config.label} plan — digital gift page`,
      handler: (response) => {
        resolve({ success: true, orderId: response.razorpay_payment_id });
      },
      notes: { tier, celebrationId },
      theme: { color: '#ec4899' },
      modal: {
        ondismiss: () => {
          resolve({ success: false, error: 'Payment cancelled' });
        },
      },
    });

    rzp.open();
  });
}
