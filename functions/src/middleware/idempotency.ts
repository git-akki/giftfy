import { Context, Next } from 'hono';
import { db } from '../lib/admin';

export async function idempotency(c: Context, next: Next) {
  const key = c.req.header('Idempotency-Key');
  if (!key) return next();

  const ref = db.collection('idempotencyKeys').doc(key);
  const existing = await ref.get();

  if (existing.exists) {
    const data = existing.data()!;
    if (new Date(data.expiresAt) > new Date()) {
      return c.json(data.responseBody, data.responseCode);
    }
  }

  await next();

  const body = await c.res.clone().json().catch(() => ({}));
  await ref.set({
    responseCode: c.res.status,
    responseBody: body,
    endpoint: c.req.path,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  });
}
