import { Hono } from 'hono';
import { db } from '../lib/admin';
import { generateApiKey } from '../lib/hash';
import { notFound, forbidden, badRequest, err } from '../lib/errors';
import { requireAuth, AuthEnv } from '../middleware/auth';

const user = new Hono<AuthEnv>();

user.use('*', requireAuth);

// GET /profile
user.get('/profile', async (c) => {
  try {
    const userId = c.get('userId');
    const snap = await db.collection('profiles').doc(userId).get();

    if (!snap.exists) {
      // Try looking up by id field (profiles may be stored with auto-id)
      const query = await db.collection('profiles').where('__name__', '==', userId).limit(1).get();
      if (query.empty) throw notFound('Profile not found');
      return c.json({ id: query.docs[0].id, ...query.docs[0].data() });
    }

    return c.json({ id: snap.id, ...snap.data() });
  } catch (e) {
    return err(c, e);
  }
});

// POST /api-keys
user.post('/api-keys', async (c) => {
  try {
    const userId = c.get('userId');
    const body = await c.req.json().catch(() => ({}));
    const { name } = body as { name?: string };

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      throw badRequest('Key name is required');
    }

    const { key, hash, hint } = generateApiKey();
    const now = new Date().toISOString();

    const ref = await db.collection('apiKeys').add({
      keyHash: hash,
      keyHint: hint,
      userId,
      name: name.trim(),
      isActive: true,
      createdAt: now,
      lastUsedAt: null,
    });

    return c.json(
      {
        id: ref.id,
        key, // plaintext — shown once only
        hint,
        name: name.trim(),
        createdAt: now,
      },
      201
    );
  } catch (e) {
    return err(c, e);
  }
});

// GET /api-keys
user.get('/api-keys', async (c) => {
  try {
    const userId = c.get('userId');
    const snap = await db
      .collection('apiKeys')
      .where('userId', '==', userId)
      .where('isActive', '==', true)
      .get();

    const keys = snap.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        hint: data.keyHint,
        name: data.name,
        isActive: data.isActive,
        createdAt: data.createdAt,
        lastUsedAt: data.lastUsedAt,
      };
    });

    return c.json({ keys });
  } catch (e) {
    return err(c, e);
  }
});

// DELETE /api-keys/:keyId
user.delete('/api-keys/:keyId', async (c) => {
  try {
    const userId = c.get('userId');
    const { keyId } = c.req.param();

    const ref = db.collection('apiKeys').doc(keyId);
    const snap = await ref.get();

    if (!snap.exists) throw notFound('API key not found');
    if (snap.data()?.userId !== userId) throw forbidden();

    await ref.update({ isActive: false });

    return c.json({ message: 'Key revoked' });
  } catch (e) {
    return err(c, e);
  }
});

export default user;
