import { Context, Next } from 'hono';
import { db } from '../lib/admin';
import { sha256 } from '../lib/hash';
import { unauthorized } from '../lib/errors';

export type AuthEnv = { Variables: { userId: string; authMethod: 'api_key' | 'session' } };

export async function requireAuth(c: Context<AuthEnv>, next: Next) {
  const header = c.req.header('Authorization');
  if (!header?.startsWith('Bearer ')) throw unauthorized('Missing Authorization: Bearer <token>');

  const token = header.slice(7);

  if (token.startsWith('pk_live_')) {
    const hash = sha256(token);
    const snap = await db.collection('apiKeys').where('keyHash', '==', hash).where('isActive', '==', true).limit(1).get();
    if (snap.empty) throw unauthorized('Invalid or revoked API key');
    c.set('userId', snap.docs[0].data().userId);
    c.set('authMethod', 'api_key');
    snap.docs[0].ref.update({ lastUsedAt: new Date().toISOString() }).catch(() => {});
  } else if (token.startsWith('sk_sess_')) {
    const snap = await db.collection('sessions').where('token', '==', token).limit(1).get();
    if (snap.empty) throw unauthorized('Invalid session');
    const sess = snap.docs[0].data();
    if (new Date(sess.expiresAt) < new Date()) throw unauthorized('Session expired');
    c.set('userId', sess.userId);
    c.set('authMethod', 'session');
  } else {
    throw unauthorized('Token must start with pk_live_ or sk_sess_');
  }

  await next();
}
