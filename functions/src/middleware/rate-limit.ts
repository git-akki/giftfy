import { Context, Next } from 'hono';
import { db } from '../lib/admin';
import { tooMany } from '../lib/errors';

const LIMITS: Record<string, { max: number; windowMs: number }> = {
  default: { max: 100, windowMs: 60000 },
  upload: { max: 10, windowMs: 60000 },
  auth: { max: 5, windowMs: 3600000 },
};

export function rateLimit(tier = 'default') {
  const { max, windowMs } = LIMITS[tier] || LIMITS.default;

  return async (c: Context, next: Next) => {
    const userId = (c as any).get?.('userId') || c.req.header('x-forwarded-for') || 'anon';
    const key = `ratelimit:${tier}:${userId}`;
    const ref = db.collection('rateLimits').doc(key);
    const now = Date.now();

    const doc = await ref.get();
    const data = doc.exists ? doc.data()! : null;

    if (data && now - new Date(data.windowStart).getTime() < windowMs) {
      if (data.count >= max) {
        const retryAfter = Math.ceil((windowMs - (now - new Date(data.windowStart).getTime())) / 1000);
        c.header('Retry-After', String(retryAfter));
        c.header('X-RateLimit-Limit', String(max));
        c.header('X-RateLimit-Remaining', '0');
        throw tooMany(`Rate limit exceeded. Retry after ${retryAfter}s`);
      }
      await ref.update({ count: data.count + 1 });
      c.header('X-RateLimit-Remaining', String(max - data.count - 1));
    } else {
      await ref.set({ count: 1, windowStart: new Date(now).toISOString() });
      c.header('X-RateLimit-Remaining', String(max - 1));
    }

    c.header('X-RateLimit-Limit', String(max));
    await next();
  };
}
