import { Hono } from 'hono';
import { db } from '../lib/admin';
import { generateCode, generateSessionToken } from '../lib/hash';
import { badRequest, err } from '../lib/errors';
import { rateLimit } from '../middleware/rate-limit';

const auth = new Hono();

auth.post('/magic-link', rateLimit('auth'), async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const { email } = body as { email?: string };

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      throw badRequest('Valid email is required');
    }

    const code = generateCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 min

    await db.collection('magicCodes').add({
      email: email.toLowerCase().trim(),
      code,
      used: false,
      createdAt: new Date().toISOString(),
      expiresAt,
    });

    // MVP: log the code (replace with email service in production)
    console.log(`[MAGIC LINK] email=${email} code=${code}`);

    return c.json({ message: 'Code sent to email' }, 200);
  } catch (e) {
    return err(c, e);
  }
});

auth.post('/verify-code', async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const { email, code } = body as { email?: string; code?: string };

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      throw badRequest('Valid email is required');
    }
    if (!code || typeof code !== 'string') {
      throw badRequest('Code is required');
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find valid, unused code
    const snap = await db
      .collection('magicCodes')
      .where('email', '==', normalizedEmail)
      .where('code', '==', code)
      .where('used', '==', false)
      .orderBy('createdAt', 'desc')
      .limit(1)
      .get();

    if (snap.empty) {
      throw badRequest('Invalid or expired code');
    }

    const codeDoc = snap.docs[0];
    const codeData = codeDoc.data();

    if (new Date(codeData.expiresAt) < new Date()) {
      throw badRequest('Code has expired');
    }

    // Mark code as used
    await codeDoc.ref.update({ used: true });

    // Find or create user profile
    const profileSnap = await db
      .collection('profiles')
      .where('email', '==', normalizedEmail)
      .limit(1)
      .get();

    let userId: string;
    let userProfile: Record<string, unknown>;

    if (profileSnap.empty) {
      const newProfile = {
        email: normalizedEmail,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const profileRef = await db.collection('profiles').add(newProfile);
      userId = profileRef.id;
      userProfile = { id: userId, ...newProfile };
    } else {
      const doc = profileSnap.docs[0];
      userId = doc.id;
      userProfile = { id: userId, ...doc.data() };
    }

    // Create session
    const token = generateSessionToken();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days

    await db.collection('sessions').add({
      token,
      userId,
      createdAt: new Date().toISOString(),
      expiresAt,
    });

    return c.json({ sessionToken: token, expiresAt, user: userProfile }, 200);
  } catch (e) {
    return err(c, e);
  }
});

export default auth;
